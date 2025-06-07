import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserRole } from '@/shared/types';
import { supabase } from '@/integrations/supabase/client'; // Import Supabase client
import { useToast } from '@/hooks/use-toast'; // Import useToast

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

  useEffect(() => {
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (session) {
          // Fetch user profile from your backend after successful Supabase auth
          // This assumes your backend has a /users/:id endpoint that returns the full User object
          try {
            const { data, error } = await supabase.from('profiles').select('*').eq('id', session.user.id).single();
            if (error) throw error;
            
            const mappedUser: User = {
              id: data.id,
              email: data.email,
              firstName: data.first_name,
              lastName: data.last_name,
              role: data.role as UserRole,
              profilePhoto: data.profile_photo,
              airport: data.airport,
              createdAt: new Date(data.created_at),
              updatedAt: new Date(data.updated_at),
              isActive: data.is_active,
              phone: data.phone,
              department: data.department,
            };
            setUser(mappedUser);
          } catch (profileError) {
            console.error('Error fetching user profile:', profileError);
            setUser(null);
            toast({
              title: "Erreur de profil",
              description: "Impossible de charger les informations de profil.",
              variant: "destructive"
            });
          }
        } else {
          setUser(null);
        }
        setIsLoading(false);
      }
    );

    // Check current session on mount
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        // Trigger onAuthStateChange to fetch profile
      } else {
        setIsLoading(false);
      }
    });

    return () => {
      authListener.unsubscribe();
    };
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        throw error;
      }
      // onAuthStateChange will handle setting the user
      toast({
        title: "Connexion réussie",
        description: "Vous êtes maintenant connecté.",
      });
      return true;
    } catch (error: any) {
      console.error('Login failed:', error.message);
      toast({
        title: "Erreur de connexion",
        description: error.message || "Email ou mot de passe incorrect.",
        variant: "destructive"
      });
      setIsLoading(false);
      return false;
    }
  };

  const logout = async () => {
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        throw error;
      }
      setUser(null);
      toast({
        title: "Déconnexion réussie",
        description: "Vous avez été déconnecté.",
      });
    } catch (error: any) {
      console.error('Logout failed:', error.message);
      toast({
        title: "Erreur de déconnexion",
        description: error.message || "Impossible de se déconnecter.",
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