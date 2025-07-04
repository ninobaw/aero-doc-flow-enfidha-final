import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { useToast } from '@/hooks/use-toast';
import { DocumentCodeConfig } from '@/shared/types';

const API_BASE_URL = 'http://localhost:5000/api';

export const useDocumentCodeConfig = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: config, isLoading, error } = useQuery<DocumentCodeConfig, Error>({
    queryKey: ['documentCodeConfig'],
    queryFn: async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/document-code-config`);
        return response.data as DocumentCodeConfig;
      } catch (err: any) {
        console.error('Error fetching document code config:', err.response?.data || err.message);
        toast({
          title: 'Erreur de configuration',
          description: err.response?.data?.message || 'Impossible de charger la configuration des codes documentaires.',
          variant: 'destructive',
        });
        throw err;
      }
    },
    staleTime: Infinity, // Configuration data doesn't change often
    gcTime: Infinity, // Use gcTime instead of cacheTime for TanStack Query v5
  });

  const updateDocumentCodeConfig = useMutation({
    mutationFn: async (updatedConfig: DocumentCodeConfig) => {
      // The backend expects the ID in the URL for PUT requests
      const response = await axios.put(`${API_BASE_URL}/document-code-config/${updatedConfig.id}`, updatedConfig);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['documentCodeConfig'] });
      toast({
        title: 'Configuration mise à jour',
        description: 'La configuration des codes documentaires a été mise à jour avec succès.',
        variant: 'success',
      });
    },
    onError: (err: any) => {
      console.error('Erreur mise à jour config codes documentaires:', err.response?.data || err.message);
      toast({
        title: 'Erreur',
        description: err.response?.data?.message || 'Impossible de mettre à jour la configuration des codes documentaires.',
        variant: 'destructive',
      });
    },
  });

  return {
    config,
    isLoading,
    error,
    updateDocumentCodeConfig: updateDocumentCodeConfig.mutate,
    isUpdating: updateDocumentCodeConfig.isPending,
  };
};