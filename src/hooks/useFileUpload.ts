import { useState } from 'react';
import axios from 'axios';
import { useToast } from '@/hooks/use-toast';

const API_BASE_URL = 'http://localhost:5000/api';

export interface UploadOptions {
  documentType: string; // Used by backend to create subfolders (e.g., 'formulaires', 'general')
  allowedTypes?: string[];
  maxSize?: number; // en MB
}

export const useFileUpload = () => {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0); // Note: actual progress tracking with multer is more complex, this remains a simple indicator
  const { toast } = useToast();

  const uploadFile = async (
    file: File,
    options: UploadOptions
  ): Promise<{ url: string; path: string } | null> => {
    try {
      setUploading(true);
      setProgress(0);

      console.log('Début de l\'upload du fichier:', file.name, 'Type:', options.documentType);

      // Client-side validation (redundant with backend, but good for UX)
      if (options.allowedTypes && options.allowedTypes.length > 0) {
        const isValidType = options.allowedTypes.some(type => 
          file.type.startsWith(type.replace('.', '')) || file.name.toLowerCase().endsWith(type)
        );
        if (!isValidType) {
          throw new Error(`Type de fichier non autorisé. Types acceptés: ${options.allowedTypes.join(', ')}`);
        }
      }

      if (options.maxSize && file.size > options.maxSize * 1024 * 1024) {
        throw new Error(`Fichier trop volumineux. Taille maximum: ${options.maxSize}MB`);
      }

      const formData = new FormData();
      formData.append('file', file);
      formData.append('documentType', options.documentType); // Pass document type for folder organization

      console.log('Envoi de la requête POST à:', `${API_BASE_URL}/uploads/file`);
      const response = await axios.post(`${API_BASE_URL}/uploads/file`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (event) => {
          if (event.total) {
            setProgress(Math.round((100 * event.loaded) / event.total));
          }
        },
      });

      console.log('Réponse de l\'upload de fichier:', response.data);
      toast({
        title: 'Upload réussi',
        description: 'Le fichier a été uploadé avec succès.',
      });

      return {
        url: `${API_BASE_URL}${response.data.fileUrl}`, // Construct full URL
        path: response.data.filePath // Relative path from backend uploads folder
      };

    } catch (error: any) {
      console.error('Erreur upload:', error.response?.data || error.message);
      toast({
        title: 'Erreur d\'upload',
        description: error.response?.data?.message || error.message || 'Erreur lors de l\'upload du fichier.',
        variant: 'destructive',
      });
      return null;
    } finally {
      setUploading(false);
      setProgress(0);
    }
  };

  const uploadTemplate = async (
    file: File,
    options: Omit<UploadOptions, 'documentType'> // Templates go into a 'templates' folder
  ): Promise<{ url: string; path: string } | null> => {
    try {
      setUploading(true);
      setProgress(0);

      console.log('Début de l\'upload du modèle:', file.name);

      if (options.allowedTypes && options.allowedTypes.length > 0) {
        const isValidType = options.allowedTypes.some(type => 
          file.type.startsWith(type.replace('.', '')) || file.name.toLowerCase().endsWith(type)
        );
        if (!isValidType) {
          throw new Error(`Type de fichier non autorisé. Types acceptés: ${options.allowedTypes.join(', ')}`);
        }
      }

      if (options.maxSize && file.size > options.maxSize * 1024 * 1024) {
        throw new Error(`Fichier trop volumineux. Taille maximum: ${options.maxSize}MB`);
      }

      const formData = new FormData();
      formData.append('templateFile', file);
      formData.append('documentType', 'templates'); // Hardcode 'templates' for template uploads

      console.log('Envoi de la requête POST à:', `${API_BASE_URL}/uploads/template`);
      const response = await axios.post(`${API_BASE_URL}/uploads/template`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (event) => {
          if (event.total) {
            setProgress(Math.round((100 * event.loaded) / event.total));
          }
        },
      });

      console.log('Réponse de l\'upload de modèle:', response.data);
      toast({
        title: 'Modèle uploadé',
        description: 'Le modèle a été uploadé avec succès.',
      });

      return {
        url: `${API_BASE_URL}${response.data.fileUrl}`,
        path: response.data.filePath
      };

    } catch (error: any) {
      console.error('Erreur upload modèle:', error.response?.data || error.message);
      toast({
        title: 'Erreur d\'upload modèle',
        description: error.response?.data?.message || error.message || 'Erreur lors de l\'upload du modèle.',
        variant: 'destructive',
      });
      return null;
    } finally {
      setUploading(false);
      setProgress(0);
    }
  };

  const copyTemplate = async (
    templateFilePath: string,
    documentType: string
  ): Promise<{ url: string; path: string } | null> => {
    try {
      setUploading(true);
      setProgress(0); // Reset progress for copy operation

      console.log('Début de la copie du modèle:', templateFilePath, 'vers le type:', documentType);
      const response = await axios.post(`${API_BASE_URL}/uploads/copy-template`, {
        templateFilePath,
        documentType,
      });

      console.log('Réponse de la copie du modèle:', response.data);
      toast({
        title: 'Modèle copié',
        description: 'Le modèle a été copié pour le nouveau document.',
      });

      return {
        url: `${API_BASE_URL}${response.data.fileUrl}`,
        path: response.data.filePath
      };
    } catch (error: any) {
      console.error('Erreur copie modèle:', error.response?.data || error.message);
      toast({
        title: 'Erreur de copie',
        description: error.response?.data?.message || error.message || 'Erreur lors de la copie du modèle.',
        variant: 'destructive',
      });
      return null;
    } finally {
      setUploading(false);
      setProgress(0);
    }
  };

  const deleteFile = async (filePath: string): Promise<boolean> => {
    try {
      console.log('Tentative de suppression du fichier:', filePath);
      await axios.delete(`${API_BASE_URL}/uploads/file`, { data: { filePath } });

      console.log('Fichier supprimé avec succès:', filePath);
      toast({
        title: 'Fichier supprimé',
        description: 'Le fichier a été supprimé avec succès.',
      });

      return true;
    } catch (error: any) {
      console.error('Erreur suppression:', error.response?.data || error.message);
      toast({
        title: 'Erreur de suppression',
        description: error.response?.data?.message || error.message || 'Erreur lors de la suppression du fichier.',
        variant: 'destructive',
      });
      return false;
    }
  };

  return {
    uploadFile,
    uploadTemplate,
    copyTemplate,
    deleteFile,
    uploading,
    progress,
  };
};