import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { useUsers } from '@/hooks/useUsers';
import { useToast } from '@/hooks/use-toast';

type UserRole = 'SUPER_ADMIN' | 'ADMINISTRATOR' | 'APPROVER' | 'USER' | 'VISITOR';
type Airport = 'ENFIDHA' | 'MONASTIR';

interface EditUserDialogProps {
  user: any;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const EditUserDialog: React.FC<EditUserDialogProps> = ({ user, open, onOpenChange }) => {
  const { updateUser, isUpdating } = useUsers();
  const { toast } = useToast();
  
  const [formData, setFormData] = useState({
    firstName: '', // Changed from first_name
    lastName: '',  // Changed from last_name
    email: '',
    phone: '',
    department: '',
    position: '',
    role: 'USER' as UserRole,
    airport: 'ENFIDHA' as Airport,
    is_active: true,
  });

  useEffect(() => {
    if (user) {
      setFormData({
        firstName: user.firstName || '', // Changed from first_name
        lastName: user.lastName || '',   // Changed from last_name
        email: user.email || '',
        phone: user.phone || '',
        department: user.department || '',
        position: user.position || '',
        role: user.role || 'USER',
        airport: user.airport || 'ENFIDHA',
        is_active: user.is_active ?? true,
      });
    }
  }, [user]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.firstName || !formData.lastName || !formData.email) { // Changed from first_name, last_name
      toast({
        title: "Erreur",
        description: "Veuillez remplir tous les champs obligatoires",
        variant: "destructive"
      });
      return;
    }

    updateUser({ id: user.id, ...formData }, {
      onSuccess: () => {
        onOpenChange(false);
        toast({
          title: "Utilisateur modifié",
          description: "L'utilisateur a été modifié avec succès"
        });
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Modifier l'utilisateur</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="firstName">Prénom *</Label>
              <Input
                id="firstName"
                value={formData.firstName}
                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                required
              />
            </div>
            <div>
              <Label htmlFor="lastName">Nom *</Label>
              <Input
                id="lastName"
                value={formData.lastName}
                onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                required
              />
            </div>
          </div>

          <div>
            <Label htmlFor="email">Email *</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="phone">Téléphone</Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="department">Département</Label>
              <Input
                id="department"
                value={formData.department}
                onChange={(e) => setFormData({ ...formData, department: e.target.value })}
              />
            </div>
          </div>

          <div>
            <Label htmlFor="position">Poste</Label>
            <Input
              id="position"
              value={formData.position}
              onChange={(e) => setFormData({ ...formData, position: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="role">Rôle</Label>
              <Select value={formData.role} onValueChange={(value: UserRole) => setFormData({ ...formData, role: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="SUPER_ADMIN">Super Administrateur</SelectItem>
                  <SelectItem value="ADMINISTRATOR">Administrateur</SelectItem>
                  <SelectItem value="APPROVER">Approbateur</SelectItem>
                  <SelectItem value="USER">Utilisateur</SelectItem>
                  <SelectItem value="VISITOR">Visiteur</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="airport">Aéroport</Label>
              <Select value={formData.airport} onValueChange={(value: Airport) => setFormData({ ...formData, airport: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ENFIDHA">Enfidha</SelectItem>
                  <SelectItem value="MONASTIR">Monastir</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="is_active"
              checked={formData.is_active}
              onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
            />
            <Label htmlFor="is_active">Compte actif</Label>
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Annuler
            </Button>
            <Button type="submit" disabled={isUpdating}>
              {isUpdating ? 'Modification...' : 'Modifier'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};