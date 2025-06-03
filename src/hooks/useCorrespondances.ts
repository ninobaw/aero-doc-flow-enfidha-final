
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';

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

  // ===========================================
  // DÉBUT INTÉGRATION BACKEND SUPABASE - CORRESPONDANCES
  // ===========================================

  const { data: correspondances = [], isLoading, error } = useQuery({
    queryKey: ['correspondances'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('correspondances')
        .select(`
          *,
          document:documents(
            title,
            author:profiles(first_name, last_name)
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as CorrespondanceData[];
    },
  });

  const createCorrespondance = useMutation({
    mutationFn: async (correspondanceData: {
      document_id: string;
      from_address: string;
      to_address: string;
      subject: string;
      content: string;
      priority: CorrespondanceData['priority'];
      airport: 'ENFIDHA' | 'MONASTIR';
      attachments?: string[];
    }) => {
      const { data, error } = await supabase
        .from('correspondances')
        .insert(correspondanceData)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['correspondances'] });
      toast({
        title: 'Correspondance créée',
        description: 'La correspondance a été créée avec succès.',
      });
    },
    onError: (error) => {
      console.error('Erreur création correspondance:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de créer la correspondance.',
        variant: 'destructive',
      });
    },
  });

  // ===========================================
  // FIN INTÉGRATION BACKEND SUPABASE - CORRESPONDANCES
  // ===========================================

  return {
    correspondances,
    isLoading,
    error,
    createCorrespondance: createCorrespondance.mutate,
    isCreating: createCorrespondance.isPending,
  };
};
