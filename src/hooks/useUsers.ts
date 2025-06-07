import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';

const API_BASE_URL = 'http://localhost:5000/api';

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
      const response = await axios.get(`${API_BASE_URL}/users`);
      return response.data as UserData[];
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
      password: string; // Password is only for initial creation, not stored in profile
    }) => {
      console.log('Création utilisateur avec données:', userData);
      // The backend handles the user creation and profile update in one go
      const response = await axios.post(`${API_BASE_URL}/users`, userData);
      console.log('Utilisateur créé:', response.data);
      return response.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      toast({
        title: 'Utilisateur créé',
        description: `L'utilisateur ${data.first_name} ${data.last_name} a été créé avec succès.`,
      });
    },
    onError: (error: any) => {
      console.error('Erreur création utilisateur:', error.response?.data || error.message);
      toast({
        title: 'Erreur',
        description: error.response?.data?.message || error.message || 'Impossible de créer l\'utilisateur.',
        variant: 'destructive',
      });
    },
  });

  const updateUser = useMutation({
    mutationFn: async ({ id, ...updates }: { id: string } & Partial<UserData>) => {
      const response = await axios.put(`${API_BASE_URL}/users/${id}`, updates);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      toast({
        title: 'Utilisateur mis à jour',
        description: 'L\'utilisateur a été mis à jour avec succès.',
      });
    },
    onError: (error: any) => {
      console.error('Erreur mise à jour utilisateur:', error.response?.data || error.message);
      toast({
        title: 'Erreur',
        description: error.response?.data?.message || error.message || 'Impossible de mettre à jour l\'utilisateur.',
        variant: 'destructive',
      });
    },
  });

  const deleteUser = useMutation({
    mutationFn: async (id: string) => {
      // Soft delete: set is_active to false
      await axios.delete(`${API_BASE_URL}/users/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      toast({
        title: 'Utilisateur désactivé',
        description: 'L\'utilisateur a été désactivé avec succès.',
      });
    },
    onError: (error: any) => {
      console.error('Erreur désactivation utilisateur:', error.response?.data || error.message);
      toast({
        title: 'Erreur',
        description: error.response?.data?.message || error.message || 'Impossible de désactiver l\'utilisateur.',
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