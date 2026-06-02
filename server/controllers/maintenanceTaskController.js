const MaintenanceTask = require('../models/MaintenanceTask');
const User = require('../models/User');

// @desc    Create a new maintenance task
// @route   POST /api/maintenance
// @access  Private (Admin/Staff)
exports.createTask = async (req, res) => {
    try {
        const task = await MaintenanceTask.create(req.body);
        res.status(201).json(task);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get all maintenance tasks
// @route   GET /api/maintenance
// @access  Private (Admin/Staff)
exports.getTasks = async (req, res) => {
    try {
        let query = {};
        
        // If staff, they might want to see only their tasks or all.
        // For now, let's allow Admin/Staff to see all, but maybe filter if needed.
        if (req.user.role === 'Staff' && req.query.myTasks === 'true') {
            query.assignedTo = req.user._id;
        }

        const tasks = await MaintenanceTask.find(query)
            .populate('assignedTo', 'name email role')
            .sort({ dueDate: 1 });

        res.json(tasks);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update a maintenance task
// @route   PUT /api/maintenance/:id
// @access  Private (Admin/Staff)
exports.updateTask = async (req, res) => {
    try {
        const task = await MaintenanceTask.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!task) return res.status(404).json({ message: 'Task not found' });
        res.json(task);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Delete a maintenance task
// @route   DELETE /api/maintenance/:id
// @access  Private (Admin)
exports.deleteTask = async (req, res) => {
    try {
        const task = await MaintenanceTask.findByIdAndDelete(req.params.id);
        if (!task) return res.status(404).json({ message: 'Task not found' });
        res.json({ message: 'Task deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get staff members for assignment
// @route   GET /api/maintenance/staff
// @access  Private (Admin)
exports.getStaff = async (req, res) => {
    try {
        const staff = await User.find({ role: 'Staff' }).select('name email');
        res.json(staff);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
