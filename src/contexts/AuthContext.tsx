
import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserRole } from '@/shared/types';

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  isLoading: boolean;
  hasPermission: (permission: string) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Comptes de test
const TEST_USERS: Array<User & { password: string }> = [
  {
    id: 'user-1',
    email: 'superadmin@aerodoc.tn',
    password: 'admin123',
    firstName: 'Ahmed',
    lastName: 'Ben Ali',
    role: UserRole.SUPER_ADMIN,
    airport: 'ENFIDHA',
    createdAt: new Date('2023-01-15'),
    updatedAt: new Date(),
    isActive: true,
    phone: '+216 20 123 456',
    department: 'Administration'
  },
  {
    id: 'user-2',
    email: 'user@aerodoc.tn',
    password: 'user123',
    firstName: 'Fatma',
    lastName: 'Trabelsi',
    role: UserRole.USER,
    airport: 'MONASTIR',
    createdAt: new Date('2023-03-20'),
    updatedAt: new Date(),
    isActive: true,
    phone: '+216 25 789 012',
    department: 'Opérations'
  }
];

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Vérifier si l'utilisateur est déjà connecté
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    
    // Simuler un délai d'authentification
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const foundUser = TEST_USERS.find(u => u.email === email && u.password === password);
    
    if (foundUser) {
      const { password: _, ...userWithoutPassword } = foundUser;
      setUser(userWithoutPassword);
      localStorage.setItem('currentUser', JSON.stringify(userWithoutPassword));
      setIsLoading(false);
      return true;
    }
    
    setIsLoading(false);
    return false;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('currentUser');
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
