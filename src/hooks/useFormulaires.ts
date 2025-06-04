
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';

export interface FormulaireData {
  id: string;
  name: string;
  template: string;
  fields: FormField[];
  is_downloadable: boolean;
  category: string;
  file_path?: string;
  file_type?: string;
  created_at: string;
  updated_at: string;
}

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
      // Pour le moment, on retourne des données mock jusqu'à ce que la table soit créée
      return [
        {
          id: '1',
          name: 'Formulaire de demande',
          template: 'template-1',
          fields: [],
          is_downloadable: true,
          category: 'Administratif',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }
      ] as FormulaireData[];
    },
    enabled: !!user,
  });

  const createFormulaire = useMutation({
    mutationFn: async (formulaireData: Partial<FormulaireData>) => {
      // Mock implementation
      console.log('Création formulaire:', formulaireData);
      return { id: Date.now().toString(), ...formulaireData } as FormulaireData;
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

  return {
    formulaires,
    isLoading,
    error,
    createFormulaire: createFormulaire.mutate,
    isCreating: createFormulaire.isPending,
  };
};
