import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserRole, Airport } from '@/shared/types';
import { useToast } from '@/hooks/use-toast';
import axios from 'axios';
import { getAbsoluteFilePath } from '@/shared/utils'; // Import getAbsoluteFilePath

const API_BASE_URL = 'http://localhost:5000/api';

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  isLoading: boolean;
  hasPermission: (permission: string) => boolean;
  refreshUser: () => Promise<void>; // New function to refresh user data
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  const fetchAndSetUser = async (userId: string) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/users/${userId}`);
      const fetchedUser = response.data;
      const mappedUser: User = {
        id: fetchedUser.id,
        email: fetchedUser.email,
        firstName: fetchedUser.firstName,
        lastName: fetchedUser.lastName,
        role: fetchedUser.role as UserRole,
        profilePhoto: fetchedUser.profilePhoto, // This is the relative path
        airport: fetchedUser.airport as Airport,
        createdAt: new Date(fetchedUser.createdAt),
        updatedAt: new Date(fetchedUser.updatedAt),
        isActive: fetchedUser.isActive,
        phone: fetchedUser.phone,
        department: fetchedUser.department,
      };
      setUser(mappedUser);
      return true;
    } catch (error) {
      console.error('Failed to fetch user data:', error);
      setUser(null);
      return false;
    }
  };

  useEffect(() => {
    const checkUserSession = async () => {
      // In a real app, you'd check for a token in localStorage and validate it.
      // For this mock setup, we'll assume no persistent session on frontend for now.
      // If you had a token, you'd use it to fetch user details here.
      // Example: const storedUserId = localStorage.getItem('userId');
      // if (storedUserId) { await fetchAndSetUser(storedUserId); }
      console.log('AuthContext: Initial session check completed. Setting isLoading to false.');
      setIsLoading(false);
    };
    checkUserSession();
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    console.log('AuthContext: Attempting login for:', email);
    try {
      const response = await axios.post(`${API_BASE_URL}/auth/login`, { email, password });
      const loggedInUser = response.data.user;

      const mappedUser: User = {
        id: loggedInUser.id,
        email: loggedInUser.email,
        firstName: loggedInUser.firstName,
        lastName: loggedInUser.lastName,
        role: loggedInUser.role as UserRole,
        profilePhoto: loggedInUser.profilePhoto, // This is the relative path
        airport: loggedInUser.airport as Airport,
        createdAt: new Date(loggedInUser.createdAt),
        updatedAt: new Date(loggedInUser.updatedAt),
        isActive: loggedInUser.isActive,
        phone: loggedInUser.phone,
        department: loggedInUser.department,
      };
      setUser(mappedUser);
      console.log('AuthContext: Login successful, user set:', mappedUser);
      toast({
        title: "Connexion réussie",
        description: "Vous êtes maintenant connecté.",
      });
      return true;
    } catch (error: any) {
      console.error('AuthContext: Login failed:', error.response?.data?.message || error.message);
      toast({
        title: "Erreur de connexion",
        description: error.response?.data?.message || "Email ou mot de passe incorrect.",
        variant: "destructive"
      });
      return false;
    } finally {
      setIsLoading(false);
      console.log('AuthContext: Login attempt finished, isLoading set to false.');
    }
  };

  const logout = async () => {
    setIsLoading(true);
    console.log('AuthContext: Attempting logout.');
    try {
      await axios.post(`${API_BASE_URL}/auth/logout`);
      setUser(null);
      console.log('AuthContext: Logout successful, user set to null.');
      toast({
        title: "Déconnexion réussie",
        description: "Vous avez été déconnecté.",
      });
    } catch (error: any) {
      console.error('AuthContext: Logout failed:', error.response?.data?.message || error.message);
      toast({
        title: "Erreur de déconnexion",
        description: error.response?.data?.message || "Impossible de se déconnecter.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
      console.log('AuthContext: Logout attempt finished, isLoading set to false.');
    }
  };

  const refreshUser = async () => {
    if (user?.id) {
      setIsLoading(true);
      await fetchAndSetUser(user.id);
      setIsLoading(false);
    }
  };

  const hasPermission = (permission: string): boolean => {
    if (!user) return false;
    
    const rolePermissions = {
      [UserRole.SUPER_ADMIN]: ['all'],
      [UserRole.ADMINISTRATOR]: ['manage_users', 'manage_documents', 'view_reports', 'manage_settings', 'manage_forms', 'create_documents'],
      [UserRole.APPROVER]: ['approve_documents', 'view_documents', 'create_documents'],
      [UserRole.USER]: ['view_documents', 'create_documents', 'view_profile'],
      [UserRole.VISITOR]: ['view_documents']
    };

    const userPermissions = rolePermissions[user.role] || [];
    return userPermissions.includes('all') || userPermissions.includes(permission);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isLoading, hasPermission, refreshUser }}>
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