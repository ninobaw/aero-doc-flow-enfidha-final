
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface UploadOptions {
  bucket: string;
  folder?: string;
  allowedTypes?: string[];
  maxSize?: number; // en MB
}

export const useFileUpload = () => {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const { toast } = useToast();

  const uploadFile = async (
    file: File,
    options: UploadOptions
  ): Promise<{ url: string; path: string } | null> => {
    try {
      setUploading(true);
      setProgress(0);

      // Vérifications de validation
      if (options.allowedTypes && options.allowedTypes.length > 0) {
        const isValidType = options.allowedTypes.some(type => 
          file.type.startsWith(type) || file.name.toLowerCase().endsWith(type)
        );
        if (!isValidType) {
          throw new Error(`Type de fichier non autorisé. Types acceptés: ${options.allowedTypes.join(', ')}`);
        }
      }

      if (options.maxSize && file.size > options.maxSize * 1024 * 1024) {
        throw new Error(`Fichier trop volumineux. Taille maximum: ${options.maxSize}MB`);
      }

      // Générer un nom de fichier unique
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}_${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = options.folder ? `${options.folder}/${fileName}` : fileName;

      setProgress(50);

      // Upload vers Supabase Storage
      const { data, error } = await supabase.storage
        .from(options.bucket)
        .upload(filePath, file);

      if (error) {
        throw error;
      }

      setProgress(90);

      // Obtenir l'URL publique
      const { data: urlData } = supabase.storage
        .from(options.bucket)
        .getPublicUrl(filePath);

      setProgress(100);

      toast({
        title: 'Upload réussi',
        description: 'Le fichier a été uploadé avec succès.',
      });

      return {
        url: urlData.publicUrl,
        path: filePath
      };

    } catch (error: any) {
      console.error('Erreur upload:', error);
      toast({
        title: 'Erreur d\'upload',
        description: error.message || 'Erreur lors de l\'upload du fichier.',
        variant: 'destructive',
      });
      return null;
    } finally {
      setUploading(false);
      setProgress(0);
    }
  };

  const deleteFile = async (bucket: string, path: string): Promise<boolean> => {
    try {
      const { error } = await supabase.storage
        .from(bucket)
        .remove([path]);

      if (error) {
        throw error;
      }

      toast({
        title: 'Fichier supprimé',
        description: 'Le fichier a été supprimé avec succès.',
      });

      return true;
    } catch (error: any) {
      console.error('Erreur suppression:', error);
      toast({
        title: 'Erreur',
        description: 'Erreur lors de la suppression du fichier.',
        variant: 'destructive',
      });
      return false;
    }
  };

  return {
    uploadFile,
    deleteFile,
    uploading,
    progress,
  };
};
