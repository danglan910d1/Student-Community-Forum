import { create } from "zustand";

interface NavState {
  activeLabel: string;
  setActiveLabel: (label: string) => void;
}

export const useNavStore = create<NavState>((set) => ({
  activeLabel: "",
  setActiveLabel: (label) => set({ activeLabel: label }),
}));
