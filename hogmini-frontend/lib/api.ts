export const API_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL || process.env.BACKEND_URL || "http://localhost:3001";

export function withApi(path: string) {
  // Ensure no double slash when joining
  return `${API_URL.replace(/\/$/, "")}/${path.replace(/^\//, "")}`;
}
