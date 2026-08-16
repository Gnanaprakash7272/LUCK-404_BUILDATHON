// MOCK DATABASE FOR SUPER ADMIN PORTAL

// 1. DEPARTMENTS
export const mockDepartments = [
  { id: 'DEP-CSE', code: 'CSE', name: 'Computer Science & Engineering', hod: 'Dr. Alan Turing', facultyCount: 24, studentCount: 450, courseCount: 4, classCount: 12, avgAttendance: 92, avgPerformance: 85, atRiskCount: 12, status: 'active' },
  { id: 'DEP-ECE', code: 'ECE', name: 'Electronics & Communication', hod: 'Dr. Claude Shannon', facultyCount: 20, studentCount: 380, courseCount: 3, classCount: 10, avgAttendance: 88, avgPerformance: 78, atRiskCount: 15, status: 'active' },
  { id: 'DEP-MECH', code: 'MECH', name: 'Mechanical Engineering', hod: 'Dr. Henry Ford', facultyCount: 18, studentCount: 320, courseCount: 3, classCount: 8, avgAttendance: 85, avgPerformance: 75, atRiskCount: 20, status: 'active' },
  { id: 'DEP-CIVIL', code: 'CIVIL', name: 'Civil Engineering', hod: 'Dr. Isambard Brunel', facultyCount: 15, studentCount: 280, courseCount: 2, classCount: 6, avgAttendance: 84, avgPerformance: 76, atRiskCount: 18, status: 'active' },
  { id: 'DEP-IT', code: 'IT', name: 'Information Technology', hod: 'Dr. Grace Hopper', facultyCount: 22, studentCount: 410, courseCount: 4, classCount: 10, avgAttendance: 91, avgPerformance: 83, atRiskCount: 10, status: 'active' },
  { id: 'DEP-EEE', code: 'EEE', name: 'Electrical Engineering', hod: 'Dr. Nikola Tesla', facultyCount: 19, studentCount: 350, courseCount: 3, classCount: 9, avgAttendance: 87, avgPerformance: 79, atRiskCount: 14, status: 'active' },
  { id: 'DEP-CHEM', code: 'CHEM', name: 'Chemical Engineering', hod: 'Dr. Marie Curie', facultyCount: 14, studentCount: 240, courseCount: 2, classCount: 6, avgAttendance: 89, avgPerformance: 82, atRiskCount: 8, status: 'active' },
  { id: 'DEP-BIO', code: 'BIO', name: 'Biotechnology', hod: 'Dr. Rosalind Franklin', facultyCount: 16, studentCount: 260, courseCount: 2, classCount: 7, avgAttendance: 90, avgPerformance: 81, atRiskCount: 9, status: 'active' },
  { id: 'DEP-MATH', code: 'MATH', name: 'Mathematics', hod: 'Dr. Carl Gauss', facultyCount: 12, studentCount: 0, courseCount: 1, classCount: 0, avgAttendance: 93, avgPerformance: 84, atRiskCount: 0, status: 'active' }, // Foundational
  { id: 'DEP-PHY', code: 'PHY', name: 'Physics', hod: 'Dr. Richard Feynman', facultyCount: 10, studentCount: 0, courseCount: 1, classCount: 0, avgAttendance: 91, avgPerformance: 82, atRiskCount: 0, status: 'active' },
  { id: 'DEP-ENG', code: 'ENG', name: 'Humanities & English', hod: 'Dr. Virginia Woolf', facultyCount: 8, studentCount: 0, courseCount: 1, classCount: 0, avgAttendance: 94, avgPerformance: 86, atRiskCount: 0, status: 'active' },
  { id: 'DEP-MBA', code: 'MBA', name: 'Business Administration', hod: 'Dr. Peter Drucker', facultyCount: 15, studentCount: 200, courseCount: 2, classCount: 5, avgAttendance: 86, avgPerformance: 80, atRiskCount: 11, status: 'active' },
  { id: 'DEP-ARCH', code: 'ARCH', name: 'Architecture', hod: 'Dr. Zaha Hadid', facultyCount: 12, studentCount: 180, courseCount: 2, classCount: 4, avgAttendance: 87, avgPerformance: 81, atRiskCount: 6, status: 'active' },
];

