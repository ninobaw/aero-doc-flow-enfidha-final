import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { Airport } from '@/shared/types'; // Import Airport type

const API_BASE_URL = 'http://localhost:5000/api'; // Your custom Node.js backend URL

export interface UserData {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  department?: string;
  position?: string;
  profilePhoto?: string;
  airport: Airport;
  role: 'SUPER_ADMIN' | 'ADMINISTRATOR' | 'APPROVER' | 'USER' | 'VISITOR';
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export const useUsers = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: users = [], isLoading, error } = useQuery({
    queryKey: ['users'],
    queryFn: async () => {
      const response = await axios.get(`${API_BASE_URL}/users`);
      console.log('Raw user data received from backend (useUsers hook):', response.data); // Added log
      return response.data as UserData[];
    },
    enabled: !!user,
  });

  const createUser = useMutation({
    mutationFn: async (userData: {
      email: string;
      firstName: string;
      lastName: string;
      phone?: string;
      department?: string;
      position?: string;
      airport: Airport;
      role: 'SUPER_ADMIN' | 'ADMINISTRATOR' | 'APPROVER' | 'USER' | 'VISITOR';
      password: string;
    }) => {
      console.log('Création utilisateur via backend Node.js avec données:', userData);
      const response = await axios.post(`${API_BASE_URL}/users`, userData);
      console.log('Utilisateur créé par backend Node.js:', response.data);
      return response.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      toast({
        title: 'Utilisateur créé',
        description: `L'utilisateur ${data.firstName} ${data.lastName} a été créé avec succès.`,
        variant: 'success', // Explicitly set to success
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
        variant: 'success', // Explicitly set to success
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
      // Changed from soft delete (isActive: false) to hard delete
      await axios.delete(`${API_BASE_URL}/users/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      toast({
        title: 'Utilisateur supprimé',
        description: 'L\'utilisateur a été supprimé définitivement.',
        variant: 'destructive', // Explicitly set to destructive for permanent delete
      });
    },
    onError: (error: any) => {
      console.error('Erreur suppression utilisateur:', error.response?.data || error.message);
      toast({
        title: 'Erreur',
        description: error.response?.data?.message || error.message || 'Impossible de supprimer l\'utilisateur.',
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