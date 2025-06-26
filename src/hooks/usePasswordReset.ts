import { useMutation } from '@tanstack/react-query';
import axios from 'axios';
import { useToast } from '@/hooks/use-toast';

const API_BASE_URL = 'http://localhost:5000/api';

export const usePasswordReset = () => {
  const { toast } = useToast();

  const requestPasswordReset = useMutation({
    mutationFn: async (email: string) => {
      const response = await axios.post(`${API_BASE_URL}/auth/forgot-password`, { email });
      return response.data;
    },
    onSuccess: () => {
      toast({
        title: 'Lien de réinitialisation envoyé',
        description: 'Si un compte est associé à cette adresse email, un lien de réinitialisation a été envoyé.',
        variant: 'success',
      });
    },
    onError: (error: any) => {
      console.error('Erreur demande réinitialisation mot de passe:', error.response?.data || error.message);
      toast({
        title: 'Erreur',
        description: error.response?.data?.message || 'Impossible d\'envoyer le lien de réinitialisation.',
        variant: 'destructive',
      });
    },
  });

  const resetPassword = useMutation({
    mutationFn: async (data: { token: string; newPassword: string }) => {
      const response = await axios.post(`${API_BASE_URL}/auth/reset-password/${data.token}`, { newPassword: data.newPassword });
      return response.data;
    },
    onSuccess: () => {
      toast({
        title: 'Mot de passe réinitialisé',
        description: 'Votre mot de passe a été réinitialisé avec succès.',
        variant: 'success',
      });
    },
    onError: (error: any) => {
      console.error('Erreur réinitialisation mot de passe:', error.response?.data || error.message);
      toast({
        title: 'Erreur',
        description: error.response?.data?.message || 'Le jeton de réinitialisation est invalide ou a expiré.',
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