// 2. FACULTY
export const mockFaculty = [
  { id: 'FAC-001', name: 'Dr. Alan Turing', email: 'a.turing@univ.edu', department: 'CSE', designation: 'Professor', roles: ['HOD'], subjects: ['CS301', 'CS401'], classes: ['CSE-3A', 'CSE-4A'], status: 'active', joiningDate: '2015-08-01', phone: '+1-555-0101' },
  { id: 'FAC-002', name: 'Dr. Claude Shannon', email: 'c.shannon@univ.edu', department: 'ECE', designation: 'Professor', roles: ['HOD', 'Advisor'], subjects: ['EC201', 'EC305'], classes: ['ECE-2B'], status: 'active', joiningDate: '2016-01-15', phone: '+1-555-0102' },
  { id: 'FAC-003', name: 'Dr. Ada Lovelace', email: 'a.lovelace@univ.edu', department: 'CSE', designation: 'Associate Professor', roles: ['Mentor'], subjects: ['CS101', 'CS202'], classes: ['CSE-1A', 'CSE-2A'], status: 'active', joiningDate: '2018-06-01', phone: '+1-555-0103' },
  { id: 'FAC-004', name: 'Mr. Linus Torvalds', email: 'l.torvalds@univ.edu', department: 'CSE', designation: 'Assistant Professor', roles: [], subjects: ['CS205'], classes: ['CSE-2B', 'CSE-2C'], status: 'on-leave', joiningDate: '2020-09-01', phone: '+1-555-0104' },
  { id: 'FAC-005', name: 'Dr. Richard Feynman', email: 'r.feynman@univ.edu', department: 'PHY', designation: 'Professor', roles: ['HOD'], subjects: ['PH101'], classes: ['CSE-1A', 'ECE-1A', 'MECH-1A'], status: 'active', joiningDate: '2012-08-01', phone: '+1-555-0105' },
  { id: 'FAC-006', name: 'Ms. Margaret Hamilton', email: 'm.hamilton@univ.edu', department: 'IT', designation: 'Associate Professor', roles: ['Advisor', 'Mentor'], subjects: ['IT302'], classes: ['IT-3A'], status: 'active', joiningDate: '2019-02-15', phone: '+1-555-0106' },
  { id: 'FAC-007', name: 'Dr. Carl Gauss', email: 'c.gauss@univ.edu', department: 'MATH', designation: 'Professor', roles: ['HOD'], subjects: ['MA101', 'MA201'], classes: ['CSE-1B', 'CSE-2A'], status: 'active', joiningDate: '2010-08-01', phone: '+1-555-0107' },
];

// 3. SUBJECTS
export const mockSubjects = [
  { id: 'CS101', code: 'CS101', name: 'Intro to Programming', department: 'CSE', semester: 1, credits: 4, type: 'Theory', faculty: 'Dr. Ada Lovelace', status: 'active' },
  { id: 'CS202', code: 'CS202', name: 'Data Structures', department: 'CSE', semester: 3, credits: 4, type: 'Theory', faculty: 'Dr. Ada Lovelace', status: 'active' },
  { id: 'CS205', code: 'CS205', name: 'Operating Systems', department: 'CSE', semester: 4, credits: 3, type: 'Theory', faculty: 'Mr. Linus Torvalds', status: 'active' },
  { id: 'CS301', code: 'CS301', name: 'Artificial Intelligence', department: 'CSE', semester: 6, credits: 4, type: 'Theory', faculty: 'Dr. Alan Turing', status: 'active' },
  { id: 'MA101', code: 'MA101', name: 'Engineering Mathematics I', department: 'MATH', semester: 1, credits: 4, type: 'Theory', faculty: 'Dr. Carl Gauss', status: 'active' },
  { id: 'PH101', code: 'PH101', name: 'Engineering Physics', department: 'PHY', semester: 1, credits: 3, type: 'Theory', faculty: 'Dr. Richard Feynman', status: 'active' },
  { id: 'PH101L', code: 'PH101L', name: 'Physics Lab', department: 'PHY', semester: 1, credits: 1, type: 'Lab', faculty: 'Dr. Richard Feynman', status: 'active' },
];

