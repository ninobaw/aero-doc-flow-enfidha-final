import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';

const API_BASE_URL = 'http://localhost:5000/api';

export interface ActionData {
  id: string;
  title: string;
  description?: string;
  assigned_to: string[];
  due_date: string;
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  parent_document_id?: string;
  progress: number;
  estimated_hours?: number;
  actual_hours?: number;
  created_at: string;
  updated_at: string;
  document?: {
    title: string;
    type: string;
  };
}

export const useActions = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: actions = [], isLoading, error } = useQuery({
    queryKey: ['actions'],
    queryFn: async () => {
      const response = await axios.get(`${API_BASE_URL}/actions`);
      return response.data as ActionData[];
    },
    enabled: !!user,
  });

  const createAction = useMutation({
    mutationFn: async (actionData: {
      title: string;
      description?: string;
      assigned_to: string[];
      due_date: string;
      priority: ActionData['priority'];
      parent_document_id?: string;
      estimated_hours?: number;
    }) => {
      const response = await axios.post(`${API_BASE_URL}/actions`, actionData);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['actions'] });
      toast({
        title: 'Action créée',
        description: 'L\'action a été créée avec succès.',
      });
    },
    onError: (error: any) => {
      console.error('Erreur création action:', error.response?.data || error.message);
      toast({
        title: 'Erreur',
        description: error.response?.data?.message || error.message || 'Impossible de créer l\'action.',
        variant: 'destructive',
      });
    },
  });

  const updateAction = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<ActionData> & { id: string }) => {
      const response = await axios.put(`${API_BASE_URL}/actions/${id}`, updates);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['actions'] });
      toast({
        title: 'Action mise à jour',
        description: 'L\'action a été mise à jour avec succès.',
      });
    },
    onError: (error: any) => {
      console.error('Erreur mise à jour action:', error.response?.data || error.message);
      toast({
        title: 'Erreur',
        description: error.response?.data?.message || error.message || 'Impossible de mettre à jour l\'action.',
        variant: 'destructive',
      });
    },
  });

  return {
    actions,
    isLoading,
    error,
    createAction: createAction.mutate,
    updateAction: updateAction.mutate,
    isCreating: createAction.isPending,
    isUpdating: updateAction.isPending,
  };
};