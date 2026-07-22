const API_URL = import.meta.env.VITE_API_URL || (import.meta.env.PROD ? "/api" : "http://localhost:8000/api");

export function getToken() {
  return localStorage.getItem("ptf_token");
}

export function setToken(token) {
  localStorage.setItem("ptf_token", token);
}

export function clearToken() {
  localStorage.removeItem("ptf_token");
}

export async function apiRequest(path, options = {}) {
  const token = getToken();
  const controller = new AbortController();
  const timeout = window.setTimeout(() => controller.abort(), options.timeoutMs || 10000);
  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    signal: controller.signal,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  }).finally(() => window.clearTimeout(timeout));

  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: "Erro inesperado" }));
    throw new Error(error.detail || "Erro inesperado");
  }

  if (response.status === 204) {
    return null;
  }

  return response.json();
}

export async function login(email, password) {
  const data = await apiRequest("/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
  setToken(data.access_token);
  return data;
}
