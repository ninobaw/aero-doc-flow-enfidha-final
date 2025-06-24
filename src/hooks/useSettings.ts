import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { Airport } from '@/shared/types'; // Import Airport type

const API_BASE_URL = 'http://localhost:5000/api';

export interface AppSettings {
  id?: string;
  user_id: string;
  company_name: string;
  default_airport: Airport; // Updated to use Airport type
  language: string;
  theme: string;
  email_notifications: boolean;
  sms_notifications: boolean;
  push_notifications: boolean;
  session_timeout: number;
  require_two_factor: boolean;
  password_expiry: number;
  document_retention: number;
  auto_archive: boolean;
  max_file_size: number;
  smtp_host: string;
  smtp_port: number;
  smtp_username: string;
  use_ssl: boolean;
  // Nouveaux champs pour la configuration SMS (Twilio)
  twilio_account_sid: string;
  twilio_auth_token: string;
  twilio_phone_number: string;
  created_at?: string;
  updated_at?: string;
}

export const useSettings = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: settings, isLoading, error } = useQuery({
    queryKey: ['settings', user?.id],
    queryFn: async () => {
      if (!user?.id) throw new Error('Utilisateur non connecté');

      console.log('Récupération des paramètres pour user_id:', user.id);
      const response = await axios.get(`${API_BASE_URL}/settings/${user.id}`);
      console.log('Paramètres récupérés:', response.data);
      return response.data as AppSettings;
    },
    enabled: !!user?.id,
  });

  const updateSettings = useMutation({
    mutationFn: async (settingsData: Partial<AppSettings>) => {
      if (!user?.id) throw new Error('Utilisateur non connecté');

      console.log('Hook: Mise à jour des paramètres pour user_id:', user.id);
      console.log('Hook: Données à sauvegarder (avant envoi API):', settingsData);

      const response = await axios.put(`${API_BASE_URL}/settings/${user.id}`, settingsData);
      console.log('Hook: Paramètres sauvegardés avec succès (réponse API):', response.data);
      return response.data;
    },
    onSuccess: (data) => { // 'data' ici est la réponse du backend après la mise à jour
      queryClient.setQueryData(['settings', user?.id], data); // Met à jour directement le cache avec les nouvelles données
      toast({
        title: 'Paramètres sauvegardés',
        description: 'Vos paramètres ont été mis à jour avec succès.',
        variant: 'success',
      });
    },
    onError: (error: any) => {
      console.error('Erreur sauvegarde paramètres:', error.response?.data || error.message);
      toast({
        title: 'Erreur',
        description: error.response?.data?.message || error.message || 'Impossible de sauvegarder les paramètres.',
        variant: 'destructive',
      });
    },
  });

  return {
    settings,
    isLoading,
    error,
    updateSettings: updateSettings.mutate,
    isUpdating: updateSettings.isPending,
  };
};