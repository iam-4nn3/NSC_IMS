// src/context/AuthContext.jsx
import { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from "jwt-decode";
import api from '../requests'; // your custom axios instance

const AuthContext = createContext();
export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem('token') || null);
  const [isAdmin, setIsAdmin] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (token) {
      try {
        const decoded = jwtDecode(token);
        const now = Date.now() / 1000;

        if (decoded.exp && decoded.exp < now) {
          console.warn('JWT token expired. Logging out.');
          logout();
          return;
        }

        api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        setIsAdmin(decoded.role === 'admin');
        localStorage.setItem('token', token);
      } catch (error) {
        console.error('Invalid token:', error.message);
        logout();
      }
    } else {
      delete api.defaults.headers.common['Authorization'];
      setIsAdmin(false);
      localStorage.removeItem('token');
    }
  }, [token]);

  const login = async (username, password) => {
    try {
      const { data } = await api.post('/auth/login', { username, password });
      console.log('JWT Token:', data.token); // helpful debug
      setToken(data.token);
      return true;
    } catch (err) {
      console.error('Login failed:', err);
      return false;
    }
  };

  const logout = () => {
    setToken(null);
    setIsAdmin(false);
    navigate('/login');
  };

  return (
    <AuthContext.Provider value={{ token, isAdmin, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
