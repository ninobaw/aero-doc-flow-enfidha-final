
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';

export interface FormulaireData {
  id: string;
  title: string;
  content: string;
  code?: string;
  airport: 'ENFIDHA' | 'MONASTIR';
  category?: string;
  description?: string;
  instructions?: string;
  status: 'DRAFT' | 'ACTIVE' | 'ARCHIVED';
  author_id: string;
  created_at: string;
  updated_at: string;
  author?: {
    first_name: string;
    last_name: string;
  };
}

// Export alias for compatibility
export type FormulaireDoc = FormulaireData;

export interface FormField {
  id: string;
  name: string;
  type: 'text' | 'number' | 'date' | 'select' | 'textarea' | 'checkbox' | 'file';
  required: boolean;
  options?: string[];
  placeholder?: string;
  validation?: string;
}

export const useFormulaires = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: formulaires = [], isLoading, error } = useQuery({
    queryKey: ['formulaires'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('documents')
        .select(`
          *,
          author:profiles(first_name, last_name)
        `)
        .eq('type', 'FORMULAIRE_DOC')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as FormulaireData[];
    },
    enabled: !!user,
  });

  const createFormulaire = useMutation({
    mutationFn: async (formulaireData: {
      title: string;
      content?: string;
      code?: string;
      airport: 'ENFIDHA' | 'MONASTIR';
      category?: string;
      description?: string;
      instructions?: string;
    }) => {
      if (!user?.id) {
        throw new Error('Vous devez être connecté pour créer un formulaire');
      }

      const { data, error } = await supabase
        .from('documents')
        .insert({
          title: formulaireData.title,
          content: JSON.stringify({
            code: formulaireData.code,
            category: formulaireData.category,
            description: formulaireData.description,
            instructions: formulaireData.instructions,
          }),
          type: 'FORMULAIRE_DOC',
          author_id: user.id,
          airport: formulaireData.airport,
          status: 'DRAFT',
        })
        .select(`
          *,
          author:profiles(first_name, last_name)
        `)
        .single();

      if (error) throw error;
      return data as FormulaireData;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['formulaires'] });
      toast({
        title: 'Formulaire créé',
        description: 'Le formulaire a été créé avec succès.',
      });
    },
    onError: (error) => {
      console.error('Erreur création formulaire:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de créer le formulaire.',
        variant: 'destructive',
      });
    },
  });

  const deleteFormulaire = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('documents')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['formulaires'] });
      toast({
        title: 'Formulaire supprimé',
        description: 'Le formulaire a été supprimé avec succès.',
      });
    },
    onError: (error) => {
      console.error('Erreur suppression formulaire:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de supprimer le formulaire.',
        variant: 'destructive',
      });
    },
  });

  return {
    formulaires,
    isLoading,
    error,
    createFormulaire: createFormulaire.mutate,
    isCreating: createFormulaire.isPending,
    deleteFormulaire: deleteFormulaire.mutate,
    isDeleting: deleteFormulaire.isPending,
  };
};
