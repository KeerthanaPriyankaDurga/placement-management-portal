import React, { createContext, useState, useEffect } from 'react';
import api from '../services/api';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is logged in
    const checkLoggedIn = async () => {
      const token = localStorage.getItem('token');
      const userId = localStorage.getItem('userId');
      const userRole = localStorage.getItem('userRole');

      if (token && userId && userRole) {
        setUser({ id: userId, role: userRole });
      }
      setLoading(false);
    };

    checkLoggedIn();
  }, []);

  const login = async (email, password, role) => {
    try {
      // Typically the API endpoint might differ by role or a common one is used.
      // Assuming a common login endpoint for simplicity in this project.
      const response = await api.post('/auth/login', { email, password, role });
      
      const { token, userId, userRole } = response.data;
      
      localStorage.setItem('token', token);
      localStorage.setItem('userId', userId);
      localStorage.setItem('userRole', userRole || role); // fallback to requested role

      setUser({ id: userId, role: userRole || role });
      return { success: true };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Login failed. Please try again.',
      };
    }
  };

  const register = async (userData) => {
    try {
      const response = await api.post('/auth/register', userData);
      return { success: true, message: 'Registration successful! Please login.' };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Registration failed.',
      };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userId');
    localStorage.removeItem('userRole');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
