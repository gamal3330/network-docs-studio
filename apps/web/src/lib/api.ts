import type { Diagram } from "@nds/shared";

const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:4000";

async function readError(response: Response, fallback: string) {
  try {
    const payload = (await response.json()) as { error?: string };
    return payload.error ?? fallback;
  } catch {
    return fallback;
  }
}

export type AuthUser = {
  id: string;
  teamId: string;
  email: string;
  name: string;
  role: "admin" | "editor" | "viewer";
};

export type ManagedUser = Pick<AuthUser, "id" | "email" | "name" | "role"> & {
  createdAt: string;
};

function authHeaders() {
  const token = localStorage.getItem("nds_token");
  const headers: Record<string, string> = {};
  if (token) headers.Authorization = `Bearer ${token}`;
  return headers;
}

export async function fetchDiagram(slug: string): Promise<Diagram> {
  const response = await fetch(`${API_URL}/api/v1/diagrams/${slug}`, {
    headers: authHeaders()
  });
  if (!response.ok) throw new Error("Failed to load diagram");
  const payload = (await response.json()) as { data: Diagram };
  return payload.data;
}

export async function fetchDiagrams(): Promise<Diagram[]> {
  const response = await fetch(`${API_URL}/api/v1/diagrams`, {
    headers: authHeaders()
  });
  if (!response.ok) throw new Error("Failed to load diagrams");
  const payload = (await response.json()) as { data: Diagram[] };
  return payload.data;
}

export async function saveDiagram(diagram: Diagram): Promise<Diagram> {
  const response = await fetch(`${API_URL}/api/v1/diagrams/${diagram.slug}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      ...authHeaders()
    },
    body: JSON.stringify(diagram)
  });

  if (!response.ok) throw new Error("Failed to save diagram");
  const payload = (await response.json()) as { data: Diagram };
  return payload.data;
}

export async function login(email: string, password: string) {
  const response = await fetch(`${API_URL}/api/v1/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password })
  });

  if (!response.ok) throw new Error("Login failed");
  const payload = (await response.json()) as { data: { token: string; user: AuthUser } };
  return payload.data;
}

export async function fetchMe() {
  const response = await fetch(`${API_URL}/api/v1/auth/me`, {
    headers: authHeaders()
  });

  if (!response.ok) throw new Error("Unauthorized");
  const payload = (await response.json()) as { data: AuthUser };
  return payload.data;
}

export async function fetchUsers() {
  const response = await fetch(`${API_URL}/api/v1/users`, {
    headers: authHeaders()
  });

  if (!response.ok) throw new Error("Failed to load users");
  const payload = (await response.json()) as { data: ManagedUser[] };
  return payload.data;
}

export async function createUser(input: {
  name: string;
  email: string;
  password: string;
  role: "admin" | "editor" | "viewer";
}) {
  const response = await fetch(`${API_URL}/api/v1/users`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...authHeaders() },
    body: JSON.stringify(input)
  });

  if (!response.ok) throw new Error(await readError(response, "Failed to create user"));
  const payload = (await response.json()) as { data: ManagedUser };
  return payload.data;
}

export async function updateUser(id: string, input: Partial<Pick<AuthUser, "name" | "role">> & { password?: string }) {
  const response = await fetch(`${API_URL}/api/v1/users/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json", ...authHeaders() },
    body: JSON.stringify(input)
  });

  if (!response.ok) throw new Error(await readError(response, "Failed to update user"));
  const payload = (await response.json()) as { data: ManagedUser };
  return payload.data;
}

export async function deleteUser(id: string) {
  const response = await fetch(`${API_URL}/api/v1/users/${id}`, {
    method: "DELETE",
    headers: authHeaders()
  });

  if (!response.ok) throw new Error(await readError(response, "Failed to delete user"));
}
