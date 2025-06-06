
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { ActionDecidee } from '@/components/actions/ActionsDecideesField';

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

      // Créer d'abord le document
      const { data: document, error: docError } = await supabase
        .from('documents')
        .insert({
          title: data.title,
          type: 'CORRESPONDANCE',
          content: data.content,
          author_id: user.id,
          airport: data.airport,
        })
        .select()
        .single();

      if (docError) throw docError;

      // Puis créer la correspondance
      const { data: correspondance, error: corrError } = await supabase
        .from('correspondances')
        .insert({
          document_id: document.id,
          from_address: data.from_address,
          to_address: data.to_address,
          subject: data.subject,
          content: data.content,
          priority: data.priority,
          status: 'DRAFT',
          airport: data.airport,
          attachments: data.attachments || [],
          actions_decidees: data.actions_decidees || [],
        })
        .select()
        .single();

      if (corrError) throw corrError;
      return correspondance;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['correspondances'] });
      queryClient.invalidateQueries({ queryKey: ['documents'] });
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

  const updateCorrespondance = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<CorrespondanceData> & { id: string }) => {
      const { data, error } = await supabase
        .from('correspondances')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['correspondances'] });
      toast({
        title: 'Correspondance mise à jour',
        description: 'La correspondance a été mise à jour avec succès.',
      });
    },
    onError: (error) => {
      console.error('Erreur mise à jour correspondance:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de mettre à jour la correspondance.',
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
