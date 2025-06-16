import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { ActionDecidee } from '@/components/actions/ActionsDecideesField';
import { Airport } from '@/shared/types'; // Import Airport type

const API_BASE_URL = 'http://localhost:5000/api';

export interface ProcesVerbalData {
  id: string;
  document_id: string;
  meeting_date: string;
  participants: string[];
  agenda: string;
  decisions: string;
  location: string;
  meeting_type: string;
  airport: Airport; // Updated to use Airport type
  next_meeting_date?: string;
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

export const useProcesVerbaux = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: procesVerbaux = [], isLoading, error } = useQuery({
    queryKey: ['proces-verbaux'],
    queryFn: async () => {
      const response = await axios.get(`${API_BASE_URL}/proces-verbaux`);
      return response.data as ProcesVerbalData[];
    },
    enabled: !!user,
  });

  const createProcesVerbalWithDocument = useMutation({
    mutationFn: async (data: {
      title: string;
      meeting_date: string;
      participants: string[];
      agenda: string;
      decisions: string;
      location: string;
      meeting_type: string;
      airport: Airport; // Updated to use Airport type
      next_meeting_date?: string;
      actions_decidees?: ActionDecidee[];
    }) => {
      if (!user?.id) throw new Error('Utilisateur non connecté');

      // The backend handles document creation internally
      const response = await axios.post(`${API_BASE_URL}/proces-verbaux`, {
        ...data,
        author_id: user.id, // Pass author_id to backend
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['proces-verbaux'] });
      queryClient.invalidateQueries({ queryKey: ['documents'] }); // Invalidate documents as a new one is created
      toast({
        title: 'Procès-verbal créé',
        description: 'Le procès-verbal a été créé avec succès.',
      });
    },
    onError: (error: any) => {
      console.error('Erreur création PV:', error.response?.data || error.message);
      toast({
        title: 'Erreur',
        description: error.response?.data?.message || error.message || 'Impossible de créer le procès-verbal.',
        variant: 'destructive',
      });
    },
  });

  const updateProcesVerbal = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<ProcesVerbalData> & { id: string }) => {
      const response = await axios.put(`${API_BASE_URL}/proces-verbaux/${id}`, updates);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['proces-verbaux'] });
      toast({
        title: 'Procès-verbal mis à jour',
        description: 'Le procès-verbal a été mis à jour avec succès.',
      });
    },
    onError: (error: any) => {
      console.error('Erreur mise à jour PV:', error.response?.data || error.message);
      toast({
        title: 'Erreur',
        description: error.response?.data?.message || error.message || 'Impossible de mettre à jour le procès-verbal.',
        variant: 'destructive',
      });
    },
  });

  return {
    procesVerbaux,
    isLoading,
    error,
    createProcesVerbal: createProcesVerbalWithDocument.mutate,
    updateProcesVerbal: updateProcesVerbal.mutate,
    isCreating: createProcesVerbalWithDocument.isPending,
    isUpdating: updateProcesVerbal.isPending,
  };
};