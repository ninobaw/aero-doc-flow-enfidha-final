import React, { useState, useRef } from 'react'; // Corrected: Changed '=>' to 'from'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Upload, FileText, Eye, X, Save } from 'lucide-react';
import { useCorrespondances } from '@/hooks/useCorrespondances';
import { ActionsDecideesField, ActionDecidee } from '@/components/actions/ActionsDecideesField';
import { Airport } from '@/shared/types'; // Import Airport type
import { TagInput } from '@/components/ui/TagInput'; // Import TagInput
import { useFileUpload } from '@/hooks/useFileUpload'; // Import useFileUpload
import { useToast } from '@/hooks/use-toast'; // Import useToast
import { getAbsoluteFilePath } from '@/shared/utils'; // Import getAbsoluteFilePath

export const CreateCorrespondanceDialog = () => {
  const [open, setOpen] = useState(false);
  const { createCorrespondance, isCreating } = useCorrespondances();
  const { uploadFile, uploading: isUploadingFile } = useFileUpload();
  const { toast } = useToast();
  
  const fileInputRef = useRef<HTMLInputElement>(null); // Create a ref for the file input

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    title: '',
    type: 'OUTGOING' as 'INCOMING' | 'OUTGOING', // Default to OUTGOING
    code: '',
    from_address: '',
    to_address: '',
    subject: '',
    content: '',
    priority: 'MEDIUM' as 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT',
    airport: 'ENFIDHA' as Airport,
    actions_decidees: [] as ActionDecidee[],
    tags: [] as string[],
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
    setSelectedFile(null); // Corrected: Changed selectedFile(null) to setSelectedFile(null)
    setPreviewUrl(null);
    if (fileInputRef.current) { // Clear the file input value
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title || !formData.from_address.trim() || !formData.to_address.trim() || !formData.subject || !formData.type || !formData.airport) { // Added .trim() for from_address and to_address
      toast({
        title: 'Champs manquants',
        description: 'Veuillez remplir tous les champs obligatoires (Titre, De, À, Objet, Type, Aéroport).',
        variant: 'destructive',
      });
      return;
    }

    let finalFilePath: string | undefined;
    let finalFileType: string | undefined;

    if (selectedFile) {
      console.log('Frontend: Préparation de l\'upload du fichier avec les options suivantes:');
      console.log('  documentType: correspondances');
      console.log('  scopeCode:', formData.airport); // Corrected: Changed airportCode to scopeCode
      console.log('  correspondenceType:', formData.type);

      const uploaded = await uploadFile(selectedFile, {
        documentType: 'correspondances', // Base folder for all correspondences
        scopeCode: formData.airport, // Corrected: Changed airportCode to scopeCode
        correspondenceType: formData.type, // Pass the correspondence type (INCOMING/OUTGOING)
        allowedTypes: ['.pdf', '.doc', '.docx', '.xls', '.xlsx', '.ppt', '.pptx', '.jpg', '.jpeg', '.png'],
        maxSize: 10 // 10MB
      });
      if (uploaded) {
        finalFilePath = uploaded.path;
        finalFileType = selectedFile.type;
      } else {
        // If file upload failed, stop the form submission
        return;
      }
    }

    createCorrespondance({
      ...formData,
      from_address: formData.from_address.trim(), // Ensure trimmed value is sent
      to_address: formData.to_address.trim(), // Ensure trimmed value is sent
      file_path: finalFilePath,
      file_type: finalFileType,
    }, {
      onSuccess: () => {
        setFormData({
          title: '',
          type: 'OUTGOING',
          code: '',
          from_address: '',
          to_address: '',
          subject: '',
          content: '',
          priority: 'MEDIUM',
          airport: 'ENFIDHA',
          actions_decidees: [],
          tags: [],
        });
        removeFile(); // Also clear the selected file
        setOpen(false);
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-aviation-sky hover:bg-aviation-sky-dark">
          <Plus className="w-4 h-4 mr-2" />
          Nouvelle Correspondance
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Créer une nouvelle correspondance</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="title">Titre du document *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Titre de la correspondance"
                required
              />
            </div>
            <div>
              <Label htmlFor="priority">Priorité</Label>
              <Select value={formData.priority} onValueChange={(value: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT') => setFormData({ ...formData, priority: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="LOW">Faible</SelectItem>
                  <SelectItem value="MEDIUM">Moyen</SelectItem>
                  <SelectItem value="HIGH">Élevé</SelectItem>
                  <SelectItem value="URGENT">Urgent</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="type">Type de correspondance *</Label>
              <Select value={formData.type} onValueChange={(value: 'INCOMING' | 'OUTGOING') => setFormData({ ...formData, type: value })} required>
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner le type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="INCOMING">Entrante</SelectItem>
                  <SelectItem value="OUTGOING">Sortante</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="code">Code (Manuel)</Label>
              <Input
                id="code"
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                placeholder="Ex: CORR-2024-001"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="from_address">De *</Label>
            <Input
              id="from_address"
              value={formData.from_address}
              onChange={(e) => setFormData({ ...formData, from_address: e.target.value })}
              placeholder="expediteur@exemple.com"
              required
            />
          </div>
          <div>
            <Label htmlFor="to_address">À *</Label>
            <Input
              id="to_address"
              value={formData.to_address}
              onChange={(e) => setFormData({ ...formData, to_address: e.target.value })}
              placeholder="destinataire@exemple.com"
              required
            />
          </div>

          <div>
            <Label htmlFor="airport">Aéroport *</Label>
            <Select value={formData.airport} onValueChange={(value: Airport) => setFormData({ ...formData, airport: value })} required>
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

          <div>
            <Label htmlFor="subject">Objet *</Label>
            <Input
              id="subject"
              value={formData.subject}
              onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
              placeholder="Objet de la correspondance"
              required
            />
          </div>

          <div>
            <Label htmlFor="content">Contenu</Label>
            <Textarea
              id="content"
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              placeholder="Contenu de la correspondance..."
              rows={6}
            />
          </div>

          {/* Tags Input */}
          <div>
            <Label htmlFor="tags">Tags</Label>
            <TagInput
              tags={formData.tags}
              onTagsChange={(newTags) => setFormData({ ...formData, tags: newTags })}
              placeholder="Ajouter des tags (ex: urgent, réunion, suivi)"
            />
            <p className="text-xs text-gray-500 mt-1">
              Appuyez sur Entrée pour ajouter un tag.
            </p>
          </div>

          {/* File Upload Section */}
          <div className="space-y-4">
            <Label>Fichier joint (optionnel)</Label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
              <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 mb-2">
                Glissez-déposez votre fichier ici ou cliquez pour sélectionner
              </p>
              <p className="text-sm text-gray-500 mb-4">
                Formats supportés: PDF, Word, Excel, Images (max 10MB)
              </p>
              <Input
                type="file"
                onChange={handleFileUpload}
                accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.jpg,.jpeg,.png"
                className="hidden"
                id="correspondance-file-upload"
                ref={fileInputRef} // Attach the ref here
              />
              <Button
                type="button"
                variant="outline"
                onClick={() => fileInputRef.current?.click()} // Trigger click via ref
              >
                Sélectionner un fichier
              </Button>
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

          <ActionsDecideesField
            actions={formData.actions_decidees}
            onChange={(actions) => setFormData({ ...formData, actions_decidees: actions })}
            disabled={isCreating || isUploadingFile}
          />

          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={isCreating || isUploadingFile}>
              Annuler
            </Button>
            <Button type="submit" disabled={isCreating || isUploadingFile}>
              <Save className="w-4 h-4 mr-2" />
              {isCreating || isUploadingFile ? 'Création...' : 'Créer'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};