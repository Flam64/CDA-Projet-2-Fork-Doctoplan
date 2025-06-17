import { Link } from 'react-router-dom';

import { useState } from 'react';
import { Menu, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Logo from '@/components/Logo';
import { useAuth } from '@/hooks/useAuth';
import { LinkButton } from '@/components/layout/LinkButton';

import { getPathFromRole } from '@/utils/getPathFromRole';

export default function Header() {
  const { user, logout } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleMenuItemClick = () => {
    setIsMenuOpen(false);
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const rolePath = getPathFromRole(user?.role || '');

  return (
    <header
      className={`w-full px-6 py-3 relative ${isMenuOpen ? 'bg-white' : ''}`}
      role="banner"
      aria-label="En-tête principal"
    >
      <div className="flex items-center justify-between">
        <Link
          to={rolePath === '/' ? '/login' : rolePath}
          className="flex items-center gap-4"
          aria-label="Retour à l'accueil"
        >
          <Logo />
          <p className="text-blue font-medium hidden sm:block">
            Bienvenue{' '}
            <span className="text-accent" aria-label={`${user?.firstname} ${user?.lastname}`}>
              {user?.firstname} {user?.lastname}
            </span>
          </p>
        </Link>

        <nav
          className="hidden md:flex items-center gap-6"
          role="navigation"
          aria-label="Menu principal"
        >
          <div className="flex items-center gap-3" role="menubar">
            <LinkButton />
            <button
              onClick={logout}
              className="border border-accent text-accent px-4 py-2 bg-white rounded-md hover:bg-accent hover:text-white transition-colors"
              aria-label="Se déconnecter"
              role="menuitem"
            >
              Déconnexion
            </button>
          </div>
        </nav>

        <div className="md:hidden">
          <motion.button
            onClick={toggleMenu}
            className="p-2 text-blue hover:text-accent transition-colors"
            whileTap={{ scale: 0.95 }}
            aria-label={isMenuOpen ? 'Fermer le menu' : 'Ouvrir le menu'}
            aria-expanded={isMenuOpen}
            aria-controls="mobile-menu"
          >
            <motion.div animate={{ rotate: isMenuOpen ? 180 : 0 }} transition={{ duration: 0.2 }}>
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </motion.div>
          </motion.button>
        </div>
      </div>

      <AnimatePresence>
        {isMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-40"
              onClick={() => setIsMenuOpen(false)}
              aria-hidden="true"
            />

            <motion.div
              id="mobile-menu"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3, type: 'spring', stiffness: 300, damping: 30 }}
              className="absolute top-full left-0 right-0 bg-white shadow-lg border-t border-gray-200 z-50 md:hidden"
              role="navigation"
              aria-label="Menu mobile"
            >
              <div className="px-6 py-4 space-y-4">
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 }}
                  className="text-blue font-medium border-b border-gray-100 pb-3"
                  role="presentation"
                >
                  Bienvenue{' '}
                  <span className="text-accent">
                    {user?.firstname} {user?.lastname}
                  </span>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.15 }}
                  className="space-y-3"
                  role="menu"
                >
                  <div
                    role="menuitem"
                    onClick={handleMenuItemClick}
                    onKeyDown={e => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        handleMenuItemClick();
                      }
                    }}
                    tabIndex={0}
                  >
                    <LinkButton />
                  </div>

                  <motion.button
                    onClick={() => {
                      logout();
                      handleMenuItemClick();
                    }}
                    className="w-full text-left border border-accent text-accent px-4 py-2 bg-white rounded-md hover:bg-accent hover:text-white transition-colors"
                    whileTap={{ scale: 0.98 }}
                    role="menuitem"
                  >
                    Déconnexion
                  </motion.button>
                </motion.div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </header>
  );
}
