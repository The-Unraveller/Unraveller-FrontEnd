import * as React from 'react';
import { Navigate } from 'react-router-dom';
import { useGameStore } from '../../store/useGameStore';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const { isAuthenticated, isInitializing } = useGameStore();

  // Đang xác thực token với server → hiển thị loading, không redirect vội
  if (isInitializing) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-spy-black">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-2 border-purple-brand/30 border-t-purple-brand rounded-full animate-spin" />
          <p className="text-text-secondary text-sm font-mono tracking-wide">
            Đang xác thực tài khoản...
          </p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/auth" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
