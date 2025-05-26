
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  FileText,
  Users,
  CheckCircle,
  Clock,
  TrendingUp,
  Plane,
  AlertTriangle,
  Activity
} from 'lucide-react';

export const Dashboard = () => {
  const stats = [
    {
      title: 'Total Documents',
      value: '2,847',
      change: '+12.5%',
      icon: FileText,
      color: 'text-aviation-sky'
    },
    {
      title: 'Utilisateurs Actifs',
      value: '156',
      change: '+3.2%',
      icon: Users,
      color: 'text-green-600'
    },
    {
      title: 'Actions Complétées',
      value: '89%',
      change: '+5.1%',
      icon: CheckCircle,
      color: 'text-aviation-success'
    },
    {
      title: 'Tâches en Cours',
      value: '23',
      change: '-2.4%',
      icon: Clock,
      color: 'text-aviation-warning'
    }
  ];

  const recentDocuments = [
    {
      id: '1',
      title: 'Rapport Sécurité Terminal A',
      type: 'PROCES_VERBAL',
      status: 'En cours',
      date: '2025-01-26',
      airport: 'ENFIDHA'
    },
    {
      id: '2',
      title: 'Correspondance DGAC',
      type: 'CORRESPONDANCE',
      status: 'Approuvé',
      date: '2025-01-25',
      airport: 'MONASTIR'
    },
    {
      id: '3',
      title: 'Formulaire Maintenance',
      type: 'FORMULAIRE_DOC',
      status: 'En attente',
      date: '2025-01-24',
      airport: 'ENFIDHA'
    }
  ];

  const urgentActions = [
    {
      id: '1',
      title: 'Inspection piste principale',
      assignee: 'Ahmed Ben Ali',
      dueDate: 'Aujourd\'hui',
      priority: 'URGENT'
    },
    {
      id: '2',
      title: 'Révision protocole sécurité',
      assignee: 'Fatma Trabelsi',
      dueDate: 'Demain',
      priority: 'HIGH'
    },
    {
      id: '3',
      title: 'Formation équipe bagages',
      assignee: 'Mohamed Sassi',
      dueDate: '3 jours',
      priority: 'MEDIUM'
    }
  ];

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-500 mt-1">
            Vue d'ensemble des activités aéroportuaires
          </p>
        </div>
        <div className="flex items-center space-x-2 bg-white px-4 py-2 rounded-lg shadow-sm border">
          <Plane className="w-5 h-5 text-aviation-sky" />
          <span className="text-sm font-medium">Enfidha - Monastir</span>
        </div>
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <Card key={index} className="hover:shadow-lg transition-shadow duration-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                {stat.title}
              </CardTitle>
              <stat.icon className={`h-5 w-5 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
              <p className="text-xs text-muted-foreground">
                <span className={stat.change.startsWith('+') ? 'text-green-600' : 'text-red-600'}>
                  {stat.change}
                </span>
                {' '}par rapport au mois dernier
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Documents récents */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <FileText className="w-5 h-5 mr-2 text-aviation-sky" />
              Documents Récents
            </CardTitle>
            <CardDescription>
              Derniers documents créés ou modifiés
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentDocuments.map((doc) => (
                <div key={doc.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900">{doc.title}</h4>
                    <div className="flex items-center space-x-2 mt-1">
                      <Badge variant="outline" className="text-xs">
                        {doc.type}
                      </Badge>
                      <span className="text-xs text-gray-500">{doc.airport}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <Badge 
                      variant={doc.status === 'Approuvé' ? 'default' : 'secondary'}
                      className="mb-1"
                    >
                      {doc.status}
                    </Badge>
                    <p className="text-xs text-gray-500">{doc.date}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Actions urgentes */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <AlertTriangle className="w-5 h-5 mr-2 text-aviation-warning" />
              Actions Urgentes
            </CardTitle>
            <CardDescription>
              Tâches nécessitant une attention immédiate
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {urgentActions.map((action) => (
                <div key={action.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900">{action.title}</h4>
                    <p className="text-sm text-gray-600">{action.assignee}</p>
                  </div>
                  <div className="text-right">
                    <Badge 
                      variant={action.priority === 'URGENT' ? 'destructive' : 'default'}
                      className="mb-1"
                    >
                      {action.priority}
                    </Badge>
                    <p className="text-xs text-gray-500">{action.dueDate}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Activité récente */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Activity className="w-5 h-5 mr-2 text-aviation-sky" />
            Activité Récente
          </CardTitle>
          <CardDescription>
            Historique des dernières actions dans le système
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[
              { user: 'Ahmed Ben Ali', action: 'a créé le document', target: 'Rapport Sécurité Terminal A', time: 'Il y a 2h' },
              { user: 'Fatma Trabelsi', action: 'a approuvé', target: 'Correspondance DGAC', time: 'Il y a 4h' },
              { user: 'Mohamed Sassi', action: 'a complété la tâche', target: 'Inspection bagages', time: 'Il y a 6h' },
              { user: 'Leila Hamdi', action: 'a généré le QR code pour', target: 'Formulaire Maintenance', time: 'Il y a 8h' }
            ].map((activity, index) => (
              <div key={index} className="flex items-center space-x-3 p-2 hover:bg-gray-50 rounded-md">
                <div className="w-8 h-8 bg-aviation-sky/10 rounded-full flex items-center justify-center">
                  <Activity className="w-4 h-4 text-aviation-sky" />
                </div>
                <div className="flex-1">
                  <p className="text-sm">
                    <span className="font-medium">{activity.user}</span>
                    {' '}{activity.action}{' '}
                    <span className="font-medium">{activity.target}</span>
                  </p>
                </div>
                <span className="text-xs text-gray-500">{activity.time}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
