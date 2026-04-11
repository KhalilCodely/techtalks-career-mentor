"use client";

import { useState } from "react";
import styles from "./login.module.css";

type AuthMode = "login" | "signup";

export default function LoginPage() {
  const [mode, setMode] = useState<AuthMode>("login");

  return (
    <main className={styles.page}>
      <section className={styles.card}>
        <header className={styles.header}>
          <p className={styles.eyebrow}>Career Mentor Platform</p>
          <h1>Welcome back</h1>
          <p className={styles.subtitle}>
            Build your profile, connect with mentors, and track your career goals.
          </p>
        </header>

        <div className={styles.switcher} role="tablist" aria-label="Authentication mode">
          <button
            type="button"
            role="tab"
            aria-selected={mode === "login"}
            className={`${styles.switchButton} ${
              mode === "login" ? styles.activeSwitch : ""
            }`}
            onClick={() => setMode("login")}
          >
            Login
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={mode === "signup"}
            className={`${styles.switchButton} ${
              mode === "signup" ? styles.activeSwitch : ""
            }`}
            onClick={() => setMode("signup")}
          >
            Sign up
          </button>
        </div>

        <form className={styles.form}>
          {mode === "signup" && (
            <label className={styles.field}>
              <span>Full name</span>
              <input type="text" placeholder="Alex Johnson" required />
            </label>
          )}

          <label className={styles.field}>
            <span>Email</span>
            <input type="email" placeholder="you@example.com" required />
          </label>

          <label className={styles.field}>
            <span>Password</span>
            <input type="password" placeholder="••••••••" required />
          </label>

          {mode === "signup" && (
            <label className={styles.field}>
              <span>Career focus</span>
              <select defaultValue="">
                <option value="" disabled>
                  Select your track
                </option>
                <option>Software Engineering</option>
                <option>Data Science</option>
                <option>Product Management</option>
                <option>UX/UI Design</option>
              </select>
            </label>
          )}

          <button type="submit" className={styles.submitButton}>
            {mode === "login" ? "Login to dashboard" : "Create account"}
          </button>
        </form>

        <footer className={styles.footerText}>
          {mode === "login" ? "Don’t have an account?" : "Already have an account?"}
          <button type="button" className={styles.linkButton} onClick={() => setMode(mode === "login" ? "signup" : "login")}>
            {mode === "login" ? "Sign up" : "Login"}
          </button>
        </footer>
      </section>
    </main>
  );
}
