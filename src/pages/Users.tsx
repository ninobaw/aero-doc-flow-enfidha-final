
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
import { EditUserDialog } from '@/components/users/EditUserDialog';
import { ViewUserDialog } from '@/components/users/ViewUserDialog';
import { useUsers } from '@/hooks/useUsers';
import { useAuth } from '@/contexts/AuthContext';
import { UserRole } from '@/shared/types';

const Users = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  
  const { users, isLoading, updateUser, deleteUser } = useUsers();
  const { user: currentUser, hasPermission } = useAuth();

  const handleToggleUserStatus = (userId: string) => {
    const user = users.find(u => u.id === userId);
    if (user) {
      updateUser({ id: userId, is_active: !user.is_active });
    }
  };

  const handleViewUser = (user: any) => {
    setSelectedUser(user);
    setViewDialogOpen(true);
  };

  const handleEditUser = (user: any) => {
    setSelectedUser(user);
    setEditDialogOpen(true);
  };

  const getRoleBadge = (role: string) => {
    const roleConfig = {
      'SUPER_ADMIN': { label: 'Super Admin', color: 'bg-red-100 text-red-800' },
      'ADMINISTRATOR': { label: 'Administrateur', color: 'bg-blue-100 text-blue-800' },
      'APPROVER': { label: 'Approbateur', color: 'bg-green-100 text-green-800' },
      'USER': { label: 'Utilisateur', color: 'bg-gray-100 text-gray-800' },
      'VISITOR': { label: 'Visiteur', color: 'bg-yellow-100 text-yellow-800' }
    };

    const config = roleConfig[role as keyof typeof roleConfig] || roleConfig.USER;
    return <Badge className={config.color}>{config.label}</Badge>;
  };

  const filteredUsers = users.filter(user =>
    user.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.department?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const canManageUsers = hasPermission('manage_users');

  if (isLoading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-lg">Chargement des utilisateurs...</div>
        </div>
      </AppLayout>
    );
  }

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
          {canManageUsers && <CreateUserDialog />}
        </div>

        {/* Statistiques utilisateurs */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[
            { title: 'Total Utilisateurs', value: users.length, icon: UsersIcon, color: 'text-aviation-sky' },
            { title: 'Actifs', value: users.filter(u => u.is_active).length, icon: Shield, color: 'text-green-600' },
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
                          <AvatarImage src={user.profile_photo} />
                          <AvatarFallback className="bg-aviation-sky text-white text-xs">
                            {user.first_name[0]}{user.last_name[0]}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium text-gray-900">
                            {user.first_name} {user.last_name}
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
                        className={user.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}
                        onClick={() => canManageUsers && handleToggleUserStatus(user.id)}
                        style={{ cursor: canManageUsers ? 'pointer' : 'default' }}
                      >
                        {user.is_active ? 'Actif' : 'Inactif'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-gray-500">
                      {new Date(user.created_at).toLocaleDateString('fr-FR')}
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="bg-white">
                          <DropdownMenuItem className="cursor-pointer" onClick={() => handleViewUser(user)}>
                            <Eye className="mr-2 h-4 w-4" />
                            Voir profil
                          </DropdownMenuItem>
                          {canManageUsers && (
                            <>
                              <DropdownMenuItem className="cursor-pointer" onClick={() => handleEditUser(user)}>
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
                                {user.is_active ? 'Désactiver' : 'Activer'}
                              </DropdownMenuItem>
                            </>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Dialogs */}
        {selectedUser && (
          <>
            <ViewUserDialog 
              user={selectedUser} 
              open={viewDialogOpen} 
              onOpenChange={setViewDialogOpen} 
            />
            <EditUserDialog 
              user={selectedUser} 
              open={editDialogOpen} 
              onOpenChange={setEditDialogOpen} 
            />
          </>
        )}
      </div>
    </AppLayout>
  );
};

export default Users;
