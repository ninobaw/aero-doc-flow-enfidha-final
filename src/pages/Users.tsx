
import { useState } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Users as UsersIcon, Settings, Shield, Search, Eye, Edit, MoreHorizontal, Trash2 } from 'lucide-react';
import { CreateUserDialog } from '@/components/users/CreateUserDialog';
import { User, UserRole } from '@/shared/types';
import { toast } from '@/hooks/use-toast';

const Users = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [users, setUsers] = useState<User[]>([
    {
      id: '1',
      firstName: 'Ahmed',
      lastName: 'Ben Ali',
      email: 'ahmed.benali@enfidha-airport.tn',
      role: UserRole.SUPER_ADMIN,
      airport: 'ENFIDHA',
      isActive: true,
      createdAt: new Date('2025-01-20'),
      updatedAt: new Date(),
      phone: '+216 20 123 456',
      department: 'Administration'
    },
    {
      id: '2',
      firstName: 'Fatma',
      lastName: 'Trabelsi',
      email: 'fatma.trabelsi@monastir-airport.tn',
      role: UserRole.ADMINISTRATOR,
      airport: 'MONASTIR',
      isActive: true,
      createdAt: new Date('2025-01-18'),
      updatedAt: new Date(),
      phone: '+216 25 789 012',
      department: 'Opérations'
    },
    {
      id: '3',
      firstName: 'Mohamed',
      lastName: 'Sassi',
      email: 'mohamed.sassi@enfidha-airport.tn',
      role: UserRole.USER,
      airport: 'ENFIDHA',
      isActive: true,
      createdAt: new Date('2025-01-15'),
      updatedAt: new Date(),
      phone: '+216 22 456 789',
      department: 'Maintenance'
    },
    {
      id: '4',
      firstName: 'Leila',
      lastName: 'Hamdi',
      email: 'leila.hamdi@monastir-airport.tn',
      role: UserRole.APPROVER,
      airport: 'MONASTIR',
      isActive: false,
      createdAt: new Date('2025-01-10'),
      updatedAt: new Date(),
      phone: '+216 24 321 654',
      department: 'Qualité'
    }
  ]);

  const handleUserCreated = (newUser: User) => {
    setUsers([...users, newUser]);
  };

  const handleToggleUserStatus = (userId: string) => {
    setUsers(users.map(user => 
      user.id === userId 
        ? { ...user, isActive: !user.isActive, updatedAt: new Date() }
        : user
    ));
    
    const user = users.find(u => u.id === userId);
    toast({
      title: user?.isActive ? "Utilisateur désactivé" : "Utilisateur activé",
      description: `${user?.firstName} ${user?.lastName} a été ${user?.isActive ? 'désactivé' : 'activé'}`
    });
  };

  const getRoleBadge = (role: UserRole) => {
    const roleConfig = {
      [UserRole.SUPER_ADMIN]: { label: 'Super Admin', color: 'bg-red-100 text-red-800' },
      [UserRole.ADMINISTRATOR]: { label: 'Administrateur', color: 'bg-blue-100 text-blue-800' },
      [UserRole.APPROVER]: { label: 'Approbateur', color: 'bg-green-100 text-green-800' },
      [UserRole.USER]: { label: 'Utilisateur', color: 'bg-gray-100 text-gray-800' },
      [UserRole.VISITOR]: { label: 'Visiteur', color: 'bg-yellow-100 text-yellow-800' }
    };

    const config = roleConfig[role];
    return <Badge className={config.color}>{config.label}</Badge>;
  };

  const filteredUsers = users.filter(user =>
    user.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.department?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* En-tête */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Gestion des Utilisateurs</h1>
            <p className="text-gray-500 mt-1">
              Gérez les utilisateurs et leurs permissions
            </p>
          </div>
          <CreateUserDialog onUserCreated={handleUserCreated} />
        </div>

        {/* Statistiques utilisateurs */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[
            { title: 'Total Utilisateurs', value: users.length, icon: UsersIcon, color: 'text-aviation-sky' },
            { title: 'Actifs', value: users.filter(u => u.isActive).length, icon: Shield, color: 'text-green-600' },
            { title: 'Enfidha', value: users.filter(u => u.airport === 'ENFIDHA').length, icon: Shield, color: 'text-blue-600' },
            { title: 'Monastir', value: users.filter(u => u.airport === 'MONASTIR').length, icon: Shield, color: 'text-purple-600' }
          ].map((stat, index) => (
            <Card key={index}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                    <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                  </div>
                  <stat.icon className={`h-8 w-8 ${stat.color}`} />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Recherche */}
        <Card>
          <CardHeader>
            <CardTitle>Rechercher Utilisateurs</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Rechercher par nom, email ou département..."
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </CardContent>
        </Card>

        {/* Liste des utilisateurs */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <UsersIcon className="w-5 h-5 mr-2 text-aviation-sky" />
              Utilisateurs ({filteredUsers.length})
            </CardTitle>
            <CardDescription>
              Liste de tous les utilisateurs du système
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Utilisateur</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Rôle</TableHead>
                  <TableHead>Département</TableHead>
                  <TableHead>Aéroport</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date d'ajout</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.map((user) => (
                  <TableRow key={user.id} className="hover:bg-gray-50">
                    <TableCell>
                      <div className="flex items-center space-x-3">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={user.profilePhoto} />
                          <AvatarFallback className="bg-aviation-sky text-white text-xs">
                            {user.firstName[0]}{user.lastName[0]}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium text-gray-900">
                            {user.firstName} {user.lastName}
                          </div>
                          {user.phone && (
                            <div className="text-sm text-gray-500">{user.phone}</div>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm text-gray-600">{user.email}</TableCell>
                    <TableCell>{getRoleBadge(user.role)}</TableCell>
                    <TableCell>
                      <span className="text-sm text-gray-600">{user.department || 'Non défini'}</span>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{user.airport}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge 
                        className={user.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}
                        onClick={() => handleToggleUserStatus(user.id)}
                        style={{ cursor: 'pointer' }}
                      >
                        {user.isActive ? 'Actif' : 'Inactif'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-gray-500">
                      {user.createdAt.toLocaleDateString('fr-FR')}
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="bg-white">
                          <DropdownMenuItem className="cursor-pointer">
                            <Eye className="mr-2 h-4 w-4" />
                            Voir profil
                          </DropdownMenuItem>
                          <DropdownMenuItem className="cursor-pointer">
                            <Edit className="mr-2 h-4 w-4" />
                            Modifier
                          </DropdownMenuItem>
                          <DropdownMenuItem className="cursor-pointer">
                            <Settings className="mr-2 h-4 w-4" />
                            Permissions
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            className="cursor-pointer text-red-600"
                            onClick={() => handleToggleUserStatus(user.id)}
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            {user.isActive ? 'Désactiver' : 'Activer'}
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
};

export default Users;
