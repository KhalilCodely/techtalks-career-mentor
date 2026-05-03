/**
 * Centralized API Client
 * Handles all HTTP requests with proper headers, error handling, and response parsing
 */

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3000/api";

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  count?: number;
}

export interface ApiError extends Error {
  status?: number;
  data?: Record<string, unknown>;
}

/**
 * Make an API request with standard headers and error handling
 */
export async function apiCall<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  const url = `${API_BASE_URL}${endpoint}`;

  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...options.headers,
  };

  // Add auth token if available
  const token = typeof window !== "undefined" ? localStorage.getItem("auth_token") : null;
  if (token) {
    (headers as Record<string, string>).Authorization = `Bearer ${token}`;
  }

  try {
    const response = await fetch(url, {
      ...options,
      headers,
    });

    const data = await response.json();

    if (!response.ok) {
      const error: ApiError = new Error(
        data.error || data.message || "API request failed"
      );
      error.status = response.status;
      error.data = data;
      throw error;
    }

    // Wrap backend response in standard format
    return {
      success: true,
      data: data,
      message: data.message,
    };
    
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error("Unknown API error");
  }
}

/**
 * GET request helper
 */
export async function apiGet<T>(endpoint: string): Promise<ApiResponse<T>> {
  return apiCall<T>(endpoint, { method: "GET" });
}

/**
 * POST request helper
 */
export async function apiPost<T>(
  endpoint: string,
  body: Record<string, unknown> | unknown[]
): Promise<ApiResponse<T>> {
  return apiCall<T>(endpoint, {
    method: "POST",
    body: JSON.stringify(body),
  });
}

/**
 * PUT request helper
 */
export async function apiPut<T>(
  endpoint: string,
  body: Record<string, unknown> | unknown[]
): Promise<ApiResponse<T>> {
  return apiCall<T>(endpoint, {
    method: "PUT",
    body: JSON.stringify(body),
  });
}

/**
 * DELETE request helper
 */
export async function apiDelete<T>(endpoint: string): Promise<ApiResponse<T>> {
  return apiCall<T>(endpoint, { method: "DELETE" });
}

/**
 * PATCH request helper
 */
export async function apiPatch<T>(
  endpoint: string,
  body: Record<string, unknown> | unknown[]
): Promise<ApiResponse<T>> {
  return apiCall<T>(endpoint, {
    method: "PATCH",
    body: JSON.stringify(body),
  });
}
