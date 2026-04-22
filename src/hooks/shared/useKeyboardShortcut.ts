// Small reusable shortcut hook so features can opt into keyboard behavior without copy-pasting
// event listeners. Keeping it generic also makes testing keyboard flows simpler.
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


