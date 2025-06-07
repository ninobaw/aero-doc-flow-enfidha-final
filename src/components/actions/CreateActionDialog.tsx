
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
import { useActions } from '@/hooks/useActions';
import { useUsers } from '@/hooks/useUsers';
import { cn } from '@/lib/utils';

export const CreateActionDialog = () => {
  const [open, setOpen] = useState(false);
  const { createAction, isCreating } = useActions();
  const { users } = useUsers();
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    priority: 'MEDIUM' as 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT',
    assigned_to: [] as string[],
    due_date: new Date(),
    estimated_hours: '',
  });

  const [dateOpen, setDateOpen] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title || !formData.description) {
      return;
    }

    const actionData = {
      ...formData,
      estimated_hours: formData.estimated_hours ? parseFloat(formData.estimated_hours) : undefined,
      due_date: formData.due_date.toISOString(),
    };

    createAction(actionData, {
      onSuccess: () => {
        setFormData({
          title: '',
          description: '',
          priority: 'MEDIUM',
          assigned_to: [],
          due_date: new Date(),
          estimated_hours: '',
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
          Nouvelle Action
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Créer une nouvelle action</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
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
            <Label htmlFor="description">Description *</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Description détaillée de l'action"
              rows={4}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="priority">Priorité</Label>
              <Select value={formData.priority} onValueChange={(value: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT') => setFormData({ ...formData, priority: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="LOW">Faible</SelectItem>
                  <SelectItem value="MEDIUM">Moyenne</SelectItem>
                  <SelectItem value="HIGH">Élevée</SelectItem>
                  <SelectItem value="URGENT">Urgente</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="estimated_hours">Heures estimées</Label>
              <Input
                id="estimated_hours"
                type="number"
                value={formData.estimated_hours}
                onChange={(e) => setFormData({ ...formData, estimated_hours: e.target.value })}
                placeholder="Ex: 8"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="due_date">Date d'échéance</Label>
            <Popover open={dateOpen} onOpenChange={setDateOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !formData.due_date && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {formData.due_date ? format(formData.due_date, "PPP", { locale: fr }) : "Sélectionner une date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={formData.due_date}
                  onSelect={(date) => {
                    if (date) {
                      setFormData({ ...formData, due_date: date });
                      setDateOpen(false);
                    }
                  }}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          <div>
            <Label htmlFor="assigned_to">Assigné à</Label>
            <Select onValueChange={(value) => {
              if (!formData.assigned_to.includes(value)) {
                setFormData({ ...formData, assigned_to: [...formData.assigned_to, value] });
              }
            }}>
              <SelectTrigger>
                <SelectValue placeholder="Sélectionner des utilisateurs" />
              </SelectTrigger>
              <SelectContent>
                {users.filter(user => user.is_active).map((user) => (
                  <SelectItem key={user.id} value={user.id}>
                    {user.first_name} {user.last_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {formData.assigned_to.length > 0 && (
              <div className="mt-2 space-y-1">
                {formData.assigned_to.map((userId) => {
                  const user = users.find(u => u.id === userId);
                  return user ? (
                    <div key={userId} className="flex items-center justify-between bg-gray-100 p-2 rounded">
                      <span>{user.first_name} {user.last_name}</span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => setFormData({ 
                          ...formData, 
                          assigned_to: formData.assigned_to.filter(id => id !== userId) 
                        })}
                      >
                        ×
                      </Button>
                    </div>
                  ) : null;
                })}
              </div>
            )}
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Annuler
            </Button>
            <Button type="submit" disabled={isCreating}>
              {isCreating ? 'Création...' : 'Créer l\'action'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
