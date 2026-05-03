"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import Link from "next/link";
import {
  getAllCategories,
  getCategorySkills,
  getAuthToken,
  type Category,
  type Skill,
} from "@/lib/api";

interface CategoryWithSkills extends Category {
  skills: Skill[];
}

export default function CategoriesPage() {
  const router = useRouter();
  const [categories, setCategories] = useState<CategoryWithSkills[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);
  const [loadingSkills, setLoadingSkills] = useState<string | null>(null);

  useEffect(() => {
    // Check authentication
    if (!getAuthToken()) {
      router.push("/login");
      return;
    }

    // Fetch categories
    const fetchCategories = async () => {
      try {
        setLoading(true);
        setError("");
        const response = await getAllCategories();
        
        // Extract categories array from response
        // API wraps responses in { success: true, data: {...}, count: N }
        const data = Array.isArray(response)
          ? response
          : (Array.isArray((response as any)?.data) ? (response as any).data : []);
        
        setCategories(
          data.map((cat: any) => ({
            ...cat,
            skills: [],
          }))
        );
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to load categories"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, [router]);

  const handleExpandCategory = async (categoryId: string) => {
    if (expandedCategory === categoryId) {
      setExpandedCategory(null);
      return;
    }

    try {
      setLoadingSkills(categoryId);
      const skillsResponse = await getCategorySkills(categoryId);
      
      // Extract skills array from response
      // API wraps responses in { success: true, data: {...}, ... }
      const skills = Array.isArray(skillsResponse)
        ? skillsResponse
        : (Array.isArray((skillsResponse as any)?.data) ? (skillsResponse as any).data : []);
      
      setCategories((prev) =>
        prev.map((cat) =>
          cat.id === categoryId ? { ...cat, skills } : cat
        )
      );
      setExpandedCategory(categoryId);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to load category skills"
      );
    } finally {
      setLoadingSkills(null);
    }
  };

  const categoryEmojis: Record<string, string> = {
    development: "💻",
    design: "🎨",
    data: "📊",
    devops: "🚀",
    marketing: "📢",
    business: "💼",
    default: "📚",
  };

  const getEmoji = (categoryName: string) => {
    const key = categoryName.toLowerCase().replace(/\s+/g, "");
    return categoryEmojis[key] || categoryEmojis.default;
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

      <div className="relative z-10 max-w-4xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12"
        >
          <Link href="/dashboard">
            <motion.button
              whileHover={{ x: -5 }}
              className="text-blue-600 dark:text-blue-400 hover:underline text-sm font-medium mb-4"
            >
              ← Back to Dashboard
            </motion.button>
          </Link>
          <h1 className="text-4xl font-bold text-zinc-900 dark:text-white mb-2">
            Skill Categories
          </h1>
          <p className="text-zinc-600 dark:text-zinc-300">
            Explore all available skill categories and discover what you can learn
          </p>
        </motion.div>

        {/* Error Message */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-600 dark:text-red-400"
          >
            {error}
          </motion.div>
        )}

        {/* Loading State */}
        {loading ? (
          <div className="flex items-center justify-center h-96">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity }}
              className="w-12 h-12 border-4 border-blue-500/30 border-t-blue-500 rounded-full"
            />
          </div>
        ) : categories.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="p-12 rounded-2xl backdrop-blur-xl bg-white/30 dark:bg-white/10 border border-white/30 dark:border-white/10 text-center"
          >
            <p className="text-zinc-600 dark:text-zinc-300 text-lg">
              No categories available yet
            </p>
          </motion.div>
        ) : (
          <div className="space-y-4">
            {categories.map((category, index) => (
              <motion.div
                key={category.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="rounded-2xl backdrop-blur-xl bg-white/30 dark:bg-white/10 border border-white/30 dark:border-white/10 overflow-hidden hover:shadow-lg transition"
              >
                {/* Category Header */}
                <motion.button
                  onClick={() => handleExpandCategory(category.id)}
                  className="w-full p-6 flex items-center justify-between hover:bg-white/20 dark:hover:bg-white/5 transition"
                >
                  <div className="flex items-center gap-4 text-left flex-1">
                    <div className="text-3xl">
                      {getEmoji(category.name)}
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-zinc-900 dark:text-white">
                        {category.name}
                      </h3>
                      {category.description && (
                        <p className="text-sm text-zinc-600 dark:text-zinc-300 mt-1">
                          {category.description}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Expand Icon */}
                  <motion.div
                    animate={{
                      rotate: expandedCategory === category.id ? 180 : 0,
                    }}
                    className="text-2xl"
                  >
                    ⌄
                  </motion.div>
                </motion.button>

                {/* Skills List */}
                {expandedCategory === category.id && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="border-t border-white/20 dark:border-white/10 p-6 bg-white/10 dark:bg-white/5"
                  >
                    {loadingSkills === category.id ? (
                      <div className="flex items-center justify-center py-8">
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Infinity }}
                          className="w-6 h-6 border-2 border-blue-500/30 border-t-blue-500 rounded-full"
                        />
                      </div>
                    ) : category.skills.length === 0 ? (
                      <p className="text-zinc-600 dark:text-zinc-300 text-center py-4">
                        No skills in this category yet
                      </p>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {category.skills.map((skill, skillIndex) => (
                          <motion.div
                            key={skill.id}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: skillIndex * 0.05 }}
                            className="p-3 rounded-lg bg-white/20 dark:bg-white/10 border border-white/20 dark:border-white/10 hover:bg-white/30 dark:hover:bg-white/20 transition"
                          >
                            <h4 className="font-medium text-zinc-900 dark:text-white">
                              ⚡ {skill.name}
                            </h4>
                          </motion.div>
                        ))}
                      </div>
                    )}
                  </motion.div>
                )}
              </motion.div>
            ))}
          </div>
        )}

        {/* Stats Summary */}
        {!loading && categories.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mt-12 p-6 rounded-2xl backdrop-blur-xl bg-white/30 dark:bg-white/10 border border-white/30 dark:border-white/10 text-center"
          >
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div>
                <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                  {categories.length}
                </p>
                <p className="text-sm text-zinc-600 dark:text-zinc-300">
                  Categories
                </p>
              </div>
              <div>
                <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                  {categories.reduce((sum, cat) => sum + cat.skills.length, 0)}
                </p>
                <p className="text-sm text-zinc-600 dark:text-zinc-300">
                  Skills Loaded
                </p>
              </div>
              <div>
                <p className="text-2xl font-bold text-pink-600 dark:text-pink-400">
                  📚
                </p>
                <p className="text-sm text-zinc-600 dark:text-zinc-300">
                  Click to Explore
                </p>
              </div>
            </div>
          </motion.div>
        )}

        {/* Footer */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-8 text-center"
        >
          <Link href="/dashboard">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-6 py-2 rounded-lg bg-blue-500/80 hover:bg-blue-600/80 text-white font-medium transition"
            >
              ← Back to Dashboard
            </motion.button>
          </Link>
        </motion.div>
      </div>
    </div>
  );
}
