/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState, useEffect } from 'react';
import { login as apiLogin, register as apiRegister } from '../services/api';

const AuthContext = createContext(null);

/**
 * AuthProvider Component.
 * Wraps root layout to manage candidate state, session tokens, and local recovery.
 */
export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const storedUser = localStorage.getItem('user');
      return storedUser ? JSON.parse(storedUser) : null;
    } catch {
      return null;
    }
  });
  
  const [token, setToken] = useState(() => localStorage.getItem('token') || null);
  const [loading, setLoading] = useState(true);

  /**
   * Logs out the user and redirects to Login page.
   */
  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('isAuthenticated');
    setToken(null);
    setUser(null);
    window.location.href = '/login';
  };

  // Restore session from localStorage on startup
  useEffect(() => {
    const checkAuth = async () => {
      const storedToken = localStorage.getItem('token');
      const storedUser = localStorage.getItem('user');

      if (storedToken && storedUser) {
        setToken(storedToken);
        try {
          setUser(JSON.parse(storedUser));
        } catch {
          // Clean up if corrupted JSON
          logout();
        }
      }
      setLoading(false);
    };

    checkAuth();
  }, []);

  /**
   * Logs in a user.
   * @param {Object} credentials - { email, password }
   */
  const login = async (credentials) => {
    const res = await apiLogin(credentials);
    const tokenVal = res?.data?.token || res?.token;
    const userVal = res?.data?.user || res?.user;

    if (tokenVal && userVal) {
      localStorage.setItem('token', tokenVal);
      localStorage.setItem('user', JSON.stringify(userVal));
      localStorage.setItem('isAuthenticated', 'true');
      setToken(tokenVal);
      setUser(userVal);
      return res;
    }
    throw new Error('Login failed: Token or user data was missing in response.');
  };

  /**
   * Registers a new user.
   * @param {Object} userData - { fullName, email, password, avatar }
   */
  const register = async (userData) => {
    const res = await apiRegister(userData);
    const tokenVal = res?.data?.token || res?.token;
    const userVal = res?.data?.user || res?.user;

    if (tokenVal && userVal) {
      localStorage.setItem('token', tokenVal);
      localStorage.setItem('user', JSON.stringify(userVal));
      localStorage.setItem('isAuthenticated', 'true');
      setToken(tokenVal);
      setUser(userVal);
      return res;
    }
    throw new Error('Registration failed: Token or user data was missing in response.');
  };

  const value = {
    user,
    token,
    loading,
    isAuthenticated: !!token,
    login,
    register,
    logout
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

/**
 * Custom Hook to consume AuthContext.
 */
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be consumed within an AuthProvider.');
  }
  return context;
}
