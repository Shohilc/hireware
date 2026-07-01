import { useState, useEffect } from 'react';
import { useAuthStore } from '../store/authStore';

export function useHydration() {
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    // Check if hydration is already complete
    if (useAuthStore.persist.hasHydrated()) {
      setHydrated(true);
      return;
    }

    // Otherwise, listen for the finish hydration event
    const unsub = useAuthStore.persist.onFinishHydration(() => {
      setHydrated(true);
    });

    return unsub;
  }, []);

  return hydrated;
}
