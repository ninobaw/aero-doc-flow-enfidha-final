
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';

export interface ProfileData {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  phone?: string;
  department?: string;
  profile_photo?: string;
  airport: 'ENFIDHA' | 'MONASTIR';
  role: 'SUPER_ADMIN' | 'ADMINISTRATOR' | 'APPROVER' | 'USER' | 'VISITOR';
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export const useProfile = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // ===========================================
  // DÉBUT INTÉGRATION BACKEND SUPABASE - PROFIL
  // ===========================================

  const { data: profile, isLoading, error } = useQuery({
    queryKey: ['profile', user?.id],
    queryFn: async () => {
      if (!user?.id) throw new Error('Utilisateur non connecté');

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error) throw error;
      return data as ProfileData;
    },
    enabled: !!user?.id,
  });

  const updateProfile = useMutation({
    mutationFn: async (updates: Partial<Omit<ProfileData, 'id' | 'created_at' | 'updated_at'>>) => {
      if (!user?.id) throw new Error('Utilisateur non connecté');

      const { data, error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', user.id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      toast({
        title: 'Profil mis à jour',
        description: 'Votre profil a été mis à jour avec succès.',
      });
    },
    onError: (error) => {
      console.error('Erreur mise à jour profil:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de mettre à jour le profil.',
        variant: 'destructive',
      });
    },
  });

  // ===========================================
  // FIN INTÉGRATION BACKEND SUPABASE - PROFIL
  // ===========================================

  return {
    profile,
    isLoading,
    error,
    updateProfile: updateProfile.mutate,
    isUpdating: updateProfile.isPending,
  };
};
