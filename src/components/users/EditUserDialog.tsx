import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { useUsers } from '@/hooks/useUsers';
import { useToast } from '@/hooks/use-toast';
import { Airport } from '@/shared/types'; // Import Airport type

type UserRole = 'SUPER_ADMIN' | 'ADMINISTRATOR' | 'APPROVER' | 'USER' | 'VISITOR' | 'AGENT_BUREAU_ORDRE'; // Updated type

interface EditUserDialogProps {
  user: any;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const EditUserDialog: React.FC<EditUserDialogProps> = ({ user, open, onOpenChange }) => {
  const { updateUser, isUpdating } = useUsers();
  const { toast } = useToast();
  
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    department: '',
    position: '',
    role: 'USER' as UserRole,
    airport: 'ENFIDHA' as Airport,
    isActive: true,
  });

  useEffect(() => {
    if (user) {
      setFormData({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email: user.email || '',
        phone: user.phone || '',
        department: user.department || '',
        position: user.position || '',
        role: user.role || 'USER',
        airport: user.airport || 'ENFIDHA',
        isActive: user.isActive ?? true,
      });
    }
  }, [user]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.firstName || !formData.lastName || !formData.email) {
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
        // Removed the duplicate toast call here.
        // The toast is now handled directly within the useUsers hook's mutation onSuccess.
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
                  <SelectItem value="AGENT_BUREAU_ORDRE">Agent Bureau d'Ordre</SelectItem>
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
                  <SelectItem value="GENERALE">Général</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="isActive"
              checked={formData.isActive}
              onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
            />
            <Label htmlFor="isActive">Compte actif</Label>
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