const express = require('express');
const router = express.Router();
const { authenticateToken, requireRole } = require('../middleware/auth');
const studentController = require('../controllers/studentController');

// Using authenticateToken for courses, but checking if student for enroll
router.use(authenticateToken);

router.get('/', studentController.getCourses);
router.get('/:id', studentController.getCourseDetails);
router.post('/:id/enroll', requireRole('student'), studentController.enrollCourse);

module.exports = router;
