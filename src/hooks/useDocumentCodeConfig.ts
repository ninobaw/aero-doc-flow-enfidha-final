import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { useToast } from '@/hooks/use-toast';
import { DocumentCodeConfig } from '@/shared/types';

const API_BASE_URL = 'http://localhost:5000/api';

export const useDocumentCodeConfig = () => {
  const { toast } = useToast();

  const { data: config, isLoading, error } = useQuery({
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
    cacheTime: Infinity,
  });

  return {
    config,
    isLoading,
    error,
  };
};