// 4. CLASSES
export const mockClasses = [
  { id: 'CSE-1A', name: 'CSE - 1st Year - Sec A', department: 'CSE', program: 'B.Tech', year: 1, semester: 1, section: 'A', advisor: 'Dr. Ada Lovelace', mentor: 'Dr. Ada Lovelace', studentCount: 60, room: 'A-101' },
  { id: 'CSE-1B', name: 'CSE - 1st Year - Sec B', department: 'CSE', program: 'B.Tech', year: 1, semester: 1, section: 'B', advisor: 'Mr. Linus Torvalds', mentor: 'Mr. Linus Torvalds', studentCount: 58, room: 'A-102' },
  { id: 'CSE-2A', name: 'CSE - 2nd Year - Sec A', department: 'CSE', program: 'B.Tech', year: 2, semester: 3, section: 'A', advisor: 'Dr. Alan Turing', mentor: 'Dr. Ada Lovelace', studentCount: 55, room: 'A-201' },
  { id: 'ECE-1A', name: 'ECE - 1st Year - Sec A', department: 'ECE', program: 'B.Tech', year: 1, semester: 1, section: 'A', advisor: 'Dr. Claude Shannon', mentor: 'Dr. Claude Shannon', studentCount: 50, room: 'B-101' },
];

// 5. ROOMS
export const mockRooms = [
  { id: 'A-101', number: 'A-101', building: 'Block A', floor: 1, capacity: 65, type: 'Classroom', status: 'available' },
  { id: 'A-102', number: 'A-102', building: 'Block A', floor: 1, capacity: 65, type: 'Classroom', status: 'available' },
  { id: 'A-201', number: 'A-201', building: 'Block A', floor: 2, capacity: 60, type: 'Classroom', status: 'available' },
  { id: 'B-101', number: 'B-101', building: 'Block B', floor: 1, capacity: 70, type: 'Classroom', status: 'maintenance' },
  { id: 'LAB-CS1', number: 'CS Lab 1', building: 'Block C', floor: 1, capacity: 30, type: 'Lab', status: 'available' },
  { id: 'AUDI-1', number: 'Main Auditorium', building: 'Admin Block', floor: 1, capacity: 500, type: 'Auditorium', status: 'available' },
];

// 6. STUDENTS
export const mockStudents = [
  { id: 'STU-2023-001', rollNumber: '23CS001', name: 'Arun Kumar', department: 'CSE', program: 'B.Tech', year: 1, semester: 1, section: 'A', classId: 'CSE-1A', mentor: 'Dr. Ada Lovelace', advisor: 'Dr. Ada Lovelace', gpa: 8.5, attendance: 92, risk: 'low', status: 'active', email: 'arun@student.edu', phone: '555-0201' },
  { id: 'STU-2023-002', rollNumber: '23CS002', name: 'Priya Sharma', department: 'CSE', program: 'B.Tech', year: 1, semester: 1, section: 'A', classId: 'CSE-1A', mentor: 'Dr. Ada Lovelace', advisor: 'Dr. Ada Lovelace', gpa: 9.2, attendance: 98, risk: 'low', status: 'active', email: 'priya@student.edu', phone: '555-0202' },
  { id: 'STU-2023-003', rollNumber: '23CS003', name: 'Rahul Verma', department: 'CSE', program: 'B.Tech', year: 1, semester: 1, section: 'B', classId: 'CSE-1B', mentor: 'Mr. Linus Torvalds', advisor: 'Mr. Linus Torvalds', gpa: 5.4, attendance: 65, risk: 'high', status: 'active', email: 'rahul@student.edu', phone: '555-0203' },
  { id: 'STU-2022-045', rollNumber: '22EC045', name: 'Sneha Gupta', department: 'ECE', program: 'B.Tech', year: 2, semester: 3, section: 'A', classId: 'ECE-2A', mentor: 'Dr. Claude Shannon', advisor: 'Dr. Claude Shannon', gpa: 7.8, attendance: 82, risk: 'medium', status: 'active', email: 'sneha@student.edu', phone: '555-0204' },
];

// 7. PARENTS
export const mockParents = [
  { id: 'PAR-001', name: 'Raj Kumar', relationship: 'Father', students: ['STU-2023-001'], phone: '555-0301', email: 'raj@parent.com', occupation: 'Engineer', address: '123 Main St', status: 'active' },
  { id: 'PAR-002', name: 'Anita Sharma', relationship: 'Mother', students: ['STU-2023-002'], phone: '555-0302', email: 'anita@parent.com', occupation: 'Doctor', address: '456 Oak Ave', status: 'active' },
  { id: 'PAR-003', name: 'Vikram Verma', relationship: 'Father', students: ['STU-2023-003'], phone: '555-0303', email: 'vikram@parent.com', occupation: 'Business', address: '789 Pine Rd', status: 'active' },
];

