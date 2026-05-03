"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import Link from "next/link";
import {
  apiGet,
  apiPatch,
  getAuthToken,
  clearAuthToken,
  updateUserProfile,
  type User,
} from "@/lib/api";

interface UserProfile extends User {
  bio?: string;
  education?: string;
  experienceLevel?: string;
  careerGoal?: string;
}

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isEditing, setIsEditing] = useState(false);

  // Form state
  const [bio, setBio] = useState("");
  const [education, setEducation] = useState("");
  const [experienceLevel, setExperienceLevel] = useState("");
  const [careerGoal, setCareerGoal] = useState("");

  // Toggle preferences state
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [weeklyProgressReports, setWeeklyProgressReports] = useState(true);
  const [communityUpdates, setCommunityUpdates] = useState(false);
  const [savingToggle, setSavingToggle] = useState(false);
  const [toggleSuccess, setToggleSuccess] = useState("");

  useEffect(() => {
    // Check authentication
    if (!getAuthToken()) {
      router.push("/login");
      return;
    }

    // Fetch user profile
    const fetchProfile = async () => {
      try {
        setLoading(true);
        setError("");

        // Get user info from protected route
        const response = await apiGet<User>("/protected/user");

        if (!response.success) {
          throw new Error(response.error || "Failed to fetch profile");
        }

        // Extract user data from response
        // API response structure: { success: true, data: { success: true, data: { id, name, email, ... } } }
        // So actual user is at response.data.data
        const userData = (response.data as any)?.data || response.data;
        if (userData && typeof userData === 'object' && 'id' in userData && 'name' in userData && 'email' in userData) {
          const profileData = userData as UserProfile;
          setUser(profileData);
          // Initialize form with profile data
          setBio(profileData.bio || "");
          setEducation(profileData.education || "");
          setExperienceLevel(profileData.experienceLevel || "");
          setCareerGoal(profileData.careerGoal || "");
          // Load toggle preferences
          setEmailNotifications((profileData as any).emailNotifications !== false);
          setWeeklyProgressReports((profileData as any).weeklyProgressReports !== false);
          setCommunityUpdates((profileData as any).communityUpdates === true);
        } else {
          setUser(null);
        }
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to load profile"
        );
        // If unauthorized, redirect to login
        if (err instanceof Error && err.message.includes("Unauthorized")) {
          clearAuthToken();
          router.push("/login");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [router]);

  const handleToggleSave = async (
    toggleName: string,
    toggleValue: boolean
  ) => {
    try {
      setSavingToggle(true);
      setToggleSuccess("");
      setError("");

      const payload: Record<string, boolean> = {
        [toggleName]: toggleValue,
      };

      const response = await apiPatch<any>("/protected/user", payload);

      if (!response.success) {
        throw new Error(response.error || "Failed to save preference");
      }

      setToggleSuccess(`Saved!`);
      setTimeout(() => setToggleSuccess(""), 2000);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to save preference"
      );
      setTimeout(() => setError(""), 3000);
    } finally {
      setSavingToggle(false);
    }
  };

  const handleLogout = () => {
    clearAuthToken();
    router.push("/");
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setError("");
      setSuccess("");

      await updateUserProfile({
        bio,
        education,
        experienceLevel,
        careerGoal,
      });

      setSuccess("Profile updated successfully!");
      setIsEditing(false);
      setTimeout(() => setSuccess(""), 3000);

      // Refresh user data
      if (user) {
        setUser({
          ...user,
          bio,
          education,
          experienceLevel,
          careerGoal,
        });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update profile");
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5 },
    },
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

      <div className="relative z-10 max-w-3xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <Link href="/dashboard">
            <motion.button
              whileHover={{ x: -5 }}
              className="text-blue-600 dark:text-blue-400 hover:underline text-sm font-medium mb-4"
            >
              ← Back to Dashboard
            </motion.button>
          </Link>
          <h1 className="text-4xl font-bold text-zinc-900 dark:text-white">
            My Profile
          </h1>
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
        ) : !user ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="p-12 rounded-2xl backdrop-blur-xl bg-white/30 dark:bg-white/10 border border-white/30 dark:border-white/10 text-center"
          >
            <p className="text-zinc-600 dark:text-zinc-300 text-lg mb-4">
              Unable to load your profile
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
        ) : (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="space-y-6"
          >
            {/* Profile Card */}
            <motion.div
              variants={itemVariants}
              whileHover={{ y: -5 }}
              className="p-8 rounded-2xl backdrop-blur-xl bg-white/30 dark:bg-white/10 border border-white/30 dark:border-white/10 shadow-lg hover:shadow-xl transition"
            >
              <div className="flex flex-col md:flex-row gap-6 md:gap-8 items-start md:items-center">
                {/* Avatar */}
                <motion.div
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  className="w-20 h-20 rounded-2xl bg-linear-to-br from-blue-500 via-purple-500 to-pink-500 flex items-center justify-center text-white text-3xl font-bold shadow-lg flex-shrink-0"
                >
                  {user.name.charAt(0).toUpperCase()}
                </motion.div>

                {/* User Info */}
                <div className="flex-1">
                  <h2 className="text-3xl font-bold text-zinc-900 dark:text-white mb-1">
                    {user.name}
                  </h2>
                  <p className="text-blue-600 dark:text-blue-400 font-medium mb-3">
                    {user.email}
                  </p>
                  <p className="text-sm text-zinc-600 dark:text-zinc-300">
                    Member since{" "}
                    {new Date(user.id).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                    })}
                  </p>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3 w-full md:w-auto flex-col md:flex-row">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setIsEditing(!isEditing)}
                    className="px-6 py-2 rounded-lg bg-blue-500/80 hover:bg-blue-600/80 text-white font-medium transition"
                  >
                    {isEditing ? "Cancel" : "Edit Profile"}
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleLogout}
                    className="px-6 py-2 rounded-lg bg-red-500/80 hover:bg-red-600/80 text-white font-medium transition"
                  >
                    Logout
                  </motion.button>
                </div>
              </div>
            </motion.div>

            {/* Success Message */}
            {success && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="p-4 rounded-xl bg-green-500/10 border border-green-500/30 text-green-600 dark:text-green-400"
              >
                {success}
              </motion.div>
            )}

            {/* Edit Profile Form */}
            {isEditing && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                variants={itemVariants}
                className="p-8 rounded-2xl backdrop-blur-xl bg-white/30 dark:bg-white/10 border border-white/30 dark:border-white/10"
              >
                <h3 className="text-2xl font-bold text-zinc-900 dark:text-white mb-6">
                  Edit Profile Information
                </h3>

                <form onSubmit={handleUpdateProfile} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-zinc-900 dark:text-white mb-2">
                      Bio
                    </label>
                    <textarea
                      value={bio}
                      onChange={(e) => setBio(e.target.value)}
                      placeholder="Tell us about yourself..."
                      className="w-full px-4 py-3 rounded-lg bg-white/50 dark:bg-white/10 border border-white/30 text-zinc-900 dark:text-white placeholder-zinc-500 focus:outline-none focus:border-blue-500 h-24"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-zinc-900 dark:text-white mb-2">
                      Education
                    </label>
                    <input
                      type="text"
                      value={education}
                      onChange={(e) => setEducation(e.target.value)}
                      placeholder="e.g., Bachelor's in Computer Science"
                      className="w-full px-4 py-3 rounded-lg bg-white/50 dark:bg-white/10 border border-white/30 text-zinc-900 dark:text-white placeholder-zinc-500 focus:outline-none focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-zinc-900 dark:text-white mb-2">
                      Experience Level
                    </label>
                    <select
                      value={experienceLevel}
                      onChange={(e) => setExperienceLevel(e.target.value)}
                      className="w-full px-4 py-3 rounded-lg bg-white/50 dark:bg-white/10 border border-white/30 text-zinc-900 dark:text-white focus:outline-none focus:border-blue-500"
                    >
                      <option value="">Select experience level</option>
                      <option value="beginner">Beginner</option>
                      <option value="intermediate">Intermediate</option>
                      <option value="advanced">Advanced</option>
                      <option value="expert">Expert</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-zinc-900 dark:text-white mb-2">
                      Career Goal
                    </label>
                    <textarea
                      value={careerGoal}
                      onChange={(e) => setCareerGoal(e.target.value)}
                      placeholder="What are your career aspirations?"
                      className="w-full px-4 py-3 rounded-lg bg-white/50 dark:bg-white/10 border border-white/30 text-zinc-900 dark:text-white placeholder-zinc-500 focus:outline-none focus:border-blue-500 h-24"
                    />
                  </div>

                  <div className="flex gap-3 pt-4">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      type="submit"
                      className="flex-1 px-6 py-3 rounded-lg bg-green-500/80 hover:bg-green-600/80 text-white font-medium transition"
                    >
                      Save Changes
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      type="button"
                      onClick={() => setIsEditing(false)}
                      className="flex-1 px-6 py-3 rounded-lg bg-zinc-500/80 hover:bg-zinc-600/80 text-white font-medium transition"
                    >
                      Cancel
                    </motion.button>
                  </div>
                </form>
              </motion.div>
            )}

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                {
                  label: "Account Type",
                  value: (user as any).role || "User",
                  emoji: "👤",
                  color: "from-blue-500 to-cyan-500",
                },
                {
                  label: "Profile Status",
                  value: bio ? "Complete" : "Incomplete",
                  emoji: "📝",
                  color: "from-yellow-500 to-orange-500",
                },
                {
                  label: "Member Since",
                  value: new Date((user as any).createdAt || Date.now()).toLocaleDateString("en-US", {
                    month: "short",
                    year: "numeric",
                  }),
                  emoji: "📅",
                  color: "from-red-500 to-pink-500",
                },
              ].map((stat, index) => (
                <motion.div
                  key={stat.label}
                  variants={itemVariants}
                  whileHover={{ y: -5 }}
                  className="p-6 rounded-xl backdrop-blur-xl bg-white/30 dark:bg-white/10 border border-white/30 dark:border-white/10 hover:shadow-lg transition"
                >
                  <div className="flex justify-between items-start mb-3">
                    <span className="text-2xl">{stat.emoji}</span>
                  </div>
                  <p className="text-xs text-zinc-600 dark:text-zinc-300 font-medium mb-2 uppercase tracking-wider">
                    {stat.label}
                  </p>
                  <p
                    className={`text-3xl font-bold bg-linear-to-r ${stat.color} bg-clip-text text-transparent`}
                  >
                    {stat.value}
                  </p>
                </motion.div>
              ))}
            </div>

            {/* Learning Activity */}
            <motion.div
              variants={itemVariants}
              className="p-8 rounded-2xl backdrop-blur-xl bg-white/30 dark:bg-white/10 border border-white/30 dark:border-white/10"
            >
              <h3 className="text-xl font-bold text-zinc-900 dark:text-white mb-6">
                Recent Activity
              </h3>

              <div className="space-y-4">
                {[
                  {
                    title: "Enrolled in Web Development",
                    date: "2 days ago",
                    icon: "💻",
                  },
                  {
                    title: "Completed React Basics",
                    date: "1 week ago",
                    icon: "✅",
                  },
                  {
                    title: "Started TypeScript Path",
                    date: "2 weeks ago",
                    icon: "🚀",
                  },
                ].map((activity, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex gap-4 p-4 rounded-lg bg-white/20 dark:bg-white/5 border border-white/20 dark:border-white/10 hover:bg-white/30 dark:hover:bg-white/10 transition"
                  >
                    <span className="text-2xl flex-shrink-0">
                      {activity.icon}
                    </span>
                    <div className="flex-1">
                      <p className="font-medium text-zinc-900 dark:text-white">
                        {activity.title}
                      </p>
                      <p className="text-sm text-zinc-600 dark:text-zinc-400">
                        {activity.date}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* Account Settings */}
            <motion.div
              variants={itemVariants}
              className="p-8 rounded-2xl backdrop-blur-xl bg-white/30 dark:bg-white/10 border border-white/30 dark:border-white/10"
            >
              <h3 className="text-xl font-bold text-zinc-900 dark:text-white mb-6">
                Account Settings
              </h3>

              <div className="space-y-3">
                {[
                  {
                    label: "Email Notifications",
                    state: emailNotifications,
                    toggleKey: "emailNotifications",
                  },
                  {
                    label: "Weekly Progress Reports",
                    state: weeklyProgressReports,
                    toggleKey: "weeklyProgressReports",
                  },
                  {
                    label: "Community Updates",
                    state: communityUpdates,
                    toggleKey: "communityUpdates",
                  },
                ].map((setting, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="flex items-center justify-between p-4 rounded-lg bg-white/20 dark:bg-white/5 border border-white/20 dark:border-white/10 hover:bg-white/30 dark:hover:bg-white/10 transition"
                  >
                    <label className="text-zinc-900 dark:text-white font-medium cursor-pointer">
                      {setting.label}
                    </label>
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      disabled={savingToggle}
                      onClick={() => {
                        const newValue = !setting.state;
                        if (setting.toggleKey === "emailNotifications") {
                          setEmailNotifications(newValue);
                          handleToggleSave("emailNotifications", newValue);
                        } else if (setting.toggleKey === "weeklyProgressReports") {
                          setWeeklyProgressReports(newValue);
                          handleToggleSave("weeklyProgressReports", newValue);
                        } else if (setting.toggleKey === "communityUpdates") {
                          setCommunityUpdates(newValue);
                          handleToggleSave("communityUpdates", newValue);
                        }
                      }}
                      className={`w-12 h-6 rounded-full transition ${
                        setting.state
                          ? "bg-green-500"
                          : "bg-zinc-400 dark:bg-zinc-600"
                      } ${savingToggle ? "opacity-50 cursor-not-allowed" : ""}`}
                    >
                      <motion.div
                        animate={{
                          x: setting.state ? 24 : 2,
                        }}
                        className="w-5 h-5 bg-white rounded-full"
                      />
                    </motion.button>
                  </motion.div>
                ))}
              </div>

              {toggleSuccess && (
                <motion.div
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -5 }}
                  className="mt-4 p-3 rounded-lg bg-green-500/20 text-green-700 dark:text-green-300 text-sm border border-green-500/30"
                >
                  {toggleSuccess}
                </motion.div>
              )}
            </motion.div>

            {/* Quick Links */}
            <motion.div
              variants={itemVariants}
              className="grid grid-cols-2 md:grid-cols-4 gap-4"
            >
              {[
                { href: "/dashboard", label: "Dashboard", emoji: "📊" },
                { href: "/categories", label: "Categories", emoji: "📚" },
                { href: "/career-path", label: "Career Paths", emoji: "🎯" },
                { href: "/", label: "Home", emoji: "🏠" },
              ].map((link) => (
                <Link key={link.href} href={link.href}>
                  <motion.div
                    whileHover={{ scale: 1.05, y: -5 }}
                    whileTap={{ scale: 0.95 }}
                    className="p-4 rounded-xl bg-white/30 dark:bg-white/10 border border-white/30 dark:border-white/10 hover:shadow-lg transition text-center cursor-pointer"
                  >
                    <div className="text-2xl mb-2">{link.emoji}</div>
                    <p className="text-sm font-medium text-zinc-900 dark:text-white">
                      {link.label}
                    </p>
                  </motion.div>
                </Link>
              ))}
            </motion.div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
