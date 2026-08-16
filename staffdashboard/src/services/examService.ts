import { fetchApi } from './apiClient';
import {
  Examination,
  CreateExamPayload,
  ExamMarkEntry,
  PostExamMarksPayload
} from '../types/academic';

export const examService = {
  // POST /api/exams
  async createExam(payload: CreateExamPayload): Promise<Examination> {
    return await fetchApi<Examination>('/exams', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  // POST /api/exams/:id/marks
  async postExamMarks(examId: string, payload: PostExamMarksPayload): Promise<{ success: boolean; message: string }> {
    return await fetchApi<{ success: boolean; message: string }>(`/exams/${examId}/marks`, {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  // GET /api/teacher/me/exams
  async getExams(): Promise<Examination[]> {
    return await fetchApi<Examination[]>('/teacher/me/exams');
  },

  // GET /api/exams/:id/marks
  async getExamMarks(examId: string): Promise<ExamMarkEntry[]> {
    return await fetchApi<ExamMarkEntry[]>(`/exams/${examId}/marks`);
  }
};
