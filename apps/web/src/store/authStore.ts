import { create } from "zustand";
import type { AuthUser, ManagedUser } from "../lib/api";
import { createUser, deleteUser, fetchMe, fetchUsers, login, updateUser } from "../lib/api";

type AuthState = {
  token?: string;
  user?: AuthUser;
  users: ManagedUser[];
  authReady: boolean;
  authError?: string;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  hydrate: () => Promise<void>;
  loadUsers: () => Promise<void>;
  createUser: (input: { name: string; email: string; password: string; role: AuthUser["role"] }) => Promise<void>;
  updateUser: (id: string, input: Partial<Pick<AuthUser, "name" | "role">> & { password?: string }) => Promise<void>;
  deleteUser: (id: string) => Promise<void>;
};

export const useAuthStore = create<AuthState>((set, get) => ({
  token: localStorage.getItem("nds_token") ?? undefined,
  users: [],
  authReady: false,
  login: async (email, password) => {
    const data = await login(email, password);
    localStorage.setItem("nds_token", data.token);
    set({ token: data.token, user: data.user, authReady: true, authError: undefined });
  },
  logout: () => {
    localStorage.removeItem("nds_token");
    set({ token: undefined, user: undefined, users: [], authReady: true });
  },
  hydrate: async () => {
    const token = localStorage.getItem("nds_token");
    if (!token) {
      set({ authReady: true });
      return;
    }

    try {
      const user = await fetchMe();
      set({ token, user, authReady: true });
    } catch {
      localStorage.removeItem("nds_token");
      set({ token: undefined, user: undefined, authReady: true });
    }
  },
  loadUsers: async () => {
    const users = await fetchUsers();
    set({ users });
  },
  createUser: async (input) => {
    await createUser(input);
    await get().loadUsers();
  },
  updateUser: async (id, input) => {
    await updateUser(id, input);
    await get().loadUsers();
  },
  deleteUser: async (id) => {
    await deleteUser(id);
    await get().loadUsers();
  }
}));
