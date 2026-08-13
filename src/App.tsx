import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { useThemeStore } from './stores/themeStore';
import { useAuthStore, mapProfileRowToUser } from './stores/authStore';
import { useDataStore } from './stores/dataStore';
import { supabase, isSupabaseConfigured } from './lib/supabase';
import { StudentNavbar } from './components/ui/StudentNavbar';
import { Footer } from './components/ui/Footer';
import { AdminNavbar } from './components/ui/AdminNavbar';
import { ToastProvider } from './components/ui/Toast';
import { PageTransition } from './components/ui/PageTransition';
import { ConfirmProvider } from './hooks/useConfirm';
import { StudentHome } from './pages/student/StudentHome';
import { CourseDetail } from './pages/student/CourseDetail';
import { LessonViewer } from './pages/student/LessonViewer';
import { HelpCenter } from './pages/student/HelpCenter';
import { StudentProfile } from './pages/student/StudentProfile';
import { MyCourses } from './pages/student/MyCourses';
import { Settings } from './pages/student/Settings';
import { Login } from './pages/auth/Login';
import { CompleteProfile } from './pages/auth/CompleteProfile';
import { ForgotPassword } from './pages/auth/ForgotPassword';
import { ResetPassword } from './pages/auth/ResetPassword';
import { InviteSetup } from './pages/auth/InviteSetup';
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { AdminManage } from './pages/admin/AdminManage';
import { CourseManagement } from './pages/admin/CourseManagement';
import { CourseCreate } from './pages/admin/CourseCreate';
import { UserManagement } from './pages/admin/UserManagement';
import { PlanManagement } from './pages/admin/PlanManagement';
import { CategoryManagement } from './pages/admin/CategoryManagement';
import { FormationManagement } from './pages/admin/FormationManagement';
import { FormationCreate } from './pages/admin/FormationCreate';
import { CompanyManagement } from './pages/admin/CompanyManagement';
import { OnboardingTemplateManagement } from './pages/admin/OnboardingTemplateManagement';
import { CompanyChecklistProgress } from './pages/admin/CompanyChecklistProgress';
import { OnboardingChecklist } from './pages/student/OnboardingChecklist';

function RootRedirect() {
  return <Navigate to="/login" replace />;
}

function ProtectedRoute({ children, requireAdmin = false }: { children: React.ReactNode, requireAdmin?: boolean }) {
  const { isAuthenticated, user } = useAuthStore();
  const { initialize } = useDataStore();

  useEffect(() => {
    if (isAuthenticated && user) {
      initialize();
    }
  }, [isAuthenticated, user, initialize]);
  
  if (!isAuthenticated || !user) {
    return <Navigate to="/" replace />;
  }
  
  if (requireAdmin && user.role !== 'admin') {
    return <Navigate to="/" replace />;
  }
  
  return <>{children}</>;
}



interface TawkAPI {
  isChatMaximized?: () => boolean;
  minimize?: () => void;
  setVisitor?: (v: { name: string; email: string }) => void;
  toggle?: () => void;
  onLoad?: () => void;
}

const AUTH_PATHS = ['/login', '/complete-profile', '/forgot-password', '/reset-password'];
const FOOTER_PATHS = ['/home', '/help', '/my-courses'];

function PersistentChrome({ position }: { position: 'top' | 'bottom' }) {
  const location = useLocation();
  const { user } = useAuthStore();

  const isAuthRoute =
    location.pathname === '/' ||
    AUTH_PATHS.includes(location.pathname) ||
    location.pathname.startsWith('/invite');

  if (isAuthRoute) return null;

  if (position === 'top') {
    const Navbar = user?.role === 'admin' ? AdminNavbar : StudentNavbar;
    return <Navbar />;
  }

  if (position === 'bottom' && FOOTER_PATHS.includes(location.pathname)) {
    return <Footer />;
  }

  return null;
}

