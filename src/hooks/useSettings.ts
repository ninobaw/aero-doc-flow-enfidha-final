
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';

export interface AppSettings {
  id?: string;
  user_id: string;
  company_name: string;
  default_airport: 'ENFIDHA' | 'MONASTIR';
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

      const { data, error } = await supabase
        .from('app_settings')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) {
        console.error('Erreur récupération paramètres:', error);
        throw error;
      }

      console.log('Paramètres récupérés:', data);

      // Si aucuns paramètres trouvés, retourner les valeurs par défaut
      if (!data) {
        console.log('Aucuns paramètres trouvés, retour des valeurs par défaut');
        return {
          user_id: user.id,
          company_name: 'AeroDoc - Gestion Documentaire',
          default_airport: 'ENFIDHA' as const,
          language: 'fr',
          theme: 'light',
          email_notifications: true,
          sms_notifications: false,
          push_notifications: true,
          session_timeout: 60,
          require_two_factor: false,
          password_expiry: 90,
          document_retention: 365,
          auto_archive: true,
          max_file_size: 10,
          smtp_host: '',
          smtp_port: 587,
          smtp_username: '',
          use_ssl: true,
        };
      }

      return data as AppSettings;
    },
    enabled: !!user?.id,
  });

  const updateSettings = useMutation({
    mutationFn: async (settingsData: Partial<AppSettings>) => {
      if (!user?.id) throw new Error('Utilisateur non connecté');

      console.log('Mise à jour des paramètres pour user_id:', user.id);
      console.log('Données à sauvegarder:', settingsData);

      const dataToSave = {
        ...settingsData,
        user_id: user.id,
      };

      // Essayer d'abord une mise à jour
      const { data: existingData } = await supabase
        .from('app_settings')
        .select('id')
        .eq('user_id', user.id)
        .maybeSingle();

      let result;

      if (existingData) {
        // Mise à jour
        console.log('Mise à jour des paramètres existants');
        const { data, error } = await supabase
          .from('app_settings')
          .update(dataToSave)
          .eq('user_id', user.id)
          .select()
          .single();

        if (error) throw error;
        result = data;
      } else {
        // Insertion
        console.log('Création de nouveaux paramètres');
        const { data, error } = await supabase
          .from('app_settings')
          .insert(dataToSave)
          .select()
          .single();

        if (error) throw error;
        result = data;
      }

      console.log('Paramètres sauvegardés avec succès:', result);
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['settings'] });
      toast({
        title: 'Paramètres sauvegardés',
        description: 'Vos paramètres ont été mis à jour avec succès.',
      });
    },
    onError: (error) => {
      console.error('Erreur sauvegarde paramètres:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de sauvegarder les paramètres.',
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
