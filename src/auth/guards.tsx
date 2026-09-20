import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from './useAuth';

const LoadingSpinner = () => (
  <div
    style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100vh',
      backgroundColor: 'var(--bg-main, #0b0f19)',
      color: 'var(--text-muted, #94a3b8)',
      fontFamily: 'var(--font-sans, system-ui, sans-serif)',
      fontSize: '0.95rem',
    }}
  >
    Loading session…
  </div>
);

/**
 * Sends signed-out visitors to /signin, remembering where they were headed so
 * the form can return them there.
 */
export const RequireAuth = () => {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/signin" replace state={{ from: location.pathname + location.search }} />;
  }

  return <Outlet />;
};

/** The mirror: a signed-in user has no business on the sign-in form. */
export const RequireAnon = () => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <LoadingSpinner />;
  }

  return isAuthenticated ? <Navigate to="/" replace /> : <Outlet />;
};
