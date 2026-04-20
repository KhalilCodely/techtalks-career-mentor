"use client";

type StoredUser = {
  id: string;
  name: string;
  email: string;
  role?: "USER" | "ADMIN";
};

export type AuthState = {
  token: string;
  user: StoredUser;
};

function decodeTokenRole(token: string): "USER" | "ADMIN" | null {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;

    const base64 = parts[1].replace(/-/g, "+").replace(/_/g, "/");
    const padded =
      base64 + "===".slice((base64.length + 3) % 4);

    const json =
      typeof window !== "undefined"
        ? window.atob(padded)
        : Buffer.from(padded, "base64").toString("binary");

    const payload = JSON.parse(json) as {
      role?: "USER" | "ADMIN";
    };

    return payload.role ?? null;
  } catch {
    return null;
  }
}

export function getAuth(): AuthState | null {
  if (typeof window === "undefined") return null;

  const token = window.localStorage.getItem("auth_token");
  const userRaw = window.localStorage.getItem("auth_user");

  if (!token || !userRaw) {
    return null;
  }

  try {
    const user = JSON.parse(userRaw) as StoredUser;

    if (!user?.id) {
      return null;
    }

    const role = user.role ?? decodeTokenRole(token);

    const mergedUser: StoredUser = role
      ? { ...user, role }
      : user;

    return { token, user: mergedUser };
  } catch {
    return null;
  }
}

export function clearAuth() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem("auth_token");
  window.localStorage.removeItem("auth_user");
}
