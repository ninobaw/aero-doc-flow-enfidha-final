
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface ProcesVerbalData {
  id: string;
  document_id: string;
  meeting_date: string;
  participants: string[];
  agenda: string;
  decisions: string;
  location: string;
  meeting_type: string;
  airport: 'ENFIDHA' | 'MONASTIR';
  next_meeting_date?: string;
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
  const queryClient = useQueryClient();

  const { data: procesVerbaux = [], isLoading, error } = useQuery({
    queryKey: ['proces-verbaux'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('proces_verbaux')
        .select(`
          *,
          document:documents(
            title,
            author:profiles(first_name, last_name)
          )
        `)
        .order('meeting_date', { ascending: false });

      if (error) throw error;
      return data as ProcesVerbalData[];
    },
  });

  const createProcesVerbal = useMutation({
    mutationFn: async (pvData: {
      document_id: string;
      meeting_date: string;
      participants: string[];
      agenda: string;
      decisions: string;
      location: string;
      meeting_type: string;
      airport: 'ENFIDHA' | 'MONASTIR';
      next_meeting_date?: string;
    }) => {
      const { data, error } = await supabase
        .from('proces_verbaux')
        .insert(pvData)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['proces-verbaux'] });
      queryClient.invalidateQueries({ queryKey: ['documents'] });
      toast({
        title: 'Procès-verbal créé',
        description: 'Le procès-verbal a été créé avec succès.',
      });
    },
    onError: (error) => {
      console.error('Erreur création PV:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de créer le procès-verbal.',
        variant: 'destructive',
      });
    },
  });

  const updateProcesVerbal = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<ProcesVerbalData> & { id: string }) => {
      const { data, error } = await supabase
        .from('proces_verbaux')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['proces-verbaux'] });
      toast({
        title: 'Procès-verbal mis à jour',
        description: 'Le procès-verbal a été mis à jour avec succès.',
      });
    },
    onError: (error) => {
      console.error('Erreur mise à jour PV:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de mettre à jour le procès-verbal.',
        variant: 'destructive',
      });
    },
  });

  return {
    procesVerbaux,
    isLoading,
    error,
    createProcesVerbal: createProcesVerbal.mutate,
    updateProcesVerbal: updateProcesVerbal.mutate,
    isCreating: createProcesVerbal.isPending,
    isUpdating: updateProcesVerbal.isPending,
  };
};
