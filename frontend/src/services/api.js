const API_URL = import.meta.env.VITE_API_URL || (import.meta.env.PROD ? "/api" : "http://localhost:8000/api");
const TOKEN_KEY = "fitland_token";
const SESSION_TOKEN_KEY = "fitland_session_token";

export function getToken() {
  return localStorage.getItem(TOKEN_KEY) || sessionStorage.getItem(SESSION_TOKEN_KEY);
}

export function setToken(token, keepConnected = true) {
  clearToken();
  if (keepConnected) {
    localStorage.setItem(TOKEN_KEY, token);
  } else {
    sessionStorage.setItem(SESSION_TOKEN_KEY, token);
  }
}

export function clearToken() {
  localStorage.removeItem(TOKEN_KEY);
  sessionStorage.removeItem(SESSION_TOKEN_KEY);
}

async function parseResponse(response) {
  if (response.status === 204) return null;
  return response.json().catch(() => null);
}

async function rawRequest(path, options = {}) {
  const token = getToken();
  const controller = new AbortController();
  const timeout = window.setTimeout(() => controller.abort(), options.timeoutMs || 10000);
  const headers = options.body instanceof FormData
    ? { ...(token ? { Authorization: `Bearer ${token}` } : {}), ...options.headers }
    : {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...options.headers,
      };

  return fetch(`${API_URL}${path}`, {
    ...options,
    credentials: "include",
    signal: controller.signal,
    headers,
  }).finally(() => window.clearTimeout(timeout));
}

export async function apiRequest(path, options = {}) {
  let response = await rawRequest(path, options);

  const canRefresh = response.status === 401
    && !path.startsWith("/auth/login")
    && !path.startsWith("/auth/owner-login")
    && !path.startsWith("/auth/refresh")
    && !options.skipAuthRefresh;
  if (canRefresh) {
    try {
      await refreshSession();
      response = await rawRequest(path, options);
    } catch {
      clearToken();
    }
  }

  if (!response.ok) {
    const error = await parseResponse(response) || { detail: "Erro inesperado" };
    throw new Error(error.detail || "Erro inesperado");
  }

  return parseResponse(response);
}

export async function login(email, password, keepConnected = true, ownerContext = false) {
  const endpoint = ownerContext ? "/auth/owner-login" : "/auth/login";
  const data = await apiRequest(endpoint, {
    method: "POST",
    body: JSON.stringify({ email, password, keep_connected: keepConnected }),
  });
  setToken(data.access_token, keepConnected);
  return data;
}

export async function refreshSession() {
  const data = await apiRequest("/auth/refresh", { method: "POST", timeoutMs: 12000, skipAuthRefresh: true });
  setToken(data.access_token, true);
  return data;
}

export async function logoutSession() {
  try {
    await apiRequest("/auth/logout", { method: "POST", timeoutMs: 8000 });
  } finally {
    clearToken();
  }
}
