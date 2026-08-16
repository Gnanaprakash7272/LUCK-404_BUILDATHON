const express = require('express');
const router = express.Router();
const { authenticateToken, requireRole } = require('../middleware/auth');
const adminController = require('../controllers/adminController');

router.use(authenticateToken, requireRole('admin'));

router.get('/students', adminController.getAllStudents);
router.get('/teachers', adminController.getAllTeachers);
router.get('/courses', adminController.getAllCourses);
router.post('/courses', adminController.createCourse);

router.get('/analytics/overview', adminController.getOverviewAnalytics);
router.get('/analytics/class/:courseId', adminController.getClassAnalytics);
router.get('/analytics/comparative', adminController.getComparativeAnalytics);

module.exports = router;
