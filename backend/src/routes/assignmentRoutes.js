const express = require('express');
const router = express.Router();
const { authenticateToken, requireRole } = require('../middleware/auth');
const studentController = require('../controllers/studentController');
const teacherController = require('../controllers/teacherController');

router.use(authenticateToken);
// Submit assignment is for students
router.post('/:id/submit', requireRole('student'), studentController.submitAssignment);

// Teacher endpoints
router.post('/', requireRole('teacher'), teacherController.createAssignment);
router.post('/:id/grade', requireRole('teacher'), teacherController.gradeAssignment);
router.get('/:id/submissions', requireRole('teacher'), teacherController.getAssignmentSubmissions);

module.exports = router;
