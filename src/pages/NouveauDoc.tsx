
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

const NouveauDoc = () => {
  const { user } = useAuth();
  const { createDocument, isCreating } = useDocuments();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  // État pour le formulaire direct
  const [formData, setFormData] = useState({
    titre: '',
    reference: '',
    aeroport: '',
    categorie: '',
    version: '1.0',
    responsable: '',
    description: '',
    contenu: ''
  });

  // État pour l'import de fichier
  const [importData, setImportData] = useState({
    titre: '',
    aeroport: '',
    description: ''
  });

  // ===========================================
  // DÉBUT INTÉGRATION BACKEND SUPABASE - NOUVEAU DOCUMENT
  // ===========================================

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
      return;
    }

    if (!formData.titre.trim() || !formData.aeroport) {
      return;
    }

    const documentData = {
      title: formData.titre,
      content: formData.contenu,
      type: 'OTHER',
      airport: formData.aeroport as 'ENFIDHA' | 'MONASTIR',
      category: formData.categorie,
      description: formData.description,
    };

    createDocument(documentData);
  };

  const handleFileSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    
    if (!user) {
      return;
    }

    if (!importData.titre.trim() || !importData.aeroport || !selectedFile) {
      return;
    }

    const documentData = {
      title: importData.titre,
      content: importData.description,
      type: 'OTHER',
      airport: importData.aeroport as 'ENFIDHA' | 'MONASTIR',
      description: importData.description,
      file: selectedFile,
    };

    createDocument(documentData);
  };

  // ===========================================
  // FIN INTÉGRATION BACKEND SUPABASE - NOUVEAU DOCUMENT
  // ===========================================

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
                        onValueChange={(value) => setFormData(prev => ({ ...prev, aeroport: value }))}
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
                      <Label htmlFor="categorie">Catégorie</Label>
                      <Select
                        value={formData.categorie}
                        onValueChange={(value) => setFormData(prev => ({ ...prev, categorie: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Sélectionner une catégorie" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="technique">Technique</SelectItem>
                          <SelectItem value="administratif">Administratif</SelectItem>
                          <SelectItem value="securite">Sécurité</SelectItem>
                          <SelectItem value="maintenance">Maintenance</SelectItem>
                          <SelectItem value="formation">Formation</SelectItem>
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
                    <Button type="button" variant="outline">
                      Annuler
                    </Button>
                    <Button 
                      type="submit" 
                      disabled={isCreating || !formData.titre.trim() || !formData.aeroport}
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
                        onValueChange={(value) => setImportData(prev => ({ ...prev, aeroport: value }))}
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
                              <Button variant="outline" size="sm" type="button">
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
                    <Button type="button" variant="outline">
                      Annuler
                    </Button>
                    <Button 
                      type="submit" 
                      disabled={isCreating || !importData.titre.trim() || !importData.aeroport || !selectedFile}
                      className="bg-aviation-sky hover:bg-aviation-sky-dark"
                    >
                      <Save className="w-4 h-4 mr-2" />
                      {isCreating ? 'Import...' : 'Importer et Enregistrer'}
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
