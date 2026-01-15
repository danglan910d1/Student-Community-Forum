import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { IAuthor } from "@/types/common";

interface AuthState {
  // State
  user: IAuthor | null;
  token: string | null;
  isAuthenticated: boolean;
  hasHydrated: boolean;

  // Actions
  setAuth: (user: IAuthor, token: string) => void;
  logout: () => void;

  /**
   * Cập nhật thông tin profile cơ bản (tên, ảnh đại diện)
   * Giúp đồng bộ UI ngay lập tức khi user sửa hồ sơ
   */
  updateProfile: (data: Partial<Pick<IAuthor, "name" | "avatar">>) => void;

  // Giữ lại để tương thích với các logic cũ nếu cần
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
      // --- Initial State ---
      user: null,
      token: null,
      isAuthenticated: false,
      hasHydrated: false,

      // --- Actions ---
      setHasHydrated: (state) => set({ hasHydrated: state }),

      setAuth: (user, token) => {
        set({ user, token, isAuthenticated: true });
        // Đồng bộ token vào cookie để Server Component có thể đọc được (Middleware/SEO)
        if (typeof window !== "undefined") {
          document.cookie = `auth-token=${token}; path=/; max-age=${60 * 60 * 24 * 7}; SameSite=Lax`;
        }
      },

      logout: () => {
        set({ user: null, token: null, isAuthenticated: false });
        if (typeof window !== "undefined") {
          document.cookie =
            "auth-token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;";
        }
      },

      updateProfile: (data) =>
        set((state) => ({
          user: state.user ? { ...state.user, ...data } : null,
        })),

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
      // Giúp tránh lỗi Hydration mismatch giữa Server và Client
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    }
  )
);
