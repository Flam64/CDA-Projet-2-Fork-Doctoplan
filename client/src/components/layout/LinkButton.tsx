import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { getPathFromRole } from '@/utils/getPathFromRole';

export function LinkButton() {
  const { user } = useAuth();
  const location = useLocation();
  let linkButtons = null;

  const rolePath = getPathFromRole(user?.role || '');

  if (location.pathname === '/admin/users') {
    linkButtons = [
      { title: 'Gérer les logs', link: '/admin/logs' },
      { title: 'Gérer les services', link: '/admin/department' },
    ];
  } else if (location.pathname !== rolePath) {
    linkButtons = [{ title: 'Tableau de bord', link: getPathFromRole(user?.role || '') }];
  }

  if (!linkButtons) {
    return null;
  }

  return (
    <div className="flex gap-3">
      {linkButtons.map(button => (
        <Link
          key={button.title}
          to={button.link}
          className="bg-blue text-white px-4 py-2 rounded-md hover:bg-blue/90 transition-colors"
        >
          {button.title}
        </Link>
      ))}
    </div>
  );
}
