import { create } from 'zustand';

interface ThemeState {
  theme: 'light' | 'dark';
  toggleTheme: () => void;
}

// Tema não é persistido de propósito: todo carregamento da página deve
// começar no claro, independente do que o usuário escolheu na visita anterior.
export const useThemeStore = create<ThemeState>()((set) => ({
  theme: 'light',
  toggleTheme: () => set((state) => ({
    theme: state.theme === 'light' ? 'dark' : 'light'
  })),
}));
