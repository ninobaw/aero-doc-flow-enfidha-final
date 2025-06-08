import React, { useState, useEffect, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Save, Upload, FileText, Eye, X } from 'lucide-react';
import { useDocuments } from '@/hooks/useDocuments';
import { useAuth } from '@/contexts/AuthContext';
import { useFileUpload } from '@/hooks/useFileUpload';
import { useToast } from '@/hooks/use-toast';
import { Airport } from '@/shared/types';
import { useDocumentCodeConfig } from '@/hooks/useDocumentCodeConfig';
import { generateDocumentCodePreview, mapDocumentTypeCodeToDocumentTypeEnum } from '@/shared/utils';
import { useNavigate } from 'react-router-dom'; // Correct import for useNavigate

export const DocumentImportForm: React.FC = () => {
  const { user } = useAuth();
  const { createDocument, isCreating } = useDocuments();
  const { uploadFile, uploading: isUploadingFile } = useFileUpload();
  const { config: codeConfig } = useDocumentCodeConfig();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const initialDepartmentCode = useMemo(() => {
    if (user && codeConfig?.departments) {
      const foundDept = codeConfig.departments.find(d => d.label === user.department);
      return foundDept ? foundDept.code : undefined;
    }
    return undefined;
  }, [user, codeConfig]);

  const [importData, setImportData] = useState({
    title: '',
    company_code: 'TAVTUN',
    airport: undefined as Airport | undefined,
    department_code: undefined as string | undefined,
    sub_department_code: undefined as string | undefined,
    document_type_code: undefined as string | undefined,
    language_code: undefined as string | undefined,
    description: ''
  });

  useEffect(() => {
    if (user && codeConfig) {
      const defaultAirport = user.airport || 'ENFIDHA';
      const defaultLanguage = 'FR';

      const foundDept = codeConfig.departments.find(d => d.label === user.department);
      const userDepartmentCode = foundDept ? foundDept.code : undefined;

      setImportData(prev => ({
        ...prev,
        airport: defaultAirport,
        department_code: userDepartmentCode,
        language_code: defaultLanguage,
      }));
    }
  }, [user, codeConfig]);

  const previewQrCodeImport = useMemo(() => {
    return generateDocumentCodePreview(
      importData.company_code,
      importData.airport,
      importData.department_code,
      importData.sub_department_code,
      importData.document_type_code,
      importData.language_code
    );
  }, [
    importData.company_code,
    importData.airport,
    importData.department_code,
    importData.sub_department_code,
    importData.document_type_code,
    importData.language_code,
  ]);

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
        type: mapDocumentTypeCodeToDocumentTypeEnum(importData.document_type_code),
        airport: importData.airport,
        file_path: uploadedFile.path,
        file_type: selectedFile.type,
        company_code: importData.company_code,
        scope_code: codeConfig?.scopes.find(s => s.code === importData.airport)?.code || importData.airport,
        department_code: importData.department_code,
        sub_department_code: importData.sub_department_code || undefined,
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

  return (
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
            disabled={!!user?.department && importData.department_code === initialDepartmentCode && initialDepartmentCode !== undefined}
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
          {user?.department && initialDepartmentCode !== undefined && (
            <p className="text-xs text-gray-500">
              Département pré-rempli ({user.department})
            </p>
          )}
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

      {/* Document Code Preview for Import */}
      <div className="space-y-2">
        <Label>Prévisualisation du Code Documentaire</Label>
        <Input
          value={previewQrCodeImport}
          readOnly
          className="font-mono bg-gray-100 text-gray-700"
        />
        <p className="text-xs text-gray-500">
          Ce code sera généré automatiquement lors de la sauvegarde. Le numéro de séquence sera attribué par le système.
        </p>
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
  );
};