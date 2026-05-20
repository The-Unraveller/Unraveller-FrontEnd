import { create } from 'zustand';

interface GameState {
  xp: number;
  streak: number;
  increaseXp: (amount: number) => void;
}

export const useGameStore = create<GameState>((set) => ({
  xp: 450,
  streak: 5,
  increaseXp: (amount) => set((state) => ({ xp: state.xp + amount })),
}));
