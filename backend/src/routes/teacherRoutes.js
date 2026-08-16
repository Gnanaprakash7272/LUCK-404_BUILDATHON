const express = require('express');
const router = express.Router();
const { authenticateToken, requireRole } = require('../middleware/auth');
const teacherController = require('../controllers/teacherController');

router.use(authenticateToken, requireRole('teacher'));

router.get('/me', teacherController.getProfile);
router.get('/me/courses', teacherController.getCourses);
router.get('/me/classes', teacherController.getClasses);
router.get('/me/classes/:id/students', teacherController.getClassStudents);
router.get('/me/assignments', teacherController.getAssignments);
router.get('/me/exams', teacherController.getExams);
router.get('/students/:studentId/profile', teacherController.getStudentProfile);
router.get('/me/at-risk-students', teacherController.getAtRiskStudents);

module.exports = router;
