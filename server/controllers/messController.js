const MessMenu = require('../models/MessMenu');
const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// @desc    Get weekly mess menu
// @route   GET /api/mess
// @access  Private
exports.getMessMenu = async (req, res) => {
    try {
        const menu = await MessMenu.find().sort({ createdAt: 1 });
        res.json(menu);
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
            menu.specialNote = specialNote || menu.specialNote;
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
        const { theme } = req.body; // e.g., "healthy", "continental", "north indian"

        const model = genAI.getGenerativeModel({ model: "gemini-pro" });
        const prompt = `Generate a daily mess menu (breakfast, lunch, snacks, dinner) with a ${theme} theme. Provide the response as a JSON object with fields: breakfast (items: array), lunch (items: array), snacks (items: array), dinner (items: array).`;
        
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();
        
        const suggestedData = JSON.parse(text.substring(text.indexOf('{'), text.lastIndexOf('}') + 1));
        res.json(suggestedData);
    } catch (error) {
        res.status(500).json({ message: 'AI suggestion failed: ' + error.message });
    }
};
