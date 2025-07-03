import React, { createContext, useContext, useState, useEffect, useRef } from 'react'; // Import useRef
import { User, UserRole, Airport } from '@/shared/types';
import { useToast } from '@/hooks/use-toast';
import axios from 'axios';
import { getAbsoluteFilePath } from '@/shared/utils';
import { USER_ROLES } from '@/shared/constants';

const API_BASE_URL = 'http://localhost:5000/api';

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  isLoading: boolean;
  hasPermission: (permission: string) => boolean;
  refreshUser: () => Promise<void>;
  resetActivityTimer: () => void; // New: Function to reset the inactivity timer
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const activityTimerRef = useRef<NodeJS.Timeout | null>(null); // Ref to store the timer

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
        profilePhoto: fetchedUser.profilePhoto,
        airport: fetchedUser.airport as Airport,
        createdAt: new Date(fetchedUser.createdAt),
        updatedAt: new Date(fetchedUser.updatedAt),
        isActive: fetchedUser.isActive,
        phone: fetchedUser.phone,
        department: fetchedUser.department,
        sessionTimeout: fetchedUser.sessionTimeout, // Store sessionTimeout from backend
      };
      setUser(mappedUser);
      console.log('AuthContext: User fetched and set. Session Timeout:', mappedUser.sessionTimeout); // ADDED LOG
      return true;
    } catch (error) {
      console.error('Failed to fetch user data:', error);
      setUser(null);
      localStorage.removeItem('userId');
      return false;
    }
  };

  const startActivityTimer = (timeoutMinutes: number) => {
    if (activityTimerRef.current) {
      clearTimeout(activityTimerRef.current);
      console.log('AuthContext: Cleared existing activity timer.'); // ADDED LOG
    }
    const timeoutMs = timeoutMinutes * 60 * 1000;
    activityTimerRef.current = setTimeout(() => {
      console.log('AuthContext: Session timed out due to inactivity. Calling logout.'); // ADDED LOG
      logout(); // Call logout when timer expires
      toast({
        title: "Session expirée",
        description: "Vous avez été déconnecté en raison d'une inactivité prolongée.",
        variant: "info"
      });
    }, timeoutMs);
    console.log(`AuthContext: Activity timer set for ${timeoutMinutes} minutes.`); // ADDED LOG
  };

  const resetActivityTimer = () => {
    if (user?.sessionTimeout) {
      console.log('AuthContext: Resetting activity timer. Current sessionTimeout:', user.sessionTimeout); // ADDED LOG
      startActivityTimer(user.sessionTimeout);
    } else {
      console.log('AuthContext: Cannot reset activity timer, user or sessionTimeout is missing.'); // ADDED LOG
    }
  };

  useEffect(() => {
    const checkUserSession = async () => {
      const storedUserId = localStorage.getItem('userId');
      if (storedUserId) {
        console.log('AuthContext: Initial check - userId found in localStorage.');
        const success = await fetchAndSetUser(storedUserId);
        // The timer will be started by the second useEffect reacting to `user` state change.
        // No need to call startActivityTimer here directly after fetchAndSetUser.
      } else {
        console.log('AuthContext: Initial check - No userId found in localStorage.');
      }
      setIsLoading(false);
    };

    checkUserSession();

    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === 'userId' && event.newValue === null) {
        console.log('AuthContext: userId removed from localStorage, logging out this tab.');
        setUser(null);
        if (activityTimerRef.current) {
          clearTimeout(activityTimerRef.current);
        }
        toast({
          title: "Déconnexion",
          description: "Vous avez été déconnecté d'un autre onglet.",
        });
      } else if (event.key === 'userId' && event.newValue !== null && !user) {
        console.log('AuthContext: userId added to localStorage, attempting to log in this tab.');
        fetchAndSetUser(event.newValue);
      }
    };

    window.addEventListener('storage', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      if (activityTimerRef.current) {
        clearTimeout(activityTimerRef.current); // Clear timer on unmount
      }
    };
  }, []); // This useEffect runs only once on mount.

  useEffect(() => {
    // This useEffect is crucial for starting/restarting the timer when `user` or `user.sessionTimeout` changes.
    if (user?.sessionTimeout) {
      console.log('AuthContext: User or sessionTimeout changed. Attempting to start/restart timer.'); // ADDED LOG
      startActivityTimer(user.sessionTimeout);
    } else if (!user && activityTimerRef.current) {
      console.log('AuthContext: User logged out or no user. Clearing activity timer.'); // ADDED LOG
      clearTimeout(activityTimerRef.current);
      activityTimerRef.current = null; // Clear ref
    }
  }, [user?.sessionTimeout, user]); // Depend on user.sessionTimeout and user object itself

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
        profilePhoto: loggedInUser.profilePhoto,
        airport: loggedInUser.airport as Airport,
        createdAt: new Date(loggedInUser.createdAt),
        updatedAt: new Date(loggedInUser.updatedAt),
        isActive: loggedInUser.isActive,
        phone: loggedInUser.phone,
        department: loggedInUser.department,
        sessionTimeout: loggedInUser.sessionTimeout, // Store sessionTimeout from login response
      };
      setUser(mappedUser);
      localStorage.setItem('userId', mappedUser.id);
      console.log('AuthContext: Login successful, user set and userId stored in localStorage:', mappedUser);
      toast({
        title: "Connexion réussie",
        description: "Vous êtes maintenant connecté.",
        variant: "success"
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
      localStorage.removeItem('userId');
      if (activityTimerRef.current) {
        clearTimeout(activityTimerRef.current); // Clear timer on explicit logout
      }
      console.log('AuthContext: Logout successful, user set to null and userId removed from localStorage.');
      toast({
        title: "Déconnexion réussie",
        description: "Vous avez été déconnecté.",
        variant: "success"
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
    
    const rolePermissions = USER_ROLES[user.role as keyof typeof USER_ROLES]?.permissions || [];

    return rolePermissions.includes('all') || rolePermissions.includes(permission);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isLoading, hasPermission, refreshUser, resetActivityTimer }}>
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