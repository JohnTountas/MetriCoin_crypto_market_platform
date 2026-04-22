// Minimal localStorage-backed state helper for isolated persistence needs.
// It is intentionally tiny so callers can understand failure behavior at a glance.
import { useEffect, useState } from 'react';

export const usePersistentState = <T,>(storageKey: string, initialValue: T) => {
  const [value, setValue] = useState<T>(() => {
    try {
      const storedValue = window.localStorage.getItem(storageKey);
      return storedValue ? (JSON.parse(storedValue) as T) : initialValue;
    } catch {
      return initialValue;
    }
  });

  useEffect(() => {
    window.localStorage.setItem(storageKey, JSON.stringify(value));
  }, [storageKey, value]);

  return [value, setValue] as const;
};


