import { create } from 'zustand';

const useStore = create((set) => ({
  user: JSON.parse(localStorage.getItem('scrap_user') || 'null'),
  setUser: (user) => {
    if (user) {
      localStorage.setItem('scrap_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('scrap_user');
    }
    set({ user });
  },
  logout: () => {
    localStorage.removeItem('scrap_user');
    set({ user: null });
  }
}));

export default useStore;
