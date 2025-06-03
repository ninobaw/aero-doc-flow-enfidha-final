import { useState } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FileText, Plus, Search, Filter } from 'lucide-react';
import { DocumentsList } from '@/components/documents/DocumentsList';
import { useDocuments } from '@/hooks/useDocuments';
import { useNavigate } from 'react-router-dom';

const Documents = () => {
  const navigate = useNavigate();
  const { documents, isLoading, deleteDocument } = useDocuments();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  // ===========================================
  // DÉBUT INTÉGRATION BACKEND SUPABASE - PAGE DOCUMENTS
  // ===========================================
  
  const filteredDocuments = documents.filter(doc => {
    const matchesSearch = doc.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         doc.content?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'all' || doc.type === filterType;
    const matchesStatus = filterStatus === 'all' || doc.status === filterStatus;
    
    return matchesSearch && matchesType && matchesStatus;
  });

  const handleDelete = (id: string) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce document ?')) {
      deleteDocument(id);
    }
  };

  // ===========================================
  // FIN INTÉGRATION BACKEND SUPABASE - PAGE DOCUMENTS
  // ===========================================

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Documents</h1>
            <p className="text-gray-500 mt-1">
              Gérer tous vos documents aéroportuaires
            </p>
          </div>
          <Button 
            onClick={() => navigate('/documents/nouveau')}
            className="bg-aviation-sky hover:bg-aviation-sky-dark"
          >
            <Plus className="w-4 h-4 mr-2" />
            Nouveau Document
          </Button>
        </div>

        {/* Filtres et recherche */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Filter className="w-5 h-5 mr-2" />
              Filtres et Recherche
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Rechercher dans les documents..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              
              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger>
                  <SelectValue placeholder="Tous les types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les types</SelectItem>
                  <SelectItem value="QUALITE_DOC">Document Qualité</SelectItem>
                  <SelectItem value="NOUVEAU_DOC">Nouveau Document</SelectItem>
                  <SelectItem value="CORRESPONDANCE">Correspondance</SelectItem>
                  <SelectItem value="PROCES_VERBAL">Procès-Verbal</SelectItem>
                  <SelectItem value="FORMULAIRE_DOC">Formulaire</SelectItem>
                </SelectContent>
              </Select>

              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger>
                  <SelectValue placeholder="Tous les statuts" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les statuts</SelectItem>
                  <SelectItem value="DRAFT">Brouillon</SelectItem>
                  <SelectItem value="ACTIVE">Actif</SelectItem>
                  <SelectItem value="ARCHIVED">Archivé</SelectItem>
                </SelectContent>
              </Select>

              <Button variant="outline" onClick={() => {
                setSearchTerm('');
                setFilterType('all');
                setFilterStatus('all');
              }}>
                Réinitialiser
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Liste des documents */}
        <DocumentsList 
          documents={filteredDocuments}
          isLoading={isLoading}
          onDelete={handleDelete}
        />
      </div>
    </AppLayout>
  );
};

export default Documents;
