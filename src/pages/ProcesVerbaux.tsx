import { useState } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ClipboardList, Save, Plus, Users } from 'lucide-react';
import { ActionsDecideesField, ActionDecidee } from '@/components/actions/ActionsDecideesField';
import { useProcesVerbaux } from '@/hooks/useProcesVerbaux';
import { useDocuments } from '@/hooks/useDocuments';
import { useToast } from '@/hooks/use-toast';

const ProcesVerbaux = () => {
  const { toast } = useToast();
  const { createProcesVerbal, isCreating } = useProcesVerbaux();
  const { createDocument, isCreating: isCreatingDocument } = useDocuments();
  
  const [formData, setFormData] = useState({
    titreReunion: '',
    numeroPV: '',
    dateReunion: '',
    duree: '',
    lieu: '',
    aeroport: '',
    president: '',
    secretaire: '',
    ordreJour: '',
    discussions: '',
    prochaineReunion: '',
  });

  const [participants, setParticipants] = useState([
    { nom: '', fonction: '', statut: 'present' }
  ]);

  const [actionsDecidees, setActionsDecidees] = useState<ActionDecidee[]>([]);

  const addParticipant = () => {
    setParticipants([...participants, { nom: '', fonction: '', statut: 'present' }]);
  };

  const updateParticipant = (index: number, field: string, value: string) => {
    const updatedParticipants = participants.map((participant, i) => 
      i === index ? { ...participant, [field]: value } : participant
    );
    setParticipants(updatedParticipants);
  };

  const removeParticipant = (index: number) => {
    if (participants.length > 1) {
      setParticipants(participants.filter((_, i) => i !== index));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.titreReunion || !formData.dateReunion) {
      toast({
        title: 'Erreur',
        description: 'Veuillez remplir tous les champs obligatoires.',
        variant: 'destructive',
      });
      return;
    }

    try {
      const pvData = {
        title: formData.titreReunion,
        meeting_date: formData.dateReunion,
        participants: participants.map(p => `${p.nom} (${p.fonction}) - ${p.statut}`),
        agenda: formData.ordreJour,
        decisions: formData.discussions,
        location: formData.lieu,
        meeting_type: 'Réunion de travail',
        airport: (formData.aeroport as 'ENFIDHA' | 'MONASTIR') || 'ENFIDHA',
        next_meeting_date: formData.prochaineReunion || undefined,
        actions_decidees: actionsDecidees,
      };

      createProcesVerbal(pvData);

      // Réinitialiser le formulaire
      setFormData({
        titreReunion: '',
        numeroPV: '',
        dateReunion: '',
        duree: '',
        lieu: '',
        aeroport: '',
        president: '',
        secretaire: '',
        ordreJour: '',
        discussions: '',
        prochaineReunion: '',
      });
      setParticipants([{ nom: '', fonction: '', statut: 'present' }]);
      setActionsDecidees([]);
    } catch (error) {
      console.error('Erreur sauvegarde PV:', error);
    }
  };

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
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="titre-reunion">Titre de la réunion *</Label>
                  <Input
                    id="titre-reunion"
                    value={formData.titreReunion}
                    onChange={(e) => setFormData({ ...formData, titreReunion: e.target.value })}
                    placeholder="Titre de la réunion"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="numero-pv">Numéro PV</Label>
                  <Input
                    id="numero-pv"
                    value={formData.numeroPV}
                    onChange={(e) => setFormData({ ...formData, numeroPV: e.target.value })}
                    placeholder="PV-2025-001"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="date-reunion">Date de la réunion *</Label>
                  <Input
                    id="date-reunion"
                    type="datetime-local"
                    value={formData.dateReunion}
                    onChange={(e) => setFormData({ ...formData, dateReunion: e.target.value })}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="duree">Durée (heures)</Label>
                  <Input
                    id="duree"
                    type="number"
                    value={formData.duree}
                    onChange={(e) => setFormData({ ...formData, duree: e.target.value })}
                    placeholder="2"
                    step="0.5"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="lieu">Lieu de la réunion</Label>
                  <Input
                    id="lieu"
                    value={formData.lieu}
                    onChange={(e) => setFormData({ ...formData, lieu: e.target.value })}
                    placeholder="Salle de réunion A1"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="aeroport">Aéroport</Label>
                  <Select value={formData.aeroport} onValueChange={(value) => setFormData({ ...formData, aeroport: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner un aéroport" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ENFIDHA">Enfidha</SelectItem>
                      <SelectItem value="MONASTIR">Monastir</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="president">Président de séance</Label>
                  <Input
                    id="president"
                    value={formData.president}
                    onChange={(e) => setFormData({ ...formData, president: e.target.value })}
                    placeholder="Nom du président"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="secretaire">Secrétaire de séance</Label>
                  <Input
                    id="secretaire"
                    value={formData.secretaire}
                    onChange={(e) => setFormData({ ...formData, secretaire: e.target.value })}
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
                    <Button type="button" variant="outline" size="sm" onClick={addParticipant}>
                      <Plus className="w-4 h-4 mr-1" />
                      Ajouter un participant
                    </Button>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {participants.map((participant, index) => (
                      <div key={index} className="flex items-center space-x-4 p-3 border border-gray-200 rounded-lg">
                        <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-4">
                          <Input 
                            placeholder="Nom du participant" 
                            value={participant.nom}
                            onChange={(e) => updateParticipant(index, 'nom', e.target.value)}
                          />
                          <Input 
                            placeholder="Fonction" 
                            value={participant.fonction}
                            onChange={(e) => updateParticipant(index, 'fonction', e.target.value)}
                          />
                          <Select value={participant.statut} onValueChange={(value) => updateParticipant(index, 'statut', value)}>
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
                        {participants.length > 1 && (
                          <Button 
                            type="button" 
                            variant="outline" 
                            size="sm"
                            onClick={() => removeParticipant(index)}
                            className="text-red-600"
                          >
                            <Plus className="w-4 h-4 rotate-45" />
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <div className="space-y-2">
                <Label htmlFor="ordre-jour">Ordre du jour</Label>
                <Textarea
                  id="ordre-jour"
                  value={formData.ordreJour}
                  onChange={(e) => setFormData({ ...formData, ordreJour: e.target.value })}
                  placeholder="1. Point 1&#10;2. Point 2&#10;3. Point 3..."
                  rows={4}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="discussions">Discussions et décisions</Label>
                <Textarea
                  id="discussions"
                  value={formData.discussions}
                  onChange={(e) => setFormData({ ...formData, discussions: e.target.value })}
                  placeholder="Détailler les discussions, décisions prises et points importants..."
                  rows={6}
                />
              </div>

              {/* Actions décidées */}
              <ActionsDecideesField
                actions={actionsDecidees}
                onChange={setActionsDecidees}
                disabled={isCreating || isCreatingDocument}
              />

              <div className="space-y-2">
                <Label htmlFor="prochaine-reunion">Prochaine réunion</Label>
                <Input
                  id="prochaine-reunion"
                  type="datetime-local"
                  value={formData.prochaineReunion}
                  onChange={(e) => setFormData({ ...formData, prochaineReunion: e.target.value })}
                />
              </div>

              <div className="flex justify-end space-x-4">
                <Button variant="outline" type="button">
                  Annuler
                </Button>
                <Button 
                  type="submit"
                  disabled={isCreating || isCreatingDocument}
                  className="bg-aviation-sky hover:bg-aviation-sky-dark"
                >
                  <Save className="w-4 h-4 mr-2" />
                  {isCreating || isCreatingDocument ? 'Enregistrement...' : 'Enregistrer le PV'}
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
