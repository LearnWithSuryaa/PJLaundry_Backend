export interface ApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data: T;
  meta?: {
    total?: number;
    page?: number;
    limit?: number;
    totalPages?: number;
  };
}

export interface ApiErrorResponse {
  success: false;
  message: string;
  data: null;
  errors?: Array<{
    field?: string;
    message: string;
  }>;
}

export interface AuthenticatedUser {
  id: string;
  email?: string;
  role?: string;
  phone?: string;
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthenticatedUser;
      token?: string;
    }
  }
}