function CompleteProfileRedirect() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isAuthInitialized, needsProfileComplete } = useAuthStore();

  useEffect(() => {
    if (isAuthInitialized && user && needsProfileComplete && location.pathname !== '/complete-profile') {
      navigate('/complete-profile', { replace: true });
    }
  }, [isAuthInitialized, user, needsProfileComplete, navigate, location.pathname]);

  return null;
}

// Reset de scroll ao trocar de rota — evita a tela "carregar no meio" depois de navegar
function ScrollToTop() {
  const location = useLocation();
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' as ScrollBehavior });
  }, [location.pathname]);
  return null;
}

function App() {
  const { theme } = useThemeStore();
  const { initializeAuth, isAuthInitialized, user } = useAuthStore();
  const initializeData = useDataStore((s) => s.initialize);
  const [isAppLoading, setIsAppLoading] = useState(true);

  useEffect(() => {
    if (!isAuthInitialized) {
      initializeAuth();
    }
  }, [initializeAuth, isAuthInitialized]);

  // Once authenticated, ensure catalog data is loaded no matter which route
  // the student lands on. Public pages (/home, /course/:id, /lesson/:id) are
  // not wrapped in ProtectedRoute, which is otherwise the only init trigger —
  // so a direct link or refresh there would show an empty catalog. initialize()
  // has its own guard, so calling it here is idempotent.
  useEffect(() => {
    if (isAuthInitialized && user) {
      initializeData();
    }
  }, [isAuthInitialized, user, initializeData]);

  useEffect(() => {
    if (isAuthInitialized) {
      const timer = setTimeout(() => {
        setIsAppLoading(false);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [isAuthInitialized]);

  useEffect(() => {
    document.documentElement.classList.remove('dark', 'light');
    document.documentElement.classList.add(theme);
  }, [theme]);

  // Fecha o chat Tawk quando clica fora dele (iframes não propagam clique pro document,
  // então qualquer mousedown no document é por definição fora do widget).
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleOutsideClick = (event: MouseEvent) => {
      const tawk = (window as unknown as { Tawk_API?: TawkAPI }).Tawk_API;
      if (!tawk?.isChatMaximized || !tawk.minimize) return;
      if (!tawk.isChatMaximized()) return;

      const target = event.target as HTMLElement | null;
      if (target?.closest('[id^="tawk-"], [class*="tawk-"], iframe[src*="tawk.to"]')) {
        return;
      }
      tawk.minimize();
    };

    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    if (window.Tawk_API || document.querySelector('script[src*="embed.tawk.to"]')) {
      const tawkAPI = window.Tawk_API as TawkAPI;
      if (tawkAPI && !tawkAPI.onLoad) {
        tawkAPI.onLoad = () => {};
      }
      return;
    }

    const s1 = document.createElement('script'), s0 = document.getElementsByTagName('script')[0];
    if (s0 && s0.parentNode) {
      s1.async = true;
      s1.src = 'https://embed.tawk.to/69d6fed9b927021c2d6b6ba5/1jmm90isg';
      s1.charset = 'UTF-8';
      s1.setAttribute('crossorigin', '*');
      s0.parentNode.insertBefore(s1, s0);
    }
  }, []);

  useEffect(() => {
    if (!isSupabaseConfigured()) {
      return;
    }
    
    const setTawkVisitor = (name: string, email: string) => {
      const win = window as unknown as { Tawk_API?: { setVisitor?: (v: { name: string; email: string }) => void } };
      if (win.Tawk_API?.setVisitor) {
        win.Tawk_API.setVisitor({ name, email });
      }
    };
    
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      const { isLoggingOut } = useAuthStore.getState();
      
      if (isLoggingOut) {
        return;
      }
      
      if (session) {
        await new Promise(resolve => setTimeout(resolve, 100));
        
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();
        
        if (profile) {
          const currentUser = useAuthStore.getState().user;
          const mergedProfile = {
            ...profile,
            name: currentUser?.name && currentUser.name.trim() ? currentUser.name : profile.name
          };
          useAuthStore.setState({ user: mapProfileRowToUser(mergedProfile), isAuthenticated: true });
          
          if (profile.name && profile.email) {
            setTawkVisitor(profile.name, profile.email);
          }
        } else {
          useAuthStore.setState({ isAuthenticated: true });
        }
      } else {
        useAuthStore.setState({ user: null, isAuthenticated: false });
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  if (isAppLoading) {
    return (
      <div className="min-h-screen bg-surface-50 dark:bg-[#111827] flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-surface-700 dark:text-white">Carregando...</p>
        </div>
      </div>
    );
  }

  return (
    <ConfirmProvider>
      <ToastProvider />
      <Router>
      <ScrollToTop />
      <CompleteProfileRedirect />
      <div className="min-h-screen flex flex-col bg-surface-50 dark:bg-surface-900">
        <PersistentChrome position="top" />
        <PageTransition>
          <Routes>
          <Route path="/" element={<RootRedirect />} />
          <Route path="/login" element={<Login />} />
          <Route path="/invite/:token" element={<InviteSetup />} />
          <Route path="/complete-profile" element={<CompleteProfile />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />

          <Route path="/home" element={<StudentHome />} />
          <Route path="/course/:id" element={<CourseDetail />} />
          <Route path="/lesson/:id" element={<LessonViewer />} />
          <Route path="/help" element={<HelpCenter />} />

          <Route path="/profile" element={<ProtectedRoute><StudentProfile /></ProtectedRoute>} />
          <Route path="/my-courses" element={<ProtectedRoute><MyCourses /></ProtectedRoute>} />
          <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
          <Route path="/onboarding" element={<ProtectedRoute><OnboardingChecklist /></ProtectedRoute>} />

          <Route path="/admin" element={<ProtectedRoute requireAdmin><AdminDashboard /></ProtectedRoute>} />
          <Route path="/admin/courses" element={<ProtectedRoute requireAdmin><CourseManagement /></ProtectedRoute>} />
          <Route path="/admin/courses/create" element={<ProtectedRoute requireAdmin><CourseCreate /></ProtectedRoute>} />
          <Route path="/admin/courses/:id" element={<ProtectedRoute requireAdmin><CourseCreate /></ProtectedRoute>} />
          <Route path="/admin/users" element={<ProtectedRoute requireAdmin><UserManagement /></ProtectedRoute>} />
          <Route path="/admin/users/:id" element={<ProtectedRoute requireAdmin><UserManagement /></ProtectedRoute>} />
          <Route path="/admin/plans" element={<ProtectedRoute requireAdmin><PlanManagement /></ProtectedRoute>} />
          <Route path="/admin/categories" element={<ProtectedRoute requireAdmin><CategoryManagement /></ProtectedRoute>} />
          <Route path="/admin/formations" element={<ProtectedRoute requireAdmin><FormationManagement /></ProtectedRoute>} />
          <Route path="/admin/formations/create" element={<ProtectedRoute requireAdmin><FormationCreate /></ProtectedRoute>} />
          <Route path="/admin/formations/:id" element={<ProtectedRoute requireAdmin><FormationCreate /></ProtectedRoute>} />
          <Route path="/admin/manage" element={<ProtectedRoute requireAdmin><AdminManage /></ProtectedRoute>} />
          <Route path="/admin/companies" element={<ProtectedRoute requireAdmin><CompanyManagement /></ProtectedRoute>} />
          <Route path="/admin/companies/:id/checklist" element={<ProtectedRoute requireAdmin><CompanyChecklistProgress /></ProtectedRoute>} />
          <Route path="/admin/onboarding-templates" element={<ProtectedRoute requireAdmin><OnboardingTemplateManagement /></ProtectedRoute>} />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
        </PageTransition>
        <PersistentChrome position="bottom" />
      </div>
      </Router>
    </ConfirmProvider>
  );
}

export default App;
