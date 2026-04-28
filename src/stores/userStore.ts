import { create } from "zustand";
import type { User } from "@/types";

interface UserState {
  user: User | null;
  isOnline: boolean;
  setUser: (user: User | null) => void;
  setOnline: (online: boolean) => void;
}

export const useUserStore = create<UserState>((set) => ({
  user: null,
  isOnline: false,
  setUser: (user) => set({ user }),
  setOnline: (online) => set({ isOnline: online }),
}));
