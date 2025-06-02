
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

      if (error) throw error;
      return data as FormulaireDoc[];
    },
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
      if (!user) throw new Error('Utilisateur non connecté');

      const documentData = {
        title: formulaireData.title,
        type: 'FORMULAIRE_DOC' as const,
        content: JSON.stringify({
          code: formulaireData.code,
          category: formulaireData.category,
          description: formulaireData.description,
          instructions: formulaireData.instructions,
        }),
        author_id: user.id,
        airport: formulaireData.airport,
        status: 'DRAFT' as const,
      };

      const { data, error } = await supabase
        .from('documents')
        .insert(documentData)
        .select()
        .single();

      if (error) throw error;
      return data;
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
