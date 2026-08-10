import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface FavoritesState {
  favorites: string[]; // course ids
  toggleFavorite: (courseId: string) => void;
  isFavorite: (courseId: string) => boolean;
}

/**
 * Favoritos do estudante persistidos localmente (localStorage).
 * Mantém a experiência consistente entre a página do curso, "Meus Cursos"
 * e os cards, sem depender de uma tabela no backend.
 */
export const useFavoritesStore = create<FavoritesState>()(
  persist(
    (set, get) => ({
      favorites: [],
      toggleFavorite: (courseId) =>
        set((state) => ({
          favorites: state.favorites.includes(courseId)
            ? state.favorites.filter((id) => id !== courseId)
            : [...state.favorites, courseId],
        })),
      isFavorite: (courseId) => get().favorites.includes(courseId),
    }),
    {
      name: 'favorites-storage',
    }
  )
);
