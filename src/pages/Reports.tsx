
import { useState } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { 
  BarChart3, 
  Download, 
  Calendar, 
  Users, 
  FileText, 
  Activity,
  TrendingUp,
  Clock,
  Target
} from 'lucide-react';

const Reports = () => {
  const [dateRange, setDateRange] = useState('7');

  const reportStats = [
    {
      title: 'Documents Créés',
      value: '48',
      change: '+12%',
      trend: 'up',
      icon: FileText,
      color: 'blue'
    },
    {
      title: 'Actions Complétées',
      value: '32',
      change: '+8%',
      trend: 'up',
      icon: Target,
      color: 'green'
    },
    {
      title: 'Utilisateurs Actifs',
      value: '15',
      change: '+5%',
      trend: 'up',
      icon: Users,
      color: 'purple'
    },
    {
      title: 'Temps Moyen',
      value: '2.5h',
      change: '-15%',
      trend: 'down',
      icon: Clock,
      color: 'orange'
    }
  ];

  const savedReports = [
    {
      id: '1',
      name: 'Rapport Activité Mensuelle',
      type: 'USER_ACTIVITY',
      lastGenerated: '2025-01-26',
      frequency: 'MONTHLY',
      status: 'SCHEDULED'
    },
    {
      id: '2',
      name: 'Usage Documents par Aéroport',
      type: 'DOCUMENT_USAGE',
      lastGenerated: '2025-01-25',
      frequency: 'WEEKLY',
      status: 'COMPLETED'
    },
    {
      id: '3',
      name: 'Performance Actions',
      type: 'ACTION_STATUS',
      lastGenerated: '2025-01-24',
      frequency: 'DAILY',
      status: 'COMPLETED'
    }
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return <Badge className="bg-green-100 text-green-800">Complété</Badge>;
      case 'SCHEDULED':
        return <Badge className="bg-blue-100 text-blue-800">Programmé</Badge>;
      case 'RUNNING':
        return <Badge className="bg-yellow-100 text-yellow-800">En cours</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getTypeLabel = (type: string) => {
    const types = {
      'USER_ACTIVITY': 'Activité Utilisateurs',
      'DOCUMENT_USAGE': 'Usage Documents',
      'ACTION_STATUS': 'Status Actions',
      'PERFORMANCE': 'Performance',
      'CUSTOM': 'Personnalisé'
    };
    return types[type as keyof typeof types] || type;
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Rapports et Statistiques</h1>
            <p className="text-gray-500 mt-1">
              Analysez les données et générez des rapports
            </p>
          </div>
          <Button className="bg-aviation-sky hover:bg-aviation-sky-dark">
            <BarChart3 className="w-4 h-4 mr-2" />
            Nouveau Rapport
          </Button>
        </div>

        {/* Statistiques générales */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {reportStats.map((stat, index) => (
            <Card key={index}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                    <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                    <div className="flex items-center mt-1">
                      <TrendingUp className={`h-4 w-4 mr-1 ${
                        stat.trend === 'up' ? 'text-green-500' : 'text-red-500'
                      }`} />
                      <span className={`text-sm ${
                        stat.trend === 'up' ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {stat.change}
                      </span>
                    </div>
                  </div>
                  <stat.icon className={`h-8 w-8 text-${stat.color}-500`} />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <Tabs defaultValue="generate" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="generate">Générer Rapport</TabsTrigger>
            <TabsTrigger value="saved">Rapports Sauvegardés</TabsTrigger>
            <TabsTrigger value="scheduled">Rapports Programmés</TabsTrigger>
          </TabsList>

          <TabsContent value="generate" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Générer un Nouveau Rapport</CardTitle>
                <CardDescription>
                  Configurez et générez un rapport personnalisé
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="report-type">Type de rapport</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionner le type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="document-usage">Usage des Documents</SelectItem>
                        <SelectItem value="user-activity">Activité des Utilisateurs</SelectItem>
                        <SelectItem value="action-status">Status des Actions</SelectItem>
                        <SelectItem value="performance">Performance</SelectItem>
                        <SelectItem value="custom">Personnalisé</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="period">Période</Label>
                    <Select value={dateRange} onValueChange={setDateRange}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="7">7 derniers jours</SelectItem>
                        <SelectItem value="30">30 derniers jours</SelectItem>
                        <SelectItem value="90">3 derniers mois</SelectItem>
                        <SelectItem value="365">Dernière année</SelectItem>
                        <SelectItem value="custom">Période personnalisée</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="airport">Aéroport</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Tous les aéroports" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Tous</SelectItem>
                        <SelectItem value="enfidha">Enfidha</SelectItem>
                        <SelectItem value="monastir">Monastir</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="format">Format</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="PDF" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pdf">PDF</SelectItem>
                        <SelectItem value="excel">Excel</SelectItem>
                        <SelectItem value="csv">CSV</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="report-name">Nom du rapport</Label>
                  <Input
                    id="report-name"
                    placeholder="Entrez le nom du rapport"
                  />
                </div>

                <div className="flex justify-end space-x-4">
                  <Button variant="outline">
                    <Calendar className="w-4 h-4 mr-2" />
                    Programmer
                  </Button>
                  <Button className="bg-aviation-sky hover:bg-aviation-sky-dark">
                    <Download className="w-4 h-4 mr-2" />
                    Générer Rapport
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="saved" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Rapports Sauvegardés</CardTitle>
                <CardDescription>
                  Liste des rapports précédemment générés
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nom du Rapport</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Dernière Génération</TableHead>
                      <TableHead>Fréquence</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {savedReports.map((report) => (
                      <TableRow key={report.id} className="hover:bg-gray-50">
                        <TableCell className="font-medium">{report.name}</TableCell>
                        <TableCell>{getTypeLabel(report.type)}</TableCell>
                        <TableCell className="text-sm text-gray-500">{report.lastGenerated}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{report.frequency}</Badge>
                        </TableCell>
                        <TableCell>{getStatusBadge(report.status)}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end space-x-2">
                            <Button variant="outline" size="sm">
                              <Download className="w-4 h-4" />
                            </Button>
                            <Button variant="outline" size="sm">
                              Voir
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="scheduled" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Rapports Programmés</CardTitle>
                <CardDescription>
                  Gérez les rapports automatiques
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <Calendar className="w-16 h-16 text-aviation-sky mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Aucun rapport programmé</h3>
                  <p className="text-gray-500 mb-4">Créez des rapports automatiques pour un suivi régulier.</p>
                  <Button className="bg-aviation-sky hover:bg-aviation-sky-dark">
                    <Calendar className="w-4 h-4 mr-2" />
                    Programmer un Rapport
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
};

export default Reports;
