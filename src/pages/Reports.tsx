
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
  Target,
  Plus,
  X
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface ReportData {
  id: string;
  name: string;
  type: string;
  lastGenerated: string;
  frequency: string;
  status: string;
}

interface NewReport {
  name: string;
  type: string;
  period: string;
  airport: string;
  format: string;
  schedule?: string;
  recipients?: string[];
}

const Reports = () => {
  const { toast } = useToast();
  const [dateRange, setDateRange] = useState('7');
  const [showNewReportModal, setShowNewReportModal] = useState(false);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  
  const [newReport, setNewReport] = useState<NewReport>({
    name: '',
    type: '',
    period: '30',
    airport: 'all',
    format: 'pdf'
  });

  const [savedReports, setSavedReports] = useState<ReportData[]>([
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
  ]);

  const [scheduledReports, setScheduledReports] = useState<ReportData[]>([]);

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

  const handleGenerateReport = () => {
    if (!newReport.name.trim() || !newReport.type) {
      toast({
        title: "Erreur",
        description: "Veuillez remplir tous les champs obligatoires.",
        variant: "destructive"
      });
      return;
    }

    setIsGenerating(true);
    
    // Simulation de génération de rapport
    setTimeout(() => {
      const generatedReport: ReportData = {
        id: `report-${Date.now()}`,
        name: newReport.name,
        type: newReport.type,
        lastGenerated: new Date().toISOString().split('T')[0],
        frequency: 'ONE_TIME',
        status: 'COMPLETED'
      };

      setSavedReports(prev => [generatedReport, ...prev]);
      setIsGenerating(false);
      setShowNewReportModal(false);
      
      // Réinitialiser le formulaire
      setNewReport({
        name: '',
        type: '',
        period: '30',
        airport: 'all',
        format: 'pdf'
      });

      toast({
        title: "Rapport généré",
        description: `Le rapport "${newReport.name}" a été généré avec succès.`
      });
    }, 2000);
  };

  const handleScheduleReport = () => {
    if (!newReport.name.trim() || !newReport.type || !newReport.schedule) {
      toast({
        title: "Erreur",
        description: "Veuillez remplir tous les champs obligatoires.",
        variant: "destructive"
      });
      return;
    }

    const scheduledReport: ReportData = {
      id: `scheduled-${Date.now()}`,
      name: newReport.name,
      type: newReport.type,
      lastGenerated: '-',
      frequency: newReport.schedule.toUpperCase(),
      status: 'SCHEDULED'
    };

    setScheduledReports(prev => [scheduledReport, ...prev]);
    setShowScheduleModal(false);
    
    // Réinitialiser le formulaire
    setNewReport({
      name: '',
      type: '',
      period: '30',
      airport: 'all',
      format: 'pdf'
    });

    toast({
      title: "Rapport programmé",
      description: `Le rapport "${newReport.name}" a été programmé avec succès.`
    });
  };

  const handleDownloadReport = (reportId: string, reportName: string) => {
    toast({
      title: "Téléchargement démarré",
      description: `Le téléchargement du rapport "${reportName}" va commencer.`
    });
    
    // Simulation du téléchargement
    setTimeout(() => {
      toast({
        title: "Téléchargement terminé",
        description: `Le rapport "${reportName}" a été téléchargé avec succès.`
      });
    }, 1500);
  };

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
          <Button 
            onClick={() => setShowNewReportModal(true)}
            className="bg-aviation-sky hover:bg-aviation-sky-dark"
          >
            <BarChart3 className="w-4 h-4 mr-2" />
            Nouveau Rapport
          </Button>
        </div>

        {/* Modal Nouveau Rapport */}
        {showNewReportModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <Card className="w-full max-w-2xl mx-4">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Créer un Nouveau Rapport</CardTitle>
                  <Button variant="ghost" size="sm" onClick={() => setShowNewReportModal(false)}>
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="report-name">Nom du rapport *</Label>
                    <Input
                      id="report-name"
                      value={newReport.name}
                      onChange={(e) => setNewReport(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="Entrez le nom du rapport"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="report-type">Type de rapport *</Label>
                    <Select value={newReport.type} onValueChange={(value) => setNewReport(prev => ({ ...prev, type: value }))}>
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionner le type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="DOCUMENT_USAGE">Usage des Documents</SelectItem>
                        <SelectItem value="USER_ACTIVITY">Activité des Utilisateurs</SelectItem>
                        <SelectItem value="ACTION_STATUS">Status des Actions</SelectItem>
                        <SelectItem value="PERFORMANCE">Performance</SelectItem>
                        <SelectItem value="CUSTOM">Personnalisé</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="period">Période</Label>
                    <Select value={newReport.period} onValueChange={(value) => setNewReport(prev => ({ ...prev, period: value }))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="7">7 derniers jours</SelectItem>
                        <SelectItem value="30">30 derniers jours</SelectItem>
                        <SelectItem value="90">3 derniers mois</SelectItem>
                        <SelectItem value="365">Dernière année</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="airport">Aéroport</Label>
                    <Select value={newReport.airport} onValueChange={(value) => setNewReport(prev => ({ ...prev, airport: value }))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Tous les aéroports</SelectItem>
                        <SelectItem value="enfidha">Enfidha</SelectItem>
                        <SelectItem value="monastir">Monastir</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="format">Format</Label>
                    <Select value={newReport.format} onValueChange={(value) => setNewReport(prev => ({ ...prev, format: value }))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pdf">PDF</SelectItem>
                        <SelectItem value="excel">Excel</SelectItem>
                        <SelectItem value="csv">CSV</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="flex justify-end space-x-4 pt-4">
                  <Button variant="outline" onClick={() => setShowScheduleModal(true)}>
                    <Calendar className="w-4 h-4 mr-2" />
                    Programmer
                  </Button>
                  <Button 
                    onClick={handleGenerateReport}
                    disabled={isGenerating}
                    className="bg-aviation-sky hover:bg-aviation-sky-dark"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    {isGenerating ? 'Génération...' : 'Générer Rapport'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Modal Programmer Rapport */}
        {showScheduleModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <Card className="w-full max-w-md mx-4">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Programmer le Rapport</CardTitle>
                  <Button variant="ghost" size="sm" onClick={() => setShowScheduleModal(false)}>
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="schedule">Fréquence *</Label>
                  <Select value={newReport.schedule} onValueChange={(value) => setNewReport(prev => ({ ...prev, schedule: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner la fréquence" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="daily">Quotidien</SelectItem>
                      <SelectItem value="weekly">Hebdomadaire</SelectItem>
                      <SelectItem value="monthly">Mensuel</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex justify-end space-x-4 pt-4">
                  <Button variant="outline" onClick={() => setShowScheduleModal(false)}>
                    Annuler
                  </Button>
                  <Button 
                    onClick={handleScheduleReport}
                    className="bg-aviation-sky hover:bg-aviation-sky-dark"
                  >
                    <Calendar className="w-4 h-4 mr-2" />
                    Programmer
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

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

        <Tabs defaultValue="saved" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="saved">Rapports Sauvegardés</TabsTrigger>
            <TabsTrigger value="scheduled">Rapports Programmés</TabsTrigger>
          </TabsList>

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
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => handleDownloadReport(report.id, report.name)}
                            >
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
                {scheduledReports.length === 0 ? (
                  <div className="text-center py-12">
                    <Calendar className="w-16 h-16 text-aviation-sky mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Aucun rapport programmé</h3>
                    <p className="text-gray-500 mb-4">Créez des rapports automatiques pour un suivi régulier.</p>
                    <Button 
                      onClick={() => setShowNewReportModal(true)}
                      className="bg-aviation-sky hover:bg-aviation-sky-dark"
                    >
                      <Calendar className="w-4 h-4 mr-2" />
                      Programmer un Rapport
                    </Button>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Nom du Rapport</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Fréquence</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {scheduledReports.map((report) => (
                        <TableRow key={report.id} className="hover:bg-gray-50">
                          <TableCell className="font-medium">{report.name}</TableCell>
                          <TableCell>{getTypeLabel(report.type)}</TableCell>
                          <TableCell>
                            <Badge variant="outline">{report.frequency}</Badge>
                          </TableCell>
                          <TableCell>{getStatusBadge(report.status)}</TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end space-x-2">
                              <Button variant="outline" size="sm">
                                Modifier
                              </Button>
                              <Button variant="outline" size="sm">
                                Arrêter
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
};

export default Reports;
