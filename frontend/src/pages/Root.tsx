import React, { useEffect, useState } from 'react';
import { App } from './App';
import { Admin } from './Admin';
import { Login } from './Login';
import { isAuthenticated } from '../services/auth';

export const Root: React.FC = () => {
  const [route, setRoute] = useState<string>(window.location.hash || '#/');
  const [authTick, setAuthTick] = useState(0);

  useEffect(() => {
    const onHash = () => setRoute(window.location.hash || '#/');
  const onAuth = () => setAuthTick((n) => n + 1); // force rerender on auth change
    window.addEventListener('hashchange', onHash);
    window.addEventListener('auth-changed', onAuth as EventListener);
    return () => {
      window.removeEventListener('hashchange', onHash);
      window.removeEventListener('auth-changed', onAuth as EventListener);
    };
  }, []);

  const authed = isAuthenticated();
  if (!authed) return <Login />;
  if (route.startsWith('#/admin')) return <Admin />;
  return <App />;
};
