par <span> pour le code QR.">
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { FileText, Eye, Download, Calendar, User, Edit, Trash2 } from 'lucide-react';
import { formatDate } from '@/shared/utils';
import type { DocumentData } from '@/hooks/useDocuments';

interface DocumentsListProps {
  documents: DocumentData[];
  isLoading: boolean;
  onEdit?: (document: DocumentData) => void;
  onDelete?: (id: string) => void;
}

export const DocumentsList = ({ documents, isLoading, onEdit, onDelete }: DocumentsListProps) => {
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

  if (documents.length === 0) {
    return (
      <Card className="text-center p-8">
        <CardContent>
          <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Aucun document trouvé
          </h3>
          <p className="text-gray-500">
            Commencez par créer votre premier document.
          </p>
        </CardContent>
      </Card>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE': return 'bg-green-100 text-green-800';
      case 'DRAFT': return 'bg-yellow-100 text-yellow-800';
      case 'ARCHIVED': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'ACTIVE': return 'Actif';
      case 'DRAFT': return 'Brouillon';
      case 'ARCHIVED': return 'Archivé';
      default: return status;
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'QUALITE_DOC': return 'Document Qualité';
      case 'NOUVEAU_DOC': return 'Nouveau Document';
      case 'CORRESPONDANCE': return 'Correspondance';
      case 'PROCES_VERBAL': return 'Procès-Verbal';
      case 'FORMULAIRE_DOC': return 'Formulaire';
      case 'TEMPLATE': return 'Modèle'; // Added TEMPLATE type
      default: return type;
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {documents.map((document) => (
        <Card key={document.id} className="hover:shadow-md transition-shadow">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="flex items-center space-x-2">
                <FileText className="w-5 h-5 text-aviation-sky" />
                <Badge variant="outline" className="text-xs">
                  {document.airport}
                </Badge>
              </div>
              <Badge className={`text-xs ${getStatusColor(document.status)}`}>
                {getStatusLabel(document.status)}
              </Badge>
            </div>
            <CardTitle className="text-lg line-clamp-2">
              {document.title}
            </CardTitle>
            <CardDescription>
              <Badge variant="secondary" className="text-xs">
                {getTypeLabel(document.type)}
              </Badge>
              {document.qr_code && (
                <span className="font-mono text-xs bg-gray-100 px-2 py-1 rounded mt-1 inline-block">
                  {document.qr_code}
                </span>
              )}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {document.content && (
                <p className="text-sm text-gray-600 line-clamp-2">
                  {document.content}
                </p>
              )}

              <div className="flex items-center justify-between text-xs text-gray-500">
                <div className="flex items-center space-x-1">
                  <User className="w-3 h-3" />
                  <span>
                    {document.author?.first_name} {document.author?.last_name}
                  </span>
                </div>
                <div className="flex items-center space-x-1">
                  <Calendar className="w-3 h-3" />
                  <span>{formatDate(document.created_at)}</span>
                </div>
              </div>

              <div className="flex justify-between pt-2">
                <div className="flex space-x-1">
                  <Button variant="outline" size="sm">
                    <Eye className="w-4 h-4 mr-1" />
                    Voir
                  </Button>
                  {document.file_path && (
                    <Button variant="outline" size="sm">
                      <Download className="w-4 h-4 mr-1" />
                      Télécharger
                    </Button>
                  )}
                </div>
                <div className="flex space-x-1">
                  {onEdit && (
                    <Button variant="ghost" size="sm" onClick={() => onEdit(document)}>
                      <Edit className="w-4 h-4" />
                    </Button>
                  )}
                  {onDelete && (
                    <Button variant="ghost" size="sm" onClick={() => onDelete(document.id)}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};