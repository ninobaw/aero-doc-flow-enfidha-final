
import { AppLayout } from '@/components/layout/AppLayout';
import { Settings as SettingsIcon } from 'lucide-react';

const Settings = () => {
  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Paramètres</h1>
          <p className="text-gray-500 mt-1">
            Configurez l'application selon vos besoins
          </p>
        </div>

        <div className="text-center py-12">
          <SettingsIcon className="w-16 h-16 text-aviation-sky mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Module Paramètres en développement</h3>
          <p className="text-gray-500">Cette section permettra de configurer tous les paramètres de l'application.</p>
        </div>
      </div>
    </AppLayout>
  );
};

export default Settings;
