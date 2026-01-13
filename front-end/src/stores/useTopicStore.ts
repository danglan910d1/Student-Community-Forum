import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { ITopic } from "@/modules/topic/types";

interface TopicState {
  topics: ITopic[];
  hasHydrated: boolean;
  // Actions
  setTopics: (topics: ITopic[]) => void;
  setHasHydrated: (state: boolean) => void;
}

const dummyStorage = {
  getItem: () => null,
  setItem: () => {},
  removeItem: () => {},
};

export const useTopicStore = create<TopicState>()(
  persist(
    (set) => ({
      // State
      topics: [],
      hasHydrated: false,

      // Actions
      setHasHydrated: (state) => set({ hasHydrated: state }),

      setTopics: (topics) => set({ topics }),
    }),
    {
      name: "topic-storage",
      storage: createJSONStorage(() =>
        typeof window !== "undefined" ? window.localStorage : dummyStorage
      ),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    }
  )
);
