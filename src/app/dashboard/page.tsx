"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import Link from "next/link";
import {
  getAllCareerPaths,
  getAllCategories,
  getAllSkills,
  getAuthToken,
  clearAuthToken,
  type CareerPath,
  type Category,
} from "@/lib/api";

// Helper to extract array from API response
function extractArray<T>(response: unknown): T[] {
  if (Array.isArray(response)) {
    return response;
  }
  if (response && typeof response === "object" && "data" in response) {
    const data = (response as Record<string, unknown>).data;
    if (Array.isArray(data)) {
      return data;
    }
  }
  return [];
}

interface DashboardStats {
  careerPaths: number;
  categories: number;
  skills: number;
}

export default function DashboardPage() {
  const router = useRouter();
  const [stats, setStats] = useState<DashboardStats>({
    careerPaths: 0,
    categories: 0,
    skills: 0,
  });
  const [careerPaths, setCareerPaths] = useState<CareerPath[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    // Check authentication
    if (!getAuthToken()) {
      router.push("/login");
      return;
    }

    // Fetch data
    const fetchData = async () => {
      try {
        setLoading(true);
        setError("");

        const [pathsResponse, categoriesResponse, skillsResponse] = await Promise.all([
          getAllCareerPaths(),
          getAllCategories(),
          getAllSkills(),
        ]);

        // Extract arrays from API responses using helper
        const pathsArray = extractArray<CareerPath>(pathsResponse);
        const categoriesArray = extractArray<Category>(categoriesResponse);
        const skillsArray = extractArray<unknown>(skillsResponse);

        setCareerPaths(pathsArray);
        setCategories(categoriesArray);
        setStats({
          careerPaths: pathsArray.length,
          categories: categoriesArray.length,
          skills: skillsArray.length,
        });
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to load dashboard data"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [router]);

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
              Dashboard
            </h1>
            <p className="text-zinc-600 dark:text-zinc-300">
              Welcome back! Here&apos;s your career development overview
            </p>
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleLogout}
            className="px-6 py-2 rounded-xl bg-red-500/80 hover:bg-red-600/80 text-white font-medium transition"
          >
            Logout
          </motion.button>
        </motion.div>

        {error && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-600 dark:text-red-400"
          >
            {error}
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
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
              {[
                {
                  title: "Career Paths",
                  value: stats.careerPaths,
                  icon: "🎯",
                  color: "from-blue-500 to-cyan-500",
                },
                {
                  title: "Categories",
                  value: stats.categories,
                  icon: "📚",
                  color: "from-purple-500 to-pink-500",
                },
                {
                  title: "Skills",
                  value: stats.skills,
                  icon: "⚡",
                  color: "from-orange-500 to-red-500",
                },
              ].map((stat, index) => (
                <motion.div
                  key={stat.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ y: -5 }}
                  className="p-6 rounded-2xl backdrop-blur-xl bg-white/30 dark:bg-white/10 border border-white/30 dark:border-white/10 shadow-lg hover:shadow-xl transition"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-zinc-600 dark:text-zinc-300 text-sm font-medium mb-2">
                        {stat.title}
                      </p>
                      <p className={`text-4xl font-bold bg-linear-to-r ${stat.color} bg-clip-text text-transparent`}>
                        {stat.value}
                      </p>
                    </div>
                    <span className="text-3xl">{stat.icon}</span>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Career Paths Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="mb-12"
            >
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-zinc-900 dark:text-white">
                  Available Career Paths
                </h2>
                <Link href="/career-path">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="px-4 py-2 rounded-lg bg-blue-500/80 hover:bg-blue-600/80 text-white text-sm font-medium transition"
                  >
                    View All →
                  </motion.button>
                </Link>
              </div>

              {careerPaths.length === 0 ? (
                <div className="p-8 rounded-2xl backdrop-blur-xl bg-white/20 dark:bg-white/5 border border-white/20 text-center text-zinc-600 dark:text-zinc-400">
                  No career paths available yet
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {careerPaths.slice(0, 4).map((path, index) => (
                    <motion.div
                      key={path.id}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: index * 0.05 }}
                      whileHover={{ y: -2 }}
                      className="p-4 rounded-xl backdrop-blur-xl bg-white/30 dark:bg-white/10 border border-white/30 dark:border-white/10 hover:shadow-lg transition"
                    >
                      <h3 className="font-semibold text-zinc-900 dark:text-white mb-1">
                        {path.title}
                      </h3>
                      {path.description && (
                        <p className="text-sm text-zinc-600 dark:text-zinc-300 line-clamp-2">
                          {path.description}
                        </p>
                      )}
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.div>

            {/* Categories Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-zinc-900 dark:text-white">
                  Skill Categories
                </h2>
                <Link href="/categories">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="px-4 py-2 rounded-lg bg-purple-500/80 hover:bg-purple-600/80 text-white text-sm font-medium transition"
                  >
                    View All →
                  </motion.button>
                </Link>
              </div>

              {categories.length === 0 ? (
                <div className="p-8 rounded-2xl backdrop-blur-xl bg-white/20 dark:bg-white/5 border border-white/20 text-center text-zinc-600 dark:text-zinc-400">
                  No categories available yet
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {categories.slice(0, 3).map((category, index) => (
                    <motion.div
                      key={category.id}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: index * 0.05 }}
                      whileHover={{ y: -2 }}
                      className="p-4 rounded-xl backdrop-blur-xl bg-white/30 dark:bg-white/10 border border-white/30 dark:border-white/10 hover:shadow-lg transition"
                    >
                      <h3 className="font-semibold text-zinc-900 dark:text-white mb-1">
                        {category.name}
                      </h3>
                      {category.description && (
                        <p className="text-sm text-zinc-600 dark:text-zinc-300 line-clamp-2">
                          {category.description}
                        </p>
                      )}
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.div>

            {/* Quick Links */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="mt-12 p-6 rounded-2xl backdrop-blur-xl bg-white/30 dark:bg-white/10 border border-white/30 dark:border-white/10"
            >
              <h3 className="text-lg font-semibold text-zinc-900 dark:text-white mb-4">
                Quick Navigation
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { href: "/categories", label: "Categories", emoji: "📚" },
                  { href: "/career-path", label: "Career Paths", emoji: "🎯" },
                  { href: "/profile", label: "My Profile", emoji: "👤" },
                  { href: "/", label: "Back Home", emoji: "🏠" },
                ].map((link) => (
                  <Link key={link.href} href={link.href}>
                    <motion.div
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="p-4 rounded-xl bg-white/40 dark:bg-white/5 border border-white/30 dark:border-white/10 hover:bg-white/50 dark:hover:bg-white/10 transition text-center cursor-pointer"
                    >
                      <div className="text-2xl mb-2">{link.emoji}</div>
                      <p className="text-sm font-medium text-zinc-900 dark:text-white">
                        {link.label}
                      </p>
                    </motion.div>
                  </Link>
                ))}
              </div>
            </motion.div>
          </>
        )}
      </div>
    </div>
  );
}
