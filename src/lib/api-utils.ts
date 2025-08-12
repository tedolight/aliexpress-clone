import { NextResponse } from 'next/server';

export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export const successResponse = <T>(
  data: T,
  message?: string,
  status = 200
): NextResponse<ApiResponse<T>> => {
  return NextResponse.json(
    {
      success: true,
      message,
      data,
    },
    { status }
  );
};

export const errorResponse = (
  error: string,
  status = 500
): NextResponse<ApiResponse> => {
  return NextResponse.json(
    {
      success: false,
      error,
    },
    { status }
  );
};

export const paginatedResponse = <T>(
  data: T[],
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  },
  message?: string
): NextResponse<ApiResponse<T[]>> => {
  return NextResponse.json({
    success: true,
    message,
    data,
    pagination,
  });
};

export const validationError = (errors: string[]): NextResponse<ApiResponse> => {
  return NextResponse.json(
    {
      success: false,
      error: 'Validation failed',
      data: { errors },
    },
    { status: 400 }
  );
};

export const notFoundError = (message = 'Resource not found'): NextResponse<ApiResponse> => {
  return NextResponse.json(
    {
      success: false,
      error: message,
    },
    { status: 404 }
  );
};

export const unauthorizedError = (message = 'Unauthorized'): NextResponse<ApiResponse> => {
  return NextResponse.json(
    {
      success: false,
      error: message,
    },
    { status: 401 }
  );
};

export const forbiddenError = (message = 'Forbidden'): NextResponse<ApiResponse> => {
  return NextResponse.json(
    {
      success: false,
      error: message,
    },
    { status: 403 }
  );
};

export const conflictError = (message = 'Conflict'): NextResponse<ApiResponse> => {
  return NextResponse.json(
    {
      success: false,
      error: message,
    },
    { status: 409 }
  );
}; 