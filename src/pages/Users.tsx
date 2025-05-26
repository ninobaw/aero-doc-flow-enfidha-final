
import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Users as UsersIcon, Plus, UserPlus, Settings, Shield } from 'lucide-react';
import { UserRole } from '@/types';

const Users = () => {
  const users = [
    {
      id: '1',
      firstName: 'Ahmed',
      lastName: 'Ben Ali',
      email: 'ahmed.benali@enfidha-airport.tn',
      role: UserRole.SUPER_ADMIN,
      airport: 'ENFIDHA',
      isActive: true,
      createdAt: '2025-01-20'
    },
    {
      id: '2',
      firstName: 'Fatma',
      lastName: 'Trabelsi',
      email: 'fatma.trabelsi@monastir-airport.tn',
      role: UserRole.ADMINISTRATOR,
      airport: 'MONASTIR',
      isActive: true,
      createdAt: '2025-01-18'
    },
    {
      id: '3',
      firstName: 'Mohamed',
      lastName: 'Sassi',
      email: 'mohamed.sassi@enfidha-airport.tn',
      role: UserRole.USER,
      airport: 'ENFIDHA',
      isActive: true,
      createdAt: '2025-01-15'
    },
    {
      id: '4',
      firstName: 'Leila',
      lastName: 'Hamdi',
      email: 'leila.hamdi@monastir-airport.tn',
      role: UserRole.APPROVER,
      airport: 'MONASTIR',
      isActive: false,
      createdAt: '2025-01-10'
    }
  ];

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
          <Button className="bg-aviation-sky hover:bg-aviation-sky-dark">
            <UserPlus className="w-4 h-4 mr-2" />
            Nouvel Utilisateur
          </Button>
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

        {/* Liste des utilisateurs */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <UsersIcon className="w-5 h-5 mr-2 text-aviation-sky" />
              Utilisateurs ({users.length})
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
                  <TableHead>Aéroport</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date d'ajout</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((user) => (
                  <TableRow key={user.id} className="hover:bg-gray-50">
                    <TableCell>
                      <div className="flex items-center space-x-3">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={`/api/placeholder/32/32`} />
                          <AvatarFallback className="bg-aviation-sky text-white text-xs">
                            {user.firstName[0]}{user.lastName[0]}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium text-gray-900">
                            {user.firstName} {user.lastName}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm text-gray-600">{user.email}</TableCell>
                    <TableCell>{getRoleBadge(user.role)}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{user.airport}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className={user.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                        {user.isActive ? 'Actif' : 'Inactif'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-gray-500">{user.createdAt}</TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm">
                        <Settings className="h-4 w-4" />
                      </Button>
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
