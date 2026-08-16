import { fetchApi } from './apiClient';
import {
  Assignment,
  CreateAssignmentPayload,
  AssignmentSubmission,
  GradePayload
} from '../types/academic';

export const assignmentService = {
  // POST /api/assignments
  async createAssignment(payload: CreateAssignmentPayload): Promise<Assignment> {
    return await fetchApi<Assignment>('/assignments', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  // POST /api/assignments/:id/grade
  async gradeSubmission(assignmentId: string | number, payload: GradePayload): Promise<{ success: boolean; message: string }> {
    return await fetchApi<{ success: boolean; message: string }>(`/assignments/${assignmentId}/grade`, {
      method: 'POST',
      body: JSON.stringify({
        student_id: payload.student_id,
        score: payload.score,
        feedback: payload.feedback
      }),
    });
  },

  // GET /api/teacher/me/assignments
  async getAssignments(): Promise<Assignment[]> {
    return await fetchApi<Assignment[]>('/teacher/me/assignments');
  },

  // GET /api/assignments/:id/submissions
  async getSubmissions(assignmentId: string): Promise<AssignmentSubmission[]> {
    return await fetchApi<AssignmentSubmission[]>(`/assignments/${assignmentId}/submissions`);
  }
};
