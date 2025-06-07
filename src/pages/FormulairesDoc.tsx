
import { AppLayout } from '@/components/layout/AppLayout';
import { FileSpreadsheet, Plus, List } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useFormulaires } from '@/hooks/useFormulaires';
import { FormulairesList } from '@/components/formulaires/FormulairesList';
import { CreateFormulaireForm } from '@/components/formulaires/CreateFormulaireForm';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent } from '@/components/ui/card';

const FormulairesDoc = () => {
  const { user } = useAuth();
  const { formulaires, isLoading } = useFormulaires();

  if (!user) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <Card className="w-full max-w-md">
            <CardContent className="p-6 text-center">
              <FileSpreadsheet className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Authentification requise
              </h3>
              <p className="text-gray-500">
                Vous devez être connecté pour accéder aux formulaires documentaires.
              </p>
            </CardContent>
          </Card>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Formulaires Doc</h1>
          <p className="text-gray-500 mt-1">
            Créer et gérer les formulaires documentaires avec modèles
          </p>
        </div>

        <Tabs defaultValue="list" className="w-full">
          <TabsList className="grid w-full grid-cols-2 max-w-md">
            <TabsTrigger value="list" className="flex items-center space-x-2">
              <List className="w-4 h-4" />
              <span>Liste des formulaires</span>
            </TabsTrigger>
            <TabsTrigger value="create" className="flex items-center space-x-2">
              <Plus className="w-4 h-4" />
              <span>Nouveau formulaire</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="list" className="mt-6">
            <FormulairesList formulaires={formulaires} isLoading={isLoading} />
          </TabsContent>

          <TabsContent value="create" className="mt-6">
            <CreateFormulaireForm />
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
};

export default FormulairesDoc;
