import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User } from '../types';
import { authAPI } from '../lib/api';
import toast from 'react-hot-toast';

function decodeJWT(token: string): any {
  try {
    const payload = token.split('.')[1];
    return JSON.parse(atob(payload.replace(/-/g, '+').replace(/_/g, '/')));
  } catch {
    return null;
  }
}

function isTokenExpired(token: string): boolean {
  const decoded = decodeJWT(token);
  if (!decoded || !decoded.exp) return true;
  return Date.now() / 1000 > decoded.exp - 30;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (userData: any) => Promise<void>;
  logout: () => void;
  updateUser: (updates: Partial<User>) => void;
}

/**
 * React Context for authentication state and actions.
 * Use with useAuth() hook.
 */
const AuthContext = createContext<AuthContextType | undefined>(undefined);

/**
 * useAuth hook provides access to authentication context.
 * @returns {AuthContextType} Auth context value.
 * @throws Error if used outside AuthProvider.
 */
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

/**
 * Props for AuthProvider component.
 * @property {ReactNode} children - Child components.
 */
interface AuthProviderProps {
  children: ReactNode;
}

/**
 * AuthProvider component wraps the app and provides authentication context.
 * Handles login, registration, logout, token refresh, and user state.
 * @param {AuthProviderProps} props - Component props.
 * @returns {JSX.Element} Auth context provider.
 */
export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // On mount: check for stored tokens, refresh if expired
    const checkAuth = async () => {
      const storedToken = localStorage.getItem('access_token');
      const storedUser = localStorage.getItem('user');
      if (storedToken && storedUser) {
        try {
          let validToken = storedToken;
          if (isTokenExpired(storedToken)) {
            const refreshed = await authAPI.refreshToken();
            validToken = refreshed || '';
          }
          if (validToken) {
            setToken(validToken);
            setUser(JSON.parse(localStorage.getItem('user')!));
          } else {
            setToken(null);
            setUser(null);
            localStorage.removeItem('access_token');
            localStorage.removeItem('refresh_token');
            localStorage.removeItem('user');
          }
        } catch (error) {
          setToken(null);
          setUser(null);
          localStorage.removeItem('access_token');
          localStorage.removeItem('refresh_token');
          localStorage.removeItem('user');
        }
      }
      setIsLoading(false);
    };
    checkAuth();
  }, []);


  const login = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      // Always refresh token before login to avoid race
      const storedToken = localStorage.getItem('access_token');
      if (storedToken && isTokenExpired(storedToken)) {
        await authAPI.refreshToken();
      }
      const { user: userData, access_token, refresh_token } = await authAPI.login(email, password);
      setUser(userData);
      setToken(access_token ?? null);
      localStorage.setItem('access_token', access_token ?? '');
      localStorage.setItem('refresh_token', refresh_token ?? '');
      localStorage.setItem('user', JSON.stringify(userData));
      toast.success(`Welcome back, ${userData.firstName}!`);
    } catch (error: any) {
      console.error('Login error:', error);
      toast.error(error.response?.data?.message || 'Login failed. Please try again.');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };


  const register = async (userData: any) => {
    try {
      setIsLoading(true);
      // Always refresh token before register to avoid race
      const storedToken = localStorage.getItem('access_token');
      if (storedToken && isTokenExpired(storedToken)) {
        await authAPI.refreshToken();
      }
      const { user: newUser, access_token, refresh_token } = await authAPI.register(userData);
      setUser(newUser);
      setToken(access_token ?? null);
      localStorage.setItem('access_token', access_token ?? '');
      localStorage.setItem('refresh_token', refresh_token ?? '');
      localStorage.setItem('user', JSON.stringify(newUser));
      toast.success(`Welcome to Smart Bus, ${newUser.firstName}!`);
    } catch (error: any) {
      console.error('Registration error:', error);
      if (error.response?.status === 409) {
        toast.error('User already registered, please try with a different email.');
      } else {
        toast.error(error.response?.data?.message || 'Registration failed. Please try again.');
      }
      throw error;
    } finally {
      setIsLoading(false);
    }
  };


  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user');
    toast.success('Logged out successfully', { id: 'logout-toast' });
  };

  const updateUser = (updates: Partial<User>) => {
    if (!user) return;
    
    const updatedUser = { ...user, ...updates };
    setUser(updatedUser);
    localStorage.setItem('user', JSON.stringify(updatedUser));
    toast.success('Profile updated successfully');
  };

  const value: AuthContextType = {
    user,
    token,
    isLoading,
    login,
    register,
    logout,
    updateUser,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};