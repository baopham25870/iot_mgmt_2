import React, { createContext, useState, useEffect, type ReactNode } from 'react';
import axios from 'axios';

interface User {
  id: number;
  username: string;
  full_name: string;
  role: string;
}

interface AuthContextType {
  user: User | null;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
  loading: boolean;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const validateToken = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        try {
          // Call an endpoint to validate token and get user info
          // For now, we'll decode from token or use a /me endpoint
          // If you don't have a /me endpoint, you can decode JWT on frontend
          const payload = JSON.parse(atob(token.split('.')[1]));
          // Check if token is expired
          const now = Math.floor(Date.now() / 1000);
          if (payload.exp && payload.exp < now) {
            // Token expired
            localStorage.removeItem('token');
            delete axios.defaults.headers.common['Authorization'];
            setUser(null);
          } else {
            // Token valid, set user from token payload
            setUser({
              id: payload.sub || 0,
              username: payload.username || 'user',
              full_name: payload.full_name || '',
              role: payload.role || 'viewer'
            });
          }
        } catch (err) {
          console.error('Token validation failed:', err);
          localStorage.removeItem('token');
          delete axios.defaults.headers.common['Authorization'];
          setUser(null);
        }
      }
      setLoading(false);
    };

    validateToken();
  }, []);

  const login = async (username: string, password: string) => {
    try {
      const res = await axios.post('/api/login', { username, password });
      const { access_token, user: userData } = res.data;
      localStorage.setItem('token', access_token);
      axios.defaults.headers.common['Authorization'] = `Bearer ${access_token}`;
      setUser(userData);
    } catch (err: any) {
      throw new Error(err.response?.data?.error || 'Đăng nhập thất bại');
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    delete axios.defaults.headers.common['Authorization'];
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};
