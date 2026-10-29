import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authService } from '../services/authService';

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const savedUser = localStorage.getItem('sdrrms_user');
      return savedUser ? JSON.parse(savedUser) : null;
    } catch {
      return null;
    }
  });

  const [token, setToken] = useState(() => {
    return localStorage.getItem('sdrrms_token') || null;
  });

  const [loading, setLoading] = useState(true);

  // Synchronize storage helper
  const persistAuth = (newToken, newUser) => {
    if (newToken) {
      localStorage.setItem('sdrrms_token', newToken);
      setToken(newToken);
    } else {
      localStorage.removeItem('sdrrms_token');
      setToken(null);
    }

    if (newUser) {
      localStorage.setItem('sdrrms_user', JSON.stringify(newUser));
      setUser(newUser);
    } else {
      localStorage.removeItem('sdrrms_user');
      setUser(null);
    }
  };

  // Validate token and fetch current user
  const refreshUser = useCallback(async () => {
    const currentToken = localStorage.getItem('sdrrms_token');
    if (!currentToken) {
      persistAuth(null, null);
      return null;
    }

    try {
      const response = await authService.getCurrentUser();
      const userData = response?.user || response?.data?.user || response?.data || response;
      if (userData && typeof userData === 'object') {
        localStorage.setItem('sdrrms_user', JSON.stringify(userData));
        setUser(userData);
        return userData;
      }
      return null;
    } catch (error) {
      // If validation fails with unauthorized, clear auth state
      persistAuth(null, null);
      throw error;
    }
  }, []);

  // Check auth status on mount
  useEffect(() => {
    let isMounted = true;

    const initAuth = async () => {
      const savedToken = localStorage.getItem('sdrrms_token');
      if (savedToken) {
        try {
          const response = await authService.getCurrentUser();
          if (isMounted) {
            const userData = response?.user || response?.data?.user || response?.data || response;
            if (userData && typeof userData === 'object') {
              localStorage.setItem('sdrrms_user', JSON.stringify(userData));
              setUser(userData);
              setToken(savedToken);
            } else {
              persistAuth(null, null);
            }
          }
        } catch {
          if (isMounted) {
            persistAuth(null, null);
          }
        }
      } else {
        if (isMounted) {
          persistAuth(null, null);
        }
      }

      if (isMounted) {
        setLoading(false);
      }
    };

    initAuth();

    return () => {
      isMounted = false;
    };
  }, []);

  // Login handler
  const login = async (credentials) => {
    setLoading(true);
    try {
      const response = await authService.login(credentials);
      const authToken = response?.token || response?.accessToken || response?.data?.token || response?.data?.accessToken;
      let userData = response?.user || response?.data?.user || null;

      if (!userData && response && typeof response === 'object' && !Array.isArray(response)) {
        if (response.email || response.id || response.role) {
          userData = response;
        }
      }

      if (authToken) {
        localStorage.setItem('sdrrms_token', authToken);
        setToken(authToken);

        // If user object not fully populated in login payload, fetch from /auth/me
        if (!userData || !userData.role) {
          try {
            const userRes = await authService.getCurrentUser();
            userData = userRes?.user || userRes?.data?.user || userRes?.data || userRes;
          } catch {
            // fallback to whatever user data was provided
          }
        }

        if (userData) {
          localStorage.setItem('sdrrms_user', JSON.stringify(userData));
          setUser(userData);
        }
      }

      return response;
    } finally {
      setLoading(false);
    }
  };

  // Register handler
  const register = async (userData) => {
    setLoading(true);
    try {
      const response = await authService.register(userData);
      const authToken = response?.token || response?.accessToken || response?.data?.token;
      const registeredUser = response?.user || response?.data?.user || null;

      if (authToken && registeredUser) {
        persistAuth(authToken, registeredUser);
      }

      return response;
    } finally {
      setLoading(false);
    }
  };

  // Logout handler
  const logout = () => {
    persistAuth(null, null);
  };

  const isAuthenticated = Boolean(token && user);

  const value = {
    user,
    token,
    loading,
    isAuthenticated,
    login,
    register,
    logout,
    refreshUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default useAuth;
