
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

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
  const queryClient = useQueryClient();

  // ===========================================
  // DÉBUT INTÉGRATION BACKEND SUPABASE - ACTIONS
  // ===========================================

  const { data: actions = [], isLoading, error } = useQuery({
    queryKey: ['actions'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('actions')
        .select(`
          *,
          document:documents(title, type)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as ActionData[];
    },
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
      const { data, error } = await supabase
        .from('actions')
        .insert({
          ...actionData,
          status: 'PENDING' as const,
          progress: 0,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['actions'] });
      toast({
        title: 'Action créée',
        description: 'L\'action a été créée avec succès.',
      });
    },
    onError: (error) => {
      console.error('Erreur création action:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de créer l\'action.',
        variant: 'destructive',
      });
    },
  });

  const updateAction = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<ActionData> & { id: string }) => {
      const { data, error } = await supabase
        .from('actions')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['actions'] });
      toast({
        title: 'Action mise à jour',
        description: 'L\'action a été mise à jour avec succès.',
      });
    },
    onError: (error) => {
      console.error('Erreur mise à jour action:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de mettre à jour l\'action.',
        variant: 'destructive',
      });
    },
  });

  // ===========================================
  // FIN INTÉGRATION BACKEND SUPABASE - ACTIONS
  // ===========================================

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
