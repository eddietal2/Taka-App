import { Redirect } from 'expo-router';
import { useEffect, useState } from 'react';

import { getToken } from '@/features/auth/session';

/**
 * App entry point.
 *
 * A stored token means a previous session, so the user goes straight to Home;
 * otherwise they land on login. The token is read asynchronously, so the first
 * render is empty rather than guessing and flashing the wrong screen.
 */
export default function Index() {
  const [target, setTarget] = useState<'/home' | '/login' | null>(null);

  useEffect(() => {
    let cancelled = false;

    void getToken().then((token) => {
      if (!cancelled) setTarget(token ? '/home' : '/login');
    });

    return () => {
      cancelled = true;
    };
  }, []);

  if (!target) return null;

  return <Redirect href={target} />;
}
