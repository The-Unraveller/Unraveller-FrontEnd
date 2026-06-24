import * as React from 'react';
import { useEffect, lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { HelmetProvider } from 'react-helmet-async';
import { useGameStore } from './store/useGameStore';
import { getUserProfile } from './services/api';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { PageTransitionLoader } from './components/common/PageTransitionLoader';
import ProtectedRoute from './components/common/ProtectedRoute';
import AdminProtectedRoute from './components/common/AdminProtectedRoute';

// Lazy load page components
const Home = lazy(() => import('./pages/Home/Home'));
const Auth = lazy(() => import('./pages/Auth/Auth'));
const Missions = lazy(() => import('./pages/Missions/Missions'));
const Game = lazy(() => import('./pages/Game/Game'));
const Result = lazy(() => import('./pages/Result/Result'));
const About = lazy(() => import('./pages/About/About'));
const Premium = lazy(() => import('./pages/Premium/Premium'));
const Badges = lazy(() => import('./pages/Badges/Badges'));
const ProgressPage = lazy(() => import('./pages/Progress/ProgressPage'));
const DashboardScreen = lazy(() => import('./pages/Dashboard/DashboardScreen'));
const UserProfile = lazy(() => import('./pages/Profile/UserProfile'));
const CourseCertificate = lazy(() => import('./pages/Certificate/CourseCertificate'));
const Market = lazy(() => import('./pages/Market/Market'));
const Report = lazy(() => import('./pages/Report/Report'));
const Score = lazy(() => import('./pages/Score/Score'));
const Streak = lazy(() => import('./pages/Streak/Streak'));
const Guide = lazy(() => import('./pages/Guide/Guide'));
const Friends = lazy(() => import('./pages/Friends/Friends'));
const NotFound = lazy(() => import('./pages/NotFound/NotFound'));
const AdminLayout = lazy(() => import('./pages/Admin/AdminLayout'));
const AdminUsers = lazy(() => import('./pages/Admin/AdminUsers'));
const AdminMissions = lazy(() => import('./pages/Admin/AdminMissions'));
const AdminNpcs = lazy(() => import('./pages/Admin/AdminNpcs'));
const AdminShopItems = lazy(() => import('./pages/Admin/AdminShopItems'));

// Role-aware redirect for /admin index — Admin → users, Moderator → missions
const AdminIndexRedirect = () => {
  const { user } = useGameStore();
  if (user?.role === 'Moderator') return <Navigate to="missions" replace />;
  return <Navigate to="users" replace />;
};

// We need a wrapper component to access Zustand store and useEffect
const AppRoutes = () => {
  const { setUser, setAuthenticated, setInitializing } = useGameStore();

  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        // Không có token → không cần init
        setInitializing(false);
        return;
      }
      try {
        const profile = await getUserProfile();
        setUser(profile);
        setAuthenticated(true);
      } catch (err) {
        console.error('Session expired or invalid token:', err);
        localStorage.removeItem('token');
        setAuthenticated(false);
      } finally {
        setInitializing(false); // Luôn kết thúc init dù thành công hay thất bại
      }
    };
    initAuth();
  }, []); // Không cần deps — chỉ chạy 1 lần khi mount

  return (
    <div className="min-h-screen bg-spy-black text-white font-body">
      <PageTransitionLoader />
      <Suspense fallback={<PageTransitionLoader />}>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Home />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/about" element={<About />} />
          <Route path="/certificate/:token" element={<CourseCertificate />} />

          {/* Protected Routes */}
          <Route path="/dashboard" element={<ProtectedRoute><DashboardScreen /></ProtectedRoute>} />
          <Route path="/courses" element={<ProtectedRoute><Missions /></ProtectedRoute>} />
          <Route path="/game/:id" element={<ProtectedRoute><Game /></ProtectedRoute>} />
          <Route path="/result/:id" element={<ProtectedRoute><Result /></ProtectedRoute>} />
          <Route path="/result-screen/:id" element={<ProtectedRoute><Result /></ProtectedRoute>} />
          <Route path="/premium" element={<ProtectedRoute><Premium /></ProtectedRoute>} />
          <Route path="/badges" element={<ProtectedRoute><Badges /></ProtectedRoute>} />
          <Route path="/progress" element={<ProtectedRoute><ProgressPage /></ProtectedRoute>} />
          <Route path="/scenario/:id" element={<ProtectedRoute><Game /></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute><UserProfile /></ProtectedRoute>} />
          <Route path="/market" element={<ProtectedRoute><Market /></ProtectedRoute>} />
          <Route path="/report" element={<ProtectedRoute><Report /></ProtectedRoute>} />
          <Route path="/score" element={<ProtectedRoute><Score /></ProtectedRoute>} />
          <Route path="/streak" element={<ProtectedRoute><Streak /></ProtectedRoute>} />
          <Route path="/guide" element={<ProtectedRoute><Guide /></ProtectedRoute>} />
          <Route path="/friends" element={<ProtectedRoute><Friends /></ProtectedRoute>} />

          {/* Admin Routes */}
          <Route path="/admin" element={<AdminProtectedRoute><AdminLayout /></AdminProtectedRoute>}>
            <Route path="users" element={<AdminUsers />} />
            <Route path="missions" element={<AdminMissions />} />
            <Route path="npcs" element={<AdminNpcs />} />
            <Route path="shop-items" element={<AdminShopItems />} />
            <Route index element={<AdminIndexRedirect />} />
          </Route>

          <Route path="/missions" element={<Navigate to="/courses" replace />} />

          {/* Fallback */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
    </div>
  );
};

function App() {
  return (
    <GoogleOAuthProvider clientId="857953455071-06bni6pvv29qabiot2kqt7b8segm5pda.apps.googleusercontent.com">
      <HelmetProvider>
        <Router>
          <AppRoutes />
          <ToastContainer
            position="top-right"
            autoClose={3500}
            hideProgressBar={false}
            newestOnTop={false}
            closeOnClick
            rtl={false}
            pauseOnFocusLoss
            draggable
            pauseOnHover
            theme="dark"
          />
        </Router>
      </HelmetProvider>
    </GoogleOAuthProvider>
  );
}

export default App;
