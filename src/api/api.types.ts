export interface ApiResponse<T> {
  data: T;
  message?: string;
  success?: boolean;
}

export interface AppError {
  message: string;
  status?: number;
  code?: string;
  fieldErrors?: Record<string, string[]>;
}
