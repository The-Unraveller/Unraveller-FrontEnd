import React from 'react';
import { Navigate } from 'react-router-dom';
import { useGameStore } from '../../store/useGameStore';
import { Loader2 } from 'lucide-react';

const AdminProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isAuthenticated } = useGameStore();

  if (!isAuthenticated) {
    return <Navigate to="/auth" replace />;
  }

  // Show loading screen while user profile is being fetched
  if (user === null) {
    return (
      <div className="min-h-screen bg-spy-black flex flex-col items-center justify-center font-mono text-spy-green">
        <Loader2 className="w-10 h-10 text-spy-green animate-spin mb-4" />
        <div className="text-xs uppercase tracking-widest animate-pulse">
          Decrypting administrator credentials...
        </div>
      </div>
    );
  }

  if (user.role !== 'Admin') {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

export default AdminProtectedRoute;
