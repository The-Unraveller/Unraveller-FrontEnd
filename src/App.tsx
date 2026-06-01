import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { GoogleOAuthProvider } from '@react-oauth/google';
import Home from './pages/Home/Home';
import Auth from './pages/Auth/Auth';
import Missions from './pages/Missions/Missions';
import Game from './pages/Game/Game';
import Result from './pages/Result/Result';
import ResultScreen from './pages/Result/ResultScreen';
import About from './pages/About/About';
import Premium from './pages/Premium/Premium';
import Badges from './pages/Badges/Badges';
import ScenarioScreen from './pages/Scenario/ScenarioScreen';
import DashboardScreen from './pages/Dashboard/DashboardScreen';
import UserProfile from './pages/Profile/UserProfile';
import Market from './pages/Market/Market';
import Report from './pages/Report/Report';
import Score from './pages/Score/Score';
import Streak from './pages/Streak/Streak';
import Guide from './pages/Guide/Guide';
import Friends from './pages/Friends/Friends';
import ProtectedRoute from './components/common/ProtectedRoute';
import AdminProtectedRoute from './components/common/AdminProtectedRoute';
import AdminLayout from './pages/Admin/AdminLayout';
import AdminUsers from './pages/Admin/AdminUsers';
import AdminMissions from './pages/Admin/AdminMissions';
import { useGameStore } from './store/useGameStore';
import { getUserProfile } from './services/api';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Role-aware redirect for /admin index — Admin → users, Moderator → missions
const AdminIndexRedirect = () => {
  const { user } = useGameStore();
  if (user?.role === 'Moderator') return <Navigate to="missions" replace />;
  return <Navigate to="users" replace />;
};

// We need a wrapper component to access Zustand store and useEffect
const AppRoutes = () => {
  const { setUser, setAuthenticated } = useGameStore();

  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const profile = await getUserProfile();
          setUser(profile);
          setAuthenticated(true);
        } catch (err) {
          console.error('Session expired or invalid token', err);
          localStorage.removeItem('token');
          setAuthenticated(false);
        }
      }
    };
    initAuth();
  }, [setUser, setAuthenticated]);

  return (
    <div className="min-h-screen bg-spy-black text-spy-green">
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Home />} />
        <Route path="/auth" element={<Auth />} />
        <Route path="/about" element={<About />} />

        {/* Protected Routes */}
        <Route path="/dashboard" element={<ProtectedRoute><DashboardScreen /></ProtectedRoute>} />
        <Route path="/courses" element={<ProtectedRoute><Missions /></ProtectedRoute>} />
        <Route path="/game/:id" element={<ProtectedRoute><Game /></ProtectedRoute>} />
        <Route path="/result/:id" element={<ProtectedRoute><Result /></ProtectedRoute>} />
        <Route path="/result-screen/:id" element={<ProtectedRoute><ResultScreen /></ProtectedRoute>} />
        <Route path="/premium" element={<ProtectedRoute><Premium /></ProtectedRoute>} />
        <Route path="/badges" element={<ProtectedRoute><Badges /></ProtectedRoute>} />
        <Route path="/scenario/:id" element={<ProtectedRoute><ScenarioScreen /></ProtectedRoute>} />
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
          <Route index element={<AdminIndexRedirect />} />
        </Route>

        <Route path="/missions" element={<Navigate to="/courses" replace />} />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  );
};

function App() {
  return (
    <GoogleOAuthProvider clientId="857953455071-06bni6pvv29qabiot2kqt7b8segm5pda.apps.googleusercontent.com">
      <Router>
        <AppRoutes />
      </Router>
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
    </GoogleOAuthProvider>
  );
}

export default App;
