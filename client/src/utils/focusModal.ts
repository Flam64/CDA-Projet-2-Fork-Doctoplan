export function focusModal(container: HTMLElement) {
  const focusableSelectors = [
    'a[href]',
    'button:not([disabled])',
    'textarea:not([disabled])',
    'input:not([type="hidden"]):not([disabled])',
    'select:not([disabled])',
    '[tabindex]:not([tabindex="-1"])',
  ];
  const focusables = Array.from(
    container.querySelectorAll<HTMLElement>(focusableSelectors.join(',')),
  );

  if (focusables.length === 0) return;

  const firstEl = focusables[0];
  const lastEl = focusables[focusables.length - 1];

  firstEl.focus();

  function handleKeyDown(e: KeyboardEvent) {
    if (e.key === 'Tab') {
      if (e.shiftKey && document.activeElement === firstEl) {
        e.preventDefault();
        lastEl.focus();
      } else if (!e.shiftKey && document.activeElement === lastEl) {
        e.preventDefault();
        firstEl.focus();
      }
    }
  }

  container.addEventListener('keydown', handleKeyDown);

  // Cleanup
  return () => {
    container.removeEventListener('keydown', handleKeyDown);
  };
}
