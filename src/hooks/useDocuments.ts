
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';

export interface Document {
  id: string;
  title: string;
  content?: string;
  author_id: string;
  qr_code: string;
  version: number;
  status: 'DRAFT' | 'ACTIVE' | 'ARCHIVED';
  type: 'FORMULAIRE_DOC' | 'CORRESPONDANCE' | 'PROCES_VERBAL' | 'QUALITE_DOC' | 'NOUVEAU_DOC' | 'GENERAL';
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

export type DocumentData = Document;

export const useDocuments = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'DRAFT' | 'ACTIVE' | 'ARCHIVED'>('all');
  const [typeFilter, setTypeFilter] = useState<'all' | 'FORMULAIRE_DOC' | 'CORRESPONDANCE' | 'PROCES_VERBAL' | 'QUALITE_DOC' | 'NOUVEAU_DOC' | 'GENERAL'>('all');
  const [airportFilter, setAirportFilter] = useState<'all' | 'ENFIDHA' | 'MONASTIR'>('all');

  const { data: documents = [], isLoading, error } = useQuery({
    queryKey: ['documents', searchTerm, statusFilter, typeFilter, airportFilter],
    queryFn: async () => {
      console.log('Récupération des documents avec filtres:', { searchTerm, statusFilter, typeFilter, airportFilter });

      let query = supabase
        .from('documents')
        .select(`
          *,
          author:profiles(first_name, last_name, email)
        `)
        .order('created_at', { ascending: false });

      if (searchTerm) {
        query = query.or(`title.ilike.%${searchTerm}%,content.ilike.%${searchTerm}%`);
      }

      if (statusFilter !== 'all') {
        query = query.eq('status', statusFilter);
      }

      if (typeFilter !== 'all') {
        query = query.eq('type', typeFilter);
      }

      if (airportFilter !== 'all') {
        query = query.eq('airport', airportFilter);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Erreur récupération documents:', error);
        throw error;
      }

      console.log('Documents récupérés:', data?.length || 0);
      return data as Document[];
    },
    enabled: true,
  });

