
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
import { 
  FileText, 
  Plus, 
  Search, 
  Filter, 
  Download, 
  Eye, 
  Edit, 
  QrCode,
  MoreHorizontal 
} from 'lucide-react';

const Documents = () => {
  const documents = [
    {
      id: '1',
      title: 'Rapport Sécurité Terminal A',
      type: 'PROCES_VERBAL',
      author: 'Ahmed Ben Ali',
      createdAt: '2025-01-26',
      status: 'ACTIVE',
      airport: 'ENFIDHA',
      version: 'v1.2'
    },
    {
      id: '2',
      title: 'Correspondance DGAC',
      type: 'CORRESPONDANCE',
      author: 'Fatma Trabelsi',
      createdAt: '2025-01-25',
      status: 'ACTIVE',
      airport: 'MONASTIR',
      version: 'v1.0'
    },
    {
      id: '3',
      title: 'Formulaire Maintenance Équipements',
      type: 'FORMULAIRE_DOC',
      author: 'Mohamed Sassi',
      createdAt: '2025-01-24',
      status: 'DRAFT',
      airport: 'ENFIDHA',
      version: 'v0.9'
    },
    {
      id: '4',
      title: 'PV Réunion Sécurité Mensuelle',
      type: 'PROCES_VERBAL',
      author: 'Leila Hamdi',
      createdAt: '2025-01-23',
      status: 'ACTIVE',
      airport: 'MONASTIR',
      version: 'v1.1'
    }
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return <Badge className="bg-green-100 text-green-800">Actif</Badge>;
      case 'DRAFT':
        return <Badge className="bg-yellow-100 text-yellow-800">Brouillon</Badge>;
      case 'ARCHIVED':
        return <Badge className="bg-gray-100 text-gray-800">Archivé</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getTypeBadge = (type: string) => {
    const colors = {
      'FORMULAIRE_DOC': 'bg-blue-100 text-blue-800',
      'CORRESPONDANCE': 'bg-purple-100 text-purple-800',
      'PROCES_VERBAL': 'bg-orange-100 text-orange-800',
      'GENERAL': 'bg-gray-100 text-gray-800'
    };
    
    const labels = {
      'FORMULAIRE_DOC': 'Formulaire',
      'CORRESPONDANCE': 'Correspondance',
      'PROCES_VERBAL': 'Procès-Verbal',
      'GENERAL': 'Général'
    };

    return (
      <Badge className={colors[type as keyof typeof colors]}>
        {labels[type as keyof typeof labels]}
      </Badge>
    );
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* En-tête */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Gestion des Documents</h1>
            <p className="text-gray-500 mt-1">
              Gérez tous vos documents aéroportuaires
            </p>
          </div>
          <Button className="bg-aviation-sky hover:bg-aviation-sky-dark">
            <Plus className="w-4 h-4 mr-2" />
            Nouveau Document
          </Button>
        </div>

        {/* Filtres et recherche */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Filtres et Recherche</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="Rechercher par titre, auteur ou contenu..."
                    className="pl-10"
                  />
                </div>
              </div>
              <Button variant="outline">
                <Filter className="w-4 h-4 mr-2" />
                Filtres
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Liste des documents */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <FileText className="w-5 h-5 mr-2 text-aviation-sky" />
              Documents ({documents.length})
            </CardTitle>
            <CardDescription>
              Liste de tous les documents dans le système
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Titre</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Auteur</TableHead>
                  <TableHead>Aéroport</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Version</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {documents.map((document) => (
                  <TableRow key={document.id} className="hover:bg-gray-50">
                    <TableCell className="font-medium">{document.title}</TableCell>
                    <TableCell>{getTypeBadge(document.type)}</TableCell>
                    <TableCell>{document.author}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{document.airport}</Badge>
                    </TableCell>
                    <TableCell>{getStatusBadge(document.status)}</TableCell>
                    <TableCell className="text-sm text-gray-500">{document.version}</TableCell>
                    <TableCell className="text-sm text-gray-500">{document.createdAt}</TableCell>
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
                            Voir
                          </DropdownMenuItem>
                          <DropdownMenuItem className="cursor-pointer">
                            <Edit className="mr-2 h-4 w-4" />
                            Modifier
                          </DropdownMenuItem>
                          <DropdownMenuItem className="cursor-pointer">
                            <QrCode className="mr-2 h-4 w-4" />
                            QR Code
                          </DropdownMenuItem>
                          <DropdownMenuItem className="cursor-pointer">
                            <Download className="mr-2 h-4 w-4" />
                            Télécharger
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

export default Documents;
