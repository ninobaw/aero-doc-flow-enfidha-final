import { useMutation } from '@tanstack/react-query';
import axios from 'axios';
import { useToast } from '@/hooks/use-toast';

const API_BASE_URL = 'http://localhost:5000/api';

export const usePasswordReset = () => {
  const { toast } = useToast();

  const requestPasswordReset = useMutation({
    mutationFn: async (email: string) => {
      const response = await axios.post(`${API_BASE_URL}/auth/request-password-reset`, { email });
      return response.data;
    },
    onSuccess: (data) => {
      toast({
        title: 'Email de réinitialisation envoyé',
        description: data.message || 'Si un compte correspondant est trouvé, un email a été envoyé.',
        variant: 'success',
      });
    },
    onError: (error: any) => {
      console.error('Erreur demande réinitialisation mot de passe:', error.response?.data || error.message);
      toast({
        title: 'Erreur',
        description: error.response?.data?.message || 'Impossible d\'envoyer l\'email de réinitialisation.',
        variant: 'destructive',
      });
    },
  });

  const resetPassword = useMutation({
    mutationFn: async ({ token, newPassword }: { token: string; newPassword: string }) => {
      const response = await axios.post(`${API_BASE_URL}/auth/reset-password`, { token, newPassword });
      return response.data;
    },
    onSuccess: (data) => {
      toast({
        title: 'Mot de passe réinitialisé',
        description: data.message || 'Votre mot de passe a été réinitialisé avec succès.',
        variant: 'success',
      });
    },
    onError: (error: any) => {
      console.error('Erreur réinitialisation mot de passe:', error.response?.data || error.message);
      toast({
        title: 'Erreur',
        description: error.response?.data?.message || 'Le jeton est invalide ou a expiré, ou le mot de passe n\'a pas pu être réinitialisé.',
        variant: 'destructive',
      });
    },
  });

  return {
    requestPasswordReset: requestPasswordReset.mutate,
    isRequestingReset: requestPasswordReset.isPending,
    resetPassword: resetPassword.mutate,
    isResettingPassword: resetPassword.isPending,
  };
};