"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { getAuthToken, clearAuthToken } from "@/lib/api";
import { useRouter } from "next/navigation";

const links = [
  { name: "Features", href: "#features" },
  { name: "AI Demo", href: "#ai-demo" },
  { name: "Reviews", href: "#reviews" },
];

export default function Navbar() {
  const router = useRouter();
  const [active, setActive] = useState("");
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    setIsAuthenticated(!!getAuthToken());
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);

      const sections = links.map((l) =>
        document.querySelector(l.href)
      );

      sections.forEach((sec, i) => {
        if (!sec) return;
        const rect = sec.getBoundingClientRect();
        if (rect.top <= 120 && rect.bottom >= 120) {
          setActive(links[i].href);
        }
      });
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleLogout = () => {
    clearAuthToken();
    setIsAuthenticated(false);
    setOpen(false);
    router.push("/");
  };

  return (
    <motion.nav
      initial={{ y: -80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className={`fixed top-0 w-full z-50 transition-all duration-300 ${
        scrolled
          ? "backdrop-blur bg-white/70 dark:bg-zinc-950/70 shadow-lg border-b border-zinc-200 dark:border-zinc-800"
          : "bg-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">

        {/* 🔥 Logo */}
        <div className="flex items-center gap-3 cursor-pointer">
          
          <motion.div
            animate={{
              boxShadow: [
                "0 0 0px rgba(59,130,246,0.4)",
                "0 0 25px rgba(59,130,246,0.8)",
                "0 0 0px rgba(59,130,246,0.4)",
              ],
            }}
            transition={{ duration: 3, repeat: Infinity }}
            whileHover={{ scale: 1.1, rotate: 5 }}
            className="w-10 h-10 rounded-xl bg-linear-to-br from-blue-500 via-purple-500 to-indigo-500 flex items-center justify-center text-white font-bold shadow-lg"
          >
            AI
          </motion.div>

          <motion.h1
            whileHover={{ scale: 1.05 }}
            className="font-bold text-lg bg-linear-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent"
          >
            CareerMentor
          </motion.h1>
        </div>

        {/* 🖥️ Desktop Links */}
        <div className="hidden md:flex gap-8 text-sm">
          {links.map((link) => (
            <a key={link.href} href={link.href} className="relative group">
              <span
                className={`transition ${
                  active === link.href
                    ? "text-black dark:text-white"
                    : "text-zinc-500"
                }`}
              >
                {link.name}
              </span>

              {/* underline */}
              <span
                className={`absolute left-0 -bottom-1 h-0.5 bg-black dark:bg-white transition-all duration-300 ${
                  active === link.href
                    ? "w-full"
                    : "w-0 group-hover:w-full"
                }`}
              />
            </a>
          ))}
        </div>

        {/* 👉 Right side */}
        <div className="flex items-center gap-4">
          {isAuthenticated ? (
            <>
              <Link href="/dashboard" className="text-sm hidden md:block text-zinc-700 dark:text-zinc-300 hover:text-black dark:hover:text-white transition">
                Dashboard
              </Link>
              <Link href="/categories" className="text-sm hidden md:block text-zinc-700 dark:text-zinc-300 hover:text-black dark:hover:text-white transition">
                Categories
              </Link>
              <Link href="/career-path" className="text-sm hidden md:block text-zinc-700 dark:text-zinc-300 hover:text-black dark:hover:text-white transition">
                Paths
              </Link>
              <Link href="/progress" className="text-sm hidden md:block text-zinc-700 dark:text-zinc-300 hover:text-black dark:hover:text-white transition">
                Progress
              </Link>
              <Link href="/profile" className="text-sm hidden md:block text-zinc-700 dark:text-zinc-300 hover:text-black dark:hover:text-white transition">
                Profile
              </Link>
              <Link href="/admin" className="text-sm hidden md:block text-orange-600 dark:text-orange-400 hover:text-orange-700 dark:hover:text-orange-300 transition font-medium">
                Admin
              </Link>
              <motion.button
                whileHover={{ scale: 1.08 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleLogout}
                className="bg-linear-to-r from-red-600 to-pink-600 text-white px-4 py-2 rounded-lg text-sm shadow-md hover:shadow-xl transition"
              >
                Logout
              </motion.button>
            </>
          ) : (
            <>
              <Link href="/login" className="text-sm hidden md:block text-zinc-700 dark:text-zinc-300 hover:text-black dark:hover:text-white transition">
                Login
              </Link>

              <motion.div whileHover={{ scale: 1.08 }} whileTap={{ scale: 0.95 }}>
                <Link
                  href="/signup"
                  className="bg-linear-to-r from-blue-600 to-purple-600 text-white px-4 py-2 rounded-lg text-sm shadow-md hover:shadow-xl transition"
                >
                  Get Started
                </Link>
              </motion.div>
            </>
          )}

          {/* 📱 Mobile button */}
          <button
            onClick={() => setOpen(!open)}
            className="md:hidden text-xl"
          >
            ☰
          </button>
        </div>
      </div>

      {/* 📱 Mobile Menu */}
      {open && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="md:hidden bg-white dark:bg-zinc-900 px-6 py-4 space-y-4 border-t dark:border-zinc-800"
        >
          {links.map((link) => (
            <a
              key={link.href}
              href={link.href}
              onClick={() => setOpen(false)}
              className="block text-sm"
            >
              {link.name}
            </a>
          ))}

          {isAuthenticated ? (
            <>
              <Link href="/dashboard" className="block text-sm" onClick={() => setOpen(false)}>
                Dashboard
              </Link>
              <Link href="/categories" className="block text-sm" onClick={() => setOpen(false)}>
                Categories
              </Link>
              <Link href="/career-path" className="block text-sm" onClick={() => setOpen(false)}>
                Career Paths
              </Link>
              <Link href="/progress" className="block text-sm" onClick={() => setOpen(false)}>
                Progress
              </Link>
              <Link href="/profile" className="block text-sm" onClick={() => setOpen(false)}>
                Profile
              </Link>
              <Link href="/admin" className="block text-sm text-orange-600 dark:text-orange-400 font-medium" onClick={() => setOpen(false)}>
                Admin Panel
              </Link>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleLogout}
                className="w-full bg-linear-to-r from-red-600 to-pink-600 text-white px-4 py-2 rounded-lg text-sm text-center"
              >
                Logout
              </motion.button>
            </>
          ) : (
            <>
              <Link href="/login" className="block text-sm">
                Login
              </Link>

              <Link
                href="/signup"
                className="block bg-linear-to-r from-blue-600 to-purple-600 text-white px-4 py-2 rounded-lg text-sm text-center"
              >
                Get Started
              </Link>
            </>
          )}
        </motion.div>
      )}
    </motion.nav>
  );
}