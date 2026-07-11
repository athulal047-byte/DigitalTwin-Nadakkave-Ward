import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import type { UserRole } from '../types';

interface Props {
  children: React.ReactNode;
  roles?: UserRole[];
  permissions?: string[];
}

/**
 * Wraps routes that require authentication.
 * Optionally restricts access to specific roles or permissions.
 */
export default function ProtectedRoute({ children, roles, permissions }: Props) {
  const { isAuthenticated, isLoading, user, hasPermission } = useAuth();
  const location = useLocation();

  // Still checking stored token
  if (isLoading) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center"
        style={{ background: 'linear-gradient(135deg, #0a0e1a 0%, #0d1525 50%, #0a0e1a 100%)' }}>
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-2 border-sky-500/30 border-t-sky-500 rounded-full animate-spin" />
          <p className="text-xs text-[var(--text-muted)]">Verifying session...</p>
        </div>
      </div>
    );
  }

  // Not logged in → redirect to login
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Logged in but wrong role
  if (roles && user && !roles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  // Logged in but missing permission
  if (permissions && permissions.length > 0) {
    const hasAnyPerm = permissions.some(p => hasPermission(p));
    if (!hasAnyPerm && user?.role !== 'admin' && user?.role !== 'corporation') {
      return <Navigate to="/" replace />;
    }
  }

  return <>{children}</>;
}
