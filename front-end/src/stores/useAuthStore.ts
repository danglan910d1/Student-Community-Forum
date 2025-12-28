import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

export interface User {
  userId: string;
  name: string;
  email: string;
  role: string;
  avatar: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  // Actions
  setAuth: (user: User, token: string) => void;
  logout: () => void;
  updateAvatar: (newAvatar: string) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,

      setAuth: (user, token) => set({ user, token, isAuthenticated: true }),

      logout: () => {
        set({ user: null, token: null, isAuthenticated: false });
        // Xóa cookie thủ công nếu không dùng thư viện
        document.cookie =
          "auth-token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;";
      },

      updateAvatar: (newAvatar) =>
        set((state) => ({
          user: state.user ? { ...state.user, avatar: newAvatar } : null,
        })),
    }),
    {
      name: "auth-storage", // Tên key trong LocalStorage
      storage: createJSONStorage(() =>
        typeof window !== "undefined" ? window.localStorage : dummyStorage
      ),
    }
  )
);

const dummyStorage = {
  getItem: () => null,
  setItem: () => {},
  removeItem: () => {},
};
