import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserRole } from '@/shared/types';
import axios from 'axios'; // Import axios

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  isLoading: boolean;
  hasPermission: (permission: string) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Define your backend API base URL
const API_BASE_URL = 'http://localhost:5000/api'; // Adjust if your backend runs on a different port/host

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if the user is already logged in from localStorage
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    try {
      const response = await axios.post(`${API_BASE_URL}/auth/login`, { email, password });
      const loggedInUser = response.data.user;
      
      setUser(loggedInUser);
      localStorage.setItem('currentUser', JSON.stringify(loggedInUser));
      setIsLoading(false);
      return true;
    } catch (error) {
      console.error('Login failed:', error);
      setUser(null);
      setIsLoading(false);
      return false;
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('currentUser');
    // In a real app, you might also call a backend logout endpoint here
  };

  const hasPermission = (permission: string): boolean => {
    if (!user) return false;
    
    const rolePermissions = {
      [UserRole.SUPER_ADMIN]: ['all'],
      [UserRole.ADMINISTRATOR]: ['manage_users', 'manage_documents', 'view_reports', 'manage_settings', 'manage_forms'],
      [UserRole.APPROVER]: ['approve_documents', 'view_documents', 'create_documents'],
      [UserRole.USER]: ['view_documents', 'create_documents', 'view_profile'],
      [UserRole.VISITOR]: ['view_documents']
    };

    const userPermissions = rolePermissions[user.role] || [];
    return userPermissions.includes('all') || userPermissions.includes(permission);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isLoading, hasPermission }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};