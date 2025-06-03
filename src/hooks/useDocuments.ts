
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';

export interface DocumentData {
  id: string;
  title: string;
  type: 'QUALITE_DOC' | 'NOUVEAU_DOC' | 'CORRESPONDANCE' | 'PROCES_VERBAL' | 'FORMULAIRE_DOC' | 'GENERAL';
  content: string;
  author_id: string;
  status: 'DRAFT' | 'ACTIVE' | 'ARCHIVED';
  airport: 'ENFIDHA' | 'MONASTIR';
  version: number;
  qr_code: string;
  file_path?: string;
  file_type?: string;
  created_at: string;
  updated_at: string;
  author?: {
    first_name: string;
    last_name: string;
    email: string;
  };
}

export const useDocuments = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // ===========================================
  // DÉBUT INTÉGRATION BACKEND SUPABASE - DOCUMENTS
  // ===========================================

  const { data: documents = [], isLoading, error } = useQuery({
    queryKey: ['documents'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('documents')
        .select(`
          *,
          author:profiles(first_name, last_name, email)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as DocumentData[];
    },
  });

  const createDocument = useMutation({
    mutationFn: async (documentData: {
      title: string;
      type: DocumentData['type'];
      content: string;
      airport: 'ENFIDHA' | 'MONASTIR';
      file_path?: string;
      file_type?: string;
    }) => {
      if (!user) throw new Error('Utilisateur non connecté');

      const { data, error } = await supabase
        .from('documents')
        .insert({
          title: documentData.title,
          type: documentData.type,
          content: documentData.content,
          author_id: user.id,
          airport: documentData.airport,
          file_path: documentData.file_path,
          file_type: documentData.file_type,
          status: 'DRAFT' as const,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['documents'] });
      toast({
        title: 'Document créé',
        description: 'Le document a été créé avec succès.',
      });
    },
    onError: (error) => {
      console.error('Erreur création document:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de créer le document.',
        variant: 'destructive',
      });
    },
  });

  const updateDocument = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<DocumentData> & { id: string }) => {
      const { data, error } = await supabase
        .from('documents')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['documents'] });
      toast({
        title: 'Document mis à jour',
        description: 'Le document a été mis à jour avec succès.',
      });
    },
    onError: (error) => {
      console.error('Erreur mise à jour document:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de mettre à jour le document.',
        variant: 'destructive',
      });
    },
  });

  const deleteDocument = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('documents')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['documents'] });
      toast({
        title: 'Document supprimé',
        description: 'Le document a été supprimé avec succès.',
      });
    },
    onError: (error) => {
      console.error('Erreur suppression document:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de supprimer le document.',
        variant: 'destructive',
      });
    },
  });

  // ===========================================
  // FIN INTÉGRATION BACKEND SUPABASE - DOCUMENTS
  // ===========================================

  return {
    documents,
    isLoading,
    error,
    createDocument: createDocument.mutate,
    updateDocument: updateDocument.mutate,
    deleteDocument: deleteDocument.mutate,
    isCreating: createDocument.isPending,
    isUpdating: updateDocument.isPending,
    isDeleting: deleteDocument.isPending,
  };
};
