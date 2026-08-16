import { fetchApi } from './apiClient';
import {
  TeacherProfile,
  Course,
  ClassGroup,
  Student,
  StudentAcademicProfile
} from '../types/academic';

export const teacherService = {
  // GET /api/teacher/me
  async getProfile(): Promise<TeacherProfile> {
    return await fetchApi<TeacherProfile>('/teacher/me');
  },

  // GET /api/teacher/me/courses
  async getCourses(): Promise<Course[]> {
    return await fetchApi<Course[]>('/teacher/me/courses');
  },

  // GET /api/teacher/me/classes
  async getClasses(): Promise<ClassGroup[]> {
    return await fetchApi<ClassGroup[]>('/teacher/me/classes');
  },

  // GET /api/teacher/me/classes/:id/students
  async getClassStudents(classId: string): Promise<Student[]> {
    return await fetchApi<Student[]>(`/teacher/me/classes/${classId}/students`);
  },

  // GET /api/teacher/students/:studentId/profile
  async getStudentAcademicProfile(studentId: string): Promise<StudentAcademicProfile> {
    return await fetchApi<StudentAcademicProfile>(`/teacher/students/${studentId}/profile`);
  }
};
