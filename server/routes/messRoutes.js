const express = require('express');
const router = express.Router();
const { getMessMenu, updateMessMenu, suggestMenu } = require('../controllers/messController');
const { protect, authorize } = require('../middleware/auth');

router.get('/', protect, getMessMenu);
router.put('/:day', protect, authorize('Admin'), updateMessMenu);
router.post('/suggest', protect, authorize('Admin'), suggestMenu);

module.exports = router;
