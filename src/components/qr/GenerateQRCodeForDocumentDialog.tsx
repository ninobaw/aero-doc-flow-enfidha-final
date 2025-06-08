import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, QrCode } from 'lucide-react';
import { useDocuments } from '@/hooks/useDocuments';
import { useQRCodes } from '@/hooks/useQRCodes';
import { useToast } from '@/hooks/use-toast';

export const GenerateQRCodeForDocumentDialog: React.FC = () => {
  const [open, setOpen] = useState(false);
  const [selectedDocumentId, setSelectedDocumentId] = useState<string | null>(null);
  
  const { documents, isLoading: isLoadingDocuments } = useDocuments();
  const { generateQRCode, isGenerating } = useQRCodes();
  const { toast } = useToast();

  const documentsWithoutQrCode = documents.filter(doc => !doc.qr_code);

  const handleGenerate = () => {
    if (!selectedDocumentId) {
      toast({
        title: "Sélection requise",
        description: "Veuillez sélectionner un document pour générer le QR code.",
        variant: "destructive"
      });
      return;
    }

    generateQRCode(selectedDocumentId, {
      onSuccess: () => {
        setSelectedDocumentId(null);
        setOpen(false);
      },
      onError: (error) => {
        console.error("Erreur lors de la génération du QR code:", error);
        toast({
          title: "Erreur de génération",
          description: "Impossible de générer le QR code pour le document sélectionné.",
          variant: "destructive"
        });
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-aviation-sky hover:bg-aviation-sky-dark">
          <Plus className="w-4 h-4 mr-2" />
          Générer QR Code
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Générer un QR Code pour un document</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <p className="text-sm text-gray-600">
            Sélectionnez un document existant pour lequel vous souhaitez générer un nouveau QR code.
          </p>
          <div>
            <Label htmlFor="document-select">Document *</Label>
            <Select
              value={selectedDocumentId || ''}
              onValueChange={setSelectedDocumentId}
              disabled={isLoadingDocuments || isGenerating}
            >
              <SelectTrigger id="document-select">
                <SelectValue placeholder="Sélectionner un document" />
              </SelectTrigger>
              <SelectContent>
                {isLoadingDocuments ? (
                  <SelectItem value="loading" disabled>Chargement des documents...</SelectItem>
                ) : documentsWithoutQrCode.length === 0 ? (
                  <SelectItem value="no-documents" disabled>Aucun document sans QR code disponible</SelectItem>
                ) : (
                  documentsWithoutQrCode.map(doc => (
                    <SelectItem key={doc.id} value={doc.id}>
                      {doc.title} ({doc.airport})
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>
          <div className="flex justify-end space-x-2 pt-4">
            <Button variant="outline" onClick={() => setOpen(false)} disabled={isGenerating}>
              Annuler
            </Button>
            <Button onClick={handleGenerate} disabled={!selectedDocumentId || isGenerating}>
              <QrCode className="w-4 h-4 mr-2" />
              {isGenerating ? 'Génération...' : 'Générer'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};