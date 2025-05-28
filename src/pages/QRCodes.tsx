
import { useState } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { QrCode, Search, Download, Eye, MoreHorizontal, Scan, FileText } from 'lucide-react';
import { QRCodeGenerator } from '@/components/qr/QRCodeGenerator';
import { DocumentLifecycle } from '@/components/qr/DocumentLifecycle';
import { QRCodeData, DocumentHistory } from '@/shared/types';

const QRCodes = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [qrCodes, setQrCodes] = useState<QRCodeData[]>([
    {
      id: '1',
      documentId: 'DOC-001',
      qrCode: 'QR-DOC-001-1737894567890',
      generatedAt: new Date('2025-01-26'),
      downloadCount: 15,
      lastAccessed: new Date('2025-01-26')
    },
    {
      id: '2',
      documentId: 'DOC-002',
      qrCode: 'QR-DOC-002-1737894567891',
      generatedAt: new Date('2025-01-25'),
      downloadCount: 8,
      lastAccessed: new Date('2025-01-25')
    },
    {
      id: '3',
      documentId: 'DOC-003',
      qrCode: 'QR-DOC-003-1737894567892',
      generatedAt: new Date('2025-01-24'),
      downloadCount: 23,
      lastAccessed: new Date('2025-01-26')
    }
  ]);

  const mockDocuments = [
    { id: 'DOC-001', title: 'Rapport Sécurité Terminal A' },
    { id: 'DOC-002', title: 'Correspondance DGAC' },
    { id: 'DOC-003', title: 'PV Réunion Sécurité' }
  ];

  const mockDocumentHistory: DocumentHistory[] = [
    {
      id: 'hist-1',
      documentId: 'DOC-001',
      action: 'CREATED',
      userId: 'user-1',
      timestamp: new Date('2025-01-20'),
      version: 1,
      comment: 'Document créé'
    },
    {
      id: 'hist-2',
      documentId: 'DOC-001',
      action: 'VIEWED',
      userId: 'user-2',
      timestamp: new Date('2025-01-22'),
      version: 1,
      comment: 'Consultation via QR Code'
    },
    {
      id: 'hist-3',
      documentId: 'DOC-001',
      action: 'DOWNLOADED',
      userId: 'user-1',
      timestamp: new Date('2025-01-24'),
      version: 1,
      comment: 'Téléchargement via QR Code'
    },
    {
      id: 'hist-4',
      documentId: 'DOC-001',
      action: 'UPDATED',
      userId: 'user-1',
      timestamp: new Date('2025-01-26'),
      version: 2,
      comment: 'Mise à jour du contenu'
    }
  ];

  const handleQRCodeGenerated = (newQRData: QRCodeData) => {
    setQrCodes([...qrCodes, newQRData]);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return <Badge className="bg-green-100 text-green-800">Actif</Badge>;
      case 'EXPIRED':
        return <Badge className="bg-red-100 text-red-800">Expiré</Badge>;
      case 'DISABLED':
        return <Badge className="bg-gray-100 text-gray-800">Désactivé</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getDocumentTitle = (documentId: string) => {
    const doc = mockDocuments.find(d => d.id === documentId);
    return doc ? doc.title : documentId;
  };

  const filteredQRCodes = qrCodes.filter(qr => {
    const docTitle = getDocumentTitle(qr.documentId);
    return docTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
           qr.qrCode.toLowerCase().includes(searchTerm.toLowerCase());
  });

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Gestion des QR Codes</h1>
            <p className="text-gray-500 mt-1">
              Générez et gérez les QR codes des documents
            </p>
          </div>
          <Button className="bg-aviation-sky hover:bg-aviation-sky-dark">
            <QrCode className="w-4 h-4 mr-2" />
            Générer QR Code
          </Button>
        </div>

        {/* Statistiques */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <QrCode className="h-8 w-8 text-aviation-sky" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total QR Codes</p>
                  <p className="text-2xl font-bold text-gray-900">{qrCodes.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Scan className="h-8 w-8 text-green-500" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Scans Total</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {qrCodes.reduce((sum, qr) => sum + qr.downloadCount, 0)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Eye className="h-8 w-8 text-blue-500" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Actifs</p>
                  <p className="text-2xl font-bold text-gray-900">{qrCodes.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Download className="h-8 w-8 text-purple-500" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Téléchargements</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {qrCodes.reduce((sum, qr) => sum + qr.downloadCount, 0)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Générateur QR Code pour test */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <QRCodeGenerator
            documentId="DOC-NEW"
            documentTitle="Nouveau Document Test"
            onQRCodeGenerated={handleQRCodeGenerated}
          />
          <DocumentLifecycle
            documentId="DOC-001"
            history={mockDocumentHistory}
          />
        </div>

        {/* Recherche */}
        <Card>
          <CardHeader>
            <CardTitle>Rechercher QR Codes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Rechercher par titre de document ou code QR..."
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </CardContent>
        </Card>

        {/* Liste des QR Codes */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <QrCode className="w-5 h-5 mr-2 text-aviation-sky" />
              QR Codes Générés ({filteredQRCodes.length})
            </CardTitle>
            <CardDescription>
              Liste de tous les QR codes générés pour les documents
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Document</TableHead>
                  <TableHead>Code QR</TableHead>
                  <TableHead>Date Génération</TableHead>
                  <TableHead>Scans</TableHead>
                  <TableHead>Dernier Accès</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredQRCodes.map((qrItem) => (
                  <TableRow key={qrItem.id} className="hover:bg-gray-50">
                    <TableCell>
                      <div>
                        <p className="font-medium">{getDocumentTitle(qrItem.documentId)}</p>
                        <p className="text-sm text-gray-500">{qrItem.documentId}</p>
                      </div>
                    </TableCell>
                    <TableCell className="font-mono text-sm">{qrItem.qrCode}</TableCell>
                    <TableCell className="text-sm text-gray-500">
                      {qrItem.generatedAt.toLocaleDateString('fr-FR')}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{qrItem.downloadCount}</Badge>
                    </TableCell>
                    <TableCell className="text-sm text-gray-500">
                      {qrItem.lastAccessed ? qrItem.lastAccessed.toLocaleDateString('fr-FR') : 'Jamais'}
                    </TableCell>
                    <TableCell>{getStatusBadge('ACTIVE')}</TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="bg-white">
                          <DropdownMenuItem className="cursor-pointer">
                            <Eye className="mr-2 h-4 w-4" />
                            Voir QR Code
                          </DropdownMenuItem>
                          <DropdownMenuItem className="cursor-pointer">
                            <Download className="mr-2 h-4 w-4" />
                            Télécharger
                          </DropdownMenuItem>
                          <DropdownMenuItem className="cursor-pointer">
                            <Scan className="mr-2 h-4 w-4" />
                            Historique Scans
                          </DropdownMenuItem>
                          <DropdownMenuItem className="cursor-pointer">
                            <FileText className="mr-2 h-4 w-4" />
                            Cycle de vie
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
};

export default QRCodes;
