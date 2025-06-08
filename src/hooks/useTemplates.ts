import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { Airport } from '@/shared/types';

const API_BASE_URL = 'http://localhost:5000/api';

export interface TemplateData {
  id: string;
  title: string;
  type: 'FORMULAIRE_DOC' | 'CORRESPONDANCE' | 'PROCES_VERBAL' | 'QUALITE_DOC' | 'NOUVEAU_DOC' | 'GENERAL' | 'TEMPLATE';
  content?: string; // Can be used for template description
  author_id: string;
  version: number;
  status: 'DRAFT' | 'ACTIVE' | 'ARCHIVED';
  airport: Airport;
  file_path?: string; // Relative path to the template file
  file_type?: string;
  qr_code: string; // Templates also have QR codes for identification
  views_count: number;
  downloads_count: number;
  created_at: string;
  updated_at: string;
  isTemplate: boolean; // Key field to identify templates
  author?: {
    first_name: string;
    last_name: string;
  };
}

export const useTemplates = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: templates = [], isLoading, error } = useQuery({
    queryKey: ['templates'],
    queryFn: async () => {
      // Fetch documents that are marked as templates
      const response = await axios.get(`${API_BASE_URL}/documents?isTemplate=true`);
      return response.data as TemplateData[];
    },
    enabled: !!user,
  });

  const createTemplate = useMutation({
    mutationFn: async (templateData: {
      title: string;
      content?: string;
      airport: Airport;
      file_path: string; // Path to the uploaded template file
      file_type: string;
    }) => {
      if (!user?.id) throw new Error('Utilisateur non connecté');

      // Templates are created as documents with type 'TEMPLATE' and isTemplate: true
      const response = await axios.post(`${API_BASE_URL}/documents`, {
        ...templateData,
        author_id: user.id,
        type: 'TEMPLATE', // Specific type for templates
        isTemplate: true,
        version: 1,
        status: 'ACTIVE', // Templates are usually active
        qr_code: `QR-TEMPLATE-${Date.now()}`, // Generate a unique QR for the template
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['templates'] });
      toast({
        title: 'Modèle créé',
        description: 'Le modèle de document a été créé avec succès.',
      });
    },
    onError: (error: any) => {
      console.error('Erreur création modèle:', error.response?.data || error.message);
      toast({
        title: 'Erreur',
        description: error.response?.data?.message || error.message || 'Impossible de créer le modèle.',
        variant: 'destructive',
      });
    },
  });

  const deleteTemplate = useMutation({
    mutationFn: async (id: string) => {
      await axios.delete(`${API_BASE_URL}/documents/${id}`); // Delete the document entry
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['templates'] });
      toast({
        title: 'Modèle supprimé',
        description: 'Le modèle de document a été supprimé avec succès.',
      });
    },
    onError: (error: any) => {
      console.error('Erreur suppression modèle:', error.response?.data || error.message);
      toast({
        title: 'Erreur',
        description: error.response?.data?.message || error.message || 'Impossible de supprimer le modèle.',
        variant: 'destructive',
      });
    },
  });

  return {
    templates,
    isLoading,
    error,
    createTemplate: createTemplate.mutate,
    isCreating: createTemplate.isPending,
    deleteTemplate: deleteTemplate.mutate,
    isDeleting: deleteTemplate.isPending,
  };
};