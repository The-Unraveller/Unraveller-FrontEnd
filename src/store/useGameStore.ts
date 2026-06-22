import { create } from 'zustand';
import type { UserProfileDto } from '../services/api';

interface GameState {
  user: UserProfileDto | null;
  isAuthenticated: boolean;
  isInitializing: boolean; // True trong khi đang xác thực token với server

  // Actions
  setUser: (user: UserProfileDto | null) => void;
  setAuthenticated: (status: boolean) => void;
  setInitializing: (status: boolean) => void;
  updateUser: (updates: Partial<UserProfileDto>) => void;
  logout: () => void;
}

export const useGameStore = create<GameState>((set) => ({
  user: null,
  isAuthenticated: false,                           // Không trust localStorage ngay
  isInitializing: !!localStorage.getItem('token'),  // Chỉ cần init nếu có token

  setUser: (user) => set({ user, isAuthenticated: !!user }),
  setAuthenticated: (status) => set({ isAuthenticated: status }),
  setInitializing: (status) => set({ isInitializing: status }),
  updateUser: (updates) => set((state) => ({
    user: state.user ? { ...state.user, ...updates } : null
  })),
  logout: () => {
    localStorage.removeItem('token');
    set({ user: null, isAuthenticated: false, isInitializing: false });
  },
}));
