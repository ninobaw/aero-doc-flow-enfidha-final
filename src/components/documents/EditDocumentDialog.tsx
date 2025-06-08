import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Save, FileText } from 'lucide-react';
import { useDocuments, DocumentData } from '@/hooks/useDocuments';
import { useToast } from '@/hooks/use-toast';
import { Airport, DocumentType } from '@/shared/types';
import { useDocumentCodeConfig } from '@/hooks/useDocumentCodeConfig';
import { useAuth } from '@/contexts/AuthContext';

interface EditDocumentDialogProps {
  document: DocumentData | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const EditDocumentDialog: React.FC<EditDocumentDialogProps> = ({ document, open, onOpenChange }) => {
  const { user } = useAuth();
  const { updateDocument, isUpdating } = useDocuments();
  const { config: codeConfig, isLoading: isLoadingCodeConfig } = useDocumentCodeConfig();
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    title: '',
    company_code: '',
    airport: '' as Airport,
    department_code: '',
    sub_department_code: '',
    document_type_code: '',
    language_code: '',
    version: '',
    responsable: '',
    description: '',
    content: ''
  });

  useEffect(() => {
    if (document) {
      setFormData({
        title: document.title || '',
        company_code: document.company_code || 'TAVTUN',
        airport: document.airport || '' as Airport,
        department_code: document.department_code || '',
        sub_department_code: document.sub_department_code || '',
        document_type_code: document.document_type_code || '',
        language_code: document.language_code || '',
        version: document.version?.toString() || '1.0',
        responsable: '', // Assuming no 'responsable' field in DocumentData directly
        description: document.content || '', // Using content as description for now
        content: document.content || ''
      });
    }
  }, [document]);

  const handleSubmit = (e: React.FormEvent) => {
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
      version: parseFloat(formData.version),
      // Note: responsable is not directly mapped to backend Document model
      // file_path and file_type are not handled in this edit dialog for simplicity
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
      return foundDept ? foundDept.code : '';
    }
    return '';
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
                  <SelectItem value="">Sélectionner...</SelectItem>
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
                  <SelectItem value="">Sélectionner...</SelectItem>
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
                disabled={!!user?.department && formData.department_code === initialDepartmentCode && initialDepartmentCode !== ''}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner un département" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Sélectionner...</SelectItem>
                  {codeConfig?.departments.map(dept => (
                    <SelectItem key={dept.code} value={dept.code}>
                      {dept.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {user?.department && initialDepartmentCode !== '' && (
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
                  <SelectItem value="">Sélectionner...</SelectItem>
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

          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Annuler
            </Button>
            <Button type="submit" disabled={isUpdating}>
              <Save className="w-4 h-4 mr-2" />
              {isUpdating ? 'Mise à jour...' : 'Mettre à jour'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};