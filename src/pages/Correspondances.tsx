
import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Mail, Save, Plus, UserPlus } from 'lucide-react';

const Correspondances = () => {
  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Correspondances</h1>
          <p className="text-gray-500 mt-1">
            Gérer les correspondances officielles
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Mail className="w-5 h-5 mr-2 text-aviation-sky" />
              Nouvelle Correspondance
            </CardTitle>
            <CardDescription>
              Créer une nouvelle correspondance avec actions associées
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="objet">Objet *</Label>
                  <Input
                    id="objet"
                    placeholder="Objet de la correspondance"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="reference">Référence</Label>
                  <Input
                    id="reference"
                    placeholder="CORR-2025-001"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="expediteur">Expéditeur</Label>
                  <Input
                    id="expediteur"
                    placeholder="Nom de l'expéditeur"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="destinataire">Destinataire</Label>
                  <Input
                    id="destinataire"
                    placeholder="Nom du destinataire"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="aeroport">Aéroport</Label>
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
                  <Label htmlFor="priorite">Priorité</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner la priorité" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="normale">Normale</SelectItem>
                      <SelectItem value="urgente">Urgente</SelectItem>
                      <SelectItem value="tres-urgente">Très urgente</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="contenu">Contenu de la correspondance *</Label>
                <Textarea
                  id="contenu"
                  placeholder="Rédiger le contenu de la correspondance..."
                  rows={6}
                  required
                />
              </div>

              {/* Section Actions */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center justify-between">
                    Actions à effectuer
                    <Button type="button" variant="outline" size="sm">
                      <Plus className="w-4 h-4 mr-1" />
                      Ajouter une action
                    </Button>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="border border-gray-200 rounded-lg p-4 space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="action-titre">Titre de l'action</Label>
                        <Input
                          id="action-titre"
                          placeholder="Titre de l'action à effectuer"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="action-priorite">Priorité</Label>
                        <Select>
                          <SelectTrigger>
                            <SelectValue placeholder="Priorité" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="basse">Basse</SelectItem>
                            <SelectItem value="moyenne">Moyenne</SelectItem>
                            <SelectItem value="haute">Haute</SelectItem>
                            <SelectItem value="critique">Critique</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="action-description">Description de l'action</Label>
                      <Textarea
                        id="action-description"
                        placeholder="Description détaillée de l'action..."
                        rows={3}
                      />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="action-responsable">Responsable</Label>
                        <Select>
                          <SelectTrigger>
                            <SelectValue placeholder="Assigner à..." />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="user1">Ahmed Ben Ali</SelectItem>
                            <SelectItem value="user2">Fatma Trabelsi</SelectItem>
                            <SelectItem value="user3">Mohamed Sassi</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="action-echeance">Échéance</Label>
                        <Input
                          id="action-echeance"
                          type="date"
                        />
                      </div>
                    </div>
                    <div className="flex justify-end">
                      <Button type="button" variant="outline" size="sm">
                        <UserPlus className="w-4 h-4 mr-1" />
                        Ajouter un responsable
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <div className="space-y-2">
                <Label htmlFor="pieces-jointes">Pièces jointes</Label>
                <Input
                  id="pieces-jointes"
                  type="file"
                  multiple
                  accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                />
                <p className="text-sm text-gray-500">
                  Formats acceptés: PDF, DOC, DOCX, JPG, PNG
                </p>
              </div>

              <div className="flex justify-end space-x-4">
                <Button variant="outline">
                  Annuler
                </Button>
                <Button className="bg-aviation-sky hover:bg-aviation-sky-dark">
                  <Save className="w-4 h-4 mr-2" />
                  Enregistrer la correspondance
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
};

export default Correspondances;
