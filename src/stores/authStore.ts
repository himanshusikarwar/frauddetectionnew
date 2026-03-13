import { create } from "zustand";
import { persist } from "zustand/middleware";

export type User = {
  id: string;
  name: string | null;
  email: string | null;
};

type AuthState = {
  user: User | null;
  loginDemo: (user: User) => void;
  logout: () => void;
  setUser: (user: User | null) => void;
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      loginDemo: (user) => set({ user }),
      logout: () => set({ user: null }),
      setUser: (user) => set({ user }),
    }),
    { name: "study-schedule-auth" }
  )
);
