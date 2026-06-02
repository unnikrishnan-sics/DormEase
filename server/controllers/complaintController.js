const Complaint = require('../models/Complaint');

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
