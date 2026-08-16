const express = require('express');
const router = express.Router();
const { authenticateToken, requireRole } = require('../middleware/auth');
const teacherController = require('../controllers/teacherController');

router.use(authenticateToken, requireRole('teacher'));

router.get('/', teacherController.getAttendance);
router.post('/', teacherController.recordAttendance);

module.exports = router;
