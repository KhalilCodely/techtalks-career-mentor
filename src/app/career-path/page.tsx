"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import Link from "next/link";
import {
  getAllCareerPaths,
  enrollUserInCareerPath,
  getAuthToken,
  getCurrentUser,
  type CareerPath,
  type User,
} from "@/lib/api";

export default function CareerPathPage() {
  const router = useRouter();
  const [careerPaths, setCareerPaths] = useState<CareerPath[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [enrolling, setEnrolling] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    // Check authentication
    if (!getAuthToken()) {
      router.push("/login");
      return;
    }

    // Fetch current user and career paths
    const fetchData = async () => {
      try {
        setLoading(true);
        setError("");

        // Get current user to have access to userId
        const currentUser = await getCurrentUser();
        setUser(currentUser);

        // Fetch career paths
        const response = await getAllCareerPaths();
        
        // Extract array from API response
        // API returns { success: true, data: [...], count: N }
        const paths = Array.isArray(response) ? response : (Array.isArray((response as any)?.data) ? (response as any).data : []);
        setCareerPaths(paths);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to load career paths"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [router]);

  const handleEnroll = async (pathId: string) => {
    if (!user) {
      setError("User information not loaded");
      return;
    }

    try {
      setEnrolling(pathId);
      setError("");
      setSuccessMessage("");

      await enrollUserInCareerPath(user.id, pathId);
      setSuccessMessage("Successfully enrolled in career path! 🎉");
      setTimeout(() => {
        setSuccessMessage("");
      }, 3000);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to enroll in career path"
      );
    } finally {
      setEnrolling(null);
    }
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

      <div className="relative z-10 max-w-5xl mx-auto">
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
            Career Paths
          </h1>
          <p className="text-zinc-600 dark:text-zinc-300">
            Choose and enroll in a career path that suits your goals
          </p>
        </motion.div>

        {/* Messages */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-600 dark:text-red-400"
          >
            {error}
          </motion.div>
        )}

        {successMessage && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="mb-6 p-4 rounded-xl bg-green-500/10 border border-green-500/30 text-green-600 dark:text-green-400"
          >
            {successMessage}
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
        ) : careerPaths.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="p-12 rounded-2xl backdrop-blur-xl bg-white/30 dark:bg-white/10 border border-white/30 dark:border-white/10 text-center"
          >
            <p className="text-zinc-600 dark:text-zinc-300 text-lg">
              No career paths available yet
            </p>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {careerPaths.map((path, index) => (
              <motion.div
                key={path.id}
                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ y: -8, scale: 1.02 }}
                className="group relative overflow-hidden rounded-2xl backdrop-blur-xl bg-white/30 dark:bg-white/10 border border-white/30 dark:border-white/10 hover:shadow-2xl transition"
              >
                {/* Gradient overlay on hover */}
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/0 to-purple-500/0 group-hover:from-blue-500/10 group-hover:to-purple-500/10 transition" />

                <div className="relative p-6 h-full flex flex-col">
                  {/* Icon */}
                  <div className="w-12 h-12 rounded-xl bg-linear-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold mb-4 group-hover:scale-110 transition">
                    🎯
                  </div>

                  {/* Content */}
                  <h3 className="text-xl font-bold text-zinc-900 dark:text-white mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition">
                    {path.title}
                  </h3>

                  {path.description && (
                    <p className="text-sm text-zinc-600 dark:text-zinc-300 mb-4 flex-1">
                      {path.description}
                    </p>
                  )}

                  {/* Meta info */}
                  <div className="flex items-center gap-2 text-xs text-zinc-500 dark:text-zinc-400 mb-4">
                    <span>📅</span>
                    <span>
                      Created{" "}
                      {new Date(path.createdAt).toLocaleDateString()}
                    </span>
                  </div>

                  {/* Enroll Button */}
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleEnroll(path.id)}
                    disabled={enrolling === path.id}
                    className="w-full py-2 rounded-lg bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white font-medium transition disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {enrolling === path.id ? (
                      <span className="flex items-center justify-center gap-2">
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Infinity }}
                          className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full"
                        />
                        Enrolling...
                      </span>
                    ) : (
                      "Enroll Now"
                    )}
                  </motion.button>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* Footer */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-12 p-6 rounded-2xl backdrop-blur-xl bg-white/30 dark:bg-white/10 border border-white/30 dark:border-white/10 text-center"
        >
          <p className="text-zinc-600 dark:text-zinc-300 mb-4">
            Not sure which path to choose?
          </p>
          <Link href="/dashboard">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-6 py-2 rounded-lg bg-blue-500/80 hover:bg-blue-600/80 text-white font-medium transition"
            >
              Back to Dashboard
            </motion.button>
          </Link>
        </motion.div>
      </div>
    </div>
  );
}
