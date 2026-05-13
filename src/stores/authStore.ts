import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { mockUsers } from '../data/users';
import type { User } from '../types';

interface AuthError {
  message?: string;
}

interface OAuthVerificationResult {
  exists: boolean;
  needsProfile: boolean;
  user?: User;
}

interface SupabaseProfile {
  id: string;
  name?: string | null;
  email?: string | null;
  role?: string | null;
  status?: string | null;
  avatar_url?: string | null;
  avatar?: string | null;
  phone?: string | null;
  created_at?: string | null;
  createdAt?: string | null;
  company_id?: string | null;
}

const mapProfileRowToUser = (profile: SupabaseProfile): User => ({
  id: profile.id,
  name: profile.name ?? profile.email?.split('@')[0] ?? 'Usuário',
  email: profile.email ?? '',
  role: profile.role === 'admin' ? 'admin' : 'student',
  status: profile.status === 'inactive' ? 'inactive' : 'active',
  avatar: profile.avatar_url ?? profile.avatar ?? undefined,
  phone: profile.phone ?? undefined,
  createdAt: profile.created_at ?? profile.createdAt ?? undefined,
});

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isAuthInitialized: boolean;
  isLoading: boolean;
  error: string | null;
  needsProfileComplete: boolean;
  isLoggingOut: boolean;
  
  // Initialize auth state from Supabase
  initializeAuth: () => Promise<void>;
  verifyOAuthUser: () => Promise<OAuthVerificationResult>;
  
  // Auth operations
  login: (email: string, password: string) => Promise<{ success: boolean; needsProfile: boolean }>;
  register: (name: string, email: string, password: string) => Promise<boolean>;
  createUserFromInvite: (name: string, email: string, password: string, role: 'student' | 'admin') => Promise<boolean>;
  logout: () => Promise<void>;
  clearError: () => void;
  signInWithGoogle: () => Promise<boolean>;
  completeProfile: (name: string) => Promise<boolean>;
  updateProfile: (name: string) => Promise<boolean>;
  setNeedsProfileComplete: (value: boolean) => void;
  
  // Password recovery
  resetPasswordForEmail: (email: string) => Promise<boolean>;
  updatePassword: (newPassword: string) => Promise<boolean>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      isAuthInitialized: false,
      isLoading: false,
      error: null,
      needsProfileComplete: false,
      isLoggingOut: false,

      initializeAuth: async () => {
        if (!isSupabaseConfigured()) {
          set({ isAuthInitialized: true });
          return;
        }

        set({ isLoading: true });

        try {
          const { data: { session } } = await supabase.auth.getSession();

          if (!session) {
            set({ user: null, isAuthenticated: false });
            localStorage.removeItem('auth-storage');
            return;
          }

          const profileResponse = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .single();
          const profile = profileResponse.data as SupabaseProfile | null;

          if (profile) {
            const mappedUser = mapProfileRowToUser(profile);

            set({
              user: mappedUser,
              isAuthenticated: true,
              needsProfileComplete: !profile.name || profile.name.trim() === '',
            });
          } else {
            set({
              user: {
                id: session.user.id,
                name: session.user.email?.split('@')[0] || 'Usuário',
                email: session.user.email || '',
                role: 'student',
                status: 'active',
              } as User,
              isAuthenticated: true,
              needsProfileComplete: true,
            });
          }
        } catch (error) {
          console.error('Auth initialization error:', error);
          set({ user: null, isAuthenticated: false });
          localStorage.removeItem('auth-storage');
        } finally {
          set({ isLoading: false, isAuthInitialized: true });
        }
      },

      // New method specifically for OAuth callback
      verifyOAuthUser: async () => {
        if (!isSupabaseConfigured()) {
          return { exists: false, needsProfile: false };
        }

        try {
          const { data: { session } } = await supabase.auth.getSession();

          if (!session) {
            return { exists: false, needsProfile: false };
          }

          const profileResponse = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .single();
          const profile = profileResponse.data as SupabaseProfile | null;

          if (profile) {
            const mappedUser = mapProfileRowToUser(profile);

            set({
              user: mappedUser,
              isAuthenticated: true,
              needsProfileComplete: !profile.name || profile.name.trim() === '',
            });

            return {
              exists: true,
              needsProfile: !profile.name || profile.name.trim() === '',
              user: mappedUser,
            };
          } else {
            // Create profile if doesn't exist
            const newProfile = {
              id: session.user.id,
              name: '',
              email: session.user.email || '',
              role: 'student',
              status: 'active',
            };

            await supabase
              .from('profiles')
              .insert([newProfile]);

            const newUser = {
              id: session.user.id,
              name: '',
              email: session.user.email || '',
              role: 'student',
              status: 'active',
            } as User;

            set({
              user: newUser,
              isAuthenticated: true,
              needsProfileComplete: true,
            });

            return {
              exists: true,
              needsProfile: true,
              user: newUser,
            };
          }
        } catch (error) {
          console.error('OAuth verification error:', error);
          return { exists: false, needsProfile: false };
        }
      },

      login: async (email: string, password: string) => {
        set({ isLoading: true, error: null });

        try {
          if (isSupabaseConfigured()) {
              const { data, error } = await supabase.auth.signInWithPassword({
                email,
                password,
              });

              if (error) {
                throw new Error(error.message);
              }

              if (data.user) {
                const profileResponse = await supabase
                  .from('profiles')
                  .select('*')
                  .eq('id', data.user.id)
                  .single();
                const profile = profileResponse.data as SupabaseProfile | null;

                if (profile) {
                  if (profile.company_id) {
                    const { data: company } = await supabase
                      .from('companies')
                      .select('status')
                      .eq('id', profile.company_id)
                      .single();
                    
                    if (!company || company.status === 'deleted') {
                      await supabase.auth.signOut();
                      throw new Error('Empresa vinculada a esta conta foi excluída. Contacte o administrador.');
                    }
                  }

                  if (!profile.name || profile.name.trim() === '') {
                    set({ isLoading: false });
                    return { success: true, needsProfile: true };
                  }
                  set({ user: mapProfileRowToUser(profile), isAuthenticated: true, isLoading: false });
                  return { success: true, needsProfile: false };
                } else {
                  set({ isLoading: false });
                  return { success: true, needsProfile: true };
                }
              }
            } else {
              const foundUser = mockUsers.find(
                u => u.email.toLowerCase() === email.toLowerCase() && password === '123456'
              );
              
              if (foundUser) {
                set({ user: foundUser, isAuthenticated: true, isLoading: false });
                return { success: true, needsProfile: false };
              } else {
                throw new Error('Email ou senha inválidos');
              }
            }
          }
          catch (error) {
            const err = error as AuthError;
            set({ error: err.message || 'Erro ao fazer login', isLoading: false });
            return { success: false, needsProfile: false };
          }

        set({ isLoading: false });
        return { success: false, needsProfile: false };
        },

      register: async (name: string, email: string, password: string) => {
        set({ isLoading: true, error: null });
        
        try {
          if (isSupabaseConfigured()) {
            const { data, error } = await supabase.auth.signUp({
              email,
              password,
              options: {
                data: {
                  name,
                },
              },
            });

            if (error) {
              set({ error: error.message });
              return false;
            }

            if (data.user) {
              // Create profile
              const newUser: User = {
                id: data.user.id,
                name,
                email,
                role: 'student',
                status: 'active',
              };

              await supabase.from('profiles').insert([{
                id: newUser.id,
                name: newUser.name,
                email: newUser.email,
                role: newUser.role,
                status: newUser.status,
              }]);

              set({ user: newUser, isAuthenticated: true, isLoading: false });
              return true;
            }
          } else {
            // Fallback to mock (create user in memory)
            const newUser: User = {
              id: `user-${Date.now()}`,
              name,
              email,
              role: 'student',
              status: 'active',
            };
            
            set({ user: newUser, isAuthenticated: true });
            return true;
          }
        } catch (error) {
          const err = error as AuthError;
          set({ error: err.message || 'Erro ao criar conta', isLoading: false });
          return false;
        }
        
        set({ isLoading: false });
        return false;
      },

      createUserFromInvite: async (name: string, email: string, password: string, role: 'student' | 'admin') => {
        set({ isLoading: true, error: null });

        try {
          if (isSupabaseConfigured()) {
            const { data, error } = await supabase.auth.signUp({
              email,
              password,
              options: {
                data: {
                  name,
                },
              },
            });

            if (error) {
              set({ error: error.message });
              return false;
            }

            if (data.user) {
              // Create profile with specified role
              const newUser: User = {
                id: data.user.id,
                name,
                email,
                role,
                status: 'active',
              };

              await supabase.from('profiles').insert([{
                id: newUser.id,
                name: newUser.name,
                email: newUser.email,
                role: newUser.role,
                status: newUser.status,
              }]);

              set({ user: newUser, isAuthenticated: true, isLoading: false });
              return true;
            }
          } else {
            // Fallback to mock (create user in memory)
            const newUser: User = {
              id: `user-${Date.now()}`,
              name,
              email,
              role,
              status: 'active',
            };

            set({ user: newUser, isAuthenticated: true });
            return true;
          }
        } catch (error) {
          const err = error as AuthError;
          set({ error: err.message || 'Erro ao criar conta', isLoading: false });
          return false;
        }

        set({ isLoading: false });
        return false;
      },

      logout: async () => {
        set({ 
          user: null, 
          isAuthenticated: false, 
          error: null, 
          needsProfileComplete: false,
          isLoggingOut: true 
        });
        localStorage.removeItem('auth-storage');
        
        if (isSupabaseConfigured()) {
          try {
            const { error } = await supabase.auth.signOut();
            if (error) {
              console.error('Logout error:', error);
            }
          } catch (err) {
            console.error('Logout exception:', err);
          }
        }
        
        set({ isLoggingOut: false });
      },

      clearError: () => set({ error: null }),

      signInWithGoogle: async () => {
        set({ isLoading: true, error: null });

        try {
          if (isSupabaseConfigured()) {
            const { error } = await supabase.auth.signInWithOAuth({
              provider: 'google',
              options: {
                redirectTo: `${window.location.origin}/complete-profile`,
              },
            });

            if (error) {
              throw new Error(error.message);
            }

            return true;
          } else {
            throw new Error('Supabase não configurado');
          }
        } catch (error) {
          const err = error as AuthError;
          set({ error: err.message || 'Erro ao entrar com Google', isLoading: false });
          return false;
        }
      },

      completeProfile: async (name: string) => {
        const currentUser = useAuthStore.getState().user;
        if (!currentUser) return false;

        set({ isLoading: true, error: null });

        try {
          if (isSupabaseConfigured()) {
            const { data: { user: authUser } } = await supabase.auth.getUser();
            
            const profileData = {
              id: currentUser.id,
              name: name.trim(),
              email: authUser?.email || currentUser.email,
            };

            const { error: upsertError } = await supabase
              .from('profiles')
              .upsert(profileData);

            if (upsertError) {
              set({ error: upsertError.message, isLoading: false });
              return false;
            }

            const { data: updatedProfile } = await supabase
              .from('profiles')
              .select('*')
              .eq('id', currentUser.id)
              .single();

            if (updatedProfile) {
              set({ 
                user: mapProfileRowToUser(updatedProfile as SupabaseProfile), 
                needsProfileComplete: false,
                isLoading: false 
              });
              return true;
            }
          }
        } catch (error) {
          const err = error as AuthError;
          set({ error: err.message || 'Erro ao completar perfil', isLoading: false });
          return false;
        }

        set({ isLoading: false });
        return false;
      },

      updateProfile: async (name: string) => {
        const currentUser = useAuthStore.getState().user;
        if (!currentUser) return false;

        set({ isLoading: true, error: null });

        try {
          if (isSupabaseConfigured()) {
            const { error: upsertError } = await supabase
              .from('profiles')
              .upsert({
                id: currentUser.id,
                name: name.trim(),
                email: currentUser.email,
              });

            if (upsertError) {
              set({ error: upsertError.message, isLoading: false });
              return false;
            }

            const { data: updatedProfile } = await supabase
              .from('profiles')
              .select('*')
              .eq('id', currentUser.id)
              .single();

            if (updatedProfile) {
              set({ user: mapProfileRowToUser(updatedProfile), isLoading: false });
              return true;
            }
          } else {
            const updatedUser = { ...currentUser, name: name.trim() } as User;
            set({ user: updatedUser, isLoading: false });
            return true;
          }
        } catch (error) {
          const err = error as AuthError;
          set({ error: err.message || 'Erro ao atualizar perfil', isLoading: false });
          return false;
        }

        set({ isLoading: false });
        return false;
      },

      setNeedsProfileComplete: (value: boolean) => set({ needsProfileComplete: value }),

      resetPasswordForEmail: async (email: string) => {
        set({ isLoading: true, error: null });

        try {
          if (isSupabaseConfigured()) {
            const { error } = await supabase.auth.resetPasswordForEmail(email, {
              redirectTo: `${window.location.origin}/reset-password`,
            });

            if (error) {
              console.error('Password reset error:', error);
              set({ isLoading: false });
              return false;
            }

            set({ isLoading: false });
            return true;
          } else {
            set({ error: 'Supabase não configurado', isLoading: false });
            return false;
          }
        } catch (error) {
          const err = error as AuthError;
          set({ error: err.message || 'Erro ao processar recuperação de senha', isLoading: false });
          return false;
        }
      },

      updatePassword: async (newPassword: string) => {
        set({ isLoading: true, error: null });

        try {
          if (isSupabaseConfigured()) {
            const { error } = await supabase.auth.updateUser({
              password: newPassword,
            });

            if (error) {
              set({ error: error.message, isLoading: false });
              return false;
            }

            set({ isLoading: false });
            return true;
          } else {
            set({ error: 'Supabase não configurado', isLoading: false });
            return false;
          }
        } catch (error) {
          const err = error as AuthError;
          set({ error: err.message || 'Erro ao atualizar senha', isLoading: false });
          return false;
        }
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ user: state.user }),
      onRehydrateStorage: () => (state) => {
        // Após reidratação, definir isAuthenticated baseado na presença do user
        if (state) {
          state.isAuthenticated = !!state.user;
          state.isAuthInitialized = false;
        }
      },
    }
  )
);