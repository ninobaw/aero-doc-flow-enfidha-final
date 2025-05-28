
import { useState } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
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
import { Activity, Clock, CheckCircle, AlertTriangle, Search, Eye, Edit, MoreHorizontal } from 'lucide-react';
import { CreateActionDialog } from '@/components/actions/CreateActionDialog';
import { ActionHistory } from '@/components/actions/ActionHistory';
import { Action, ActionStatus, Priority } from '@/shared/types';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

const Actions = () => {
  const [actions, setActions] = useState<Action[]>([
    {
      id: 'action-1',
      title: 'Révision Procédures Sécurité',
      description: 'Réviser et mettre à jour les procédures de sécurité du terminal A',
      assignedTo: ['user-1'],
      dueDate: new Date('2025-02-15'),
      status: ActionStatus.IN_PROGRESS,
      priority: Priority.HIGH,
      createdAt: new Date('2025-01-20'),
      updatedAt: new Date('2025-01-26'),
      parentDocumentId: 'doc-1',
      tasks: [],
      progress: 65,
      estimatedHours: 16,
      actualHours: 10
    },
    {
      id: 'action-2',
      title: 'Formation Personnel',
      description: 'Organiser une formation sur les nouvelles procédures',
      assignedTo: ['user-2'],
      dueDate: new Date('2025-02-28'),
      status: ActionStatus.PENDING,
      priority: Priority.MEDIUM,
      createdAt: new Date('2025-01-22'),
      updatedAt: new Date('2025-01-22'),
      parentDocumentId: 'doc-2',
      tasks: [],
      progress: 0,
      estimatedHours: 8
    }
  ]);

  const [searchTerm, setSearchTerm] = useState('');

  const mockDocuments = [
    { id: 'doc-1', title: 'Rapport Sécurité Terminal A' },
    { id: 'doc-2', title: 'Correspondance DGAC' },
    { id: 'doc-3', title: 'PV Réunion Sécurité' }
  ];

  const mockUsers = [
    { id: 'user-1', firstName: 'Ahmed', lastName: 'Ben Ali' },
    { id: 'user-2', firstName: 'Fatma', lastName: 'Trabelsi' },
    { id: 'user-3', firstName: 'Mohamed', lastName: 'Sassi' }
  ];

  const mockHistory = [
    {
      id: 'hist-1',
      actionId: 'action-1',
      action: 'Action créée',
      userId: 'user-1',
      userName: 'Ahmed Ben Ali',
      timestamp: new Date('2025-01-20'),
      details: 'Action créée et assignée'
    },
    {
      id: 'hist-2',
      actionId: 'action-1',
      action: 'Progression mise à jour',
      userId: 'user-1',
      userName: 'Ahmed Ben Ali',
      timestamp: new Date('2025-01-26'),
      details: 'Progression passée à 65%'
    }
  ];

  const handleActionCreated = (newAction: Action) => {
    setActions([...actions, newAction]);
  };

  const getStatusBadge = (status: ActionStatus) => {
    switch (status) {
      case ActionStatus.PENDING:
        return <Badge className="bg-yellow-100 text-yellow-800">En attente</Badge>;
      case ActionStatus.IN_PROGRESS:
        return <Badge className="bg-blue-100 text-blue-800">En cours</Badge>;
      case ActionStatus.COMPLETED:
        return <Badge className="bg-green-100 text-green-800">Terminé</Badge>;
      case ActionStatus.CANCELLED:
        return <Badge className="bg-red-100 text-red-800">Annulé</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getPriorityBadge = (priority: Priority) => {
    switch (priority) {
      case Priority.LOW:
        return <Badge className="bg-gray-100 text-gray-800">Faible</Badge>;
      case Priority.MEDIUM:
        return <Badge className="bg-yellow-100 text-yellow-800">Moyen</Badge>;
      case Priority.HIGH:
        return <Badge className="bg-orange-100 text-orange-800">Élevé</Badge>;
      case Priority.URGENT:
        return <Badge className="bg-red-100 text-red-800">Urgent</Badge>;
      default:
        return <Badge variant="outline">{priority}</Badge>;
    }
  };

  const filteredActions = actions.filter(action =>
    action.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    action.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Actions & Tâches</h1>
            <p className="text-gray-500 mt-1">
              Suivi des actions et gestion des tâches
            </p>
          </div>
          <CreateActionDialog
            onActionCreated={handleActionCreated}
            documents={mockDocuments}
            users={mockUsers}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[
            { 
              title: 'Total Actions', 
              value: actions.length, 
              icon: Activity, 
              color: 'text-aviation-sky' 
            },
            { 
              title: 'En Cours', 
              value: actions.filter(a => a.status === ActionStatus.IN_PROGRESS).length, 
              icon: Clock, 
              color: 'text-aviation-warning' 
            },
            { 
              title: 'Complétées', 
              value: actions.filter(a => a.status === ActionStatus.COMPLETED).length, 
              icon: CheckCircle, 
              color: 'text-aviation-success' 
            },
            { 
              title: 'Urgentes', 
              value: actions.filter(a => a.priority === Priority.URGENT).length, 
              icon: AlertTriangle, 
              color: 'text-red-600' 
            }
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
            <CardTitle>Rechercher Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Rechercher par titre ou description..."
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </CardContent>
        </Card>

        {/* Liste des actions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Activity className="w-5 h-5 mr-2 text-aviation-sky" />
              Actions ({filteredActions.length})
            </CardTitle>
            <CardDescription>
              Liste de toutes les actions dans le système
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Titre</TableHead>
                  <TableHead>Assigné à</TableHead>
                  <TableHead>Priorité</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Progression</TableHead>
                  <TableHead>Échéance</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredActions.map((action) => (
                  <TableRow key={action.id} className="hover:bg-gray-50">
                    <TableCell>
                      <div>
                        <p className="font-medium">{action.title}</p>
                        <p className="text-sm text-gray-500 truncate max-w-xs">{action.description}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      {action.assignedTo.map(userId => {
                        const user = mockUsers.find(u => u.id === userId);
                        return user ? `${user.firstName} ${user.lastName}` : 'Non assigné';
                      }).join(', ')}
                    </TableCell>
                    <TableCell>{getPriorityBadge(action.priority)}</TableCell>
                    <TableCell>{getStatusBadge(action.status)}</TableCell>
                    <TableCell>
                      <div className="w-full">
                        <Progress value={action.progress} className="w-full" />
                        <span className="text-xs text-gray-500">{action.progress}%</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm text-gray-500">
                      {format(action.dueDate, "dd/MM/yyyy", { locale: fr })}
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
                            Voir détails
                          </DropdownMenuItem>
                          <DropdownMenuItem className="cursor-pointer">
                            <Edit className="mr-2 h-4 w-4" />
                            Modifier
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

        {/* Historique des actions */}
        {filteredActions.length > 0 && (
          <ActionHistory
            actionId={filteredActions[0].id}
            entries={mockHistory}
          />
        )}
      </div>
    </AppLayout>
  );
};

export default Actions;
