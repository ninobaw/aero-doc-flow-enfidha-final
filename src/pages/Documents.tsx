import React, { useState } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FileText, Plus, Search, Filter } from 'lucide-react'; // Removed Upload icon
import { DocumentsList } from '@/components/documents/DocumentsList';
import { useDocuments, DocumentData } from '@/hooks/useDocuments';
import { useNavigate } from 'react-router-dom';
import { EditDocumentDialog } from '@/components/documents/EditDocumentDialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DocumentCreationForm } from '@/components/documents/DocumentCreationForm';
// Removed DocumentImportForm import
import { TagInput } from '@/components/ui/TagInput';

const Documents = () => {
  const navigate = useNavigate();
  const { documents, isLoading, deleteDocument } = useDocuments();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterAirport, setFilterAirport] = useState<string>('all');
  const [filterTags, setFilterTags] = useState<string[]>([]);

  const [selectedDocumentForEdit, setSelectedDocumentForEdit] = useState<DocumentData | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  
  const filteredDocuments = documents.filter(doc => {
    const matchesSearch = doc.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         doc.content?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         doc.qr_code.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'all' || doc.type === filterType;
    const matchesStatus = filterStatus === 'all' || doc.status === filterStatus;
    const matchesAirport = filterAirport === 'all' || doc.airport === filterAirport;
    
    const matchesTags = filterTags.length === 0 || 
                        (doc.tags && filterTags.every(tag => doc.tags.includes(tag)));

    return matchesSearch && matchesType && matchesStatus && matchesAirport && matchesTags;
  });

  const handleDelete = (id: string) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce document ?')) {
      deleteDocument(id);
    }
  };

  const handleEdit = (document: DocumentData) => {
    setSelectedDocumentForEdit(document);
    setIsEditDialogOpen(true);
  };

  const handleResetFilters = () => {
    setSearchTerm('');
    setFilterType('all');
    setFilterStatus('all');
    setFilterAirport('all');
    setFilterTags([]);
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Documents</h1>
          <p className="text-gray-500 mt-1">
            Gérer tous vos documents aéroportuaires
          </p>
        </div>

        <Tabs defaultValue="list" className="w-full">
          <TabsList className="grid w-full grid-cols-2 max-w-lg"> {/* Changed grid-cols-3 to grid-cols-2 */}
            <TabsTrigger value="list" className="flex items-center space-x-2">
              <FileText className="w-4 h-4" />
              <span>Liste des documents</span>
            </TabsTrigger>
            <TabsTrigger value="create" className="flex items-center space-x-2">
              <Plus className="w-4 h-4" />
              <span>Créer un document</span>
            </TabsTrigger>
            {/* Removed "Importer un document" tab */}
          </TabsList>

          <TabsContent value="list" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Filter className="w-5 h-5 mr-2" />
                  Filtres et Recherche
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                  <div className="relative md:col-span-2">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                      placeholder="Rechercher par titre, contenu ou code QR..."
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
                      <SelectItem value="GENERAL">Général</SelectItem>
                      <SelectItem value="TEMPLATE">Modèle</SelectItem>
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

                  <Select value={filterAirport} onValueChange={setFilterAirport}>
                    <SelectTrigger>
                      <SelectValue placeholder="Tous les aéroports" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tous les aéroports</SelectItem>
                      <SelectItem value="ENFIDHA">Enfidha</SelectItem>
                      <SelectItem value="MONASTIR">Monastir</SelectItem>
                      <SelectItem value="GENERALE">Général</SelectItem>
                    </SelectContent>
                  </Select>

                  <div className="md:col-span-3">
                    <TagInput
                      tags={filterTags}
                      onTagsChange={setFilterTags}
                      placeholder="Filtrer par tags (ex: sécurité, audit)"
                    />
                  </div>
                  <Button variant="outline" onClick={handleResetFilters} className="md:col-span-1">
                    Réinitialiser les filtres
                  </Button>
                </div>
              </CardContent>
            </Card>
            <DocumentsList 
              documents={filteredDocuments}
              isLoading={isLoading}
              onDelete={handleDelete}
              onEdit={handleEdit}
            />
          </TabsContent>

          <TabsContent value="create" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Plus className="w-5 h-5 mr-2 text-aviation-sky" />
                  Créer un nouveau document
                </CardTitle>
                <CardDescription>
                  Remplissez le formulaire pour créer un document à partir de zéro.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <DocumentCreationForm />
              </CardContent>
            </Card>
          </TabsContent>

          {/* Removed "import" tab content */}
        </Tabs>
      </div>

      {selectedDocumentForEdit && (
        <EditDocumentDialog
          document={selectedDocumentForEdit}
          open={isEditDialogOpen}
          onOpenChange={setIsEditDialogOpen}
        />
      )}
    </AppLayout>
  );
};

export default Documents;