  const createDocument = useMutation({
    mutationFn: async (documentData: {
      title: string;
      content?: string;
      type: 'FORMULAIRE_DOC' | 'CORRESPONDANCE' | 'PROCES_VERBAL' | 'QUALITE_DOC' | 'NOUVEAU_DOC' | 'GENERAL';
      airport: 'ENFIDHA' | 'MONASTIR';
      category?: string;
      description?: string;
      file?: File;
    }) => {
      if (!user?.id) {
        throw new Error('Vous devez être connecté pour créer un document');
      }

      console.log('Création document avec données:', documentData);

      let file_path = null;
      let file_type = null;

      // Upload du fichier si présent
      if (documentData.file) {
        console.log('Upload du fichier:', documentData.file.name);
        
        const fileExt = documentData.file.name.split('.').pop();
        const fileName = `${Date.now()}_${Math.random().toString(36).substring(2)}.${fileExt}`;
        
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('documents')
          .upload(fileName, documentData.file);

        if (uploadError) {
          console.error('Erreur upload fichier:', uploadError);
          // Créer le bucket s'il n'existe pas
          const { error: bucketError } = await supabase.storage.createBucket('documents', { public: true });
          if (!bucketError || bucketError.message.includes('already exists')) {
            // Réessayer l'upload
            const { data: retryUploadData, error: retryUploadError } = await supabase.storage
              .from('documents')
              .upload(fileName, documentData.file);
            
            if (retryUploadError) {
              throw new Error('Erreur lors de l\'upload du fichier');
            }
            file_path = retryUploadData.path;
          } else {
            throw new Error('Erreur lors de l\'upload du fichier');
          }
        } else {
          file_path = uploadData.path;
        }

        file_type = documentData.file.type;
      }

      const documentToInsert = {
        title: documentData.title,
        content: documentData.content || documentData.description || '',
        type: documentData.type,
        author_id: user.id,
        airport: documentData.airport,
        status: 'DRAFT' as const,
        file_path,
        file_type,
      };

      console.log('Données à insérer:', documentToInsert);

      const { data, error } = await supabase
        .from('documents')
        .insert(documentToInsert)
        .select(`
          *,
          author:profiles(first_name, last_name, email)
        `)
        .single();

      if (error) {
        console.error('Erreur création document:', error);
        throw error;
      }

      console.log('Document créé avec succès:', data);

      // Log de l'activité
      await supabase
        .from('activity_logs')
        .insert({
          user_id: user.id,
          action: 'document_created',
          entity_type: 'DOCUMENT',
          entity_id: data.id,
          details: `Document "${data.title}" créé`,
        });

      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['documents'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-activities'] });
      
      toast({
        title: 'Document créé',
        description: `Le document "${data.title}" a été créé avec succès.`,
      });
    },
    onError: (error: any) => {
      console.error('Erreur création document:', error);
      
      let errorMessage = 'Impossible de créer le document.';
      
      if (error.message?.includes('Vous devez être connecté')) {
        errorMessage = error.message;
      } else if (error.code === '23505') {
        errorMessage = 'Un document avec ce titre existe déjà.';
      } else if (error.code === '42501') {
        errorMessage = 'Permissions insuffisantes pour créer un document.';
      }

      toast({
        title: 'Erreur',
        description: errorMessage,
        variant: 'destructive',
      });
    },
  });

  const updateDocument = useMutation({
    mutationFn: async ({ id, ...updates }: { id: string } & Partial<Omit<Document, 'id' | 'author'>>) => {
      if (!user?.id) throw new Error('Utilisateur non connecté');

      const { data, error } = await supabase
        .from('documents')
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .select(`
          *,
          author:profiles(first_name, last_name, email)
        `)
        .single();

      if (error) throw error;

      // Log de l'activité
      await supabase
        .from('activity_logs')
        .insert({
          user_id: user.id,
          action: 'document_updated',
          entity_type: 'DOCUMENT',
          entity_id: data.id,
          details: `Document "${data.title}" mis à jour`,
        });

      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['documents'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-activities'] });
      
      toast({
        title: 'Document mis à jour',
        description: `Le document "${data.title}" a été mis à jour.`,
      });
    },
    onError: (error: any) => {
      console.error('Erreur mise à jour document:', error);
      toast({
        title: 'Erreur',
        description: error.message || 'Impossible de mettre à jour le document.',
        variant: 'destructive',
      });
    },
  });

  const deleteDocument = useMutation({
    mutationFn: async (id: string) => {
      if (!user?.id) throw new Error('Utilisateur non connecté');

      // Récupérer le document pour le nom
      const { data: doc } = await supabase
        .from('documents')
        .select('title, file_path')
        .eq('id', id)
        .single();

      // Supprimer le fichier associé si il existe
      if (doc?.file_path) {
        await supabase.storage
          .from('documents')
          .remove([doc.file_path]);
      }

      const { error } = await supabase
        .from('documents')
        .delete()
        .eq('id', id);

      if (error) throw error;

      // Log de l'activité
      await supabase
        .from('activity_logs')
        .insert({
          user_id: user.id,
          action: 'document_deleted',
          entity_type: 'DOCUMENT',
          entity_id: id,
          details: `Document "${doc?.title || 'Inconnu'}" supprimé`,
        });

      return doc?.title;
    },
    onSuccess: (title) => {
      queryClient.invalidateQueries({ queryKey: ['documents'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-activities'] });
      
      toast({
        title: 'Document supprimé',
        description: `Le document "${title}" a été supprimé avec succès.`,
      });
    },
    onError: (error: any) => {
      console.error('Erreur suppression document:', error);
      toast({
        title: 'Erreur',
        description: error.message || 'Impossible de supprimer le document.',
        variant: 'destructive',
      });
    },
  });

  return {
    documents,
    isLoading,
    error,
    searchTerm,
    setSearchTerm,
    statusFilter,
    setStatusFilter,
    typeFilter,
    setTypeFilter,
    airportFilter,
    setAirportFilter,
    createDocument: createDocument.mutate,
    isCreating: createDocument.isPending,
    updateDocument: updateDocument.mutate,
    isUpdating: updateDocument.isPending,
    deleteDocument: deleteDocument.mutate,
    isDeleting: deleteDocument.isPending,
  };
};
