import { create } from "zustand";

interface HealthState {
  lastRitualDate: string | null;
  waterIntake: number;
  mood: string | null;

  setLastRitualDate: (date: string) => void;
  setWaterIntake: (amount: number) => void;
  setMood: (mood: string) => void;
}

export const useHealthStore = create<HealthState>((set) => ({
  lastRitualDate: null,
  waterIntake: 0,
  mood: null,

  setLastRitualDate: (date) => set({ lastRitualDate: date }),

  setWaterIntake: (amount) => set({ waterIntake: amount }),

  setMood: (mood) => set({ mood }),
}));
