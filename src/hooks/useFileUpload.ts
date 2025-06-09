import { useState } from 'react';
import axios from 'axios';
import { useToast } from '@/hooks/use-toast';

const API_BASE_URL = 'http://localhost:5000/api';

export interface UploadOptions {
  mainFolder: string; // e.g., 'correspondances', 'profiles', 'documents', 'templates'
  subFolder1?: string; // e.g., airport name for correspondences/documents, or user ID for profiles
  subFolder2?: string; // e.g., 'incoming'/'outgoing' for correspondences
  allowedTypes?: string[];
  maxSize?: number; // in MB
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

      console.log('Début de l\'upload du fichier:', file.name, 'Options:', options);

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
      formData.append('mainFolder', options.mainFolder);
      if (options.subFolder1) {
        formData.append('subFolder1', options.subFolder1);
      }
      if (options.subFolder2) {
        formData.append('subFolder2', options.subFolder2);
      }

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
    options: Omit<UploadOptions, 'mainFolder' | 'subFolder1' | 'subFolder2'> // Templates go into a 'templates' folder
  ): Promise<{ url: string; path: string } | null> => {
    // This function will now use the generic uploadFile, fixing the mainFolder to 'templates'
    return uploadFile(file, {
      mainFolder: 'templates',
      ...options,
    });
  };

  const copyTemplate = async (
    templateFilePath: string, // This is the relative path from 'uploads'
    targetDocumentType: string, // This is the DocumentType enum value (e.g., 'CORRESPONDANCE', 'FORMULAIRE_DOC')
    targetAirport?: string, // Optional: for specific document types like CORRESPONDANCE
    targetCorrespondenceType?: 'incoming' | 'outgoing' // Optional: for CORRESPONDANCE
  ): Promise<{ url: string; path: string } | null> => {
    try {
      setUploading(true);
      setProgress(0); // Reset progress for copy operation

      console.log('Début de la copie du modèle:', templateFilePath, 'vers le type:', targetDocumentType);
      
      // Determine the target main folder and subfolders based on document type
      let mainFolder = 'documents'; // Default for general documents
      let subFolder1: string | undefined;
      let subFolder2: string | undefined;

      if (targetDocumentType === 'CORRESPONDANCE') {
        mainFolder = 'correspondances';
        subFolder1 = targetAirport;
        subFolder2 = targetCorrespondenceType;
      } else if (targetDocumentType === 'FORMULAIRE_DOC') {
        mainFolder = 'formulaires';
        subFolder1 = targetAirport; // Assuming forms might also be organized by airport
      }
      // Add other document types as needed

      const response = await axios.post(`${API_BASE_URL}/uploads/copy-template`, {
        templateFilePath,
        mainFolder, // Pass new mainFolder
        subFolder1, // Pass new subFolder1
        subFolder2, // Pass new subFolder2
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