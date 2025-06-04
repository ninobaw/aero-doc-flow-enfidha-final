
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

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
      const { data, error } = await supabase
        .from('documents')
        .select(`
          id,
          title,
          type,
          qr_code,
          created_at,
          author:profiles(first_name, last_name)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      return data.map(doc => ({
        id: doc.id,
        document_id: doc.id,
        qr_code: doc.qr_code,
        generated_at: doc.created_at,
        download_count: 0,
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
      const newQRCode = `QR-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      
      const { data, error } = await supabase
        .from('documents')
        .update({ qr_code: newQRCode })
        .eq('id', documentId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['qr-codes'] });
      toast({
        title: 'QR Code généré',
        description: 'Le QR Code a été généré avec succès.',
      });
    },
    onError: (error) => {
      console.error('Erreur génération QR Code:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de générer le QR Code.',
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
