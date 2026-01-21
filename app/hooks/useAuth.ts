// hooks/useAuth.ts
'use client';

import { useState, useEffect, useCallback } from 'react';
import { authService, User } from '@/app/lib/api/auth.service';

interface UseAuthReturn {
  user: User | null;
  loading: boolean;
  isAuthenticated: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  checkAuth: () => Promise<void>;
}

export function useAuth(): UseAuthReturn {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Verificar autenticación al montar el componente
   */
  const checkAuth = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const token = authService.getSessionToken();
      if (token) {
        const userData = await authService.validateSession(token);
        setUser(userData);
        setIsAuthenticated(true);
      } else {
        setUser(null);
        setIsAuthenticated(false);
      }
    } catch (error: any) {
      console.error('Error al verificar autenticación:', error);
      authService.clearSessionToken();
      setUser(null);
      setIsAuthenticated(false);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Efecto para verificar autenticación al montar
   */
  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  /**
   * Login del usuario
   */
  const login = async (email: string, password: string) => {
    try {
      setLoading(true);
      setError(null);

      // Usar el método loginComplete que hace todo el flujo automáticamente
      const response = await authService.loginComplete(email, password);
      
      setUser(response.data.user);
      setIsAuthenticated(true);
    } catch (error: any) {
      console.error('Error al iniciar sesión:', error);
      setError(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Logout del usuario
   */
  const logout = () => {
    authService.logout();
    setUser(null);
    setIsAuthenticated(false);
    setError(null);
  };

  return {
    user,
    loading,
    isAuthenticated,
    error,
    login,
    logout,
    checkAuth,
  };
}