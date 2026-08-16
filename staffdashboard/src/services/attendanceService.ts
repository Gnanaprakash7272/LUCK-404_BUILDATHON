import { fetchApi } from './apiClient';
import { AttendancePayload } from '../types/academic';

// Raw record shape returned by GET /api/attendance
export interface RawAttendanceRecord {
  id: number;
  class_id: number;
  student_id: number;
  date: string;
  status: string; // 'present' | 'absent' | 'late' (lowercase from DB)
}

export const attendanceService = {
  // POST /api/attendance
  async recordAttendance(payload: AttendancePayload): Promise<{ success: boolean; message: string }> {
    const normalizedPayload = {
      ...payload,
      records: payload.records.map(r => ({
        student_id: r.student_id,
        status: (r.status || 'PRESENT').toLowerCase(),
        remarks: r.remarks
      }))
    };
    return await fetchApi<{ success: boolean; message: string }>('/attendance', {
      method: 'POST',
      body: JSON.stringify(normalizedPayload),
    });
  },

  // GET /api/attendance?class_id=<id>[&date=<YYYY-MM-DD>]
  // Backend expects class_id (not course_id). Date is optional — omit to get all records for the class.
  async getAttendance(classId: string, date?: string): Promise<RawAttendanceRecord[]> {
    const params = new URLSearchParams({ class_id: classId });
    if (date) params.append('date', date);
    return await fetchApi<RawAttendanceRecord[]>(`/attendance?${params.toString()}`);
  }
};
