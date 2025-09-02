import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';

export const useAuth = () => {
  const { data: session } = useSession();
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    if (session?.user?.accessToken) {
      setToken(session.user.accessToken);
      // Store in localStorage for API client access
      if (typeof window !== 'undefined') {
        localStorage.setItem('accessToken', session.user.accessToken);
      }
    }
  }, [session]);

  const logout = () => {
    setToken(null);
    if (typeof window !== 'undefined') {
      localStorage.removeItem('accessToken');
      sessionStorage.removeItem('accessToken');
    }
  };

  return { token, logout, isAuthenticated: !!token };
};
