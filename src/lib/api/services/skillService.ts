/**
 * Skill Service
 * Handles all skill-related API calls
 */

import { apiGet, apiPost, apiPut, apiDelete } from "../client";

export interface Skill {
  id: string;
  name: string;
  categoryId: string;
  createdAt: string;
  updatedAt: string;
}

export interface SkillWithCategory extends Skill {
  category?: {
    id: string;
    name: string;
  };
}

/**
 * Get all skills
 */
export async function getAllSkills(category?: string): Promise<Skill[]> {
  const url = category ? `/skills?category=${category}` : "/skills";
  const response = await apiGet<Skill[]>(url);

  if (!response.success) {
    throw new Error(response.error || "Failed to fetch skills");
  }

  return response.data || [];
}

/**
 * Get single skill by ID
 */
export async function getSkillById(id: string): Promise<SkillWithCategory> {
  const response = await apiGet<SkillWithCategory>(`/skills/${id}`);

  if (!response.success) {
    throw new Error(response.error || "Failed to fetch skill");
  }

  return response.data!;
}

/**
 * Create a new skill
 */
export async function createSkill(
  name: string,
  categoryId: string
): Promise<Skill> {
  const response = await apiPost<Skill>("/skills", {
    name,
    categoryId,
  });

  if (!response.success) {
    throw new Error(response.error || "Failed to create skill");
  }

  return response.data!;
}

/**
 * Update a skill
 */
export async function updateSkill(
  id: string,
  updates: { name?: string; categoryId?: string }
): Promise<Skill> {
  const response = await apiPut<Skill>(`/skills/${id}`, updates);

  if (!response.success) {
    throw new Error(response.error || "Failed to update skill");
  }

  return response.data!;
}

/**
 * Delete a skill
 */
export async function deleteSkill(id: string): Promise<void> {
  const response = await apiDelete(`/skills/${id}`);

  if (!response.success) {
    throw new Error(response.error || "Failed to delete skill");
  }
}

/**
 * Get skills by category
 */
export async function getSkillsByCategory(
  categoryId: string
): Promise<Skill[]> {
  const response = await apiGet<Skill[]>(`/skills?category=${categoryId}`);

  if (!response.success) {
    throw new Error(response.error || "Failed to fetch skills");
  }

  return response.data || [];
}
