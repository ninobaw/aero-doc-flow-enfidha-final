import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Mail, Eye, Calendar, User, ArrowRight, Tag, FileDown, ArrowUpRight, ArrowDownLeft } from 'lucide-react'; // Import new icons for type
import { formatDate, getAbsoluteFilePath } from '@/shared/utils';
import type { CorrespondanceData } from '@/hooks/useCorrespondances';
import { useUsers } from '@/hooks/useUsers';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

interface CorrespondancesListProps {
  correspondances: CorrespondanceData[];
  isLoading: boolean;
}

export const CorrespondancesList = ({ correspondances, isLoading }: CorrespondancesListProps) => {
  const { users, isLoading: isLoadingUsers } = useUsers();

  if (isLoading || isLoadingUsers) {
    return (
      <Card className="p-8 text-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-aviation-sky mx-auto mb-4"></div>
        <p className="text-gray-600">Chargement des correspondances...</p>
      </Card>
    );
  }

  if (correspondances.length === 0) {
    return (
      <Card className="text-center p-8">
        <CardContent>
          <Mail className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Aucune correspondance trouvée
          </h3>
          <p className="text-gray-500">
            Commencez par créer votre première correspondance.
          </p>
        </CardContent>
      </Card>
    );
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'URGENT': return 'bg-red-100 text-red-800';
      case 'HIGH': return 'bg-orange-100 text-orange-800';
      case 'MEDIUM': return 'bg-blue-100 text-blue-800';
      case 'LOW': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'SENT': return 'bg-green-100 text-green-800';
      case 'RECEIVED': return 'bg-blue-100 text-blue-800';
      case 'DRAFT': return 'bg-yellow-100 text-yellow-800';
      case 'ARCHIVED': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeBadgeColor = (type: string) => {
    switch (type) {
      case 'INCOMING': return 'bg-purple-100 text-purple-800';
      case 'OUTGOING': return 'bg-indigo-100 text-indigo-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'INCOMING': return <ArrowDownLeft className="w-4 h-4 text-purple-600" />;
      case 'OUTGOING': return <ArrowUpRight className="w-4 h-4 text-indigo-600" />;
      default: return <Mail className="w-4 h-4 text-gray-600" />;
    }
  };

  const getAssigneeName = (userId: string) => {
    const user = users.find(u => u.id === userId);
    return user ? `${user.firstName} ${user.lastName}` : 'Utilisateur inconnu';
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Mail className="w-5 h-5 mr-2 text-aviation-sky" />
          Liste des Correspondances
        </CardTitle>
        <CardDescription>
          Gérer toutes les correspondances officielles.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="min-w-[180px]">Objet</TableHead> {/* Adjusted width */}
                <TableHead className="min-w-[120px]">De</TableHead> {/* Adjusted width */}
                <TableHead className="min-w-[120px]">À</TableHead> {/* Adjusted width */}
                <TableHead className="min-w-[100px]">Type</TableHead> {/* Adjusted width */}
                <TableHead>Priorité</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead>Aéroport</TableHead>
                <TableHead className="min-w-[120px]">Tags</TableHead> {/* Adjusted width */}
                <TableHead className="min-w-[100px]">Date</TableHead> {/* Adjusted width */}
                <TableHead className="text-right min-w-[120px]">Actions</TableHead> {/* Adjusted width */}
              </TableRow>
            </TableHeader>
            <TableBody>
              {correspondances.map((correspondance) => (
                <TableRow key={correspondance.id} className="hover:bg-gray-50">
                  <TableCell className="font-medium">
                    <div className="line-clamp-2">{correspondance.subject}</div>
                    {correspondance.code && (
                      <span className="font-mono text-xs bg-gray-100 px-1 py-0.5 rounded mt-1 inline-block">
                        Code: {correspondance.code}
                      </span>
                    )}
                  </TableCell>
                  <TableCell className="text-sm text-gray-600">
                    {correspondance.from_address}
                  </TableCell>
                  <TableCell className="text-sm text-gray-600">
                    {correspondance.to_address}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-1">
                      {getTypeIcon(correspondance.type)}
                      <Badge className={`text-xs ${getTypeBadgeColor(correspondance.type)}`}>
                        {correspondance.type === 'INCOMING' ? 'Entrante' : 'Sortante'}
                      </Badge>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge className={`text-xs ${getPriorityColor(correspondance.priority)}`}>
                      {correspondance.priority}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge className={`text-xs ${getStatusColor(correspondance.status)}`}>
                      {correspondance.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="text-xs">
                      {correspondance.airport}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1 max-w-[150px]">
                      {correspondance.tags && correspondance.tags.length > 0 ? (
                        correspondance.tags.slice(0, 2).map((tag, index) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            {tag}
                          </Badge>
                        ))
                      ) : (
                        <span className="text-xs text-gray-500">Aucun tag</span>
                      )}
                      {correspondance.tags && correspondance.tags.length > 2 && (
                        <span className="text-xs text-gray-500">+{correspondance.tags.length - 2}</span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-sm text-gray-500">
                    {formatDate(correspondance.created_at)}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end space-x-2">
                      <Button variant="outline" size="sm" onClick={() => window.open(correspondance.qr_code, '_blank')}>
                        <Eye className="w-4 h-4" />
                      </Button>
                      {correspondance.file_path && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            const link = document.createElement('a');
                            link.href = getAbsoluteFilePath(correspondance.file_path!);
                            link.download = `correspondance-${correspondance.code || correspondance.id}.${correspondance.file_type?.split('/')[1] || 'file'}`;
                            document.body.appendChild(link);
                            link.click();
                            document.body.removeChild(link);
                          }}
                        >
                          <FileDown className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};