const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

const authRoutes = require('./routes/authRoutes');
const studentRoutes = require('./routes/studentRoutes');
const courseRoutes = require('./routes/courseRoutes');
const assignmentRoutes = require('./routes/assignmentRoutes');
const teacherRoutes = require('./routes/teacherRoutes');
const attendanceRoutes = require('./routes/attendanceRoutes');
const examRoutes = require('./routes/examRoutes');
const adminRoutes = require('./routes/adminRoutes');
const { authenticateToken, requireRole } = require('./middleware/auth');

app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/students', studentRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/assignments', assignmentRoutes);
app.use('/api/teacher', teacherRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/exams', examRoutes);
app.use('/api/admin', adminRoutes);

// Protected route for testing
app.get('/api/test-protected', authenticateToken, (req, res) => {

  res.json({ message: 'You have accessed a protected route!', user: req.user });
});

// Role-protected route for testing
app.get('/api/test-admin', authenticateToken, requireRole('admin'), (req, res) => {
  res.json({ message: 'Welcome Admin!' });
});

app.get('/', (req, res) => {
  res.send('Academic Pulse Backend is running!');
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
