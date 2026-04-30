import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useEffect } from 'react';
import { useThemeStore } from './stores/themeStore';
import { useAuthStore } from './stores/authStore';
import { useDataStore } from './stores/dataStore';
import { supabase, isSupabaseConfigured } from './lib/supabase';
import { StudentNavbar } from './components/ui/StudentNavbar';
import { Footer } from './components/ui/Footer';
import { AdminNavbar } from './components/ui/AdminNavbar';
import { ToastProvider } from './components/ui/Toast';
import { PageTransition } from './components/ui/PageTransition';
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



function App() {
  const { theme } = useThemeStore();
  const { user, initializeAuth, isAuthInitialized, needsProfileComplete } = useAuthStore();

  useEffect(() => {
    if (!isAuthInitialized) {
      initializeAuth();
    }
  }, [initializeAuth, isAuthInitialized]);

  useEffect(() => {
    if (isAuthInitialized && user && needsProfileComplete && window.location.pathname !== '/complete-profile') {
      window.location.href = '/complete-profile';
    }
  }, [isAuthInitialized, user, needsProfileComplete]);

  interface TawkAPI {
    isChatMaximized?: () => boolean;
    minimize?: () => void;
    setVisitor?: (v: { name: string; email: string }) => void;
    toggle?: () => void;
    onLoad?: () => void;
  }

  useEffect(() => {
    document.documentElement.classList.remove('dark', 'light');
    document.documentElement.classList.add(theme);
  }, [theme]);

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
          const mergedUser = {
            ...profile,
            name: currentUser?.name && currentUser.name.trim() ? currentUser.name : profile.name
          };
          useAuthStore.setState({ user: mergedUser, isAuthenticated: true });
          
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

  const Navbar = user?.role === 'admin' ? AdminNavbar : StudentNavbar;

  return (
    <>
      <ToastProvider />
      <Router>
      <div className="min-h-screen flex flex-col bg-surface-50 dark:bg-surface-900">
        <PageTransition>
          <Routes>
          <Route path="/" element={<RootRedirect />} />
          <Route path="/login" element={<Login />} />
          <Route path="/invite/:token" element={<InviteSetup />} />
          <Route path="/complete-profile" element={<CompleteProfile />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          
          <Route path="/home" element={
            <>
              <Navbar />
              <StudentHome />
              <Footer />
            </>
          } />
          
          <Route path="/course/:id" element={
            <>
              <Navbar />
              <CourseDetail />
            </>
          } />
          
          <Route path="/lesson/:id" element={
            <>
              <Navbar />
              <LessonViewer />
            </>
          } />
          
          <Route path="/help" element={
            <>
              <Navbar />
              <HelpCenter />
              <Footer />
            </>
          } />
          
          <Route path="/profile" element={
            <ProtectedRoute>
              <Navbar />
              <StudentProfile />
            </ProtectedRoute>
          } />
          
          <Route path="/my-courses" element={
            <ProtectedRoute>
              <Navbar />
              <MyCourses />
              <Footer />
            </ProtectedRoute>
          } />
          
          <Route path="/settings" element={
            <ProtectedRoute>
              <Navbar />
              <Settings />
            </ProtectedRoute>
          } />
          
          <Route path="/admin" element={
            <ProtectedRoute requireAdmin>
              <AdminNavbar />
              <AdminDashboard />
            </ProtectedRoute>
          } />
          
          <Route path="/admin/courses" element={
            <ProtectedRoute requireAdmin>
              <AdminNavbar />
              <CourseManagement />
            </ProtectedRoute>
          } />
          
          <Route path="/admin/courses/create" element={
            <ProtectedRoute requireAdmin>
              <AdminNavbar />
              <CourseCreate />
            </ProtectedRoute>
          } />
          
          <Route path="/admin/courses/:id" element={
            <ProtectedRoute requireAdmin>
              <AdminNavbar />
              <CourseCreate />
            </ProtectedRoute>
          } />
          
          <Route path="/admin/users" element={
            <ProtectedRoute requireAdmin>
              <AdminNavbar />
              <UserManagement />
            </ProtectedRoute>
          } />
          
          <Route path="/admin/plans" element={
            <ProtectedRoute requireAdmin>
              <AdminNavbar />
              <PlanManagement />
            </ProtectedRoute>
          } />
          
          <Route path="/admin/categories" element={
            <ProtectedRoute requireAdmin>
              <AdminNavbar />
              <CategoryManagement />
            </ProtectedRoute>
          } />
          
          <Route path="/admin/formations" element={
            <ProtectedRoute requireAdmin>
              <AdminNavbar />
              <FormationManagement />
            </ProtectedRoute>
          } />
          
          <Route path="/admin/formations/create" element={
            <ProtectedRoute requireAdmin>
              <AdminNavbar />
              <FormationCreate />
            </ProtectedRoute>
          } />
          
          <Route path="/admin/formations/:id" element={
            <ProtectedRoute requireAdmin>
              <AdminNavbar />
              <FormationCreate />
            </ProtectedRoute>
          } />
          
          <Route path="/admin/manage" element={
            <ProtectedRoute requireAdmin>
              <AdminNavbar />
              <AdminManage />
            </ProtectedRoute>
          } />
          
          <Route path="/admin/companies" element={
            <ProtectedRoute requireAdmin>
              <AdminNavbar />
              <CompanyManagement />
            </ProtectedRoute>
          } />
          
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
        </PageTransition>
      </div>
      </Router>
    </>
  );
}

export default App;