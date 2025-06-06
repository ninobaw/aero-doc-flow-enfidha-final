
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
      console.log('Récupération des formulaires');
      
      const { data, error } = await supabase
        .from('documents')
        .select(`
          *,
          author:profiles(first_name, last_name)
        `)
        .eq('type', 'FORMULAIRE_DOC')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Erreur récupération formulaires:', error);
        throw error;
      }

      console.log('Formulaires récupérés:', data);
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

      console.log('Création du formulaire:', formulaireData);
      console.log('User ID:', user.id);

      // Vérifier que l'user.id est un UUID valide ou générer un UUID si nécessaire
      let authorId = user.id;
      
      // Si l'ID utilisateur n'est pas un UUID valide, utiliser l'ID du profil utilisateur
      if (!authorId.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i)) {
        console.log('ID utilisateur non-UUID détecté, récupération du profil...');
        
        // Récupérer le profil utilisateur pour obtenir l'UUID correct
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('id')
          .eq('email', user.email)
          .maybeSingle();

        if (profileError) {
          console.error('Erreur récupération profil:', profileError);
          throw new Error('Impossible de récupérer le profil utilisateur');
        }

        if (!profile) {
          console.error('Profil utilisateur non trouvé pour:', user.email);
          throw new Error('Profil utilisateur non trouvé');
        }

        authorId = profile.id;
        console.log('UUID du profil récupéré:', authorId);
      }

      const contentData = {
        code: formulaireData.code || '',
        category: formulaireData.category || '',
        description: formulaireData.description || '',
        instructions: formulaireData.instructions || '',
      };

      const documentData = {
        title: formulaireData.title,
        content: JSON.stringify(contentData),
        type: 'FORMULAIRE_DOC' as const,
        author_id: authorId,
        airport: formulaireData.airport,
        status: 'DRAFT' as const,
      };

      console.log('Données à insérer:', documentData);

      const { data, error } = await supabase
        .from('documents')
        .insert(documentData)
        .select(`
          *,
          author:profiles(first_name, last_name)
        `)
        .single();

      if (error) {
        console.error('Erreur création formulaire:', error);
        throw error;
      }

      console.log('Formulaire créé avec succès:', data);
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
        description: error.message || 'Impossible de créer le formulaire.',
        variant: 'destructive',
      });
    },
  });

  const deleteFormulaire = useMutation({
    mutationFn: async (id: string) => {
      console.log('Suppression du formulaire:', id);
      
      const { error } = await supabase
        .from('documents')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Erreur suppression formulaire:', error);
        throw error;
      }

      console.log('Formulaire supprimé avec succès');
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
