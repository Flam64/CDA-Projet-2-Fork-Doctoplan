import { ReactNode, useEffect, useRef } from 'react';
import { focusModal } from '@/utils/focusModal';

export function FocusTrapModal({ children }: { children: ReactNode }) {
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = modalRef.current;
    if (container) {
      // attendre 100ms que les enfants soient bien montés
      const timeout = setTimeout(() => {
        const cleanup = focusModal(container);
        if (cleanup) {
          // enregistrer le nettoyage
          container.dataset.cleanup = '1';
        }
      }, 100);

      return () => clearTimeout(timeout);
    }
    return;
  }, []);

  return (
    <div ref={modalRef} className="w-full" tabIndex={-1}>
      {children}
    </div>
  );
}
