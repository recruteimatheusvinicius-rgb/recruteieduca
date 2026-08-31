import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { useEffect, useState, lazy, Suspense } from 'react';
import { useThemeStore } from './stores/themeStore';
import { useAuthStore, mapProfileRowToUser } from './stores/authStore';
import { useDataStore } from './stores/dataStore';
import { supabase, isSupabaseConfigured } from './lib/supabase';
import { StudentNavbar } from './components/ui/StudentNavbar';
import { Footer } from './components/ui/Footer';
import { AdminSidebar } from './components/ui/AdminSidebar';
import { ToastProvider } from './components/ui/Toast';
import { PageTransition } from './components/ui/PageTransition';
import { ConfirmProvider } from './hooks/useConfirm';
import { Login } from './pages/auth/Login';
import { MarketingLayout } from './pages/marketing/MarketingLayout';
import { Home } from './pages/marketing/Home';
import { Cursos } from './pages/marketing/Cursos';
import { Conteudos } from './pages/marketing/Conteudos';
import { CriarConta } from './pages/marketing/CriarConta';

// Rotas carregadas sob demanda: reduz o bundle inicial (principalmente as
// telas de admin, que puxam o editor Tiptap) para quem só usa a área do aluno.
const StudentHome = lazy(() => import('./pages/student/StudentHome').then(m => ({ default: m.StudentHome })));
const CourseDetail = lazy(() => import('./pages/student/CourseDetail').then(m => ({ default: m.CourseDetail })));
const LessonViewer = lazy(() => import('./pages/student/LessonViewer').then(m => ({ default: m.LessonViewer })));
const HelpCenter = lazy(() => import('./pages/student/HelpCenter').then(m => ({ default: m.HelpCenter })));
const StudentProfile = lazy(() => import('./pages/student/StudentProfile').then(m => ({ default: m.StudentProfile })));
const MyCourses = lazy(() => import('./pages/student/MyCourses').then(m => ({ default: m.MyCourses })));
const Settings = lazy(() => import('./pages/student/Settings').then(m => ({ default: m.Settings })));
const OnboardingChecklist = lazy(() => import('./pages/student/OnboardingChecklist').then(m => ({ default: m.OnboardingChecklist })));
const Webinars = lazy(() => import('./pages/student/EducaHub').then(m => ({ default: m.Webinars })));
const Pilulas = lazy(() => import('./pages/student/EducaHub').then(m => ({ default: m.Pilulas })));
const Materiais = lazy(() => import('./pages/student/EducaHub').then(m => ({ default: m.Materiais })));
const CompleteProfile = lazy(() => import('./pages/auth/CompleteProfile').then(m => ({ default: m.CompleteProfile })));
const ForgotPassword = lazy(() => import('./pages/auth/ForgotPassword').then(m => ({ default: m.ForgotPassword })));
const ResetPassword = lazy(() => import('./pages/auth/ResetPassword').then(m => ({ default: m.ResetPassword })));
const InviteSetup = lazy(() => import('./pages/auth/InviteSetup').then(m => ({ default: m.InviteSetup })));
const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard').then(m => ({ default: m.AdminDashboard })));
const CourseManagement = lazy(() => import('./pages/admin/CourseManagement').then(m => ({ default: m.CourseManagement })));
const CourseCreate = lazy(() => import('./pages/admin/CourseCreate').then(m => ({ default: m.CourseCreate })));
const UserManagement = lazy(() => import('./pages/admin/UserManagement').then(m => ({ default: m.UserManagement })));
const PlanManagement = lazy(() => import('./pages/admin/PlanManagement').then(m => ({ default: m.PlanManagement })));
const CategoryManagement = lazy(() => import('./pages/admin/CategoryManagement').then(m => ({ default: m.CategoryManagement })));
const FormationManagement = lazy(() => import('./pages/admin/FormationManagement').then(m => ({ default: m.FormationManagement })));
const FormationCreate = lazy(() => import('./pages/admin/FormationCreate').then(m => ({ default: m.FormationCreate })));
const CompanyManagement = lazy(() => import('./pages/admin/CompanyManagement').then(m => ({ default: m.CompanyManagement })));
const OnboardingTemplateManagement = lazy(() => import('./pages/admin/OnboardingTemplateManagement').then(m => ({ default: m.OnboardingTemplateManagement })));
const CompanyChecklistProgress = lazy(() => import('./pages/admin/CompanyChecklistProgress').then(m => ({ default: m.CompanyChecklistProgress })));

function RouteFallback() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );
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
const MARKETING_PATHS = ['/', '/cursos', '/conteudos', '/criar-conta'];
const FOOTER_PATHS = ['/home', '/help', '/my-courses'];

function AppRoutes() {
  return (
    <Suspense fallback={<RouteFallback />}>
      <Routes>
        <Route path="/" element={<MarketingLayout />}>
          <Route index element={<Home />} />
          <Route path="cursos" element={<Cursos />} />
          <Route path="conteudos" element={<Conteudos />} />
          <Route path="criar-conta" element={<CriarConta />} />
        </Route>
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
        <Route path="/educa/webinars" element={<ProtectedRoute><Webinars /></ProtectedRoute>} />
        <Route path="/educa/pilulas" element={<ProtectedRoute><Pilulas /></ProtectedRoute>} />
        <Route path="/educa/materiais" element={<ProtectedRoute><Materiais /></ProtectedRoute>} />

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
        <Route path="/admin/manage" element={<Navigate to="/admin" replace />} />
        <Route path="/admin/companies" element={<ProtectedRoute requireAdmin><CompanyManagement /></ProtectedRoute>} />
        <Route path="/admin/companies/:id/checklist" element={<ProtectedRoute requireAdmin><CompanyChecklistProgress /></ProtectedRoute>} />
        <Route path="/admin/onboarding-templates" element={<ProtectedRoute requireAdmin><OnboardingTemplateManagement /></ProtectedRoute>} />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  );
}

// Admin usa uma sidebar escura fixa em vez do menu superior do aluno — troca
// de layout completa, não só de componente, então fica isolada daqui.
function AppShell() {
  const location = useLocation();
  const { user } = useAuthStore();

  const isAuthRoute =
    MARKETING_PATHS.includes(location.pathname) ||
    AUTH_PATHS.includes(location.pathname) ||
    location.pathname.startsWith('/invite');

  const showFooter = FOOTER_PATHS.includes(location.pathname);

  if (!isAuthRoute && user?.role === 'admin') {
    return (
      <div className="min-h-screen flex flex-col lg:flex-row bg-surface-50 dark:bg-surface-900">
        <AdminSidebar />
        <div className="flex-1 min-w-0 flex flex-col">
          <PageTransition>
            <AppRoutes />
          </PageTransition>
          {showFooter && <Footer />}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-surface-50 dark:bg-surface-900">
      {!isAuthRoute && <StudentNavbar />}
      <PageTransition>
        <AppRoutes />
      </PageTransition>
      {showFooter && <Footer />}
    </div>
  );
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
        <AppShell />
      </Router>
    </ConfirmProvider>
  );
}

export default App;