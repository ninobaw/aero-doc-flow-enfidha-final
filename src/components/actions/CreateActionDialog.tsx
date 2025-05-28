
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, Plus } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Action, ActionStatus, Priority } from '@/shared/types';
import { toast } from '@/hooks/use-toast';

interface CreateActionDialogProps {
  onActionCreated: (action: Action) => void;
  documents: Array<{ id: string; title: string }>;
  users: Array<{ id: string; firstName: string; lastName: string }>;
}

export const CreateActionDialog: React.FC<CreateActionDialogProps> = ({
  onActionCreated,
  documents,
  users
}) => {
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    assignedTo: [] as string[],
    dueDate: undefined as Date | undefined,
    priority: Priority.MEDIUM,
    parentDocumentId: '',
    estimatedHours: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title || !formData.description || !formData.parentDocumentId || !formData.dueDate) {
      toast({
        title: "Erreur",
        description: "Veuillez remplir tous les champs obligatoires",
        variant: "destructive"
      });
      return;
    }

    const newAction: Action = {
      id: `action-${Date.now()}`,
      title: formData.title,
      description: formData.description,
      assignedTo: formData.assignedTo,
      dueDate: formData.dueDate,
      status: ActionStatus.PENDING,
      priority: formData.priority,
      createdAt: new Date(),
      updatedAt: new Date(),
      parentDocumentId: formData.parentDocumentId,
      tasks: [],
      progress: 0,
      estimatedHours: formData.estimatedHours ? parseInt(formData.estimatedHours) : undefined
    };

    onActionCreated(newAction);
    
    toast({
      title: "Action créée",
      description: "L'action a été créée avec succès"
    });

    // Reset form
    setFormData({
      title: '',
      description: '',
      assignedTo: [],
      dueDate: undefined,
      priority: Priority.MEDIUM,
      parentDocumentId: '',
      estimatedHours: ''
    });
    
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-aviation-sky hover:bg-aviation-sky-dark">
          <Plus className="w-4 h-4 mr-2" />
          Nouvelle Action
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Créer une nouvelle action</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="title">Titre *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Titre de l'action"
                required
              />
            </div>
            <div>
              <Label htmlFor="priority">Priorité</Label>
              <Select value={formData.priority} onValueChange={(value: Priority) => setFormData({ ...formData, priority: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner la priorité" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={Priority.LOW}>Faible</SelectItem>
                  <SelectItem value={Priority.MEDIUM}>Moyen</SelectItem>
                  <SelectItem value={Priority.HIGH}>Élevé</SelectItem>
                  <SelectItem value={Priority.URGENT}>Urgent</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label htmlFor="description">Description *</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Description détaillée de l'action"
              rows={3}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="document">Document lié *</Label>
              <Select value={formData.parentDocumentId} onValueChange={(value) => setFormData({ ...formData, parentDocumentId: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner un document" />
                </SelectTrigger>
                <SelectContent>
                  {documents.map((doc) => (
                    <SelectItem key={doc.id} value={doc.id}>
                      {doc.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="estimatedHours">Heures estimées</Label>
              <Input
                id="estimatedHours"
                type="number"
                value={formData.estimatedHours}
                onChange={(e) => setFormData({ ...formData, estimatedHours: e.target.value })}
                placeholder="Ex: 8"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="assignedTo">Assigné à</Label>
            <Select value={formData.assignedTo[0] || ''} onValueChange={(value) => setFormData({ ...formData, assignedTo: [value] })}>
              <SelectTrigger>
                <SelectValue placeholder="Sélectionner un utilisateur" />
              </SelectTrigger>
              <SelectContent>
                {users.map((user) => (
                  <SelectItem key={user.id} value={user.id}>
                    {user.firstName} {user.lastName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Date d'échéance *</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full justify-start text-left font-normal"
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {formData.dueDate ? format(formData.dueDate, "PPP", { locale: fr }) : "Sélectionner une date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={formData.dueDate}
                  onSelect={(date) => setFormData({ ...formData, dueDate: date })}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Annuler
            </Button>
            <Button type="submit">
              Créer l'action
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
