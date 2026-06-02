const express = require('express');
const router = express.Router();
const { 
    createTask, getTasks, updateTask, deleteTask, getStaff 
} = require('../controllers/maintenanceTaskController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);

router.route('/')
    .get(authorize('Admin', 'Staff'), getTasks)
    .post(authorize('Admin'), createTask);

router.get('/staff', authorize('Admin'), getStaff);

router.route('/:id')
    .put(authorize('Admin', 'Staff'), updateTask)
    .delete(authorize('Admin'), deleteTask);

module.exports = router;
