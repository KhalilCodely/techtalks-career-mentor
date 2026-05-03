"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  getAllCategories,
  getCategorySkills,
  Category,
  Skill,
} from "@/lib/api/services/categoryService";

export default function CategoriesDisplay() {
  const [categories, setCategoriesData] = useState<Category[]>([]);
  const [categorySkills, setCategorySkills] = useState<
    Record<string, Skill[]>
  >({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);

  useEffect(() => {
    const fetchCategories = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await getAllCategories(false);
        setCategoriesData(data);
      } catch (err) {
        const message = err instanceof Error ? err.message : "Failed to load categories";
        setError(message);
        console.error("Error fetching categories:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  const handleExpandCategory = async (categoryId: string) => {
    if (expandedCategory === categoryId) {
      setExpandedCategory(null);
      return;
    }

    // Fetch skills if not already loaded
    if (!categorySkills[categoryId]) {
      try {
        const skills = await getCategorySkills(categoryId);
        setCategorySkills((prev) => ({
          ...prev,
          [categoryId]: skills,
        }));
      } catch (err) {
        console.error("Error fetching skills:", err);
        setError("Failed to load skills");
      }
    }

    setExpandedCategory(categoryId);
  };

  if (loading) {
    return (
      <section className="py-20 px-6 bg-white dark:bg-zinc-950">
        <div className="max-w-4xl mx-auto">
          <div className="text-center">
            <motion.div
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="text-lg text-zinc-600 dark:text-zinc-300"
            >
              Loading categories...
            </motion.div>
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="py-20 px-6 bg-white dark:bg-zinc-950">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-4 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-lg"
          >
            <p className="text-red-600 dark:text-red-400">Error: {error}</p>
          </motion.div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-20 px-6 bg-white dark:bg-zinc-950">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 text-center"
        >
          <h2 className="text-3xl font-bold mb-2">Skill Categories</h2>
          <p className="text-zinc-600 dark:text-zinc-300">
            {categories.length} categories available
          </p>
        </motion.div>

        <div className="space-y-3">
          {categories.map((category, index) => (
            <motion.div
              key={category.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <button
                onClick={() => handleExpandCategory(category.id)}
                className="w-full p-4 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/30 dark:to-purple-950/30 border border-blue-200 dark:border-blue-800 rounded-lg hover:shadow-md transition-shadow text-left"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-zinc-900 dark:text-white">
                      {category.name}
                    </h3>
                    {category.description && (
                      <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-1">
                        {category.description}
                      </p>
                    )}
                  </div>
                  <motion.div
                    animate={{
                      rotate: expandedCategory === category.id ? 180 : 0,
                    }}
                    transition={{ duration: 0.2 }}
                  >
                    <svg
                      className="w-5 h-5 text-zinc-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 14l-7 7m0 0l-7-7m7 7V3"
                      />
                    </svg>
                  </motion.div>
                </div>
              </button>

              {/* Skills list */}
              {expandedCategory === category.id && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mt-2 ml-4 p-3 bg-zinc-50 dark:bg-zinc-900 rounded-lg border border-zinc-200 dark:border-zinc-800"
                >
                  {categorySkills[category.id]?.length === 0 ? (
                    <p className="text-sm text-zinc-500">No skills in this category</p>
                  ) : (
                    <ul className="space-y-2">
                      {categorySkills[category.id]?.map((skill) => (
                        <motion.li
                          key={skill.id}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          className="text-sm text-zinc-700 dark:text-zinc-300 p-2 bg-white dark:bg-zinc-800 rounded border border-zinc-200 dark:border-zinc-700"
                        >
                          {skill.name}
                        </motion.li>
                      ))}
                    </ul>
                  )}
                </motion.div>
              )}
            </motion.div>
          ))}
        </div>

        {categories.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12"
          >
            <p className="text-zinc-600 dark:text-zinc-400">
              No categories available yet
            </p>
          </motion.div>
        )}
      </div>
    </section>
  );
}
