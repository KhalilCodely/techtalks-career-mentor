/**
 * Authentication Service
 * Handles login, signup, and token management
 */

import { apiPost, apiGet, apiPut } from "../client";

export interface User {
  id: string;
  name: string;
  email: string;
}

export interface AuthResponse {
  message: string;
  user: User;
  token?: string;
}

/**
 * Login with email and password
 */
export async function login(
  email: string,
  password: string
): Promise<AuthResponse> {
  const response = await apiPost<AuthResponse>("/login", {
    email,
    password,
  });

  if (!response.success) {
    throw new Error(response.error || "Login failed");
  }

  // Store token
  if (response.data?.token) {
    localStorage.setItem("auth_token", response.data.token);
  }

  return response.data!;
}

/**
 * Sign up with name, email, and password
 */
export async function signup(
  name: string,
  email: string,
  password: string
): Promise<AuthResponse> {
  const response = await apiPost<AuthResponse>("/signup", {
    name,
    email,
    password,
  });

  if (!response.success) {
    throw new Error(response.error || "Signup failed");
  }

  return response.data!;
}

/**
 * Get stored auth token
 */
export function getAuthToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("auth_token");
}

/**
 * Clear auth token (logout)
 */
export function clearAuthToken(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem("auth_token");
}

/**
 * Check if user is authenticated
 */
export function isAuthenticated(): boolean {
  return getAuthToken() !== null;
}

/**
 * Get current user info from protected endpoint
 */
export async function getCurrentUser(): Promise<User> {
  const response = await apiGet<{ success: boolean; data: User }>("/protected/user");

  if (!response.success) {
    throw new Error(response.error || "Failed to fetch current user");
  }

  // Handle nested response structure from /protected/user
  const userData = response.data?.data || response.data;
  
  if (!userData || typeof userData !== 'object' || !('id' in userData)) {
    throw new Error("Invalid user data");
  }

  return userData as User;
}

/**
 * Update user profile information
 */
export async function updateUserProfile(data: {
  bio?: string;
  education?: string;
  experienceLevel?: string;
  careerGoal?: string;
}): Promise<Record<string, unknown>> {
  const response = await apiPut<Record<string, unknown>>("/protected/user", data);

  if (!response.success) {
    throw new Error(response.error || "Failed to update profile");
  }

  return response.data || {};
}
