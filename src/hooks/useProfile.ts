import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';

const API_BASE_URL = 'http://localhost:5000/api';

export interface ProfileData {
  id: string;
  email: string;
  firstName: string; // Changed from first_name
  lastName: string;  // Changed from last_name
  phone?: string;
  department?: string;
  position?: string;
  profilePhoto?: string; // Changed from profile_photo
  airport: 'ENFIDHA' | 'MONASTIR' | 'GENERALE'; // Added GENERALE
  role: 'SUPER_ADMIN' | 'ADMINISTRATOR' | 'APPROVER' | 'USER' | 'VISITOR';
  isActive: boolean; // Changed from is_active
  createdAt: string;
  updatedAt: string;
}

export const useProfile = () => {
  const { toast } = useToast();
  const { user } = useAuth(); // Get user from local AuthContext

  console.log('useProfile: user from AuthContext:', user);

  const queryClient = useQueryClient();

  const { data: profile, isLoading, error } = useQuery({
    queryKey: ['profile', user?.id],
    queryFn: async () => {
      if (!user?.id) {
        console.warn('useProfile: user.id is missing, skipping fetch.');
        throw new Error('Utilisateur non connecté');
      }
      console.log(`useProfile: Fetching profile for user ID: ${user.id}`);
      const response = await axios.get(`${API_BASE_URL}/users/${user.id}`);
      console.log('useProfile: Profile data fetched:', response.data);
      return response.data as ProfileData;
    },
    enabled: !!user?.id, // Only fetch if user is logged in
  });

  console.log('useProfile: isLoading:', isLoading, 'profile:', profile, 'error:', error);

  const updateProfile = useMutation({
    mutationFn: async (updates: Partial<Omit<ProfileData, 'id' | 'createdAt' | 'updatedAt' | 'email' | 'role' | 'airport' | 'isActive'>>) => {
      if (!user?.id) throw new Error('Utilisateur non connecté');
      console.log(`useProfile: Updating profile for user ID: ${user.id} with updates:`, updates);
      const response = await axios.put(`${API_BASE_URL}/users/${user.id}`, updates);
      console.log('useProfile: Profile updated successfully:', response.data);
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
      console.error('useProfile: Erreur mise à jour profil:', error.response?.data || error.message);
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