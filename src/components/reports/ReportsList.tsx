import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { FileText, Download, Trash2, Play } from 'lucide-react';
import { formatDate } from '@/shared/utils';
import type { ReportData } from '@/hooks/useReports';
import { useReports } from '@/hooks/useReports'; // Import useReports to access delete mutation
import { useToast } from '@/hooks/use-toast'; // Import useToast

interface ReportsListProps {
  reports: ReportData[];
  isLoading: boolean;
  onDelete?: (id: string) => void;
}

export const ReportsList = ({ reports, isLoading, onDelete }: ReportsListProps) => {
  const { deleteReport, isDeleting } = useReports(); // Use deleteReport from hook
  const { toast } = useToast(); // Initialize useToast

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[...Array(6)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader>
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              <div className="h-3 bg-gray-200 rounded w-1/2"></div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="h-3 bg-gray-200 rounded"></div>
                <div className="h-3 bg-gray-200 rounded w-2/3"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (reports.length === 0) {
    return (
      <Card className="text-center p-8">
        <CardContent>
          <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Aucun rapport trouvé
          </h3>
          <p className="text-gray-500">
            Commencez par créer votre premier rapport.
          </p>
        </CardContent>
      </Card>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'COMPLETED': return 'bg-green-100 text-green-800';
      case 'PENDING': return 'bg-yellow-100 text-yellow-800';
      case 'RUNNING': return 'bg-blue-100 text-blue-800';
      case 'ERROR': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'DOCUMENT_USAGE': return 'Utilisation documents';
      case 'USER_ACTIVITY': return 'Activité utilisateurs';
      case 'ACTION_STATUS': return 'Statut actions';
      case 'PERFORMANCE': return 'Performance';
      case 'CUSTOM': return 'Personnalisé';
      default: return type;
    }
  };

  const handleDelete = (id: string, name: string) => {
    if (window.confirm(`Êtes-vous sûr de vouloir supprimer le rapport "${name}" ? Cette action est irréversible.`)) {
      deleteReport(id, {
        onSuccess: () => {
          toast({
            title: "Rapport supprimé",
            description: `Le rapport "${name}" a été supprimé avec succès.`,
            variant: "success", // Appliquer la variante 'success'
          });
        },
        onError: (error) => {
          toast({
            title: "Erreur de suppression",
            description: error.message || `Impossible de supprimer le rapport "${name}".`,
            variant: "destructive", // Appliquer la variante 'destructive'
          });
        }
      });
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {reports.map((report) => (
        <Card key={report.id} className="hover:shadow-md transition-shadow">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="flex items-center space-x-2">
                <FileText className="w-5 h-5 text-aviation-sky" />
              </div>
              <Badge className={`text-xs ${getStatusColor(report.status)}`}>
                {report.status}
              </Badge>
            </div>
            <CardTitle className="text-lg line-clamp-2">
              {report.name}
            </CardTitle>
            <CardDescription>
              {getTypeLabel(report.type)}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {report.frequency && (
                <div className="text-xs text-gray-500">
                  Fréquence: {report.frequency}
                </div>
              )}

              {report.last_generated && (
                <div className="text-xs text-gray-500">
                  Dernière génération: {formatDate(report.last_generated)}
                </div>
              )}

              <div className="text-xs text-gray-500">
                Créé le: {formatDate(report.created_at)}
              </div>

              <div className="flex justify-between pt-2">
                <div className="flex space-x-1">
                  <Button variant="outline" size="sm">
                    <Play className="w-4 h-4 mr-1" />
                    Générer
                  </Button>
                  {report.content && (
                    <Button variant="outline" size="sm">
                      <Download className="w-4 h-4 mr-1" />
                      Télécharger
                    </Button>
                  )}
                </div>
                {onDelete && (
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => handleDelete(report.id, report.name)} // Pass report name for confirmation
                    className="text-red-600 hover:text-red-800"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};