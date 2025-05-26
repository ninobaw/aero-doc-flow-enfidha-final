
import { useState } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FileSpreadsheet, Upload, Eye, Download, Save, X } from 'lucide-react';

const FormulairesDoc = () => {
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setUploadedFile(file);
      // Create preview URL for supported file types
      if (file.type.startsWith('image/') || file.type === 'application/pdf') {
        const url = URL.createObjectURL(file);
        setPreviewUrl(url);
      }
    }
  };

  const removeFile = () => {
    setUploadedFile(null);
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
    }
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Formulaires Doc</h1>
          <p className="text-gray-500 mt-1">
            Créer et gérer les formulaires documentaires avec modèles
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <FileSpreadsheet className="w-5 h-5 mr-2 text-aviation-sky" />
              Nouveau Formulaire Documentaire
            </CardTitle>
            <CardDescription>
              Remplissez les informations et téléchargez un modèle de formulaire
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="nom-formulaire">Nom du formulaire *</Label>
                  <Input
                    id="nom-formulaire"
                    placeholder="Entrez le nom du formulaire"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="code-formulaire">Code formulaire</Label>
                  <Input
                    id="code-formulaire"
                    placeholder="FORM-2025-001"
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
                      <SelectValue placeholder="Sélectionner la catégorie" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="securite">Sécurité</SelectItem>
                      <SelectItem value="maintenance">Maintenance</SelectItem>
                      <SelectItem value="operations">Opérations</SelectItem>
                      <SelectItem value="qualite">Qualité</SelectItem>
                      <SelectItem value="environnement">Environnement</SelectItem>
                      <SelectItem value="rh">Ressources Humaines</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description du formulaire</Label>
                <Textarea
                  id="description"
                  placeholder="Description détaillée du formulaire et de son utilisation..."
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="instructions">Instructions de remplissage</Label>
                <Textarea
                  id="instructions"
                  placeholder="Instructions pour remplir correctement ce formulaire..."
                  rows={3}
                />
              </div>

              {/* Upload Section */}
              <Card className="border-dashed border-2 border-gray-300">
                <CardContent className="p-6">
                  <div className="text-center">
                    <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <Label htmlFor="file-upload" className="cursor-pointer">
                      <span className="text-lg font-medium text-gray-900">
                        Télécharger un modèle de formulaire
                      </span>
                      <p className="text-gray-500 mt-1">
                        PDF, DOC, DOCX, XLS, XLSX jusqu'à 10MB
                      </p>
                    </Label>
                    <Input
                      id="file-upload"
                      type="file"
                      className="hidden"
                      accept=".pdf,.doc,.docx,.xls,.xlsx"
                      onChange={handleFileUpload}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      className="mt-4"
                      onClick={() => document.getElementById('file-upload')?.click()}
                    >
                      Choisir un fichier
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* File Preview */}
              {uploadedFile && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center justify-between">
                      Fichier téléchargé
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={removeFile}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <FileSpreadsheet className="w-8 h-8 text-aviation-sky" />
                        <div>
                          <p className="font-medium">{uploadedFile.name}</p>
                          <p className="text-sm text-gray-500">
                            {(uploadedFile.size / 1024 / 1024).toFixed(2)} MB
                          </p>
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        {previewUrl && (
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => window.open(previewUrl, '_blank')}
                          >
                            <Eye className="w-4 h-4 mr-1" />
                            Visualiser
                          </Button>
                        )}
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            const url = URL.createObjectURL(uploadedFile);
                            const a = document.createElement('a');
                            a.href = url;
                            a.download = uploadedFile.name;
                            a.click();
                            URL.revokeObjectURL(url);
                          }}
                        >
                          <Download className="w-4 h-4 mr-1" />
                          Télécharger
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              <div className="flex justify-end space-x-4">
                <Button variant="outline">
                  Annuler
                </Button>
                <Button className="bg-aviation-sky hover:bg-aviation-sky-dark">
                  <Save className="w-4 h-4 mr-2" />
                  Enregistrer le formulaire
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
};

export default FormulairesDoc;
