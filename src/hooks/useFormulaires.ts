
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';

export interface FormulaireDoc {
  id: string;
  title: string;
  content: string;
  author_id: string;
  qr_code: string;
  version: number;
  status: 'DRAFT' | 'ACTIVE' | 'ARCHIVED';
  file_path?: string;
  file_type?: string;
  airport: 'ENFIDHA' | 'MONASTIR';
  created_at: string;
  updated_at: string;
  author?: {
    first_name: string;
    last_name: string;
    email: string;
  };
}

export const useFormulaires = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // ===========================================
  // DÉBUT INTÉGRATION BACKEND SUPABASE - FORMULAIRES
  // ===========================================

  const { data: formulaires = [], isLoading, error } = useQuery({
    queryKey: ['formulaires'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('documents')
        .select(`
          *,
          author:profiles(first_name, last_name, email)
        `)
        .eq('type', 'FORMULAIRE_DOC')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Erreur récupération formulaires:', error);
        throw error;
      }
      return data as FormulaireDoc[];
    },
    enabled: true,
  });

  const createFormulaire = useMutation({
    mutationFn: async (formulaireData: {
      title: string;
      content: string;
      code?: string;
      airport: 'ENFIDHA' | 'MONASTIR';
      category?: string;
      description?: string;
      instructions?: string;
    }) => {
      if (!user?.id) {
        throw new Error('Vous devez être connecté pour créer un formulaire');
      }

      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
      if (!uuidRegex.test(user.id)) {
        console.error('ID utilisateur invalide:', user.id);
        throw new Error('ID utilisateur invalide. Veuillez vous reconnecter.');
      }

      const contentJson = {
        code: formulaireData.code || '',
        category: formulaireData.category || '',
        description: formulaireData.description || '',
        instructions: formulaireData.instructions || '',
      };

      const documentData = {
        title: formulaireData.title,
        type: 'FORMULAIRE_DOC' as const,
        content: JSON.stringify(contentJson),
        author_id: user.id,
        airport: formulaireData.airport,
        status: 'DRAFT' as const,
      };

      console.log('Données à insérer:', documentData);

      const { data, error } = await supabase
        .from('documents')
        .insert(documentData)
        .select(`
          *,
          author:profiles(first_name, last_name, email)
        `)
        .single();

      if (error) {
        console.error('Erreur création formulaire:', error);
        throw error;
      }

      console.log('Formulaire créé avec succès:', data);
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['formulaires'] });
      queryClient.invalidateQueries({ queryKey: ['documents'] });
      toast({
        title: 'Formulaire créé',
        description: `Le formulaire "${data.title}" a été créé avec succès.`,
      });
    },
    onError: (error: any) => {
      console.error('Erreur création formulaire:', error);
      
      let errorMessage = 'Impossible de créer le formulaire.';
      
      if (error.message?.includes('uuid')) {
        errorMessage = 'Problème d\'authentification. Veuillez vous reconnecter.';
      } else if (error.message?.includes('Vous devez être connecté')) {
        errorMessage = error.message;
      } else if (error.code === '23505') {
        errorMessage = 'Un formulaire avec ce titre existe déjà.';
      } else if (error.code === '42501') {
        errorMessage = 'Permissions insuffisantes pour créer un formulaire.';
      }

      toast({
        title: 'Erreur',
        description: errorMessage,
        variant: 'destructive',
      });
    },
  });

  const updateFormulaire = useMutation({
    mutationFn: async ({ id, ...updates }: { id: string } & Partial<FormulaireDoc>) => {
      if (!user?.id) throw new Error('Utilisateur non connecté');

      const { data, error } = await supabase
        .from('documents')
        .update(updates)
        .eq('id', id)
        .eq('author_id', user.id)
        .select(`
          *,
          author:profiles(first_name, last_name, email)
        `)
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['formulaires'] });
      toast({
        title: 'Formulaire mis à jour',
        description: `Le formulaire "${data.title}" a été mis à jour.`,
      });
    },
    onError: (error) => {
      console.error('Erreur mise à jour formulaire:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de mettre à jour le formulaire.',
        variant: 'destructive',
      });
    },
  });

  const deleteFormulaire = useMutation({
    mutationFn: async (id: string) => {
      if (!user?.id) throw new Error('Utilisateur non connecté');

      const { error } = await supabase
        .from('documents')
        .delete()
        .eq('id', id)
        .eq('author_id', user.id);

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

  // ===========================================
  // FIN INTÉGRATION BACKEND SUPABASE - FORMULAIRES
  // ===========================================

  return {
    formulaires,
    isLoading,
    error,
    createFormulaire: createFormulaire.mutate,
    isCreating: createFormulaire.isPending,
    updateFormulaire: updateFormulaire.mutate,
    isUpdating: updateFormulaire.isPending,
    deleteFormulaire: deleteFormulaire.mutate,
    isDeleting: deleteFormulaire.isPending,
  };
};
