import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserRole } from '@/shared/types';
import { useToast } from '@/hooks/use-toast';
import axios from 'axios'; // Import axios for backend calls

const API_BASE_URL = 'http://localhost:5000/api'; // Your custom Node.js backend URL

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  isLoading: boolean;
  hasPermission: (permission: string) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  // Simulate initial user check (e.g., from a stored token or session)
  // In a real app, you might check localStorage for a token and validate it with the backend
  useEffect(() => {
    const checkUserSession = async () => {
      // For simplicity, we'll assume no persistent session on frontend for now.
      // User will need to log in on refresh.
      // In a real app, you'd send a request to your backend to validate a token from localStorage.
      setIsLoading(false);
    };
    checkUserSession();
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    try {
      const response = await axios.post(`${API_BASE_URL}/auth/login`, { email, password });
      const loggedInUser = response.data.user; // Assuming your backend returns { user: {...}, token: '...' }

      const mappedUser: User = {
        id: loggedInUser.id,
        email: loggedInUser.email,
        firstName: loggedInUser.firstName,
        lastName: loggedInUser.lastName,
        role: loggedInUser.role as UserRole,
        profilePhoto: loggedInUser.profilePhoto,
        airport: loggedInUser.airport,
        createdAt: new Date(loggedInUser.createdAt),
        updatedAt: new Date(loggedInUser.updatedAt),
        isActive: loggedInUser.isActive,
        phone: loggedInUser.phone,
        department: loggedInUser.department,
      };
      setUser(mappedUser);
      toast({
        title: "Connexion réussie",
        description: "Vous êtes maintenant connecté.",
      });
      return true;
    } catch (error: any) {
      console.error('Login failed:', error.response?.data?.message || error.message);
      toast({
        title: "Erreur de connexion",
        description: error.response?.data?.message || "Email ou mot de passe incorrect.",
        variant: "destructive"
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setIsLoading(true);
    try {
      await axios.post(`${API_BASE_URL}/auth/logout`); // Call backend logout endpoint
      setUser(null);
      toast({
        title: "Déconnexion réussie",
        description: "Vous avez été déconnecté.",
      });
    } catch (error: any) {
      console.error('Logout failed:', error.response?.data?.message || error.message);
      toast({
        title: "Erreur de déconnexion",
        description: error.response?.data?.message || "Impossible de se déconnecter.",
        variant: "destructive"
      });
    } finally {
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