import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services/api';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  useEffect(() => {
    let active = true;
    // Old client-side role data is not an authentication credential.
    localStorage.removeItem('themor_user');
    authService.me().then(user => { if (active) setCurrentUser(user); }).catch(() => {}).finally(() => { if (active) setIsAuthLoading(false); });
    return () => { active = false; };
  }, []);

  const login = async (account, password) => {
    const user = await authService.login(account, password);
    setCurrentUser(user);
    return user;
  };
  const register = async data => {
    const user = await authService.register(data);
    setCurrentUser(user);
    return user;
  };
  const logout = async () => { await authService.logout(); setCurrentUser(null); };
  const updateProfile = async fields => {
    const user = await authService.updateProfile(fields);
    setCurrentUser(user);
    return user;
  };
  const deleteAccount = async () => { await authService.deleteAccount(); setCurrentUser(null); };
  return <AuthContext.Provider value={{ currentUser, isAuthLoading, isAdmin: currentUser?.role === 'admin', isLoggedIn: !!currentUser, login, register, logout, updateProfile, deleteAccount }}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
}
