import { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { isFirebaseConfigured } from '../../config/firebase';

interface ProtectedRouteProps {
  children: ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { user, loading } = useAuth();

  // If Firebase is not configured, allow access (fallback mode)
  if (!isFirebaseConfigured()) {
    return <>{children}</>;
  }

  // Show loading screen while checking auth status
  if (loading) {
    return (
      <div className="loading-screen">
        <div className="loading-spinner"></div>
        <p>Verificando autenticación...</p>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}
