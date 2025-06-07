
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { QrCode, Download, Eye, History } from 'lucide-react';
import { QRCodeData } from '@/shared/types';
import { toast } from '@/hooks/use-toast';

interface QRCodeGeneratorProps {
  documentId: string;
  documentTitle: string;
  onQRCodeGenerated: (qrData: QRCodeData) => void;
}

export const QRCodeGenerator: React.FC<QRCodeGeneratorProps> = ({
  documentId,
  documentTitle,
  onQRCodeGenerated
}) => {
  const [qrData, setQrData] = useState<QRCodeData | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    // Génération automatique du QR code lors de la création du document
    generateQRCode();
  }, [documentId]);

  const generateQRCode = async () => {
    setIsGenerating(true);
    
    // Simulation de la génération du QR code
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const newQRData: QRCodeData = {
      id: `qr-${documentId}-${Date.now()}`,
      documentId,
      qrCode: `QR-${documentId.toUpperCase()}-${Date.now()}`,
      generatedAt: new Date(),
      downloadCount: 0,
      lastAccessed: undefined
    };

    setQrData(newQRData);
    onQRCodeGenerated(newQRData);
    setIsGenerating(false);

    toast({
      title: "QR Code généré",
      description: "Le QR code a été généré automatiquement pour ce document"
    });
  };

  const handleDownload = () => {
    if (qrData) {
      // Simulation du téléchargement
      const updatedQRData = {
        ...qrData,
        downloadCount: qrData.downloadCount + 1,
        lastAccessed: new Date()
      };
      setQrData(updatedQRData);
      
      toast({
        title: "QR Code téléchargé",
        description: "Le QR code a été téléchargé avec succès"
      });
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center">
            <QrCode className="w-5 h-5 mr-2 text-aviation-sky" />
            QR Code du Document
          </div>
          {qrData && (
            <Badge className="bg-green-100 text-green-800">Généré</Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isGenerating ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-aviation-sky mx-auto"></div>
            <p className="mt-4 text-gray-600">Génération du QR code...</p>
          </div>
        ) : qrData ? (
          <div className="space-y-4">
            <div className="text-center">
              <div className="w-32 h-32 bg-gray-100 border-2 border-dashed border-gray-300 mx-auto rounded-lg flex items-center justify-center">
                <QrCode className="w-16 h-16 text-gray-400" />
              </div>
              <p className="mt-2 text-sm font-mono text-gray-600">{qrData.qrCode}</p>
            </div>
            
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-gray-600">Téléchargements:</p>
                <p className="font-medium">{qrData.downloadCount}</p>
              </div>
              <div>
                <p className="text-gray-600">Dernier accès:</p>
                <p className="font-medium">
                  {qrData.lastAccessed ? 
                    qrData.lastAccessed.toLocaleDateString('fr-FR') : 
                    'Jamais'
                  }
                </p>
              </div>
            </div>

            <div className="flex space-x-2">
              <Button onClick={handleDownload} className="flex-1">
                <Download className="w-4 h-4 mr-2" />
                Télécharger
              </Button>
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="outline" className="flex-1">
                    <Eye className="w-4 h-4 mr-2" />
                    Aperçu
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Aperçu du QR Code</DialogTitle>
                  </DialogHeader>
                  <div className="text-center py-8">
                    <div className="w-48 h-48 bg-gray-100 border-2 border-dashed border-gray-300 mx-auto rounded-lg flex items-center justify-center">
                      <QrCode className="w-24 h-24 text-gray-400" />
                    </div>
                    <p className="mt-4 font-mono text-lg">{qrData.qrCode}</p>
                    <p className="text-gray-600">{documentTitle}</p>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        ) : (
          <div className="text-center py-8">
            <QrCode className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">Aucun QR code généré</p>
            <Button onClick={generateQRCode} className="mt-4">
              Générer QR Code
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
