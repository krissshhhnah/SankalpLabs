import { create } from 'zustand';
import { UserProfile } from '@whiteboard/shared';

interface AuthState {
  token: string | null;
  user: UserProfile | null;
  setAuth: (token: string, user: UserProfile) => void;
  updateUser: (partialUser: Partial<UserProfile>) => void;
  logout: () => void;
}

const LOCAL_TOKEN = localStorage.getItem('wb_token');
const LOCAL_USER = localStorage.getItem('wb_user');

export const useAuthStore = create<AuthState>((set) => ({
  token: LOCAL_TOKEN,
  user: LOCAL_USER ? JSON.parse(LOCAL_USER) : null,

  setAuth: (token, user) => {
    localStorage.setItem('wb_token', token);
    localStorage.setItem('wb_user', JSON.stringify(user));
    set({ token, user });
  },

  updateUser: (partialUser) => {
    set((state) => {
      if (!state.user) return state;
      const updatedUser = { ...state.user, ...partialUser };
      localStorage.setItem('wb_user', JSON.stringify(updatedUser));
      return { user: updatedUser };
    });
  },

  logout: () => {
    localStorage.removeItem('wb_token');
    localStorage.removeItem('wb_user');
    set({ token: null, user: null });
  },
}));
