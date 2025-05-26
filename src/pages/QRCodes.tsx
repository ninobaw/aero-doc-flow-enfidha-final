
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
import { QrCode, Search, Download, Eye, MoreHorizontal, Scan } from 'lucide-react';

const QRCodes = () => {
  const [searchTerm, setSearchTerm] = useState('');

  const qrCodes = [
    {
      id: '1',
      documentId: 'DOC-001',
      documentTitle: 'Rapport Sécurité Terminal A',
      qrCode: 'QR-DOC-001-1737894567890',
      generatedAt: '2025-01-26',
      downloadCount: 15,
      lastAccessed: '2025-01-26 14:30',
      status: 'ACTIVE'
    },
    {
      id: '2',
      documentId: 'DOC-002',
      documentTitle: 'Correspondance DGAC',
      qrCode: 'QR-DOC-002-1737894567891',
      generatedAt: '2025-01-25',
      downloadCount: 8,
      lastAccessed: '2025-01-25 16:45',
      status: 'ACTIVE'
    },
    {
      id: '3',
      documentId: 'DOC-003',
      documentTitle: 'PV Réunion Sécurité',
      qrCode: 'QR-DOC-003-1737894567892',
      generatedAt: '2025-01-24',
      downloadCount: 23,
      lastAccessed: '2025-01-26 09:15',
      status: 'ACTIVE'
    }
  ];

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

  const filteredQRCodes = qrCodes.filter(qr => 
    qr.documentTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
    qr.qrCode.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
                  <p className="text-2xl font-bold text-gray-900">
                    {qrCodes.filter(qr => qr.status === 'ACTIVE').length}
                  </p>
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
                        <p className="font-medium">{qrItem.documentTitle}</p>
                        <p className="text-sm text-gray-500">{qrItem.documentId}</p>
                      </div>
                    </TableCell>
                    <TableCell className="font-mono text-sm">{qrItem.qrCode}</TableCell>
                    <TableCell className="text-sm text-gray-500">{qrItem.generatedAt}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{qrItem.downloadCount}</Badge>
                    </TableCell>
                    <TableCell className="text-sm text-gray-500">{qrItem.lastAccessed}</TableCell>
                    <TableCell>{getStatusBadge(qrItem.status)}</TableCell>
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
