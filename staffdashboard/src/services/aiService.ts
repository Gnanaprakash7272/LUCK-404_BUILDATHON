import { fetchApi } from './apiClient';
import { AtRiskStudent } from '../types/ai';

export const aiService = {
  // GET /api/teacher/me/at-risk-students
  async getAtRiskStudents(): Promise<AtRiskStudent[]> {
    return await fetchApi<AtRiskStudent[]>('/teacher/me/at-risk-students');
  }
};
