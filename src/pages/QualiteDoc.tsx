import { useState } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FileCheck, Save } from 'lucide-react';
import { useDocuments } from '@/hooks/useDocuments';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { Airport } from '@/shared/types'; // Import Airport type

const QualiteDoc = () => {
  const { user } = useAuth();
  const { createDocument, isCreating } = useDocuments();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    title: '',
    reference: '',
    airport: '' as Airport, // Updated to use Airport type
    typeQualite: '', // Specific to QualiteDoc, will be part of content
    version: '1.0',
    responsable: '',
    description: '',
    objectifs: '',
    processus: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast({
        title: 'Erreur d\'authentification',
        description: 'Vous devez être connecté pour créer un document.',
        variant: 'destructive',
      });
      return;
    }

    if (!formData.title.trim() || !formData.airport) {
      toast({
        title: 'Erreur de validation',
        description: 'Le titre du document et l\'aéroport sont requis.',
        variant: 'destructive',
      });
      return;
    }

    // Combine specific fields into a JSON string for the 'content' field
    const contentData = {
      reference: formData.reference,
      typeQualite: formData.typeQualite,
      version: formData.version,
      responsable: formData.responsable,
      description: formData.description,
      objectifs: formData.objectifs,
      processus: formData.processus,
    };

    createDocument({
      title: formData.title.trim(),
      type: 'QUALITE_DOC', // Fixed type for this page
      content: JSON.stringify(contentData),
      airport: formData.airport, // Use Airport type
    }, {
      onSuccess: () => {
        setFormData({
          title: '',
          reference: '',
          airport: 'ENFIDHA', // Reset to default
          typeQualite: '',
          version: '1.0',
          responsable: '',
          description: '',
          objectifs: '',
          processus: '',
        });
        navigate('/documents'); // Redirect to documents list after creation
      }
    });
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Qualité Doc</h1>
          <p className="text-gray-500 mt-1">
            Créer et gérer les documents de qualité
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <FileCheck className="w-5 h-5 mr-2 text-aviation-sky" />
              Nouveau Document Qualité
            </CardTitle>
            <CardDescription>
              Remplissez les informations du document qualité
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="titre">Titre du document *</Label>
                  <Input
                    id="titre"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="Entrez le titre du document"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="reference">Référence</Label>
                  <Input
                    id="reference"
                    value={formData.reference}
                    onChange={(e) => setFormData({ ...formData, reference: e.target.value })}
                    placeholder="REF-QUAL-2025-001"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="aeroport">Aéroport *</Label>
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

                <div className="space-y-2">
                  <Label htmlFor="type-qualite">Type de document qualité</Label>
                  <Select 
                    value={formData.typeQualite} 
                    onValueChange={(value) => setFormData({ ...formData, typeQualite: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner le type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="procedure">Procédure</SelectItem>
                      <SelectItem value="instruction">Instruction de travail</SelectItem>
                      <SelectItem value="manuel">Manuel qualité</SelectItem>
                      <SelectItem value="politique">Politique qualité</SelectItem>
                      <SelectItem value="audit">Rapport d'audit</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="version">Version</Label>
                  <Input
                    id="version"
                    value={formData.version}
                    onChange={(e) => setFormData({ ...formData, version: e.target.value })}
                    placeholder="1.0"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="responsable">Responsable qualité</Label>
                  <Input
                    id="responsable"
                    value={formData.responsable}
                    onChange={(e) => setFormData({ ...formData, responsable: e.target.value })}
                    placeholder="Nom du responsable"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Description détaillée du document qualité..."
                  rows={4}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="objectifs">Objectifs qualité</Label>
                <Textarea
                  id="objectifs"
                  value={formData.objectifs}
                  onChange={(e) => setFormData({ ...formData, objectifs: e.target.value })}
                  placeholder="Définir les objectifs et la portée de ce document..."
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="processus">Processus concernés</Label>
                <Textarea
                  id="processus"
                  value={formData.processus}
                  onChange={(e) => setFormData({ ...formData, processus: e.target.value })}
                  placeholder="Lister les processus aéroportuaires concernés..."
                  rows={3}
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
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
};

export default QualiteDoc;