import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { ActionDecidee } from '@/components/actions/ActionsDecideesField';
import { Airport } from '@/shared/types'; // Import Airport type

const API_BASE_URL = 'http://localhost:5000/api';

export interface CorrespondanceData {
  id: string;
  // Removed document_id as Correspondance is now standalone
  title: string; // Added directly
  author_id: string; // Added directly
  qr_code: string; // Added directly
  file_path?: string; // Added directly
  file_type?: string; // Added directly
  version: number; // Added directly
  views_count: number; // Added directly
  downloads_count: number; // Added directly

  type: 'INCOMING' | 'OUTGOING'; // New field
  code?: string; // New field
  from_address: string;
  to_address: string;
  subject: string;
  content: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  status: string;
  airport: Airport; // Updated to use Airport type
  attachments?: string[];
  actions_decidees?: ActionDecidee[];
  tags?: string[]; // Added tags field
  created_at: string;
  updated_at: string; // Added updated_at

  author?: { // Author details now directly on CorrespondanceData
    first_name: string;
    last_name: string;
  };
  // Codification fields for generation
  company_code?: string;
  scope_code?: string;
  department_code?: string;
  sub_department_code?: string;
  language_code?: string;
  sequence_number?: number;
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

  const createCorrespondance = useMutation({
    mutationFn: async (data: {
      title: string;
      type: 'INCOMING' | 'OUTGOING';
      code?: string;
      from_address: string;
      to_address: string;
      subject: string;
      content: string;
      priority: CorrespondanceData['priority'];
      airport: Airport;
      attachments?: string[];
      actions_decidees?: ActionDecidee[];
      tags?: string[];
      file_path?: string;
      file_type?: string;
      // Codification fields for generation
      company_code?: string;
      scope_code?: string;
      department_code?: string;
      sub_department_code?: string;
      language_code?: string;
    }) => {
      if (!user?.id) throw new Error('Utilisateur non connecté');

      const response = await axios.post(`${API_BASE_URL}/correspondances`, {
        ...data,
        author_id: user.id, // Pass author_id to backend
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['correspondances'] });
      // No need to invalidate 'documents' anymore as correspondences are separate
      toast({
        title: 'Correspondance créée',
        description: 'La correspondance a été créée avec succès.',
        variant: 'success', // Explicitly set to success
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
        variant: 'success', // Explicitly set to success
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

  const deleteCorrespondance = useMutation({
    mutationFn: async (id: string) => {
      await axios.delete(`${API_BASE_URL}/correspondances/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['correspondances'] });
      toast({
        title: 'Correspondance supprimée',
        description: 'La correspondance a été supprimée avec succès.',
        variant: 'destructive', // Explicitly set to destructive
      });
    },
    onError: (error: any) => {
      console.error('Erreur suppression correspondance:', error.response?.data || error.message);
      toast({
        title: 'Erreur',
        description: error.response?.data?.message || error.message || 'Impossible de supprimer la correspondance.',
        variant: 'destructive',
      });
    },
  });

  return {
    correspondances,
    isLoading,
    error,
    createCorrespondance: createCorrespondance.mutate,
    updateCorrespondance: updateCorrespondance.mutate,
    deleteCorrespondance: deleteCorrespondance.mutate,
    isCreating: createCorrespondance.isPending,
    isUpdating: updateCorrespondance.isPending,
    isDeleting: deleteCorrespondance.isPending,
  };
};