"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";

type NavLink = {
  name: string;
  href: string;
  submenu?: { name: string; href: string }[];
};

const links: NavLink[] = [
  { name: "Features", href: "#features" },
  { name: "AI Demo", href: "#ai-demo" },
  {
    name: "Dashboard",
    href: "#dashboard",
    submenu: [
      { name: "Skills", href: "/dashboard/skills" },
      { name: "Career Path", href: "/dashboard/career-path" },
    ],
  },
  { name: "Reviews", href: "#reviews" },
];

export default function Navbar() {
  const [active, setActive] = useState("");
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);

      const sections = links.map((l) => document.querySelector(l.href));

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
        {/* ðŸ”¥ Logo */}
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

        {/* ðŸ–¥ï¸ Desktop Links */}
        <div className="hidden md:flex gap-8 text-sm">
          {links.map((link) => (
            <div key={link.name} className="relative group">
              <a href={link.href} className="relative inline-block">
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
                    active === link.href ? "w-full" : "w-0 group-hover:w-full"
                  }`}
                />
              </a>

              {link.submenu && (
                <div className="absolute left-0 mt-1 w-48 rounded-lg bg-white dark:bg-zinc-900 shadow-lg border border-zinc-200 dark:border-zinc-800 opacity-0 translate-y-2 pointer-events-none group-hover:opacity-100 group-hover:translate-y-0 group-hover:pointer-events-auto transition-all duration-200">
                  {link.submenu.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      className="block px-4 py-2 text-sm text-zinc-700 dark:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                    >
                      {item.name}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* ðŸ‘‰ Right side */}
        <div className="flex items-center gap-4">
          <Link href="/login" className="text-sm hidden md:block">
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

          {/* ðŸ“± Mobile button */}
          <button onClick={() => setOpen(!open)} className="md:hidden text-xl">
            â˜°
          </button>
        </div>
      </div>

      {/* ðŸ“± Mobile Menu */}
      {open && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="md:hidden bg-white dark:bg-zinc-900 px-6 py-4 space-y-4 border-t dark:border-zinc-800"
        >
          {links.map((link) => (
            <div key={link.name} className="space-y-2">
              <a
                href={link.href}
                onClick={() => setOpen(false)}
                className="block text-sm"
              >
                {link.name}
              </a>

              {link.submenu && (
                <div className="ml-4 space-y-1">
                  {link.submenu.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setOpen(false)}
                      className="block text-sm text-zinc-700 dark:text-zinc-100"
                    >
                      {item.name}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          ))}

          <Link href="/login" className="block text-sm">
            Login
          </Link>

          <Link
            href="/signup"
            className="block bg-linear-to-r from-blue-600 to-purple-600 text-white px-4 py-2 rounded-lg text-sm text-center"
          >
            Get Started
          </Link>
        </motion.div>
      )}
    </motion.nav>
  );
}
