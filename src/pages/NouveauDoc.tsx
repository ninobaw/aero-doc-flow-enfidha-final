import { useMemo } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FilePlus, Upload, FileText } from 'lucide-react';
import { useDocumentCodeConfig } from '@/hooks/useDocumentCodeConfig';
import { DocumentCreationForm } from '@/components/documents/DocumentCreationForm';
import { DocumentImportForm } from '@/components/documents/DocumentImportForm';

const NouveauDoc = () => {
  const { isLoading: isLoadingCodeConfig } = useDocumentCodeConfig();

  if (isLoadingCodeConfig) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-aviation-sky"></div>
          <p className="ml-4 text-gray-600">Chargement de la configuration...</p>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Nouveau Document</h1>
          <p className="text-gray-500 mt-1">
            Créer un nouveau document via formulaire ou import de fichier
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <FilePlus className="w-5 h-5 mr-2 text-aviation-sky" />
              Création de Document
            </CardTitle>
            <CardDescription>
              Choisissez votre méthode de création de document
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="formulaire" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="formulaire" className="flex items-center">
                  <FileText className="w-4 h-4 mr-2" />
                  Formulaire Direct
                </TabsTrigger>
                <TabsTrigger value="import" className="flex items-center">
                  <Upload className="w-4 h-4 mr-2" />
                  Import de Fichier
                </TabsTrigger>
              </TabsList>

              <TabsContent value="formulaire" className="space-y-6 mt-6">
                <DocumentCreationForm />
              </TabsContent>

              <TabsContent value="import" className="space-y-6 mt-6">
                <DocumentImportForm />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
};

export default NouveauDoc;