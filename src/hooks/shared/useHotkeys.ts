import { useEffect } from 'react';

export const useHotkeys = (matcher: (event: KeyboardEvent) => boolean, callback: () => void) => {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (matcher(event)) {
        event.preventDefault();
        callback();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [callback, matcher]);
};

