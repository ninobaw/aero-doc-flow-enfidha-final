
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { UserPlus } from 'lucide-react';
import { useUsers } from '@/hooks/useUsers';
import { useToast } from '@/hooks/use-toast';

type UserRole = 'SUPER_ADMIN' | 'ADMINISTRATOR' | 'APPROVER' | 'USER' | 'VISITOR';
type Airport = 'ENFIDHA' | 'MONASTIR';

export const CreateUserDialog: React.FC = () => {
  const [open, setOpen] = useState(false);
  const { createUser, isCreating } = useUsers();
  const { toast } = useToast();
  
  const [formData, setFormData] = useState({
    email: '',
    first_name: '',
    last_name: '',
    role: 'USER' as UserRole,
    airport: 'ENFIDHA' as Airport,
    phone: '',
    department: '',
    password: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.email || !formData.first_name || !formData.last_name || !formData.password) {
      toast({
        title: "Erreur",
        description: "Veuillez remplir tous les champs obligatoires",
        variant: "destructive"
      });
      return;
    }

    // Validation de l'email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      toast({
        title: "Erreur",
        description: "Veuillez entrer une adresse email valide",
        variant: "destructive"
      });
      return;
    }

    // Validation du mot de passe
    if (formData.password.length < 6) {
      toast({
        title: "Erreur",
        description: "Le mot de passe doit contenir au moins 6 caractères",
        variant: "destructive"
      });
      return;
    }

    createUser(formData, {
      onSuccess: () => {
        // Reset form
        setFormData({
          email: '',
          first_name: '',
          last_name: '',
          role: 'USER',
          airport: 'ENFIDHA',
          phone: '',
          department: '',
          password: ''
        });
        setOpen(false);
      }
    });
  };

  const getRoleDescription = (role: UserRole): string => {
    switch (role) {
      case 'SUPER_ADMIN':
        return "Accès complet à toutes les fonctionnalités";
      case 'ADMINISTRATOR':
        return "Gestion des utilisateurs, documents, rapports et paramètres";
      case 'APPROVER':
        return "Approbation des documents, création et consultation";
      case 'USER':
        return "Consultation et création de documents, gestion du profil";
      case 'VISITOR':
        return "Consultation des documents uniquement";
      default:
        return "Consultation et création de documents, gestion du profil";
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-aviation-sky hover:bg-aviation-sky-dark">
          <UserPlus className="w-4 h-4 mr-2" />
          Nouvel Utilisateur
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Créer un nouvel utilisateur</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="first_name">Prénom *</Label>
              <Input
                id="first_name"
                value={formData.first_name}
                onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                placeholder="Prénom"
                required
              />
            </div>
            <div>
              <Label htmlFor="last_name">Nom *</Label>
              <Input
                id="last_name"
                value={formData.last_name}
                onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                placeholder="Nom"
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
              placeholder="exemple@aerodoc.tn"
              required
            />
          </div>

          <div>
            <Label htmlFor="password">Mot de passe *</Label>
            <Input
              id="password"
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              placeholder="Minimum 6 caractères"
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
                placeholder="+216 XX XXX XXX"
              />
            </div>
            <div>
              <Label htmlFor="department">Département</Label>
              <Input
                id="department"
                value={formData.department}
                onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                placeholder="Ex: Opérations"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="role">Rôle</Label>
              <Select value={formData.role} onValueChange={(value: UserRole) => setFormData({ ...formData, role: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner le rôle" />
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
                  <SelectValue placeholder="Sélectionner l'aéroport" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ENFIDHA">Enfidha</SelectItem>
                  <SelectItem value="MONASTIR">Monastir</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="bg-blue-50 p-4 rounded-lg">
            <h4 className="font-medium text-blue-900 mb-2">Permissions du rôle sélectionné:</h4>
            <div className="text-sm text-blue-800">
              {getRoleDescription(formData.role)}
            </div>
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Annuler
            </Button>
            <Button type="submit" disabled={isCreating}>
              {isCreating ? 'Création...' : 'Créer l\'utilisateur'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
