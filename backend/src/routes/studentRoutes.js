const express = require('express');
const router = express.Router();
const { authenticateToken, requireRole } = require('../middleware/auth');
const studentController = require('../controllers/studentController');

// All student routes require student role
router.use(authenticateToken, requireRole('student'));

router.get('/me/dashboard', studentController.getDashboard);
router.get('/me/assignments', studentController.getAssignments);
router.get('/me/grades', studentController.getGrades);
router.get('/me/attendance', studentController.getAttendance);
router.get('/me/ai-insight', studentController.getAiInsight);

module.exports = router;
