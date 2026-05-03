/**
 * Career Path Service
 * Handles career path operations, enrollment, and progress tracking
 */

import { apiGet, apiPost, apiPut, apiDelete, apiPatch } from "../client";

export interface CareerPath {
  id: string;
  title: string;
  description?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface UserCareerPath {
  id: string;
  userId: string;
  careerPathId: string;
  progress: number;
  enrolledAt: string;
  updatedAt: string;
}

/**
 * Get all career paths
 */
export async function getAllCareerPaths(): Promise<CareerPath[]> {
  const response = await apiGet<CareerPath[]>("/career_path");

  if (!response.success) {
    throw new Error(response.error || "Failed to fetch career paths");
  }

  return response.data || [];
}

/**
 * Get user's enrolled career paths
 */
export async function getUserCareerPaths(userId: string): Promise<CareerPath[]> {
  const response = await apiGet<CareerPath[]>(`/career_path?userId=${userId}`);

  if (!response.success) {
    throw new Error(response.error || "Failed to fetch user career paths");
  }

  return response.data || [];
}

/**
 * Get single career path by ID
 */
export async function getCareerPathById(id: string): Promise<CareerPath> {
  const response = await apiGet<CareerPath>(`/career_path/${id}`);

  if (!response.success) {
    throw new Error(response.error || "Failed to fetch career path");
  }

  return response.data!;
}

/**
 * Create a new career path (Admin only)
 */
export async function createCareerPath(
  title: string,
  description?: string
): Promise<CareerPath> {
  const response = await apiPost<CareerPath>("/career_path", {
    title,
    ...(description && { description }),
  });

  if (!response.success) {
    throw new Error(response.error || "Failed to create career path");
  }

  return response.data!;
}

/**
 * Update a career path (Admin only)
 */
export async function updateCareerPath(
  id: string,
  updates: { title?: string; description?: string }
): Promise<CareerPath> {
  const response = await apiPut<CareerPath>(`/career_path/${id}`, updates);

  if (!response.success) {
    throw new Error(response.error || "Failed to update career path");
  }

  return response.data!;
}

/**
 * Delete a career path (Admin only)
 */
export async function deleteCareerPath(id: string): Promise<void> {
  const response = await apiDelete(`/career_path/${id}`);

  if (!response.success) {
    throw new Error(response.error || "Failed to delete career path");
  }
}

/**
 * Enroll a user in a career path
 */
export async function enrollUserInCareerPath(
  userId: string,
  careerPathId: string
): Promise<UserCareerPath> {
  const response = await apiPost<UserCareerPath>("/career_path/enroll", {
    userId,
    careerPathId,
  });

  if (!response.success) {
    throw new Error(response.error || "Failed to enroll in career path");
  }

  return response.data!;
}

/**
 * Update user's progress in a career path
 */
export async function updateCareerProgress(
  userId: string,
  careerPathId: string,
  progress: number
): Promise<UserCareerPath> {
  const response = await apiPatch<UserCareerPath>("/career_path/progress", {
    userId,
    careerPathId,
    progress: Math.min(100, Math.max(0, progress)), // Clamp between 0-100
  });

  if (!response.success) {
    throw new Error(response.error || "Failed to update progress");
  }

  return response.data!;
}

/**
 * Unenroll a user from a career path
 */
export async function unenrollUserFromCareerPath(
  userId: string,
  careerPathId: string
): Promise<void> {
  const response = await apiDelete(
    `/career_path/unenroll?userId=${userId}&careerPathId=${careerPathId}`
  );

  if (!response.success) {
    throw new Error(response.error || "Failed to unenroll from career path");
  }
}
