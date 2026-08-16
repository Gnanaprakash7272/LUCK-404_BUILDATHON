const express = require('express');
const router = express.Router();
const { authenticateToken, requireRole } = require('../middleware/auth');
const teacherController = require('../controllers/teacherController');

router.use(authenticateToken, requireRole('teacher'));

router.post('/', teacherController.createExam);
router.get('/:id/marks', teacherController.getExamMarks);
router.post('/:id/marks', teacherController.recordExamMarks);

module.exports = router;
