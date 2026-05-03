/**
 * API Services Export Index
 * Centralized exports for all API services
 */

// Client
export { apiCall, apiGet, apiPost, apiPut, apiDelete, apiPatch } from "./client";
export type { ApiResponse, ApiError } from "./client";

// Auth Service
export {
  login,
  signup,
  getCurrentUser,
  updateUserProfile,
  getAuthToken,
  clearAuthToken,
  isAuthenticated,
} from "./services/authService";
export type { User, AuthResponse } from "./services/authService";

// Category Service
export {
  getAllCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
  getCategorySkills,
} from "./services/categoryService";
export type { Category, CategoryWithSkills } from "./services/categoryService";

// Skill Service
export {
  getAllSkills,
  getSkillById,
  createSkill,
  updateSkill,
  deleteSkill,
  getSkillsByCategory,
} from "./services/skillService";
export type { Skill, SkillWithCategory } from "./services/skillService";

// Career Path Service
export {
  getAllCareerPaths,
  getUserCareerPaths,
  getCareerPathById,
  createCareerPath,
  updateCareerPath,
  deleteCareerPath,
  enrollUserInCareerPath,
  updateCareerProgress,
  unenrollUserFromCareerPath,
} from "./services/careerPathService";
export type {
  CareerPath,
  UserCareerPath,
} from "./services/careerPathService";
