export const API_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL || process.env.BACKEND_URL || "http://localhost:3001";

export function withApi(path: string) {
  // Ensure no double slash when joining
  return `${API_URL.replace(/\/$/, "")}/${path.replace(/^\//, "")}`;
}

export async function apiFetch(path: string, options: RequestInit = {}) {
  const url = withApi(path);
  const response = await fetch(url, {
    ...options,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
  });

  // Global unauthorized handler for client-side calls
  if (response.status === 401 && typeof window !== "undefined") {
    // Avoid infinite redirect if already on login page
    if (!window.location.pathname.startsWith("/login")) {
      window.location.href = "/login";
    }
  }

  return response;
}
