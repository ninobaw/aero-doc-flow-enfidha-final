import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Mail, Eye, Calendar, User, ArrowRight, Tag } from 'lucide-react'; // Import Tag icon
import { formatDate } from '@/shared/utils';
import type { CorrespondanceData } from '@/hooks/useCorrespondances';
import { useUsers } from '@/hooks/useUsers'; // Import useUsers to resolve assignee names

interface CorrespondancesListProps {
  correspondances: CorrespondanceData[];
  isLoading: boolean;
}

export const CorrespondancesList = ({ correspondances, isLoading }: CorrespondancesListProps) => {
  const { users, isLoading: isLoadingUsers } = useUsers(); // Fetch users to resolve names

  if (isLoading || isLoadingUsers) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {[...Array(4)].map((_, i) => (
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

  const getAssigneeName = (userId: string) => {
    const user = users.find(u => u.id === userId);
    return user ? `${user.firstName} ${user.lastName}` : 'Utilisateur inconnu';
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {correspondances.map((correspondance) => (
        <Card key={correspondance.id} className="hover:shadow-md transition-shadow">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="flex items-center space-x-2">
                <Mail className="w-5 h-5 text-aviation-sky" />
                <Badge variant="outline" className="text-xs">
                  {correspondance.airport}
                </Badge>
              </div>
              <div className="flex space-x-1">
                <Badge className={`text-xs ${getPriorityColor(correspondance.priority)}`}>
                  {correspondance.priority}
                </Badge>
                <Badge className={`text-xs ${getStatusColor(correspondance.status)}`}>
                  {correspondance.status}
                </Badge>
              </div>
            </div>
            <CardTitle className="text-lg line-clamp-2">
              {correspondance.subject}
            </CardTitle>
            <CardDescription>
              <div className="flex items-center space-x-2 text-sm">
                <span className="font-medium">{correspondance.from_address}</span>
                <ArrowRight className="w-3 h-3" />
                <span className="font-medium">{correspondance.to_address}</span>
              </div>
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <p className="text-sm text-gray-600 line-clamp-3">
                {correspondance.content}
              </p>

              {correspondance.tags && correspondance.tags.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-2">
                  {correspondance.tags.map((tag, index) => (
                    <Badge key={index} variant="secondary" className="text-xs flex items-center">
                      <Tag className="w-3 h-3 mr-1" /> {tag}
                    </Badge>
                  ))}
                </div>
              )}

              {correspondance.actions_decidees && correspondance.actions_decidees.length > 0 && (
                <div className="text-xs text-gray-500 mt-2">
                  <p className="font-medium">Actions décidées:</p>
                  <ul className="list-disc list-inside ml-2">
                    {correspondance.actions_decidees.map((action, index) => (
                      <li key={index} className="truncate">
                        {action.titre} (Resp: {getAssigneeName(action.responsable[0])}) {/* Access first element of responsable array */}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {correspondance.document && (
                <div className="text-xs text-gray-500">
                  Document lié: {correspondance.document.title}
                </div>
              )}

              <div className="flex items-center justify-between text-xs text-gray-500">
                <div className="flex items-center space-x-1">
                  <Calendar className="w-3 h-3" />
                  <span>{formatDate(correspondance.created_at)}</span>
                </div>
                {correspondance.attachments && correspondance.attachments.length > 0 && (
                  <span>{correspondance.attachments.length} pièce(s) jointe(s)</span>
                )}
              </div>

              <div className="flex justify-end pt-2">
                <Button variant="outline" size="sm">
                  <Eye className="w-4 h-4 mr-1" />
                  Voir détails
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};