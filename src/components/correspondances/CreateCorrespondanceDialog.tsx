
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus } from 'lucide-react';
import { useCorrespondances } from '@/hooks/useCorrespondances';
import { ActionsDecideesField, ActionDecidee } from '@/components/actions/ActionsDecideesField';

export const CreateCorrespondanceDialog = () => {
  const [open, setOpen] = useState(false);
  const { createCorrespondance, isCreating } = useCorrespondances();
  
  const [formData, setFormData] = useState({
    title: '',
    from_address: '',
    to_address: '',
    subject: '',
    content: '',
    priority: 'MEDIUM' as 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT',
    airport: 'ENFIDHA' as 'ENFIDHA' | 'MONASTIR',
    actions_decidees: [] as ActionDecidee[],
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title || !formData.from_address || !formData.to_address || !formData.subject) {
      return;
    }

    createCorrespondance(formData, {
      onSuccess: () => {
        setFormData({
          title: '',
          from_address: '',
          to_address: '',
          subject: '',
          content: '',
          priority: 'MEDIUM',
          airport: 'ENFIDHA',
          actions_decidees: [],
        });
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
          </div>

          <div>
            <Label htmlFor="airport">Aéroport</Label>
            <Select value={formData.airport} onValueChange={(value: 'ENFIDHA' | 'MONASTIR') => setFormData({ ...formData, airport: value })}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ENFIDHA">Enfidha</SelectItem>
                <SelectItem value="MONASTIR">Monastir</SelectItem>
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

          <ActionsDecideesField
            actions={formData.actions_decidees}
            onChange={(actions) => setFormData({ ...formData, actions_decidees: actions })}
          />

          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Annuler
            </Button>
            <Button type="submit" disabled={isCreating}>
              {isCreating ? 'Création...' : 'Créer'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
