"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import Link from "next/link";
import {
  getUserCareerPaths,
  updateCareerProgress,
  getAuthToken,
  clearAuthToken,
  getCurrentUser,
  type User,
} from "@/lib/api";

interface UserCareerPathWithData {
  id: string;
  userId: string;
  careerPathId: string;
  progress: number;
  enrolledAt: string;
  updatedAt: string;
  careerPath?: {
    title: string;
    description?: string;
  };
}

export default function ProgressPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [enrolledPaths, setEnrolledPaths] = useState<UserCareerPathWithData[]>(
    []
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  useEffect(() => {
    if (!getAuthToken()) {
      router.push("/login");
      return;
    }

    const fetchData = async () => {
      try {
        setLoading(true);
        setError("");

        // Get current user
        const currentUser = await getCurrentUser();
        setUser(currentUser);

        // Get user's enrolled paths
        const response = await getUserCareerPaths(currentUser.id);

        // Extract array from response
        const paths = Array.isArray(response)
          ? response
          : Array.isArray((response as any)?.data)
          ? (response as any).data
          : [];

        setEnrolledPaths(paths as UserCareerPathWithData[]);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load progress");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [router]);

  const handleUpdateProgress = async (pathId: string, newProgress: number) => {
    if (!user) return;

    try {
      setUpdatingId(pathId);
      setError("");

      await updateCareerProgress(user.id, pathId, newProgress);

      // Update local state
      setEnrolledPaths(
        enrolledPaths.map((p) =>
          p.careerPathId === pathId ? { ...p, progress: newProgress } : p
        )
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update progress");
    } finally {
      setUpdatingId(null);
    }
  };

  const handleLogout = () => {
    clearAuthToken();
    router.push("/");
  };

  const getProgressColor = (progress: number) => {
    if (progress < 33) return "from-red-400 to-red-600";
    if (progress < 66) return "from-yellow-400 to-yellow-600";
    return "from-green-400 to-green-600";
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
          className="flex justify-between items-center mb-12"
        >
          <div>
            <h1 className="text-4xl font-bold text-zinc-900 dark:text-white mb-2">
              My Learning Progress
            </h1>
            <p className="text-zinc-600 dark:text-zinc-300">
              Track your progress across enrolled career paths
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

        {/* Error Message */}
        {error && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
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
        ) : enrolledPaths.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="p-12 rounded-2xl backdrop-blur-xl bg-white/30 dark:bg-white/10 border border-white/30 dark:border-white/10 text-center"
          >
            <p className="text-zinc-600 dark:text-zinc-300 text-lg mb-4">
              You haven't enrolled in any career paths yet
            </p>
            <Link href="/career-path">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-6 py-2 rounded-xl bg-blue-500/80 hover:bg-blue-600/80 text-white font-medium transition"
              >
                Explore Career Paths
              </motion.button>
            </Link>
          </motion.div>
        ) : (
          <div className="space-y-6">
            {/* Stats */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="grid grid-cols-1 md:grid-cols-3 gap-4"
            >
              <motion.div
                whileHover={{ scale: 1.05 }}
                className="p-6 rounded-2xl backdrop-blur-xl bg-white/30 dark:bg-white/10 border border-white/30 dark:border-white/10 text-center"
              >
                <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-2">
                  Enrolled Paths
                </p>
                <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                  {enrolledPaths.length}
                </p>
              </motion.div>

              <motion.div
                whileHover={{ scale: 1.05 }}
                className="p-6 rounded-2xl backdrop-blur-xl bg-white/30 dark:bg-white/10 border border-white/30 dark:border-white/10 text-center"
              >
                <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-2">
                  Average Progress
                </p>
                <p className="text-3xl font-bold text-purple-600 dark:text-purple-400">
                  {enrolledPaths.length > 0
                    ? Math.round(
                        enrolledPaths.reduce((sum, p) => sum + p.progress, 0) /
                          enrolledPaths.length
                      )
                    : 0}
                  %
                </p>
              </motion.div>

              <motion.div
                whileHover={{ scale: 1.05 }}
                className="p-6 rounded-2xl backdrop-blur-xl bg-white/30 dark:bg-white/10 border border-white/30 dark:border-white/10 text-center"
              >
                <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-2">
                  Completed
                </p>
                <p className="text-3xl font-bold text-green-600 dark:text-green-400">
                  {enrolledPaths.filter((p) => p.progress === 100).length}
                </p>
              </motion.div>
            </motion.div>

            {/* Progress Cards */}
            <div className="space-y-4">
              {enrolledPaths.map((path, index) => (
                <motion.div
                  key={path.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ scale: 1.02 }}
                  className="p-6 rounded-2xl backdrop-blur-xl bg-white/30 dark:bg-white/10 border border-white/30 dark:border-white/10"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-xl font-bold text-zinc-900 dark:text-white mb-1">
                        {path.careerPath?.title || "Unknown Path"}
                      </h3>
                      <p className="text-sm text-zinc-600 dark:text-zinc-400">
                        {path.careerPath?.description || "No description"}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-3xl font-bold text-blue-600">
                        {path.progress}%
                      </p>
                      <p className="text-xs text-zinc-500">
                        {path.progress === 100 ? "Completed! 🎉" : "In Progress"}
                      </p>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="mb-4">
                    <div className="h-2 bg-white/20 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${path.progress}%` }}
                        transition={{ delay: 0.2, duration: 0.8 }}
                        className={`h-full bg-gradient-to-r ${getProgressColor(path.progress)}`}
                      />
                    </div>
                  </div>

                  {/* Progress Controls */}
                  <div className="flex gap-2 flex-wrap">
                    {[0, 25, 50, 75, 100].map((val) => (
                      <motion.button
                        key={val}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleUpdateProgress(path.careerPathId, val)}
                        disabled={updatingId === path.careerPathId}
                        className={`px-3 py-1 rounded-lg text-sm font-medium transition ${
                          path.progress === val
                            ? "bg-blue-500/80 text-white"
                            : "bg-white/20 hover:bg-white/40 text-zinc-900 dark:text-white"
                        } disabled:opacity-50 disabled:cursor-not-allowed`}
                      >
                        {val}%
                      </motion.button>
                    ))}
                  </div>

                  {/* Enrollment Info */}
                  <div className="mt-4 pt-4 border-t border-white/10">
                    <p className="text-xs text-zinc-500">
                      Enrolled:{" "}
                      {new Date(path.enrolledAt).toLocaleDateString()}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
