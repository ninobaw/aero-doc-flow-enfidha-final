
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';

export interface UserData {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  phone?: string;
  department?: string;
  position?: string;
  profile_photo?: string;
  airport: 'ENFIDHA' | 'MONASTIR';
  role: 'SUPER_ADMIN' | 'ADMINISTRATOR' | 'APPROVER' | 'USER' | 'VISITOR';
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export const useUsers = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: users = [], isLoading, error } = useQuery({
    queryKey: ['users'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as UserData[];
    },
    enabled: !!user,
  });

  const createUser = useMutation({
    mutationFn: async (userData: {
      email: string;
      first_name: string;
      last_name: string;
      phone?: string;
      department?: string;
      position?: string;
      airport: 'ENFIDHA' | 'MONASTIR';
      role: 'SUPER_ADMIN' | 'ADMINISTRATOR' | 'APPROVER' | 'USER' | 'VISITOR';
      password: string;
    }) => {
      console.log('Création utilisateur avec données:', userData);
      
      // Créer l'utilisateur dans auth.users
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email: userData.email,
        password: userData.password,
        email_confirm: true,
        user_metadata: {
          first_name: userData.first_name,
          last_name: userData.last_name,
        }
      });

      if (authError) {
        console.error('Erreur création auth:', authError);
        throw authError;
      }

      console.log('Utilisateur auth créé:', authData.user);

      // Mettre à jour le profil créé automatiquement par le trigger
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .update({
          first_name: userData.first_name,
          last_name: userData.last_name,
          phone: userData.phone,
          department: userData.department,
          position: userData.position,
          airport: userData.airport,
          role: userData.role,
        })
        .eq('id', authData.user.id)
        .select()
        .single();

      if (profileError) {
        console.error('Erreur mise à jour profil:', profileError);
        throw profileError;
      }

      console.log('Profil mis à jour:', profileData);
      return profileData;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      toast({
        title: 'Utilisateur créé',
        description: `L'utilisateur ${data.first_name} ${data.last_name} a été créé avec succès. Les admins ont été notifiés.`,
      });
    },
    onError: (error: any) => {
      console.error('Erreur création utilisateur:', error);
      toast({
        title: 'Erreur',
        description: error.message || 'Impossible de créer l\'utilisateur.',
        variant: 'destructive',
      });
    },
  });

  const updateUser = useMutation({
    mutationFn: async ({ id, ...updates }: { id: string } & Partial<UserData>) => {
      const { data, error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      toast({
        title: 'Utilisateur mis à jour',
        description: 'L\'utilisateur a été mis à jour avec succès.',
      });
    },
    onError: (error) => {
      console.error('Erreur mise à jour utilisateur:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de mettre à jour l\'utilisateur.',
        variant: 'destructive',
      });
    },
  });

  const deleteUser = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('profiles')
        .update({ is_active: false })
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      toast({
        title: 'Utilisateur désactivé',
        description: 'L\'utilisateur a été désactivé avec succès.',
      });
    },
    onError: (error) => {
      console.error('Erreur désactivation utilisateur:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de désactiver l\'utilisateur.',
        variant: 'destructive',
      });
    },
  });

  return {
    users,
    isLoading,
    error,
    createUser: createUser.mutate,
    isCreating: createUser.isPending,
    updateUser: updateUser.mutate,
    isUpdating: updateUser.isPending,
    deleteUser: deleteUser.mutate,
    isDeleting: deleteUser.isPending,
  };
};
