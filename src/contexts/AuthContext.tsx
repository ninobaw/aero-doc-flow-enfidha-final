import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserRole, Airport } from '@/shared/types';
import { useToast } from '@/hooks/use-toast';
import axios from 'axios';
import { getAbsoluteFilePath } from '@/shared/utils'; // Import getAbsoluteFilePath
import { USER_ROLES } from '@/shared/constants'; // Import USER_ROLES from constants

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
      localStorage.removeItem('userId'); // Clear invalid userId from storage
      return false;
    }
  };

  useEffect(() => {
    const checkUserSession = async () => {
      const storedUserId = localStorage.getItem('userId');
      if (storedUserId) {
        console.log('AuthContext: Found userId in localStorage, attempting to fetch user data.');
        await fetchAndSetUser(storedUserId);
      } else {
        console.log('AuthContext: No userId found in localStorage.');
      }
      setIsLoading(false);
    };

    checkUserSession();

    // Listen for storage events to synchronize logout across tabs
    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === 'userId' && event.newValue === null) {
        // userId was removed from localStorage, meaning another tab logged out
        console.log('AuthContext: userId removed from localStorage, logging out this tab.');
        setUser(null);
        toast({
          title: "Déconnexion",
          description: "Vous avez été déconnecté d'un autre onglet.",
          variant: "destructive" // Déconnexion est un événement important, peut être destructive ou info
        });
      } else if (event.key === 'userId' && event.newValue !== null && !user) {
        // userId was added to localStorage, meaning another tab logged in
        console.log('AuthContext: userId added to localStorage, attempting to log in this tab.');
        fetchAndSetUser(event.newValue);
      }
    };

    window.addEventListener('storage', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []); // Empty dependency array means this runs once on mount

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
      localStorage.setItem('userId', mappedUser.id); // Persist userId
      console.log('AuthContext: Login successful, user set and userId stored in localStorage:', mappedUser);
      toast({
        title: "Connexion réussie",
        description: "Vous êtes maintenant connecté.",
        variant: "success" // Succès en vert
      });
      return true;
    } catch (error: any) {
      console.error('AuthContext: Login failed:', error.response?.data?.message || error.message);
      toast({
        title: "Erreur de connexion",
        description: error.response?.data?.message || "Email ou mot de passe incorrect.",
        variant: "destructive" // Échec en rouge
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
      localStorage.removeItem('userId'); // Remove userId from localStorage
      console.log('AuthContext: Logout successful, user set to null and userId removed from localStorage.');
      toast({
        title: "Déconnexion réussie",
        description: "Vous avez été déconnecté.",
        variant: "success" // Succès en vert
      });
    } catch (error: any) {
      console.error('AuthContext: Logout failed:', error.response?.data?.message || error.message);
      toast({
        title: "Erreur de déconnexion",
        description: error.response?.data?.message || "Impossible de se déconnecter.",
        variant: "destructive" // Échec en rouge
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
    
    const rolePermissions = USER_ROLES[user.role as keyof typeof USER_ROLES]?.permissions || [];

    return rolePermissions.includes('all') || rolePermissions.includes(permission);
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