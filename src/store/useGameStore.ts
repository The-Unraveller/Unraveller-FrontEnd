import { create } from 'zustand';
import type { UserProfileDto } from '../services/api';

interface GameState {
  user: UserProfileDto | null;
  isAuthenticated: boolean;

  // Actions
  setUser: (user: UserProfileDto | null) => void;
  setAuthenticated: (status: boolean) => void;
  updateUser: (updates: Partial<UserProfileDto>) => void;
  logout: () => void;
}

export const useGameStore = create<GameState>((set) => ({
  user: null,
  isAuthenticated: !!localStorage.getItem('token'),

  setUser: (user) => set({ user, isAuthenticated: !!user }),
  setAuthenticated: (status) => set({ isAuthenticated: status }),
  updateUser: (updates) => set((state) => ({
    user: state.user ? { ...state.user, ...updates } : null
  })),
  logout: () => {
    localStorage.removeItem('token');
    set({ user: null, isAuthenticated: false });
  },
}));
