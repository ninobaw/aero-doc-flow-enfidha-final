import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { QrCode, Search, Download, Eye, Plus } from 'lucide-react';
import { useState } from 'react';
import { useQRCodes } from '@/hooks/useQRCodes';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { QRCodeGenerator } from '@/components/qr/QRCodeGenerator'; // Import the QRCodeGenerator component

const QRCodes = () => {
  const { qrCodes, isLoading, generateQRCode: generateNewQRCode } = useQRCodes();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedQRCodeData, setSelectedQRCodeData] = useState<any>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);

  const filteredQRCodes = qrCodes.filter(qr => 
    qr.document?.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    qr.qr_code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const generateQRCodeImage = (qrCodeValue: string) => {
    // This is a placeholder for a real QR code image generation service or library.
    // For now, it uses a public API for demonstration.
    return `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(qrCodeValue)}`;
  };

  const handleDownloadQRCode = (qrCodeData: any) => {
    const qrUrl = generateQRCodeImage(qrCodeData.qr_code);
    const link = document.createElement('a');
    link.href = qrUrl;
    link.download = `qr-${qrCodeData.document?.title.replace(/[^a-z0-9]/gi, '_').toLowerCase() || qrCodeData.id}.png`;
    link.click();
  };

  const handleViewQRCode = (qrData: any) => {
    setSelectedQRCodeData(qrData);
    setIsViewDialogOpen(true);
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">QR Codes</h1>
            <p className="text-gray-500 mt-1">
              Générer et gérer les codes QR des documents
            </p>
          </div>
          {/* The "Générer QR Code" button here would typically open a dialog to select a document to generate a QR for.
              For now, the useQRCodes hook has a generateQRCode mutation that can be triggered with a document ID.
              This button is left as a placeholder for future implementation of a selection dialog. */}
          <Button className="bg-aviation-sky hover:bg-aviation-sky-dark" onClick={() => alert('Fonctionnalité de génération de QR code pour un document spécifique à implémenter.')}>
            <Plus className="w-4 h-4 mr-2" />
            Générer QR Code
          </Button>
        </div>

        {/* Recherche */}
        <Card>
          <CardContent className="p-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Rechercher un document par titre ou code QR..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </CardContent>
        </Card>

        {/* Liste des QR Codes */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardContent className="p-6">
                  <div className="flex flex-col items-center space-y-4">
                    <div className="w-32 h-32 bg-gray-200 rounded"></div>
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : filteredQRCodes.length === 0 ? (
          <Card className="text-center p-8">
            <CardContent>
              <QrCode className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Aucun QR Code trouvé
              </h3>
              <p className="text-gray-500">
                {searchTerm ? 'Aucun document ne correspond à votre recherche.' : 'Aucun document avec QR Code disponible.'}
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredQRCodes.map((qrData) => (
              <Card key={qrData.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <QrCode className="w-5 h-5 text-aviation-sky" />
                    <Badge variant="outline">
                      {qrData.document?.airport || 'N/A'}
                    </Badge>
                  </div>
                  <CardTitle className="text-lg line-clamp-2">
                    {qrData.document?.title || 'Document sans titre'}
                  </CardTitle>
                  <CardDescription>
                    <Badge variant="secondary" className="text-xs">
                      {qrData.document?.type || 'N/A'}
                    </Badge>
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col items-center space-y-4">
                    {/* QR Code Image */}
                    <div className="w-32 h-32 border rounded-lg overflow-hidden bg-white">
                      <img
                        src={generateQRCodeImage(qrData.qr_code)}
                        alt={`QR Code pour ${qrData.document?.title || 'Document'}`}
                        className="w-full h-full object-contain"
                      />
                    </div>

                    {/* Code QR */}
                    <div className="text-center">
                      <p className="text-xs text-gray-500 mb-1">Code QR</p>
                      <p className="font-mono text-sm bg-gray-100 px-2 py-1 rounded">
                        {qrData.qr_code.substring(0, 12)}...
                      </p>
                    </div>

                    {/* Actions */}
                    <div className="flex space-x-2 w-full">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="flex-1"
                        onClick={() => handleViewQRCode(qrData)} // Open dialog on click
                      >
                        <Eye className="w-4 h-4 mr-1" />
                        Voir
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="flex-1"
                        onClick={() => handleDownloadQRCode(qrData)}
                      >
                        <Download className="w-4 h-4 mr-1" />
                        Télécharger
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Dialog for viewing QR Code details */}
        {selectedQRCodeData && (
          <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Détails du QR Code</DialogTitle>
              </DialogHeader>
              <QRCodeGenerator 
                documentId={selectedQRCodeData.document_id} 
                documentTitle={selectedQRCodeData.document?.title || 'Document'}
                // The onQRCodeGenerated prop is not strictly needed here as we are viewing existing QR codes
                // but it's part of the component's interface.
                onQRCodeGenerated={() => {}} 
              />
            </DialogContent>
          </Dialog>
        )}
      </div>
    </AppLayout>
  );
};

export default QRCodes;