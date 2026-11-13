export function getToken() {
  return localStorage.getItem("sweety_token");
}

export function saveSession(token, user) {
  localStorage.setItem("sweety_token", token);
  localStorage.setItem("sweety_user", JSON.stringify(user));
}

export function clearSession() {
  localStorage.removeItem("sweety_token");
  localStorage.removeItem("sweety_user");
}

export function getSavedUser() {
  const saved = localStorage.getItem("sweety_user");
  return saved ? JSON.parse(saved) : null;
}

export async function apiRequest(path, options = {}) {
  const token = getToken();
  const response = await fetch(`/api${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const error = new Error(data.message || "Something went wrong.");
    error.status = response.status;
    throw error;
  }
  return data;
}