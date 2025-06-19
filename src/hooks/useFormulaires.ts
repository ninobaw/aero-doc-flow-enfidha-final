import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios'; // Import axios
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { Airport } from '@/shared/types'; // Import Airport type

// Define your backend API base URL
const API_BASE_URL = 'http://localhost:5000/api';

export interface FormulaireData {
  id: string;
  title: string;
  content: string; // This will store JSON string of code, category, description, instructions
  code?: string;
  airport: Airport; // Updated to use Airport type
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
      console.log('Récupération des formulaires via backend API');
      const response = await axios.get(`${API_BASE_URL}/formulaires`);
      console.log('Formulaires récupérés:', response.data);
      return response.data as FormulaireData[];
    },
    enabled: !!user,
  });

  const createFormulaire = useMutation({
    mutationFn: async (formulaireData: {
      title: string;
      content?: string;
      code?: string;
      airport: Airport; // Updated to use Airport type
      category?: string;
      description?: string;
      instructions?: string;
    }) => {
      if (!user?.id) {
        throw new Error('Vous devez être connecté pour créer un formulaire');
      }

      console.log('Création du formulaire via backend API:', formulaireData);
      
      const response = await axios.post(`${API_BASE_URL}/formulaires`, {
        title: formulaireData.title,
        content: formulaireData.content, // This will be a JSON string
        code: formulaireData.code,
        airport: formulaireData.airport,
        category: formulaireData.category,
        description: formulaireData.description,
        instructions: formulaireData.instructions,
        author_id: user.id, // Pass author_id from frontend user
      });
      console.log('Formulaire créé avec succès:', response.data);
      return response.data as FormulaireData;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['formulaires'] });
      toast({
        title: 'Formulaire créé',
        description: 'Le formulaire a été créé avec succès.',
        variant: 'success', // Ajout de la variante success
      });
    },
    onError: (error: any) => {
      console.error('Erreur création formulaire:', error.response?.data || error.message);
      toast({
        title: 'Erreur',
        description: error.response?.data?.message || error.message || 'Impossible de créer le formulaire.',
        variant: 'destructive',
      });
    },
  });

  const deleteFormulaire = useMutation({
    mutationFn: async (id: string) => {
      console.log('Suppression du formulaire via backend API:', id);
      await axios.delete(`${API_BASE_URL}/formulaires/${id}`);
      console.log('Formulaire supprimé avec succès');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['formulaires'] });
      toast({
        title: 'Formulaire supprimé',
        description: 'Le formulaire a été supprimé avec succès.',
        variant: 'destructive', // Ajout de la variante destructive pour la suppression
      });
    },
    onError: (error: any) => {
      console.error('Erreur suppression formulaire:', error.response?.data || error.message);
      toast({
        title: 'Erreur',
        description: error.response?.data?.message || error.message || 'Impossible de supprimer le formulaire.',
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