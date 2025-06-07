import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { ActionDecidee } from '@/components/actions/ActionsDecideesField';

const API_BASE_URL = 'http://localhost:5000/api';

export interface CorrespondanceData {
  id: string;
  document_id: string;
  from_address: string;
  to_address: string;
  subject: string;
  content: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  status: string;
  airport: 'ENFIDHA' | 'MONASTIR';
  attachments?: string[];
  actions_decidees?: ActionDecidee[];
  created_at: string;
  document?: {
    title: string;
    author: {
      first_name: string;
      last_name: string;
    };
  };
}

export const useCorrespondances = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: correspondances = [], isLoading, error } = useQuery({
    queryKey: ['correspondances'],
    queryFn: async () => {
      const response = await axios.get(`${API_BASE_URL}/correspondances`);
      return response.data as CorrespondanceData[];
    },
    enabled: !!user,
  });

  const createCorrespondanceWithDocument = useMutation({
    mutationFn: async (data: {
      title: string;
      from_address: string;
      to_address: string;
      subject: string;
      content: string;
      priority: CorrespondanceData['priority'];
      airport: 'ENFIDHA' | 'MONASTIR';
      attachments?: string[];
      actions_decidees?: ActionDecidee[];
    }) => {
      if (!user?.id) throw new Error('Utilisateur non connecté');

      // The backend handles document creation internally
      const response = await axios.post(`${API_BASE_URL}/correspondances`, {
        ...data,
        author_id: user.id, // Pass author_id to backend
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['correspondances'] });
      queryClient.invalidateQueries({ queryKey: ['documents'] }); // Invalidate documents as a new one is created
      toast({
        title: 'Correspondance créée',
        description: 'La correspondance a été créée avec succès.',
      });
    },
    onError: (error: any) => {
      console.error('Erreur création correspondance:', error.response?.data || error.message);
      toast({
        title: 'Erreur',
        description: error.response?.data?.message || error.message || 'Impossible de créer la correspondance.',
        variant: 'destructive',
      });
    },
  });

  const updateCorrespondance = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<CorrespondanceData> & { id: string }) => {
      const response = await axios.put(`${API_BASE_URL}/correspondances/${id}`, updates);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['correspondances'] });
      toast({
        title: 'Correspondance mise à jour',
        description: 'La correspondance a été mise à jour avec succès.',
      });
    },
    onError: (error: any) => {
      console.error('Erreur mise à jour correspondance:', error.response?.data || error.message);
      toast({
        title: 'Erreur',
        description: error.response?.data?.message || error.message || 'Impossible de mettre à jour la correspondance.',
        variant: 'destructive',
      });
    },
  });

  return {
    correspondances,
    isLoading,
    error,
    createCorrespondance: createCorrespondanceWithDocument.mutate,
    updateCorrespondance: updateCorrespondance.mutate,
    isCreating: createCorrespondanceWithDocument.isPending,
    isUpdating: updateCorrespondance.isPending,
  };
};