import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios'; // Import axios
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { Airport } from '@/shared/types'; // Import Airport type

// Define your backend API base URL
const API_BASE_URL = 'http://localhost:5000/api';

export interface DocumentData {
  id: string;
  title: string;
  type: 'FORMULAIRE_DOC' | 'CORRESPONDANCE' | 'PROCES_VERBAL' | 'QUALITE_DOC' | 'NOUVEAU_DOC' | 'GENERAL' | 'TEMPLATE';
  content?: string;
  author_id: string;
  version: number;
  status: 'DRAFT' | 'ACTIVE' | 'ARCHIVED';
  airport: Airport; // Updated to use Airport type
  file_path?: string;
  file_type?: string;
  qr_code: string;
  views_count: number;
  downloads_count: number;
  created_at: string;
  updated_at: string;
  author?: {
    first_name: string;
    last_name: string;
  };
  // New codification fields
  company_code?: string;
  scope_code?: string;
  department_code?: string;
  sub_department_code?: string;
  document_type_code?: string;
  language_code?: string;
  sequence_number?: number;
  tags?: string[]; // Added tags field
  // Approval fields
  approved_by?: {
    first_name: string;
    last_name: string;
  };
  approved_at?: string;
}

export const useDocuments = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: documents = [], isLoading, error } = useQuery({
    queryKey: ['documents'],
    queryFn: async () => {
      const response = await axios.get(`${API_BASE_URL}/documents`);
      return response.data as DocumentData[];
    },
  });

  const createDocument = useMutation({
    mutationFn: async (documentData: {
      title: string;
      type: 'FORMULAIRE_DOC' | 'CORRESPONDANCE' | 'PROCES_VERBAL' | 'QUALITE_DOC' | 'NOUVEAU_DOC' | 'GENERAL';
      content?: string;
      airport: Airport; // Updated to use Airport type
      file_path?: string;
      file_type?: string;
      // New codification fields
      company_code?: string;
      scope_code?: string;
      department_code?: string;
      sub_department_code?: string;
      document_type_code?: string;
      language_code?: string;
    }) => {
      if (!user?.id) throw new Error('Utilisateur non connecté');

      const response = await axios.post(`${API_BASE_URL}/documents`, {
        ...documentData,
        author_id: user.id,
      });
      return response.data;
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
    mutationFn: async ({ id, ...updates }: { 
      id: string;
      title?: string;
      type?: 'FORMULAIRE_DOC' | 'CORRESPONDANCE' | 'PROCES_VERBAL' | 'QUALITE_DOC' | 'NOUVEAU_DOC' | 'GENERAL';
      content?: string;
      status?: 'DRAFT' | 'ACTIVE' | 'ARCHIVED';
      airport?: Airport; // Updated to use Airport type
      file_path?: string;
      file_type?: string;
      version?: number;
      views_count?: number;
      downloads_count?: number;
      // New codification fields
      company_code?: string;
      scope_code?: string;
      department_code?: string;
      sub_department_code?: string;
      document_type_code?: string;
      language_code?: string;
      sequence_number?: number;
      tags?: string[]; // Include tags in updates
      approved_by_id?: string; // New field for approval
    }) => {
      const response = await axios.put(`${API_BASE_URL}/documents/${id}`, updates);
      return response.data;
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
      await axios.delete(`${API_BASE_URL}/documents/${id}`);
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