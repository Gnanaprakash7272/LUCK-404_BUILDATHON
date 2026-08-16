export interface UserAuthResponse {
  token: string;
  user: {
    id: string;
    name: string;
    email: string;
    role: 'TEACHER' | 'STAFF' | 'ADMIN';
    department: string;
  };
}

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
}

export interface ApiError {
  message: string;
  code?: string;
  status?: number;
}
