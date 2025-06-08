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
import { Airport } from '@/shared/types';
import { useDocumentCodeConfig } from '@/hooks/useDocumentCodeConfig'; // Import the new hook

const NouveauDoc = () => {
  const { user } = useAuth();
  const { createDocument, isCreating } = useDocuments();
  const { uploadFile, uploading: isUploadingFile } = useFileUpload();
  const { config: codeConfig, isLoading: isLoadingCodeConfig } = useDocumentCodeConfig(); // Use the new hook
  const navigate = useNavigate();
  const { toast } = useToast();

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  // État pour le formulaire direct
  const [formData, setFormData] = useState({
    title: '',
    company_code: 'TAVTUN', // Default company code
    airport: 'ENFIDHA' as Airport,
    department_code: '',
    sub_department_code: '',
    document_type_code: '',
    language_code: 'FR',
    version: '1.0',
    responsable: '',
    description: '',
    content: ''
  });

  // État pour l'import de fichier
  const [importData, setImportData] = useState({
    title: '',
    company_code: 'TAVTUN', // Default company code
    airport: 'ENFIDHA' as Airport,
    department_code: '',
    sub_department_code: '',
    document_type_code: '',
    language_code: 'FR',
    description: ''
  });

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      
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
        setPreviewUrl(null);
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

    if (!formData.title.trim() || !formData.airport || !formData.document_type_code || !formData.department_code || !formData.language_code) {
      toast({
        title: 'Champs manquants',
        description: 'Veuillez remplir tous les champs obligatoires (Titre, Aéroport, Type de document, Département, Langue).',
        variant: 'destructive',
      });
      return;
    }

    const documentData = {
      title: formData.title,
      content: formData.content,
      type: codeConfig?.documentTypes.find(dt => dt.code === formData.document_type_code)?.label || 'GENERAL', // Map code back to full type string
      airport: formData.airport,
      company_code: formData.company_code,
      scope_code: codeConfig?.scopes.find(s => s.code === formData.airport)?.code || formData.airport, // Use airport code as scope code
      department_code: formData.department_code,
      sub_department_code: formData.sub_department_code || undefined, // Optional
      document_type_code: formData.document_type_code,
      language_code: formData.language_code,
      // version and responsable are not directly mapped to backend Document model fields
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

    if (!importData.title.trim() || !importData.airport || !importData.document_type_code || !importData.department_code || !importData.language_code || !selectedFile) {
      toast({
        title: 'Champs manquants',
        description: 'Veuillez remplir tous les champs obligatoires et sélectionner un fichier.',
        variant: 'destructive',
      });
      return;
    }

    const uploadedFile = await uploadFile(selectedFile, {
      bucket: 'documents',
      folder: 'uploads',
      allowedTypes: ['.pdf', '.doc', '.docx', '.xls', '.xlsx', '.ppt', '.pptx'],
      maxSize: 10
    });

    if (uploadedFile) {
      const documentData = {
        title: importData.title,
        content: importData.description,
        type: codeConfig?.documentTypes.find(dt => dt.code === importData.document_type_code)?.label || 'GENERAL', // Map code back to full type string
        airport: importData.airport,
        file_path: uploadedFile.path,
        file_type: selectedFile.type,
        company_code: importData.company_code,
        scope_code: codeConfig?.scopes.find(s => s.code === importData.airport)?.code || importData.airport, // Use airport code as scope code
        department_code: importData.department_code,
        sub_department_code: importData.sub_department_code || undefined, // Optional
        document_type_code: importData.document_type_code,
        language_code: importData.language_code,
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

  if (isLoadingCodeConfig) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-aviation-sky"></div>
          <p className="ml-4 text-gray-600">Chargement de la configuration...</p>
        </div>
      </AppLayout>
    );
  }

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
                      <Label htmlFor="title">Titre du document *</Label>
                      <Input
                        id="title"
                        value={formData.title}
                        onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                        placeholder="Entrez le titre du document"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="company_code">Code Société</Label>
                      <Input
                        id="company_code"
                        value={formData.company_code}
                        onChange={(e) => setFormData(prev => ({ ...prev, company_code: e.target.value }))}
                        placeholder="Ex: TAVTUN"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="aeroport">Aéroport (Scope) *</Label>
                      <Select 
                        value={formData.airport}
                        onValueChange={(value: Airport) => setFormData(prev => ({ ...prev, airport: value }))}
                        required
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Sélectionner un aéroport" />
                        </SelectTrigger>
                        <SelectContent>
                          {codeConfig?.scopes.map(scope => (
                            <SelectItem key={scope.code} value={scope.code}>
                              {scope.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="document_type_code">Type de document *</Label>
                      <Select
                        value={formData.document_type_code}
                        onValueChange={(value: string) => setFormData(prev => ({ ...prev, document_type_code: value }))}
                        required
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Sélectionner un type" />
                        </SelectTrigger>
                        <SelectContent>
                          {codeConfig?.documentTypes.map(docType => (
                            <SelectItem key={docType.code} value={docType.code}>
                              {docType.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="department_code">Département *</Label>
                      <Select
                        value={formData.department_code}
                        onValueChange={(value: string) => setFormData(prev => ({ ...prev, department_code: value }))}
                        required
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Sélectionner un département" />
                        </SelectTrigger>
                        <SelectContent>
                          {codeConfig?.departments.map(dept => (
                            <SelectItem key={dept.code} value={dept.code}>
                              {dept.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="sub_department_code">Sous-département</Label>
                      <Select
                        value={formData.sub_department_code}
                        onValueChange={(value: string) => setFormData(prev => ({ ...prev, sub_department_code: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Sélectionner un sous-département" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="">Aucun</SelectItem>
                          {codeConfig?.subDepartments.map(subDept => (
                            <SelectItem key={subDept.code} value={subDept.code}>
                              {subDept.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="language_code">Langue *</Label>
                      <Select
                        value={formData.language_code}
                        onValueChange={(value: string) => setFormData(prev => ({ ...prev, language_code: value }))}
                        required
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Sélectionner une langue" />
                        </SelectTrigger>
                        <SelectContent>
                          {codeConfig?.languages.map(lang => (
                            <SelectItem key={lang.code} value={lang.code}>
                              {lang.label}
                            </SelectItem>
                          ))}
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
                    <Label htmlFor="content">Contenu du document</Label>
                    <Textarea
                      id="content"
                      value={formData.content}
                      onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
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
                        value={importData.title}
                        onChange={(e) => setImportData(prev => ({ ...prev, title: e.target.value }))}
                        placeholder="Entrez le titre du document"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="company_code_import">Code Société</Label>
                      <Input
                        id="company_code_import"
                        value={importData.company_code}
                        onChange={(e) => setImportData(prev => ({ ...prev, company_code: e.target.value }))}
                        placeholder="Ex: TAVTUN"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="aeroport-import">Aéroport (Scope) *</Label>
                      <Select
                        value={importData.airport}
                        onValueChange={(value: Airport) => setImportData(prev => ({ ...prev, airport: value }))}
                        required
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Sélectionner un aéroport" />
                        </SelectTrigger>
                        <SelectContent>
                          {codeConfig?.scopes.map(scope => (
                            <SelectItem key={scope.code} value={scope.code}>
                              {scope.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="document_type_code_import">Type de document *</Label>
                      <Select
                        value={importData.document_type_code}
                        onValueChange={(value: string) => setImportData(prev => ({ ...prev, document_type_code: value }))}
                        required
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Sélectionner un type" />
                        </SelectTrigger>
                        <SelectContent>
                          {codeConfig?.documentTypes.map(docType => (
                            <SelectItem key={docType.code} value={docType.code}>
                              {docType.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="department_code_import">Département *</Label>
                      <Select
                        value={importData.department_code}
                        onValueChange={(value: string) => setImportData(prev => ({ ...prev, department_code: value }))}
                        required
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Sélectionner un département" />
                        </SelectTrigger>
                        <SelectContent>
                          {codeConfig?.departments.map(dept => (
                            <SelectItem key={dept.code} value={dept.code}>
                              {dept.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="sub_department_code_import">Sous-département</Label>
                      <Select
                        value={importData.sub_department_code}
                        onValueChange={(value: string) => setImportData(prev => ({ ...prev, sub_department_code: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Sélectionner un sous-département" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="">Aucun</SelectItem>
                          {codeConfig?.subDepartments.map(subDept => (
                            <SelectItem key={subDept.code} value={subDept.code}>
                              {subDept.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="language_code_import">Langue *</Label>
                      <Select
                        value={importData.language_code}
                        onValueChange={(value: string) => setImportData(prev => ({ ...prev, language_code: value }))}
                        required
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Sélectionner une langue" />
                        </SelectTrigger>
                        <SelectContent>
                          {codeConfig?.languages.map(lang => (
                            <SelectItem key={lang.code} value={lang.code}>
                              {lang.label}
                            </SelectItem>
                          ))}
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
                      disabled={isCreating || isUploadingFile || !importData.title.trim() || !importData.airport || !importData.document_type_code || !importData.department_code || !importData.language_code || !selectedFile}
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