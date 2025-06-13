import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Save, FileText, Upload, Eye, X, Download } from 'lucide-react';
import { useDocuments, DocumentData } from '@/hooks/useDocuments';
import { useToast } from '@/hooks/use-toast';
import { Airport } from '@/shared/types';
import { useDocumentCodeConfig } from '@/hooks/useDocumentCodeConfig';
import { generateDocumentCodePreview, getAbsoluteFilePath, mapDocumentTypeCodeToDocumentTypeEnum } from '@/shared/utils';
import { TagInput } from '@/components/ui/TagInput';
import { useFileUpload } from '@/hooks/useFileUpload'; // Import useFileUpload
import { useAuth } from '@/contexts/AuthContext'; // Import useAuth

interface EditDocumentDialogProps {
  document: DocumentData | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const EditDocumentDialog: React.FC<EditDocumentDialogProps> = ({ document, open, onOpenChange }) => {
  const { user } = useAuth();
  const { updateDocument, isUpdating } = useDocuments();
  const { config: codeConfig, isLoading: isLoadingCodeConfig } = useDocumentCodeConfig();
  const { uploadFile, uploading: isUploadingFile } = useFileUpload(); // Use file upload hook
  const { toast } = useToast();

  const fileInputRef = useRef<HTMLInputElement>(null); // Ref for file input

  const [formData, setFormData] = useState({
    title: '',
    company_code: '',
    airport: undefined as Airport | undefined,
    department_code: undefined as string | undefined,
    sub_department_code: undefined as string | undefined,
    document_type_code: undefined as string | undefined,
    language_code: undefined as string | undefined,
    version: '',
    responsable: '',
    description: '',
    content: '',
    tags: [] as string[],
  });

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    if (document) {
      setFormData({
        title: document.title || '',
        company_code: document.company_code || 'TAVTUN',
        airport: document.airport || undefined,
        department_code: document.department_code || undefined,
        sub_department_code: document.sub_department_code || undefined,
        document_type_code: document.document_type_code || undefined,
        language_code: document.language_code || undefined,
        version: document.version?.toString() || '1.0',
        responsable: '', // Assuming no 'responsable' field in DocumentData directly
        description: document.content || '', // Using content as description for now
        content: document.content || '',
        tags: document.tags || [],
      });
      // Set initial preview URL if document has a file
      if (document.file_path) {
        setPreviewUrl(getAbsoluteFilePath(document.file_path));
      } else {
        setPreviewUrl(null);
      }
      setSelectedFile(null); // Clear any previously selected file
    }
  }, [document]);

  // Memoized QR code preview for edit form
  const previewQrCodeEdit = useMemo(() => {
    return generateDocumentCodePreview(
      formData.company_code,
      formData.airport,
      formData.department_code,
      formData.sub_department_code,
      formData.document_type_code,
      formData.language_code
    );
  }, [
    formData.company_code,
    formData.airport,
    formData.department_code,
    formData.sub_department_code,
    formData.document_type_code,
    formData.language_code,
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
    if (fileInputRef.current) {
      fileInputRef.current.value = ''; // Clear the file input value
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!document) return;

    if (!formData.title.trim() || !formData.airport || !formData.document_type_code || !formData.department_code || !formData.language_code) {
      toast({
        title: 'Champs manquants',
        description: 'Veuillez remplir tous les champs obligatoires (Titre, Aéroport, Type de document, Département, Langue).',
        variant: 'destructive',
      });
      return;
    }

    let finalFilePath: string | undefined = document.file_path;
    let finalFileType: string | undefined = document.file_type;
    let newVersion = parseFloat(formData.version);

    if (selectedFile) {
      // Determine the document type enum for file upload options
      const documentTypeEnum = mapDocumentTypeCodeToDocumentTypeEnum(formData.document_type_code!);

      const uploaded = await uploadFile(selectedFile, {
        documentType: documentTypeEnum, // Use mapped type for folder
        scopeCode: formData.airport,
        departmentCode: formData.department_code,
        documentTypeCode: formData.document_type_code,
        allowedTypes: ['.pdf', '.doc', '.docx', '.xls', '.xlsx', '.ppt', '.pptx'],
        maxSize: 10
      });
      if (uploaded) {
        finalFilePath = uploaded.path;
        finalFileType = selectedFile.type;
        newVersion = parseFloat((document.version + 0.1).toFixed(1)); // Increment version by 0.1 for file update
      } else {
        return; // Stop if file upload failed
      }
    }

    const updatedData = {
      title: formData.title,
      content: formData.content,
      airport: formData.airport,
      company_code: formData.company_code,
      scope_code: codeConfig?.scopes.find(s => s.code === formData.airport)?.code || formData.airport,
      department_code: formData.department_code,
      sub_department_code: formData.sub_department_code || undefined,
      document_type_code: formData.document_type_code,
      language_code: formData.language_code,
      version: newVersion, // Use the new version
      tags: formData.tags,
      file_path: finalFilePath, // Include updated file path
      file_type: finalFileType, // Include updated file type
    };

    updateDocument({ id: document.id, ...updatedData }, {
      onSuccess: () => {
        onOpenChange(false);
        toast({
          title: 'Document mis à jour',
          description: 'Le document a été mis à jour avec succès.',
        });
      }
    });
  };

  if (isLoadingCodeConfig) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-2xl">
          <div className="flex items-center justify-center min-h-[200px]">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-aviation-sky"></div>
            <p className="ml-4 text-gray-600">Chargement de la configuration...</p>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  // Determine initial department code based on user's department for disabling logic
  const initialDepartmentCode = useMemo(() => {
    if (user && codeConfig?.departments) {
      const foundDept = codeConfig.departments.find(d => d.label === user.department);
      return foundDept ? foundDept.code : undefined;
    }
    return undefined;
  }, [user, codeConfig]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <FileText className="w-5 h-5 mr-2" />
            Modifier le Document
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
              <Label htmlFor="airport">Aéroport (Scope) *</Label>
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
                disabled={!!user?.department && formData.department_code === initialDepartmentCode && initialDepartmentCode !== undefined}
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
              <Label htmlFor="sub_department_code">Sous-département</Label>
              <Select
                value={formData.sub_department_code}
                onValueChange={(value: string) => setFormData(prev => ({ ...prev, sub_department_code: value }))}
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
                readOnly // Version is now managed automatically on file upload
                className="bg-gray-100"
              />
            </div>
          </div>

          {/* Existing QR Code and Preview of New Code */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Code QR Actuel</Label>
              <Input
                value={document?.qr_code || 'N/A'}
                readOnly
                className="font-mono bg-gray-100 text-gray-700"
              />
              <p className="text-xs text-gray-500">
                Code QR attribué à ce document.
              </p>
            </div>
            <div className="space-y-2">
              <Label>Prévisualisation du Nouveau Code</Label>
              <Input
                value={previewQrCodeEdit}
                readOnly
                className="font-mono bg-gray-100 text-gray-700"
              />
              <p className="text-xs text-gray-500">
                Ce code sera généré si les champs de codification sont modifiés.
              </p>
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

          {/* File Upload Section for replacement */}
          <div className="space-y-4">
            <Label>Remplacer le fichier du document (optionnel)</Label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
              <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 mb-2">
                Glissez-déposez un nouveau fichier ici ou cliquez pour sélectionner
              </p>
              <p className="text-sm text-gray-500 mb-4">
                Formats supportés: PDF, Word, Excel, PowerPoint (max 10MB)
              </p>
              <Input
                type="file"
                onChange={handleFileUpload}
                accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx"
                className="hidden"
                id="document-file-upload"
                ref={fileInputRef}
              />
              <Label htmlFor="document-file-upload" className="cursor-pointer">
                <Button type="button" variant="outline">
                  Sélectionner un nouveau fichier
                </Button>
              </Label>
            </div>

            {(selectedFile || document?.file_path) && (
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">
                      {selectedFile?.name || document?.file_path?.split('/').pop() || 'Fichier actuel'}
                    </p>
                    <p className="text-sm text-gray-500">
                      {selectedFile ? (selectedFile.size / 1024 / 1024).toFixed(2) + ' MB' : 'Fichier existant'}
                    </p>
                  </div>
                  <div className="flex space-x-2">
                    {(selectedFile && previewUrl) || (document?.file_path && getAbsoluteFilePath(document.file_path)) ? (
                      <Button 
                        variant="outline" 
                        size="sm" 
                        type="button"
                        onClick={() => window.open(selectedFile ? previewUrl! : getAbsoluteFilePath(document!.file_path!), '_blank')}
                      >
                        <Eye className="w-4 h-4 mr-2" />
                        Prévisualiser
                      </Button>
                    ) : null}
                    {document?.file_path && (
                      <Button 
                        variant="outline" 
                        size="sm" 
                        type="button"
                        onClick={() => {
                          const link = document.createElement('a');
                          link.href = getAbsoluteFilePath(document.file_path!);
                          link.download = document.title;
                          document.body.appendChild(link);
                          link.click();
                          document.body.removeChild(link);
                        }}
                      >
                        <Download className="w-4 h-4 mr-2" />
                        Télécharger
                      </Button>
                    )}
                    {selectedFile && ( // Only show remove button if a new file is selected
                      <Button 
                        variant="outline" 
                        size="sm" 
                        type="button"
                        onClick={removeFile}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Tag Input */}
          <div className="space-y-2">
            <Label htmlFor="tags">Tags</Label>
            <TagInput
              tags={formData.tags}
              onTagsChange={(newTags) => setFormData(prev => ({ ...prev, tags: newTags }))}
              placeholder="Ajouter des tags (ex: sécurité, maintenance)"
            />
            <p className="text-xs text-gray-500">
              Appuyez sur Entrée pour ajouter un tag.
            </p>
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Annuler
            </Button>
            <Button type="submit" disabled={isUpdating || isUploadingFile}>
              <Save className="w-4 h-4 mr-2" />
              {isUpdating || isUploadingFile ? 'Mise à jour...' : 'Mettre à jour'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};