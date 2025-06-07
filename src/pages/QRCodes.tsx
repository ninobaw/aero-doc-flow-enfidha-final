
import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { QrCode, Search, Download, Eye, Plus } from 'lucide-react';
import { useState } from 'react';
import { useDocuments } from '@/hooks/useDocuments';

const QRCodes = () => {
  const { documents, isLoading } = useDocuments();
  const [searchTerm, setSearchTerm] = useState('');

  // ===========================================
  // DÉBUT INTÉGRATION BACKEND SUPABASE - PAGE QR CODES
  // ===========================================
  
  const filteredDocuments = documents.filter(doc => 
    doc.title.toLowerCase().includes(searchTerm.toLowerCase()) &&
    doc.qr_code
  );

  const generateQRCode = (qrCode: string) => {
    // Génération d'un QR code simple avec l'URL du document
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(qrCode)}`;
    return qrUrl;
  };

  const downloadQRCode = (document: any) => {
    const qrUrl = generateQRCode(document.qr_code);
    const link = document.createElement('a');
    link.href = qrUrl;
    link.download = `qr-${document.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.png`;
    link.click();
  };

  // ===========================================
  // FIN INTÉGRATION BACKEND SUPABASE - PAGE QR CODES
  // ===========================================

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
          <Button className="bg-aviation-sky hover:bg-aviation-sky-dark">
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
                placeholder="Rechercher un document..."
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
        ) : filteredDocuments.length === 0 ? (
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
            {filteredDocuments.map((document) => (
              <Card key={document.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <QrCode className="w-5 h-5 text-aviation-sky" />
                    <Badge variant="outline">
                      {document.airport}
                    </Badge>
                  </div>
                  <CardTitle className="text-lg line-clamp-2">
                    {document.title}
                  </CardTitle>
                  <CardDescription>
                    <Badge variant="secondary" className="text-xs">
                      {document.type}
                    </Badge>
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col items-center space-y-4">
                    {/* QR Code Image */}
                    <div className="w-32 h-32 border rounded-lg overflow-hidden bg-white">
                      <img
                        src={generateQRCode(document.qr_code)}
                        alt={`QR Code pour ${document.title}`}
                        className="w-full h-full object-contain"
                      />
                    </div>

                    {/* Code QR */}
                    <div className="text-center">
                      <p className="text-xs text-gray-500 mb-1">Code QR</p>
                      <p className="font-mono text-sm bg-gray-100 px-2 py-1 rounded">
                        {document.qr_code.substring(0, 12)}...
                      </p>
                    </div>

                    {/* Actions */}
                    <div className="flex space-x-2 w-full">
                      <Button variant="outline" size="sm" className="flex-1">
                        <Eye className="w-4 h-4 mr-1" />
                        Voir
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="flex-1"
                        onClick={() => downloadQRCode(document)}
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
      </div>
    </AppLayout>
  );
};

export default QRCodes;
