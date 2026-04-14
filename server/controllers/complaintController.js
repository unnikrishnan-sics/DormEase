const Complaint = require('../models/Complaint');
const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// @desc    Submit a new complaint
// @route   POST /api/complaints
// @access  Private
exports.submitComplaint = async (req, res) => {
    try {
        const { category, description, priority } = req.body;

        // Create initial complaint
        const complaint = new Complaint({
            userId: req.user._id,
            category,
            description,
            priority
        });

        // AI Analysis using Gemini
        try {
            const model = genAI.getGenerativeModel({ model: "gemini-pro" });
            const prompt = `Analyze this hostel complaint: "${description}". Provide a JSON response with the following fields: "sentiment" (String: Positive/Neutral/Negative), "summary" (String: Short summary of the issue), and "suggestedResponse" (String: A helpful response for the admin to send to the student).`;
            
            const result = await model.generateContent(prompt);
            const response = await result.response;
            const text = response.text();
            
            // Basic extraction (Assuming JSON-like response from AI)
            // In production, use robust parsing
            const aiData = JSON.parse(text.substring(text.indexOf('{'), text.lastIndexOf('}') + 1));
            complaint.aiAnalysis = aiData;
        } catch (aiError) {
            console.error('AI Analysis failed:', aiError);
            // Non-critical error, continue without AI data
        }

        await complaint.save();
        res.status(201).json(complaint);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get all complaints
// @route   GET /api/complaints
// @access  Private
exports.getComplaints = async (req, res) => {
    try {
        let complaints;
        if (req.user.role === 'Admin' || req.user.role === 'Staff') {
            complaints = await Complaint.find().populate('userId', 'name email');
        } else {
            complaints = await Complaint.find({ userId: req.user._id });
        }
        res.json(complaints);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update complaint status
// @route   PUT /api/complaints/:id
// @access  Private/Admin/Staff
exports.updateComplaintStatus = async (req, res) => {
    try {
        const complaint = await Complaint.findById(req.params.id);

        if (complaint) {
            complaint.status = req.body.status || complaint.status;
            complaint.resolutionDetails = req.body.resolutionDetails || complaint.resolutionDetails;
            complaint.assignedTo = req.body.assignedTo || complaint.assignedTo;

            const updatedComplaint = await complaint.save();
            res.json(updatedComplaint);
        } else {
            res.status(404).json({ message: 'Complaint not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
