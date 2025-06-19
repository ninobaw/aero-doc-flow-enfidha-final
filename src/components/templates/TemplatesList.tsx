import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { FileText, Download, Trash2, Eye, FilePlus } from 'lucide-react';
import { formatDate, getAbsoluteFilePath } from '@/shared/utils'; // Import getAbsoluteFilePath
import type { TemplateData } from '@/hooks/useTemplates';
import { useTemplates } from '@/hooks/useTemplates';
import { useFileUpload } from '@/hooks/useFileUpload'; // To delete the actual file
import { useToast } from '@/hooks/use-toast'; // Import useToast

interface TemplatesListProps {
  templates: TemplateData[];
  isLoading: boolean;
}

export const TemplatesList = ({ templates, isLoading }: TemplatesListProps) => {
  const { deleteTemplate, isDeleting } = useTemplates();
  const { deleteFile } = useFileUpload();
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

  if (templates.length === 0) {
    return (
      <Card className="text-center p-8">
        <CardContent>
          <FilePlus className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Aucun modèle trouvé
          </h3>
          <p className="text-gray-500">
            Commencez par importer votre premier modèle de document.
          </p>
        </CardContent>
      </Card>
    );
  }

  const handleDelete = async (templateId: string, filePath?: string, title?: string) => {
    if (window.confirm(`Êtes-vous sûr de vouloir supprimer le modèle "${title}" ? Cette action est irréversible.`)) {
      // First, try to delete the file from the backend storage
      if (filePath) {
        const fileDeleted = await deleteFile(filePath);
        if (!fileDeleted) {
          // If file deletion fails, you might want to stop here or log a warning
          // For now, we'll proceed to delete the database entry even if the file remains
          console.warn(`Failed to delete physical file for template ${title}. Proceeding with database deletion.`);
          toast({
            title: "Avertissement de suppression",
            description: `Le fichier physique du modèle "${title}" n'a pas pu être supprimé. Veuillez le faire manuellement si nécessaire.`,
            variant: "destructive", // Utiliser destructive pour les avertissements importants
          });
        }
      }
      // Then, delete the template entry from the database
      deleteTemplate(templateId, {
        onSuccess: () => {
          toast({
            title: "Modèle supprimé",
            description: `Le modèle "${title}" a été supprimé avec succès.`,
            variant: "success", // Appliquer la variante 'success'
          });
        },
        onError: (error) => {
          toast({
            title: "Erreur de suppression",
            description: error.message || `Impossible de supprimer le modèle "${title}".`,
            variant: "destructive", // Appliquer la variante 'destructive'
          });
        }
      });
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {templates.map((template) => (
        <Card key={template.id} className="hover:shadow-md transition-shadow">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="flex items-center space-x-2">
                <FileText className="w-5 h-5 text-aviation-sky" />
                <Badge variant="outline" className="text-xs">
                  {template.airport}
                </Badge>
              </div>
              <Badge className="text-xs bg-green-100 text-green-800">
                Actif
              </Badge>
            </div>
            <CardTitle className="text-lg line-clamp-2">
              {template.title}
            </CardTitle>
            <CardDescription>
              <Badge variant="secondary" className="text-xs">
                Modèle
              </Badge>
              {template.qr_code && (
                <span className="font-mono text-xs bg-gray-100 px-2 py-1 rounded mt-1 inline-block">
                  {template.qr_code}
                </span>
              )}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {template.content && (
                <p className="text-sm text-gray-600 line-clamp-2">
                  {template.content}
                </p>
              )}
              
              <div className="flex items-center justify-between text-xs text-gray-500">
                <div className="flex items-center space-x-1">
                  <span>Version: {template.version}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <span>Créé le: {formatDate(template.created_at)}</span>
                </div>
              </div>

              <div className="flex justify-between pt-2">
                <div className="flex space-x-1">
                  {template.file_path && (
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => window.open(getAbsoluteFilePath(template.file_path), '_blank')} // Use getAbsoluteFilePath
                    >
                      <Eye className="w-4 h-4 mr-1" />
                      Visualiser
                    </Button>
                  )}
                  {template.file_path && (
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => {
                        const link = document.createElement('a');
                        link.href = getAbsoluteFilePath(template.file_path); // Use getAbsoluteFilePath
                        link.download = template.title; // Suggest filename
                        document.body.appendChild(link);
                        link.click();
                        document.body.removeChild(link);
                      }}
                    >
                      <Download className="w-4 h-4 mr-1" />
                      Télécharger
                    </Button>
                  )}
                </div>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => handleDelete(template.id, template.file_path, template.title)}
                  disabled={isDeleting}
                  className="text-red-600 hover:text-red-700"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};