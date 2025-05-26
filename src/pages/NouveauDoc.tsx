
import { useState } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FilePlus, Upload, FileText, Save, Eye } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const NouveauDoc = () => {
  const { toast } = useToast();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      
      // Créer une URL de prévisualisation pour les images et PDFs
      if (file.type.startsWith('image/') || file.type === 'application/pdf') {
        const url = URL.createObjectURL(file);
        setPreviewUrl(url);
      }
      
      toast({
        title: "Fichier sélectionné",
        description: `${file.name} (${(file.size / 1024 / 1024).toFixed(2)} MB)`
      });
    }
  };

  const handleFormSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    toast({
      title: "Document créé",
      description: "Le nouveau document a été enregistré avec succès."
    });
  };

  const handleFileSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!selectedFile) {
      toast({
        title: "Erreur",
        description: "Veuillez sélectionner un fichier.",
        variant: "destructive"
      });
      return;
    }
    
    toast({
      title: "Document importé",
      description: "Le document a été importé et enregistré avec succès."
    });
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
                        placeholder="Entrez le titre du document"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="reference">Référence</Label>
                      <Input
                        id="reference"
                        placeholder="NDOC-ENF-2025-001"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="aeroport">Aéroport *</Label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Sélectionner un aéroport" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="enfidha">Enfidha</SelectItem>
                          <SelectItem value="monastir">Monastir</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="categorie">Catégorie</Label>
                      <Select>
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
                        placeholder="1.0"
                        defaultValue="1.0"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="responsable">Responsable</Label>
                      <Input
                        id="responsable"
                        placeholder="Nom du responsable"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      placeholder="Description détaillée du document..."
                      rows={4}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="contenu">Contenu du document</Label>
                    <Textarea
                      id="contenu"
                      placeholder="Saisissez le contenu complet du document..."
                      rows={8}
                    />
                  </div>

                  <div className="flex justify-end space-x-4">
                    <Button variant="outline">
                      Annuler
                    </Button>
                    <Button type="submit" className="bg-aviation-sky hover:bg-aviation-sky-dark">
                      <Save className="w-4 h-4 mr-2" />
                      Enregistrer
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
                        placeholder="Entrez le titre du document"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="aeroport-import">Aéroport *</Label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Sélectionner un aéroport" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="enfidha">Enfidha</SelectItem>
                          <SelectItem value="monastir">Monastir</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description-import">Description</Label>
                    <Textarea
                      id="description-import"
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
                          {previewUrl && (
                            <Button variant="outline" size="sm">
                              <Eye className="w-4 h-4 mr-2" />
                              Prévisualiser
                            </Button>
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="flex justify-end space-x-4">
                    <Button variant="outline">
                      Annuler
                    </Button>
                    <Button type="submit" className="bg-aviation-sky hover:bg-aviation-sky-dark">
                      <Save className="w-4 h-4 mr-2" />
                      Importer et Enregistrer
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
