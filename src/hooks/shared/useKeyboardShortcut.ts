import { useEffect } from 'react';

export const useKeyboardShortcut = (
  matchesShortcut: (event: KeyboardEvent) => boolean,
  onShortcutMatch: () => void,
) => {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (matchesShortcut(event)) {
        event.preventDefault();
        onShortcutMatch();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [matchesShortcut, onShortcutMatch]);
};


