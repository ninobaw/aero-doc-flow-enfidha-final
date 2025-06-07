import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';

const API_BASE_URL = 'http://localhost:5000/api';

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

  const { data: profile, isLoading, error } = useQuery({
    queryKey: ['profile', user?.id],
    queryFn: async () => {
      if (!user?.id) throw new Error('Utilisateur non connecté');
      const response = await axios.get(`${API_BASE_URL}/users/${user.id}`);
      return response.data as ProfileData;
    },
    enabled: !!user?.id,
  });

  const updateProfile = useMutation({
    mutationFn: async (updates: Partial<Omit<ProfileData, 'id' | 'created_at' | 'updated_at' | 'email' | 'role' | 'airport' | 'is_active'>>) => {
      if (!user?.id) throw new Error('Utilisateur non connecté');
      const response = await axios.put(`${API_BASE_URL}/users/${user.id}`, updates);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      toast({
        title: 'Profil mis à jour',
        description: 'Votre profil a été mis à jour avec succès.',
      });
    },
    onError: (error: any) => {
      console.error('Erreur mise à jour profil:', error.response?.data || error.message);
      toast({
        title: 'Erreur',
        description: error.response?.data?.message || error.message || 'Impossible de mettre à jour le profil.',
        variant: 'destructive',
      });
    },
  });

  return {
    profile,
    isLoading,
    error,
    updateProfile: updateProfile.mutate,
    isUpdating: updateProfile.isPending,
  };
};