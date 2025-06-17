import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { getPathFromRole } from '@/utils/getPathFromRole';

export function LinkButton() {
  const { user } = useAuth();
  const location = useLocation();
  let linkButton = null;

  const rolePath = getPathFromRole(user?.role || '');

  if (location.pathname === '/admin/users') {
    linkButton = { title: 'Gérer les logs', link: '/admin/logs' };
  } else if (location.pathname !== rolePath) {
    linkButton = { title: 'Tableau de bord', link: getPathFromRole(user?.role || '') };
  }

  if (!linkButton) {
    return null;
  }

  return (
    <Link
      to={linkButton.link}
      className="bg-blue text-white px-4 py-2 rounded-md hover:bg-blue/90 transition-colors"
    >
      {linkButton.title}
    </Link>
  );
}
