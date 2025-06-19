import { useState } from 'react';
import axios from 'axios';
import { useToast } from '@/hooks/use-toast';

const API_BASE_URL = 'http://localhost:5000/api';

export interface UploadOptions {
  documentType: string; // Used by backend to create subfolders (e.g., 'formulaires', 'general', 'correspondances')
  allowedTypes?: string[];
  maxSize?: number; // en MB
  scopeCode?: string; // New: for specific document types like correspondences
  departmentCode?: string; // New: for specific document types
  documentTypeCode?: string; // New: for specific document types
  correspondenceType?: 'INCOMING' | 'OUTGOING'; // New: for correspondences
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
      if (options.scopeCode) { // Pass scope code if provided
        formData.append('scopeCode', options.scopeCode);
      }
      if (options.departmentCode) { // Pass department code if provided
        formData.append('departmentCode', options.departmentCode);
      }
      if (options.documentTypeCode) { // Pass document type code if provided
        formData.append('documentTypeCode', options.documentTypeCode);
      }
      if (options.correspondenceType) { // Pass correspondence type if provided
        formData.append('correspondenceType', options.correspondenceType);
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
        variant: 'success', // Appliquer la variante 'success'
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
        variant: 'destructive', // Appliquer la variante 'destructive'
      });
      return null;
    } finally {
      setUploading(false);
      setProgress(0);
    }
  };

  const uploadTemplate = async (
    file: File,
    options: Omit<UploadOptions, 'documentType' | 'scopeCode' | 'departmentCode' | 'documentTypeCode' | 'correspondenceType'> // Templates go into a 'templates' folder
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
        variant: 'success', // Appliquer la variante 'success'
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
        variant: 'destructive', // Appliquer la variante 'destructive'
      });
      return null;
    } finally {
      setUploading(false);
      setProgress(0);
    }
  };

  const copyTemplate = async (
    templateFilePath: string,
    options: Omit<UploadOptions, 'allowedTypes' | 'maxSize' | 'correspondenceType'> // Need documentType, scopeCode, departmentCode, documentTypeCode
  ): Promise<{ url: string; path: string } | null> => {
    try {
      setUploading(true);
      setProgress(0); // Reset progress for copy operation

      console.log('Début de la copie du modèle:', templateFilePath, 'vers le type:', options.documentType);
      const response = await axios.post(`${API_BASE_URL}/uploads/copy-template`, {
        templateFilePath,
        documentType: options.documentType,
        scopeCode: options.scopeCode,
        departmentCode: options.departmentCode,
        documentTypeCode: options.documentTypeCode,
      });

      console.log('Réponse de la copie du modèle:', response.data);
      toast({
        title: 'Modèle copié',
        description: 'Le modèle a été copié pour le nouveau document.',
        variant: 'success', // Appliquer la variante 'success'
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
        variant: 'destructive', // Appliquer la variante 'destructive'
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
        variant: 'success', // Appliquer la variante 'success'
      });

      return true;
    } catch (error: any) {
      console.error('Erreur suppression:', error.response?.data || error.message);
      toast({
        title: 'Erreur de suppression',
        description: error.response?.data?.message || error.message || 'Erreur lors de la suppression du fichier.',
        variant: 'destructive', // Appliquer la variante 'destructive'
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