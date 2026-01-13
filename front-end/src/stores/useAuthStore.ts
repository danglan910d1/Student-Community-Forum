import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { IAuthor } from "@/types/common";

interface AuthState {
  user: IAuthor | null; // Đổi từ IUser sang IAuthor
  token: string | null;
  isAuthenticated: boolean;
  hasHydrated: boolean;

  // Actions nhận vào IAuthor
  setAuth: (user: IAuthor, token: string) => void;
  logout: () => void;
  updateAvatar: (newAvatar: string) => void;
  setHasHydrated: (state: boolean) => void;
}

const dummyStorage = {
  getItem: () => null,
  setItem: () => {},
  removeItem: () => {},
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      // State
      user: null,
      token: null,
      isAuthenticated: false,
      hasHydrated: false,

      // Actions
      setHasHydrated: (state) => set({ hasHydrated: state }),

      setAuth: (user, token) => set({ user, token, isAuthenticated: true }),

      logout: () => {
        set({ user: null, token: null, isAuthenticated: false });
        document.cookie =
          "auth-token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;";
      },

      updateAvatar: (newAvatar) =>
        set((state) => ({
          user: state.user ? { ...state.user, avatar: newAvatar } : null,
        })),
    }),
    {
      name: "auth-storage",
      storage: createJSONStorage(() =>
        typeof window !== "undefined" ? window.localStorage : dummyStorage
      ),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    }
  )
);
