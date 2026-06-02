const MessMenu = require('../models/MessMenu');
const MessRequest = require('../models/MessRequest');
const Settings = require('../models/Settings');
const Student = require('../models/Student');
const { GoogleGenerativeAI } = require("@google/generative-ai");

// @desc    Get weekly mess menu
// @route   GET /api/mess
// @access  Private
exports.getMessMenu = async (req, res) => {
    try {
        const menu = await MessMenu.find().sort({ createdAt: 1 });
        
        // If student, check for allergy warnings
        let warnings = [];
        if (req.user.role === 'Student') {
            const student = await Student.findOne({ userId: req.user._id });
            if (student && student.allergies.length > 0) {
                // Cross-reference menu items with student allergies
                menu.forEach(day => {
                   ['breakfast', 'lunch', 'snacks', 'dinner'].forEach(meal => {
                       day[meal].items.forEach(item => {
                           const foundAllergens = item.allergens.filter(a => student.allergies.includes(a));
                           if (foundAllergens.length > 0) {
                               warnings.push({
                                   day: day.dayOfWeek,
                                   meal: meal,
                                   item: item.name,
                                   allergens: foundAllergens
                               });
                           }
                       });
                   });
                });
            }
        }

        res.json({ menu, warnings });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Request extra food (Egg/Chicken)
// @route   POST /api/mess/request
// @access  Private/Student
exports.requestExtra = async (req, res) => {
    try {
        const { date, mealType, item, paymentMethod } = req.body;
        const student = await Student.findOne({ userId: req.user._id });

        if (!student) return res.status(404).json({ message: 'Student profile not found' });

        const settings = await Settings.findOne();
        const limit = settings?.extrasDailyLimit || 9;
        
        let price = 0;
        // Search in dynamic messItems first
        const itemConfig = settings?.messItems?.find(i => i.name === item);
        if (itemConfig) {
            price = itemConfig.price;
        } else {
            // Fallback to old messPrices structure
            price = settings?.messPrices?.[item] || 0;
        }

        // 1. Check daily limit for this item/date
        const existingCount = await MessRequest.countDocuments({ date, mealType, item, status: { $ne: 'Cancelled' } });
        if (existingCount >= limit) {
            return res.status(400).json({ message: `Daily limit of ${limit} reached for ${item} on this date.` });
        }

        // 2. Create the request
        const request = await MessRequest.create({
            studentId: student._id,
            date,
            mealType,
            item,
            amount: price,
            paymentMethod,
            status: 'Pending',
            paymentStatus: paymentMethod === 'Card' ? 'Unpaid' : 'Unpaid' // Will be updated via Stripe or Admin
        });

        res.status(201).json({ 
            message: 'Request submitted successfully', 
            request,
            requiresOnlinePayment: paymentMethod === 'Card' && price > 0
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get mess requests (Production Sheet)
// @route   GET /api/mess/requests
// @access  Private/Admin/Staff
exports.getMessRequests = async (req, res) => {
    try {
        const { date, mealType } = req.query;
        let query = {};
        if (date) query.date = date;
        if (mealType) query.mealType = mealType;

        const requests = await MessRequest.find(query)
            .populate({
                path: 'studentId',
                populate: { path: 'userId', select: 'name' }
            })
            .sort({ createdAt: -1 });

        res.json(requests);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get current student's mess requests
// @route   GET /api/mess/requests/my
// @access  Private/Student
exports.getMyRequests = async (req, res) => {
    try {
        const student = await Student.findOne({ userId: req.user._id });
        if (!student) return res.status(404).json({ message: 'Student profile not found' });

        const requests = await MessRequest.find({ studentId: student._id })
            .sort({ createdAt: -1 });
        res.json(requests);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update request status (Mark as paid/collected)
// @route   PUT /api/mess/requests/:id
// @access  Private/Admin/Staff
exports.updateRequestStatus = async (req, res) => {
    try {
        const { status, paymentStatus } = req.body;
        const request = await MessRequest.findById(req.params.id);

        if (!request) return res.status(404).json({ message: 'Request not found' });

        if (status) request.status = status;
        if (paymentStatus) request.paymentStatus = paymentStatus;

        await request.save();
        res.json(request);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};



// @desc    Update mess menu
// @route   PUT /api/mess/:day
// @access  Private/Admin
exports.updateMessMenu = async (req, res) => {
    try {
        const { breakfast, lunch, snacks, dinner, specialNote } = req.body;
        const day = req.params.day;

        let menu = await MessMenu.findOne({ dayOfWeek: day });

        if (menu) {
            menu.breakfast = breakfast || menu.breakfast;
            menu.lunch = lunch || menu.lunch;
            menu.snacks = snacks || menu.snacks;
            menu.dinner = dinner || menu.dinner;
            if (specialNote !== undefined) menu.specialNote = specialNote;
            await menu.save();
        } else {
            menu = await MessMenu.create({
                dayOfWeek: day,
                breakfast,
                lunch,
                snacks,
                dinner,
                specialNote
            });
        }

        res.json(menu);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Suggest menu using AI
// @route   POST /api/mess/suggest
// @access  Private/Admin
exports.suggestMenu = async (req, res) => {
    try {
        const { theme, constraints } = req.body; 

        if (!process.env.GEMINI_API_KEY) {
            return res.status(500).json({ message: 'AI Suggestion failed: GEMINI_API_KEY is not defined in server .env' });
        }

        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        const model = genAI.getGenerativeModel({ model: "gemini-3-flash-preview" });
        
        const prompt = `Return a daily hostel mess menu.
        Theme: ${theme}
        Kitchen constraints: ${constraints || 'none'}
        
        Strictly follow these rules:
        1. Output MUST be valid JSON.
        2. Format: { "breakfast": { "items": [{ "name": "...", "allergens": [] }], "time": "..." }, "lunch": ..., "snacks": ..., "dinner": ... }
        3. For EACH item, list common allergens (e.g., Dairy, Nuts, Gluten).
        4. No markdown formatting. No preamble. Only the JSON object.`;
        
        console.log(`[AI INFO] Theme: ${theme}, Constraints: ${constraints}`);
        
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();
        
        console.log('[AI DEBUG] Raw Response:', text);
        
        // Find JSON content even if AI adds extra text or markdown
        // We look for the first '{' and the last '}'
        const jsonStart = text.indexOf('{');
        const jsonEnd = text.lastIndexOf('}');
        
        if (jsonStart === -1 || jsonEnd === -1) {
            console.error('[AI ERROR] No JSON found in response:', text);
            throw new Error('AI response did not contain a valid JSON block.');
        }
        
        const cleanText = text.substring(jsonStart, jsonEnd + 1);
        try {
            const suggestedData = JSON.parse(cleanText);
            res.json(suggestedData);
        } catch (parseError) {
            console.error('[AI ERROR] JSON Parse failed:', cleanText);
            throw new Error('Failed to parse AI response into menu format.');
        }
    } catch (error) {
        console.error('AI SUGGESTION ERROR:', error);
        res.status(500).json({ 
            message: 'AI Error: ' + error.message,
            stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
    }
};
