import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { useToast } from '@/hooks/use-toast';

const API_BASE_URL = 'http://localhost:5000/api';

export interface QRCodeData {
  id: string;
  document_id: string;
  qr_code: string;
  generated_at: string;
  download_count: number;
  last_accessed?: string;
  document?: {
    title: string;
    type: string;
    author: {
      first_name: string;
      last_name: string;
    };
  };
}

export const useQRCodes = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: qrCodes = [], isLoading, error } = useQuery({
    queryKey: ['qr-codes'],
    queryFn: async () => {
      // Fetch documents that have a QR code
      const response = await axios.get(`${API_BASE_URL}/documents`);
      const documentsWithQRCodes = response.data.filter((doc: any) => doc.qr_code) as any[];
      
      return documentsWithQRCodes.map(doc => ({
        id: doc.id,
        document_id: doc.id,
        qr_code: doc.qr_code,
        generated_at: doc.created_at, // Assuming generated_at is document creation date for now
        download_count: doc.downloads_count || 0, // Use document's download count
        last_accessed: doc.updated_at, // Use document's last updated date for last accessed
        document: {
          title: doc.title,
          type: doc.type,
          author: doc.author
        }
      })) as QRCodeData[];
    },
  });

  const generateQRCode = useMutation({
    mutationFn: async (documentId: string) => {
      const newQRCodeValue = `QR-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      
      // Update the document with the new QR code value
      const response = await axios.put(`${API_BASE_URL}/documents/${documentId}`, { qr_code: newQRCodeValue });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['qr-codes'] });
      queryClient.invalidateQueries({ queryKey: ['documents'] }); // Invalidate documents as well
      toast({
        title: 'QR Code généré',
        description: 'Le QR Code a été généré avec succès.',
      });
    },
    onError: (error: any) => {
      console.error('Erreur génération QR Code:', error.response?.data || error.message);
      toast({
        title: 'Erreur',
        description: error.response?.data?.message || error.message || 'Impossible de générer le QR Code.',
        variant: 'destructive',
      });
    },
  });

  return {
    qrCodes,
    isLoading,
    error,
    generateQRCode: generateQRCode.mutate,
    isGenerating: generateQRCode.isPending,
  };
};