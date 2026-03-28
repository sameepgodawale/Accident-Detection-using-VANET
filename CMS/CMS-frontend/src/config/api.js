// src/config/api.js

const API_BASE = "https://cms-backend-lmof.onrender.com";

export const API = {
  login:     `${API_BASE}/api/auth/login`,
  register:  `${API_BASE}/api/auth/register`,
  incidents: `${API_BASE}/api/accident`,
  accident:  `${API_BASE}/api/accident`,
  alerts:    `${API_BASE}/api/alerts`,
  rsu:       `${API_BASE}/api/rsu`,
  users:     `${API_BASE}/api/admin/users`,
  test:      `${API_BASE}/api/test`
};

// ── Token helpers ─────────────────────────────────────────────────────────────
export function getToken() {
  return localStorage.getItem("token");
}

export function saveToken(token) {
  localStorage.setItem("token", token);
}

export function clearToken() {
  localStorage.removeItem("token");
}

export function isLoggedIn() {
  return !!getToken();
}

// ── Authenticated fetch wrapper ───────────────────────────────────────────────
// Use this for ALL requests instead of raw fetch()
export async function apiFetch(url, options = {}) {
  const token = getToken();

  const res = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { "Authorization": `Bearer ${token}` } : {}),
      ...(options.headers || {})
    }
  });

  // Token expired or invalid — log out and redirect to login
  if (res.status === 401) {
    clearToken();
    window.location.href = "/login";
    return null;
  }

  return res;
}

// ── Login helper ──────────────────────────────────────────────────────────────
export async function login(username, password) {
  const res = await fetch(API.login, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password })
  });

  const data = await res.json();

  if (res.ok && data.token) {
    saveToken(data.token);
    return { success: true, user: data.user };
  }

  return { success: false, message: data.message || "Login failed" };
}
