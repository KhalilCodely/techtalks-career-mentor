"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import Link from "next/link";
import {
  getAllCategories,
  getAllSkills,
  getAllCareerPaths,
  createCategory,
  createSkill,
  createCareerPath,
  deleteCategory,
  deleteSkill,
  deleteCareerPath,
  getAuthToken,
  clearAuthToken,
  type Category,
  type Skill,
  type CareerPath,
} from "@/lib/api";

type Tab = "categories" | "skills" | "career-paths";

export default function AdminPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<Tab>("categories");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Categories state
  const [categories, setCategories] = useState<Category[]>([]);
  const [categoryName, setCategoryName] = useState("");
  const [categoryDesc, setCategoryDesc] = useState("");

  // Skills state
  const [skills, setSkills] = useState<Skill[]>([]);
  const [skillName, setSkillName] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");

  // Career Paths state
  const [careerPaths, setCareerPaths] = useState<CareerPath[]>([]);
  const [pathTitle, setPathTitle] = useState("");
  const [pathDesc, setPathDesc] = useState("");

  useEffect(() => {
    if (!getAuthToken()) {
      router.push("/login");
      return;
    }

    const fetchData = async () => {
      try {
        setLoading(true);
        setError("");

        const [catsResponse, skillsResponse, pathsResponse] = await Promise.all([
          getAllCategories(),
          getAllSkills(),
          getAllCareerPaths(),
        ]);

        // Extract arrays from responses
        const cats = Array.isArray(catsResponse)
          ? catsResponse
          : Array.isArray((catsResponse as any)?.data)
          ? (catsResponse as any).data
          : [];

        const skillsList = Array.isArray(skillsResponse)
          ? skillsResponse
          : Array.isArray((skillsResponse as any)?.data)
          ? (skillsResponse as any).data
          : [];

        const paths = Array.isArray(pathsResponse)
          ? pathsResponse
          : Array.isArray((pathsResponse as any)?.data)
          ? (pathsResponse as any).data
          : [];

        setCategories(cats);
        setSkills(skillsList);
        setCareerPaths(paths);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load data");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [router]);

  // Category handlers
  const handleCreateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!categoryName.trim()) {
      setError("Category name is required");
      return;
    }

    try {
      setError("");
      setSuccess("");

      const newCategory = await createCategory(categoryName, categoryDesc);
      setCategories([...categories, newCategory]);
      setCategoryName("");
      setCategoryDesc("");
      setSuccess("Category created successfully!");
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create category");
    }
  };

  const handleDeleteCategory = async (id: string) => {
    if (!confirm("Are you sure?")) return;

    try {
      setError("");
      await deleteCategory(id);
      setCategories(categories.filter((c) => c.id !== id));
      setSuccess("Category deleted successfully!");
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete category");
    }
  };

  // Skill handlers
  const handleCreateSkill = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!skillName.trim() || !selectedCategory) {
      setError("Skill name and category are required");
      return;
    }

    try {
      setError("");
      setSuccess("");

      const newSkill = await createSkill(skillName, selectedCategory);
      setSkills([...skills, newSkill]);
      setSkillName("");
      setSuccess("Skill created successfully!");
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create skill");
    }
  };

  const handleDeleteSkill = async (id: string) => {
    if (!confirm("Are you sure?")) return;

    try {
      setError("");
      await deleteSkill(id);
      setSkills(skills.filter((s) => s.id !== id));
      setSuccess("Skill deleted successfully!");
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete skill");
    }
  };

  // Career Path handlers
  const handleCreateCareerPath = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pathTitle.trim()) {
      setError("Career path title is required");
      return;
    }

    try {
      setError("");
      setSuccess("");

      const newPath = await createCareerPath(pathTitle, pathDesc);
      setCareerPaths([...careerPaths, newPath]);
      setPathTitle("");
      setPathDesc("");
      setSuccess("Career path created successfully!");
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create career path");
    }
  };

  const handleDeleteCareerPath = async (id: string) => {
    if (!confirm("Are you sure?")) return;

    try {
      setError("");
      await deleteCareerPath(id);
      setCareerPaths(careerPaths.filter((p) => p.id !== id));
      setSuccess("Career path deleted successfully!");
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete career path");
    }
  };

  const handleLogout = () => {
    clearAuthToken();
    router.push("/");
  };

  return (
    <div className="min-h-screen px-6 py-12 bg-linear-to-br from-indigo-200 via-white to-blue-200 dark:from-zinc-950 dark:via-zinc-900 dark:to-black overflow-hidden relative">
      {/* Background blobs */}
      <motion.div
        className="absolute w-96 h-96 bg-blue-500/20 blur-3xl rounded-full -top-40 -left-40"
        animate={{ x: [0, 50, 0], y: [0, 40, 0] }}
        transition={{ duration: 12, repeat: Infinity }}
      />
      <motion.div
        className="absolute w-96 h-96 bg-purple-500/20 blur-3xl rounded-full -bottom-40 -right-40"
        animate={{ x: [0, -50, 0], y: [0, -40, 0] }}
        transition={{ duration: 14, repeat: Infinity }}
      />

      <div className="relative z-10 max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex justify-between items-center mb-12"
        >
          <div>
            <h1 className="text-4xl font-bold text-zinc-900 dark:text-white mb-2">
              Admin Panel
            </h1>
            <p className="text-zinc-600 dark:text-zinc-300">
              Manage categories, skills, and career paths
            </p>
          </div>
          <div className="flex gap-2">
            <Link href="/dashboard">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-4 py-2 rounded-xl bg-blue-500/80 hover:bg-blue-600/80 text-white font-medium transition"
              >
                Dashboard
              </motion.button>
            </Link>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleLogout}
              className="px-6 py-2 rounded-xl bg-red-500/80 hover:bg-red-600/80 text-white font-medium transition"
            >
              Logout
            </motion.button>
          </div>
        </motion.div>

        {/* Messages */}
        {error && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-600 dark:text-red-400"
          >
            {error}
          </motion.div>
        )}

        {success && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mb-6 p-4 rounded-xl bg-green-500/10 border border-green-500/30 text-green-600 dark:text-green-400"
          >
            {success}
          </motion.div>
        )}

        {loading ? (
          <div className="flex items-center justify-center h-96">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity }}
              className="w-12 h-12 border-4 border-blue-500/30 border-t-blue-500 rounded-full"
            />
          </div>
        ) : (
          <>
            {/* Tabs */}
            <div className="flex gap-4 mb-8">
              {(["categories", "skills", "career-paths"] as const).map((tab) => (
                <motion.button
                  key={tab}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setActiveTab(tab)}
                  className={`px-6 py-3 rounded-xl font-medium transition ${
                    activeTab === tab
                      ? "bg-blue-500/80 text-white"
                      : "bg-white/30 dark:bg-white/10 text-zinc-700 dark:text-zinc-300 hover:bg-white/50 dark:hover:bg-white/20"
                  }`}
                >
                  {tab === "categories"
                    ? "Categories"
                    : tab === "skills"
                    ? "Skills"
                    : "Career Paths"}
                </motion.button>
              ))}
            </div>

            {/* Content */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Categories */}
              {activeTab === "categories" && (
                <>
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="rounded-2xl p-8 backdrop-blur-xl bg-white/30 dark:bg-white/10 border border-white/30 dark:border-white/10"
                  >
                    <h2 className="text-2xl font-bold text-zinc-900 dark:text-white mb-6">
                      Add New Category
                    </h2>

                    <form onSubmit={handleCreateCategory} className="space-y-4">
                      <input
                        type="text"
                        placeholder="Category name"
                        value={categoryName}
                        onChange={(e) => setCategoryName(e.target.value)}
                        className="w-full px-4 py-3 rounded-lg bg-white/50 dark:bg-white/10 border border-white/30 text-zinc-900 dark:text-white placeholder-zinc-500 focus:outline-none focus:border-blue-500"
                      />
                      <textarea
                        placeholder="Description (optional)"
                        value={categoryDesc}
                        onChange={(e) => setCategoryDesc(e.target.value)}
                        className="w-full px-4 py-3 rounded-lg bg-white/50 dark:bg-white/10 border border-white/30 text-zinc-900 dark:text-white placeholder-zinc-500 focus:outline-none focus:border-blue-500 h-24"
                      />
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        type="submit"
                        className="w-full bg-blue-500/80 hover:bg-blue-600/80 text-white font-medium py-2 rounded-lg transition"
                      >
                        Create Category
                      </motion.button>
                    </form>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="rounded-2xl p-8 backdrop-blur-xl bg-white/30 dark:bg-white/10 border border-white/30 dark:border-white/10"
                  >
                    <h2 className="text-2xl font-bold text-zinc-900 dark:text-white mb-6">
                      Categories ({categories.length})
                    </h2>

                    <div className="space-y-3 max-h-96 overflow-y-auto">
                      {categories.map((cat) => (
                        <motion.div
                          key={cat.id}
                          whileHover={{ scale: 1.02 }}
                          className="flex justify-between items-center p-4 bg-white/50 dark:bg-white/10 rounded-lg border border-white/20"
                        >
                          <div>
                            <p className="font-medium text-zinc-900 dark:text-white">
                              {cat.name}
                            </p>
                            <p className="text-sm text-zinc-600 dark:text-zinc-400">
                              {cat.description || "No description"}
                            </p>
                          </div>
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => handleDeleteCategory(cat.id)}
                            className="px-3 py-1 rounded-lg bg-red-500/20 hover:bg-red-500/40 text-red-600 dark:text-red-400 text-sm"
                          >
                            Delete
                          </motion.button>
                        </motion.div>
                      ))}
                    </div>
                  </motion.div>
                </>
              )}

              {/* Skills */}
              {activeTab === "skills" && (
                <>
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="rounded-2xl p-8 backdrop-blur-xl bg-white/30 dark:bg-white/10 border border-white/30 dark:border-white/10"
                  >
                    <h2 className="text-2xl font-bold text-zinc-900 dark:text-white mb-6">
                      Add New Skill
                    </h2>

                    <form onSubmit={handleCreateSkill} className="space-y-4">
                      <select
                        value={selectedCategory}
                        onChange={(e) => setSelectedCategory(e.target.value)}
                        className="w-full px-4 py-3 rounded-lg bg-white/50 dark:bg-white/10 border border-white/30 text-zinc-900 dark:text-white focus:outline-none focus:border-blue-500"
                      >
                        <option value="">Select a category</option>
                        {categories.map((cat) => (
                          <option key={cat.id} value={cat.id}>
                            {cat.name}
                          </option>
                        ))}
                      </select>
                      <input
                        type="text"
                        placeholder="Skill name"
                        value={skillName}
                        onChange={(e) => setSkillName(e.target.value)}
                        className="w-full px-4 py-3 rounded-lg bg-white/50 dark:bg-white/10 border border-white/30 text-zinc-900 dark:text-white placeholder-zinc-500 focus:outline-none focus:border-blue-500"
                      />
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        type="submit"
                        className="w-full bg-blue-500/80 hover:bg-blue-600/80 text-white font-medium py-2 rounded-lg transition"
                      >
                        Create Skill
                      </motion.button>
                    </form>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="rounded-2xl p-8 backdrop-blur-xl bg-white/30 dark:bg-white/10 border border-white/30 dark:border-white/10"
                  >
                    <h2 className="text-2xl font-bold text-zinc-900 dark:text-white mb-6">
                      Skills ({skills.length})
                    </h2>

                    <div className="space-y-3 max-h-96 overflow-y-auto">
                      {skills.map((skill) => {
                        const category = categories.find(
                          (c) => c.id === skill.categoryId
                        );
                        return (
                          <motion.div
                            key={skill.id}
                            whileHover={{ scale: 1.02 }}
                            className="flex justify-between items-center p-4 bg-white/50 dark:bg-white/10 rounded-lg border border-white/20"
                          >
                            <div>
                              <p className="font-medium text-zinc-900 dark:text-white">
                                {skill.name}
                              </p>
                              <p className="text-sm text-zinc-600 dark:text-zinc-400">
                                {category?.name || "Unknown category"}
                              </p>
                            </div>
                            <motion.button
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={() => handleDeleteSkill(skill.id)}
                              className="px-3 py-1 rounded-lg bg-red-500/20 hover:bg-red-500/40 text-red-600 dark:text-red-400 text-sm"
                            >
                              Delete
                            </motion.button>
                          </motion.div>
                        );
                      })}
                    </div>
                  </motion.div>
                </>
              )}

              {/* Career Paths */}
              {activeTab === "career-paths" && (
                <>
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="rounded-2xl p-8 backdrop-blur-xl bg-white/30 dark:bg-white/10 border border-white/30 dark:border-white/10"
                  >
                    <h2 className="text-2xl font-bold text-zinc-900 dark:text-white mb-6">
                      Add New Career Path
                    </h2>

                    <form onSubmit={handleCreateCareerPath} className="space-y-4">
                      <input
                        type="text"
                        placeholder="Career path title"
                        value={pathTitle}
                        onChange={(e) => setPathTitle(e.target.value)}
                        className="w-full px-4 py-3 rounded-lg bg-white/50 dark:bg-white/10 border border-white/30 text-zinc-900 dark:text-white placeholder-zinc-500 focus:outline-none focus:border-blue-500"
                      />
                      <textarea
                        placeholder="Description (optional)"
                        value={pathDesc}
                        onChange={(e) => setPathDesc(e.target.value)}
                        className="w-full px-4 py-3 rounded-lg bg-white/50 dark:bg-white/10 border border-white/30 text-zinc-900 dark:text-white placeholder-zinc-500 focus:outline-none focus:border-blue-500 h-24"
                      />
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        type="submit"
                        className="w-full bg-blue-500/80 hover:bg-blue-600/80 text-white font-medium py-2 rounded-lg transition"
                      >
                        Create Career Path
                      </motion.button>
                    </form>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="rounded-2xl p-8 backdrop-blur-xl bg-white/30 dark:bg-white/10 border border-white/30 dark:border-white/10"
                  >
                    <h2 className="text-2xl font-bold text-zinc-900 dark:text-white mb-6">
                      Career Paths ({careerPaths.length})
                    </h2>

                    <div className="space-y-3 max-h-96 overflow-y-auto">
                      {careerPaths.map((path) => (
                        <motion.div
                          key={path.id}
                          whileHover={{ scale: 1.02 }}
                          className="flex justify-between items-center p-4 bg-white/50 dark:bg-white/10 rounded-lg border border-white/20"
                        >
                          <div>
                            <p className="font-medium text-zinc-900 dark:text-white">
                              {path.title}
                            </p>
                            <p className="text-sm text-zinc-600 dark:text-zinc-400">
                              {path.description || "No description"}
                            </p>
                          </div>
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => handleDeleteCareerPath(path.id)}
                            className="px-3 py-1 rounded-lg bg-red-500/20 hover:bg-red-500/40 text-red-600 dark:text-red-400 text-sm"
                          >
                            Delete
                          </motion.button>
                        </motion.div>
                      ))}
                    </div>
                  </motion.div>
                </>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
