/**
 * Category Service
 * Handles all category-related API calls
 */

import { apiGet, apiPost, apiPut, apiDelete } from "../client";

export interface Category {
  id: string;
  name: string;
  description?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CategoryWithSkills extends Category {
  skills?: Skill[];
}

export interface Skill {
  id: string;
  name: string;
  categoryId: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * Get all categories
 */
export async function getAllCategories(
  includeSkills: boolean = false
): Promise<Category[]> {
  const response = await apiGet<Category[]>(
    `/categories?include_skills=${includeSkills}`
  );

  if (!response.success) {
    throw new Error(response.error || "Failed to fetch categories");
  }

  return response.data || [];
}

/**
 * Get single category by ID
 */
export async function getCategoryById(
  id: string,
  includeSkills: boolean = false
): Promise<CategoryWithSkills> {
  const response = await apiGet<CategoryWithSkills>(
    `/categories/${id}?include_skills=${includeSkills}`
  );

  if (!response.success) {
    throw new Error(response.error || "Failed to fetch category");
  }

  return response.data!;
}

/**
 * Create a new category
 */
export async function createCategory(
  name: string,
  description?: string
): Promise<Category> {
  const response = await apiPost<Category>("/categories", {
    name,
    ...(description && { description }),
  });

  if (!response.success) {
    throw new Error(response.error || "Failed to create category");
  }

  return response.data!;
}

/**
 * Update a category
 */
export async function updateCategory(
  id: string,
  updates: { name?: string; description?: string }
): Promise<Category> {
  const response = await apiPut<Category>(`/categories/${id}`, updates);

  if (!response.success) {
    throw new Error(response.error || "Failed to update category");
  }

  return response.data!;
}

/**
 * Delete a category
 */
export async function deleteCategory(id: string): Promise<void> {
  const response = await apiDelete(`/categories/${id}`);

  if (!response.success) {
    throw new Error(response.error || "Failed to delete category");
  }
}

/**
 * Get skills for a specific category
 */
export async function getCategorySkills(id: string): Promise<Skill[]> {
  const response = await apiGet<any>(`/categories/${id}?include_skills=true`);

  if (!response.success) {
    throw new Error(response.error || "Failed to fetch category skills");
  }

  // Backend returns category with skills inside
  const data = response.data;
  if (data?.skills && Array.isArray(data.skills)) {
    return data.skills;
  }
  if (data?.data?.skills && Array.isArray(data.data.skills)) {
    return data.data.skills;
  }
  return [];
}
