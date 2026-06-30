import { useEffect } from 'react';
import { useAuthStore } from '../store/authStore';

export function useAuth() {
  const store = useAuthStore();

  useEffect(() => {
    // Listen for auth expiry events from axios interceptor
    const handleExpiry = () => {
      store.logout();
    };
    window.addEventListener('auth:expired', handleExpiry);
    return () => window.removeEventListener('auth:expired', handleExpiry);
  }, []);

  return {
    user: store.user,
    token: store.token,
    isAuthenticated: !!store.token,
    isLoading: store.isLoading,
    error: store.error,
    login: store.login,
    register: store.register,
    logout: store.logout,
    fetchUser: store.fetchUser,
    setToken: store.setToken,
    clearError: store.clearError,
  };
}
