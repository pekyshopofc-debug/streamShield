export interface ApiResponse<T> {
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total?: number;
  hasMore: boolean;
  nextToken?: string;
}

export interface SearchParams {
  q: string;
  page?: string;
  continuation?: string;
}

export interface ApiError {
  status: number;
  message: string;
  code?: string;
}
