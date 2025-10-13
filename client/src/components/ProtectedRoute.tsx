import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';

type ProtectedRouteProps = {
  redirectPath?: string;
};

export default function ProtectedRoute({ redirectPath = '/login' }: ProtectedRouteProps) {
  const { user, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="w-16 h-16 border-t-4 border-b-4 border-teal-500 rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to={redirectPath} />;
  }

  const roleUrl = location.pathname.split('/')[1];

  if (roleUrl !== user.role) {
    return <Navigate to={user.role === 'admin' ? '/admin/users' : `/${user.role}`} replace />;
  }

  return <Outlet />;
}