// 8. TIMETABLE (Global matrix)
export const mockTimetable = [
  { id: 'TT-001', day: 'Monday', period: '1', time: '08:00 - 09:00', classId: 'CSE-1A', subjectId: 'CS101', facultyId: 'FAC-003', roomId: 'A-101', type: 'Theory' },
  { id: 'TT-002', day: 'Monday', period: '2', time: '09:00 - 10:00', classId: 'CSE-1A', subjectId: 'MA101', facultyId: 'FAC-007', roomId: 'A-101', type: 'Theory' },
  { id: 'TT-003', day: 'Monday', period: '1', time: '08:00 - 09:00', classId: 'CSE-1B', subjectId: 'PH101', facultyId: 'FAC-005', roomId: 'A-102', type: 'Theory' },
  { id: 'TT-004', day: 'Monday', period: '2', time: '09:00 - 10:00', classId: 'CSE-2A', subjectId: 'CS202', facultyId: 'FAC-003', roomId: 'A-201', type: 'Theory' },
  // CONFLICT EXAMPLE: Dr. Ada Lovelace (FAC-003) assigned to two classes simultaneously on Monday Period 2
  { id: 'TT-005', day: 'Monday', period: '2', time: '09:00 - 10:00', classId: 'CSE-1B', subjectId: 'CS101', facultyId: 'FAC-003', roomId: 'A-102', type: 'Theory' },
];

// 9. LEAVE REQUESTS
export const mockLeaves = [
  { id: 'LV-001', facultyId: 'FAC-004', facultyName: 'Mr. Linus Torvalds', department: 'CSE', type: 'Medical', startDate: '2026-08-15', endDate: '2026-08-20', days: 5, status: 'approved', substituteId: 'FAC-003' },
  { id: 'LV-002', facultyId: 'FAC-007', facultyName: 'Dr. Carl Gauss', department: 'MATH', type: 'Conference', startDate: '2026-09-01', endDate: '2026-09-03', days: 3, status: 'pending', substituteId: null },
];

// 10. NOTIFICATIONS
export const mockNotifications = [
  { id: 1, type: 'alert', title: 'Timetable Conflict Detected', message: 'Dr. Ada Lovelace is assigned to CSE-1A and CSE-1B simultaneously on Mon Period 2.', time: '10 mins ago', read: false },
  { id: 2, type: 'warning', title: 'High Risk Student', message: 'Rahul Verma (CSE-1B) attendance dropped below 70%', time: '1 hour ago', read: false },
  { id: 3, type: 'info', title: 'Leave Request', message: 'Dr. Carl Gauss requested Conference leave for Sep 1-3.', time: '3 hours ago', read: true },
  { id: 4, type: 'success', title: 'System Backup', message: 'Institutional data backup completed successfully.', time: '1 day ago', read: true }
];

// 11. AUDIT LOGS
export const mockAuditLogs = [
  { id: 'AUD-001', action: 'Timetable Modified', entity: 'CSE-1A', oldVal: 'Room A-105', newVal: 'Room A-101', reason: 'AC Repair', user: 'Super Admin', date: '2026-08-16 09:30 AM' },
  { id: 'AUD-002', action: 'Leave Approved', entity: 'FAC-004', oldVal: 'Pending', newVal: 'Approved', reason: 'Medical Certificate verified', user: 'Super Admin', date: '2026-08-15 04:15 PM' },
  { id: 'AUD-003', action: 'Mark Corrected', entity: 'STU-2023-003', oldVal: '45', newVal: '55', reason: 'Re-evaluation', user: 'Dr. Ada Lovelace', date: '2026-08-14 11:00 AM' },
];

// 12. AI INSIGHTS
export const mockAIInsights = [
  { id: 'INS001', type: 'risk', targetId: 'DEP-MECH', title: 'Mechanical Dept Performance Drop', description: 'Detected a 12% drop in average core subject scores for MECH 2nd Year.', evidence: 'Fluid Mechanics avg dropped from 78% to 66%.', recommendation: 'Review curriculum pacing for fluid mechanics.' },
  { id: 'INS002', type: 'anomaly', targetId: 'STU-2023-003', title: 'Sudden Attendance Drop', description: 'Rahul Verma has missed 5 consecutive days.', evidence: 'Attendance 100% -> 65% in one month.', recommendation: 'Alert Mentor (Mr. Linus Torvalds) to schedule a parent meeting.' },
];

export const mockAcademicRecords = [
  { id: 'REC001', studentId: 'STU-2023-001', subjectId: 'CS101', type: 'Midterm', score: '92/100', grade: 'A', date: '2026-03-15' },
  { id: 'REC002', studentId: 'STU-2023-003', subjectId: 'CS101', type: 'Midterm', score: '45/100', grade: 'F', date: '2026-03-15' },
];
