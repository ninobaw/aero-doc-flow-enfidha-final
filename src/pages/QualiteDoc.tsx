
import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FileCheck, Save, Plus } from 'lucide-react';

const QualiteDoc = () => {
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
            <form className="space-y-6">
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
                    placeholder="REF-QUAL-2025-001"
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
                  <Label htmlFor="type-qualite">Type de document qualité</Label>
                  <Select>
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
                    placeholder="1.0"
                    defaultValue="1.0"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="responsable">Responsable qualité</Label>
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
                  placeholder="Description détaillée du document qualité..."
                  rows={4}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="objectifs">Objectifs qualité</Label>
                <Textarea
                  id="objectifs"
                  placeholder="Définir les objectifs et la portée de ce document..."
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="processus">Processus concernés</Label>
                <Textarea
                  id="processus"
                  placeholder="Lister les processus aéroportuaires concernés..."
                  rows={3}
                />
              </div>

              <div className="flex justify-end space-x-4">
                <Button variant="outline">
                  Annuler
                </Button>
                <Button className="bg-aviation-sky hover:bg-aviation-sky-dark">
                  <Save className="w-4 h-4 mr-2" />
                  Enregistrer
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
