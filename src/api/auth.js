// src/api/auth.js
export function getToken() {
  const t = localStorage.getItem("token");
  console.log("TOKEN EXISTS:", !!t);
  console.log("PAYLOAD:", t ? JSON.parse(atob(t.split(".")[1])) : null);
  return t;
}

export function getJwtPayload() {
  const token = getToken();
  if (!token) return null;

  try {
    const base64 = token.split(".")[1];
    return JSON.parse(atob(base64));
  } catch {
    return null;
  }
}

export function getRole() {
  return getJwtPayload()?.role ?? null; // "ADMIN" | "OWNER"
}

export function requireAdmin() {
  const role = getRole();
  if (role !== "ADMIN") {
    const err = new Error("Admin access required");
    err.isForbidden = true;
    throw err;
  }
}