import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Save, Upload, FileText, Eye, X } from 'lucide-react';
import { useTemplates } from '@/hooks/useTemplates';
import { useFileUpload } from '@/hooks/useFileUpload';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Airport } from '@/shared/types';

export const UploadTemplateForm: React.FC = () => {
  const { user } = useAuth();
  const { createTemplate, isCreating } = useTemplates();
  const { uploadTemplate, uploading: isUploadingFile } = useFileUpload();
  const { toast } = useToast();

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    title: '',
    airport: user?.airport || 'ENFIDHA' as Airport,
    description: '',
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

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    
    if (!user) {
      toast({
        title: 'Erreur d\'authentification',
        description: 'Vous devez être connecté pour importer un modèle.',
        variant: 'destructive',
      });
      return;
    }

    if (!formData.title.trim() || !formData.airport || !selectedFile) {
      toast({
        title: 'Champs manquants',
        description: 'Veuillez remplir le titre, sélectionner un aéroport et un fichier.',
        variant: 'destructive',
      });
      return;
    }

    const uploadedFile = await uploadTemplate(selectedFile, {
      allowedTypes: ['.pdf', '.doc', '.docx', '.xls', '.xlsx', '.ppt', '.pptx'],
      maxSize: 10 // 10MB
    });

    if (uploadedFile) {
      createTemplate({
        title: formData.title,
        content: formData.description,
        airport: formData.airport,
        file_path: uploadedFile.path,
        file_type: selectedFile.type,
      }, {
        onSuccess: () => {
          toast({
            title: 'Modèle importé',
            description: 'Le modèle a été importé et enregistré avec succès.',
          });
          // Reset form
          setFormData({
            title: '',
            airport: user?.airport || 'ENFIDHA',
            description: '',
          });
          removeFile();
        }
      });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <FilePlus className="w-5 h-5 mr-2 text-aviation-sky" />
          Importer un nouveau modèle
        </CardTitle>
        <CardDescription>
          Téléchargez un fichier pour l'utiliser comme modèle de document.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="template-title">Titre du modèle *</Label>
              <Input
                id="template-title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Ex: Modèle de rapport mensuel"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="template-airport">Aéroport *</Label>
              <Select
                value={formData.airport}
                onValueChange={(value: Airport) => setFormData({ ...formData, airport: value })}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner un aéroport" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ENFIDHA">Enfidha</SelectItem>
                  <SelectItem value="MONASTIR">Monastir</SelectItem>
                  <SelectItem value="GENERALE">Général</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="template-description">Description (optionnel)</Label>
            <Textarea
              id="template-description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Description du modèle et de son utilisation..."
              rows={3}
            />
          </div>

          <div className="space-y-4">
            <Label>Fichier du modèle *</Label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
              <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 mb-2">
                Glissez-déposez votre fichier ici ou cliquez pour sélectionner
              </p>
              <p className="text-sm text-gray-500 mb-4">
                Formats supportés: PDF, Word, Excel, PowerPoint (max 10MB)
              </p>
              <Input
                type="file"
                onChange={handleFileUpload}
                accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx"
                className="hidden"
                id="template-file-upload"
              />
              <Label htmlFor="template-file-upload" className="cursor-pointer">
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
            <Button type="button" variant="outline" onClick={() => {
              setFormData({ title: '', airport: user?.airport || 'ENFIDHA', description: '' });
              removeFile();
            }}>
              Annuler
            </Button>
            <Button
              type="submit"
              disabled={isCreating || isUploadingFile || !formData.title.trim() || !formData.airport || !selectedFile}
              className="bg-aviation-sky hover:bg-aviation-sky-dark"
            >
              <Save className="w-4 h-4 mr-2" />
              {isCreating || isUploadingFile ? 'Import...' : 'Importer le modèle'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};