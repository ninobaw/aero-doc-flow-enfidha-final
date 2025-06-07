import { useState } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FilePlus, Upload, FileText, Save, Eye, X } from 'lucide-react';
import { useDocuments } from '@/hooks/useDocuments';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useFileUpload } from '@/hooks/useFileUpload';
import { useToast } from '@/hooks/use-toast';

const NouveauDoc = () => {
  const { user } = useAuth();
  const { createDocument, isCreating } = useDocuments();
  const { uploadFile, uploading: isUploadingFile } = useFileUpload();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  // État pour le formulaire direct
  const [formData, setFormData] = useState({
    titre: '',
    reference: '',
    aeroport: '' as 'ENFIDHA' | 'MONASTIR' | '',
    type: '' as 'FORMULAIRE_DOC' | 'CORRESPONDANCE' | 'PROCES_VERBAL' | 'QUALITE_DOC' | 'NOUVEAU_DOC' | 'GENERAL' | '',
    version: '1.0',
    responsable: '',
    description: '',
    contenu: ''
  });

  // État pour l'import de fichier
  const [importData, setImportData] = useState({
    titre: '',
    aeroport: '' as 'ENFIDHA' | 'MONASTIR' | '',
    type: '' as 'FORMULAIRE_DOC' | 'CORRESPONDANCE' | 'PROCES_VERBAL' | 'QUALITE_DOC' | 'NOUVEAU_DOC' | 'GENERAL' | '',
    description: ''
  });

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      
      // Créer une URL de prévisualisation pour les images et PDFs
      if (file.type.startsWith('image/') || file.type === 'application/pdf') {
        if (previewUrl) {
          URL.revokeObjectURL(previewUrl);
        }
        const url = URL.createObjectURL(file);
        setPreviewUrl(url);
      } else {
        if (previewUrl) {
          URL.revokeObjectURL(previewUrl);
        }
        setPreviewUrl(null); // No preview for other file types
      }
    }
  };

  const removeFile = () => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    setSelectedFile(null);
    setPreviewUrl(null);
  };

  const handleFormSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    
    if (!user) {
      toast({
        title: 'Erreur d\'authentification',
        description: 'Vous devez être connecté pour créer un document.',
        variant: 'destructive',
      });
      return;
    }

    if (!formData.titre.trim() || !formData.aeroport || !formData.type) {
      toast({
        title: 'Champs manquants',
        description: 'Veuillez remplir tous les champs obligatoires (Titre, Aéroport, Type).',
        variant: 'destructive',
      });
      return;
    }

    const documentData = {
      title: formData.titre,
      content: formData.contenu,
      type: formData.type as 'FORMULAIRE_DOC' | 'CORRESPONDANCE' | 'PROCES_VERBAL' | 'QUALITE_DOC' | 'NOUVEAU_DOC' | 'GENERAL',
      airport: formData.aeroport as 'ENFIDHA' | 'MONASTIR',
      // Additional metadata can be stringified into content or added as separate fields if schema allows
      // For now, reference, version, responsable are not directly mapped to backend Document model fields
      // They could be part of the 'content' JSON string if needed.
    };

    createDocument(documentData, {
      onSuccess: () => {
        toast({
          title: 'Document créé',
          description: 'Le document a été créé avec succès.',
        });
        navigate('/documents');
      }
    });
  };

  const handleFileSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    
    if (!user) {
      toast({
        title: 'Erreur d\'authentification',
        description: 'Vous devez être connecté pour importer un document.',
        variant: 'destructive',
      });
      return;
    }

    if (!importData.titre.trim() || !importData.aeroport || !importData.type || !selectedFile) {
      toast({
        title: 'Champs manquants',
        description: 'Veuillez remplir tous les champs obligatoires et sélectionner un fichier.',
        variant: 'destructive',
      });
      return;
    }

    const uploadedFile = await uploadFile(selectedFile, {
      bucket: 'documents', // Logical bucket name
      folder: 'uploads',
      allowedTypes: ['.pdf', '.doc', '.docx', '.xls', '.xlsx', '.ppt', '.pptx'],
      maxSize: 10 // 10MB
    });

    if (uploadedFile) {
      const documentData = {
        title: importData.titre,
        content: importData.description,
        type: importData.type as 'FORMULAIRE_DOC' | 'CORRESPONDANCE' | 'PROCES_VERBAL' | 'QUALITE_DOC' | 'NOUVEAU_DOC' | 'GENERAL',
        airport: importData.aeroport as 'ENFIDHA' | 'MONASTIR',
        file_path: uploadedFile.path, // Store the path from the simulated upload
        file_type: selectedFile.type,
      };

      createDocument(documentData, {
        onSuccess: () => {
          toast({
            title: 'Document importé',
            description: 'Le document a été importé et enregistré avec succès.',
          });
          navigate('/documents');
        }
      });
    }
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Nouveau Document</h1>
          <p className="text-gray-500 mt-1">
            Créer un nouveau document via formulaire ou import de fichier
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <FilePlus className="w-5 h-5 mr-2 text-aviation-sky" />
              Création de Document
            </CardTitle>
            <CardDescription>
              Choisissez votre méthode de création de document
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="formulaire" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="formulaire" className="flex items-center">
                  <FileText className="w-4 h-4 mr-2" />
                  Formulaire Direct
                </TabsTrigger>
                <TabsTrigger value="import" className="flex items-center">
                  <Upload className="w-4 h-4 mr-2" />
                  Import de Fichier
                </TabsTrigger>
              </TabsList>

              <TabsContent value="formulaire" className="space-y-6 mt-6">
                <form onSubmit={handleFormSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="titre">Titre du document *</Label>
                      <Input
                        id="titre"
                        value={formData.titre}
                        onChange={(e) => setFormData(prev => ({ ...prev, titre: e.target.value }))}
                        placeholder="Entrez le titre du document"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="reference">Référence</Label>
                      <Input
                        id="reference"
                        value={formData.reference}
                        onChange={(e) => setFormData(prev => ({ ...prev, reference: e.target.value }))}
                        placeholder="NDOC-ENF-2025-001"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="aeroport">Aéroport *</Label>
                      <Select 
                        value={formData.aeroport}
                        onValueChange={(value: 'ENFIDHA' | 'MONASTIR') => setFormData(prev => ({ ...prev, aeroport: value }))}
                        required
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Sélectionner un aéroport" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="ENFIDHA">Enfidha</SelectItem>
                          <SelectItem value="MONASTIR">Monastir</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="type">Type de document *</Label>
                      <Select
                        value={formData.type}
                        onValueChange={(value: 'FORMULAIRE_DOC' | 'CORRESPONDANCE' | 'PROCES_VERBAL' | 'QUALITE_DOC' | 'NOUVEAU_DOC' | 'GENERAL') => setFormData(prev => ({ ...prev, type: value }))}
                        required
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Sélectionner un type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="GENERAL">Général</SelectItem>
                          <SelectItem value="FORMULAIRE_DOC">Formulaire</SelectItem>
                          <SelectItem value="CORRESPONDANCE">Correspondance</SelectItem>
                          <SelectItem value="PROCES_VERBAL">Procès-Verbal</SelectItem>
                          <SelectItem value="QUALITE_DOC">Document Qualité</SelectItem>
                          <SelectItem value="NOUVEAU_DOC">Nouveau Document</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="version">Version</Label>
                      <Input
                        id="version"
                        value={formData.version}
                        onChange={(e) => setFormData(prev => ({ ...prev, version: e.target.value }))}
                        placeholder="1.0"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="responsable">Responsable</Label>
                      <Input
                        id="responsable"
                        value={formData.responsable}
                        onChange={(e) => setFormData(prev => ({ ...prev, responsable: e.target.value }))}
                        placeholder="Nom du responsable"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="Description détaillée du document..."
                      rows={4}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="contenu">Contenu du document</Label>
                    <Textarea
                      id="contenu"
                      value={formData.contenu}
                      onChange={(e) => setFormData(prev => ({ ...prev, contenu: e.target.value }))}
                      placeholder="Saisissez le contenu complet du document..."
                      rows={8}
                    />
                  </div>

                  <div className="flex justify-end space-x-4">
                    <Button type="button" variant="outline" onClick={() => navigate('/documents')}>
                      Annuler
                    </Button>
                    <Button 
                      type="submit" 
                      disabled={isCreating}
                      className="bg-aviation-sky hover:bg-aviation-sky-dark"
                    >
                      <Save className="w-4 h-4 mr-2" />
                      {isCreating ? 'Enregistrement...' : 'Enregistrer'}
                    </Button>
                  </div>
                </form>
              </TabsContent>

              <TabsContent value="import" className="space-y-6 mt-6">
                <form onSubmit={handleFileSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="titre-import">Titre du document *</Label>
                      <Input
                        id="titre-import"
                        value={importData.titre}
                        onChange={(e) => setImportData(prev => ({ ...prev, titre: e.target.value }))}
                        placeholder="Entrez le titre du document"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="aeroport-import">Aéroport *</Label>
                      <Select
                        value={importData.aeroport}
                        onValueChange={(value: 'ENFIDHA' | 'MONASTIR') => setImportData(prev => ({ ...prev, aeroport: value }))}
                        required
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Sélectionner un aéroport" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="ENFIDHA">Enfidha</SelectItem>
                          <SelectItem value="MONASTIR">Monastir</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="type-import">Type de document *</Label>
                      <Select
                        value={importData.type}
                        onValueChange={(value: 'FORMULAIRE_DOC' | 'CORRESPONDANCE' | 'PROCES_VERBAL' | 'QUALITE_DOC' | 'NOUVEAU_DOC' | 'GENERAL') => setImportData(prev => ({ ...prev, type: value }))}
                        required
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Sélectionner un type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="GENERAL">Général</SelectItem>
                          <SelectItem value="FORMULAIRE_DOC">Formulaire</SelectItem>
                          <SelectItem value="CORRESPONDANCE">Correspondance</SelectItem>
                          <SelectItem value="PROCES_VERBAL">Procès-Verbal</SelectItem>
                          <SelectItem value="QUALITE_DOC">Document Qualité</SelectItem>
                          <SelectItem value="NOUVEAU_DOC">Nouveau Document</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description-import">Description</Label>
                    <Textarea
                      id="description-import"
                      value={importData.description}
                      onChange={(e) => setImportData(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="Description du document importé..."
                      rows={3}
                    />
                  </div>

                  <div className="space-y-4">
                    <Label>Fichier à importer</Label>
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                      <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-600 mb-2">
                        Glissez-déposez votre fichier ici ou cliquez pour sélectionner
                      </p>
                      <p className="text-sm text-gray-500 mb-4">
                        Formats supportés: PDF, Word, Excel, PowerPoint
                      </p>
                      <Input
                        type="file"
                        onChange={handleFileUpload}
                        accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx"
                        className="hidden"
                        id="file-upload"
                      />
                      <Label htmlFor="file-upload" className="cursor-pointer">
                        <Button type="button" variant="outline">
                          Sélectionner un fichier
                        </Button>
                      </Label>
                    </div>

                    {selectedFile && (
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium">{selectedFile.name}</p>
                            <p className="text-sm text-gray-500">
                              {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                            </p>
                          </div>
                          <div className="flex space-x-2">
                            {previewUrl && (
                              <Button 
                                variant="outline" 
                                size="sm" 
                                type="button"
                                onClick={() => window.open(previewUrl, '_blank')}
                              >
                                <Eye className="w-4 h-4 mr-2" />
                                Prévisualiser
                              </Button>
                            )}
                            <Button 
                              variant="outline" 
                              size="sm" 
                              type="button"
                              onClick={removeFile}
                            >
                              <X className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="flex justify-end space-x-4">
                    <Button type="button" variant="outline" onClick={() => navigate('/documents')}>
                      Annuler
                    </Button>
                    <Button 
                      type="submit" 
                      disabled={isCreating || isUploadingFile || !importData.titre.trim() || !importData.aeroport || !importData.type || !selectedFile}
                      className="bg-aviation-sky hover:bg-aviation-sky-dark"
                    >
                      <Save className="w-4 h-4 mr-2" />
                      {isCreating || isUploadingFile ? 'Import...' : 'Importer et Enregistrer'}
                    </Button>
                  </div>
                </form>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
};

export default NouveauDoc;