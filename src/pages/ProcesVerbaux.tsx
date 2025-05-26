
import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ClipboardList, Save, Plus, UserPlus, Users } from 'lucide-react';

const ProcesVerbaux = () => {
  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Procès-Verbaux</h1>
          <p className="text-gray-500 mt-1">
            Créer et gérer les procès-verbaux de réunions
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <ClipboardList className="w-5 h-5 mr-2 text-aviation-sky" />
              Nouveau Procès-Verbal
            </CardTitle>
            <CardDescription>
              Rédiger un nouveau procès-verbal avec actions de suivi
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="titre-reunion">Titre de la réunion *</Label>
                  <Input
                    id="titre-reunion"
                    placeholder="Titre de la réunion"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="numero-pv">Numéro PV</Label>
                  <Input
                    id="numero-pv"
                    placeholder="PV-2025-001"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="date-reunion">Date de la réunion *</Label>
                  <Input
                    id="date-reunion"
                    type="datetime-local"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="duree">Durée (heures)</Label>
                  <Input
                    id="duree"
                    type="number"
                    placeholder="2"
                    step="0.5"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="lieu">Lieu de la réunion</Label>
                  <Input
                    id="lieu"
                    placeholder="Salle de réunion A1"
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
                  <Label htmlFor="president">Président de séance</Label>
                  <Input
                    id="president"
                    placeholder="Nom du président"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="secretaire">Secrétaire de séance</Label>
                  <Input
                    id="secretaire"
                    placeholder="Nom du secrétaire"
                  />
                </div>
              </div>

              {/* Participants */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center justify-between">
                    <div className="flex items-center">
                      <Users className="w-5 h-5 mr-2" />
                      Participants
                    </div>
                    <Button type="button" variant="outline" size="sm">
                      <Plus className="w-4 h-4 mr-1" />
                      Ajouter un participant
                    </Button>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center space-x-4 p-3 border border-gray-200 rounded-lg">
                      <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-4">
                        <Input placeholder="Nom du participant" />
                        <Input placeholder="Fonction" />
                        <Select>
                          <SelectTrigger>
                            <SelectValue placeholder="Statut" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="present">Présent</SelectItem>
                            <SelectItem value="absent">Absent</SelectItem>
                            <SelectItem value="excuse">Excusé</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <div className="space-y-2">
                <Label htmlFor="ordre-jour">Ordre du jour</Label>
                <Textarea
                  id="ordre-jour"
                  placeholder="1. Point 1&#10;2. Point 2&#10;3. Point 3..."
                  rows={4}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="discussions">Discussions et décisions</Label>
                <Textarea
                  id="discussions"
                  placeholder="Détailler les discussions, décisions prises et points importants..."
                  rows={6}
                />
              </div>

              {/* Section Actions */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center justify-between">
                    Actions décidées
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
                        <Label htmlFor="action-titre">Action à réaliser</Label>
                        <Input
                          id="action-titre"
                          placeholder="Titre de l'action"
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
                      <Label htmlFor="action-description">Description détaillée</Label>
                      <Textarea
                        id="action-description"
                        placeholder="Description de l'action à réaliser..."
                        rows={3}
                      />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="action-responsable">Responsable principal</Label>
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
                      <div className="space-y-2">
                        <Label htmlFor="action-statut">Statut initial</Label>
                        <Select>
                          <SelectTrigger>
                            <SelectValue placeholder="Statut" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="a-faire">À faire</SelectItem>
                            <SelectItem value="en-cours">En cours</SelectItem>
                            <SelectItem value="termine">Terminé</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="flex justify-end">
                      <Button type="button" variant="outline" size="sm">
                        <UserPlus className="w-4 h-4 mr-1" />
                        Ajouter des collaborateurs
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <div className="space-y-2">
                <Label htmlFor="prochaine-reunion">Prochaine réunion</Label>
                <Input
                  id="prochaine-reunion"
                  type="datetime-local"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="annexes">Annexes</Label>
                <Input
                  id="annexes"
                  type="file"
                  multiple
                  accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png"
                />
                <p className="text-sm text-gray-500">
                  Joindre les documents de support (présentations, rapports, etc.)
                </p>
              </div>

              <div className="flex justify-end space-x-4">
                <Button variant="outline">
                  Annuler
                </Button>
                <Button className="bg-aviation-sky hover:bg-aviation-sky-dark">
                  <Save className="w-4 h-4 mr-2" />
                  Enregistrer le PV
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
};

export default ProcesVerbaux;
