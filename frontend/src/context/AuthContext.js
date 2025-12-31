import React, { createContext, useContext, useState, useEffect } from 'react';
import { authAPI, favoritesAPI } from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('token');
      const savedUser = localStorage.getItem('user');

      if (token && savedUser) {
        try {
          // Verify token is still valid
          const userData = await authAPI.getMe();
          setUser(userData);
          localStorage.setItem('user', JSON.stringify(userData));
        } catch (error) {
          // Token invalid, clear storage
          localStorage.removeItem('token');
          localStorage.removeItem('user');
        }
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  const login = async (email, password) => {
    const response = await authAPI.login(email, password);
    localStorage.setItem('token', response.token);
    localStorage.setItem('user', JSON.stringify(response));
    setUser(response);
    return response;
  };

  const register = async (name, email, password) => {
    const response = await authAPI.register(name, email, password);
    localStorage.setItem('token', response.token);
    localStorage.setItem('user', JSON.stringify(response));
    setUser(response);
    return response;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  };

  const forgotPassword = async (email) => {
    return await authAPI.forgotPassword(email);
  };

  const resetPassword = async (token, newPassword) => {
    return await authAPI.resetPassword(token, newPassword);
  };

  const verifyEmail = async (token) => {
    return await authAPI.verifyEmail(token);
  };

  const resendVerification = async () => {
    return await authAPI.resendVerification();
  };

  const toggleFavorite = async (vehicleId) => {
    if (!user) return;

    try {
      const isFav = user.favorites?.includes(vehicleId);
      let response;

      if (isFav) {
        response = await favoritesAPI.remove(vehicleId);
      } else {
        response = await favoritesAPI.add(vehicleId);
      }

      // Update user state with new favorites
      const updatedUser = { ...user, favorites: response.favorites };
      setUser(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));
    } catch (error) {
      console.error('Failed to toggle favorite:', error);
    }
  };

  const isFavorite = (vehicleId) => {
    return user?.favorites?.includes(vehicleId) || false;
  };

  return (
    <AuthContext.Provider value={{
      user, loading, login, register, logout,
      toggleFavorite, isFavorite, forgotPassword, resetPassword,
      verifyEmail, resendVerification
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
