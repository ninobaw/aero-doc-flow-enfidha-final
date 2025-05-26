
import { AppLayout } from '@/components/layout/AppLayout';
import { BarChart3 } from 'lucide-react';

const Reports = () => {
  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Rapports et Statistiques</h1>
          <p className="text-gray-500 mt-1">
            Analysez les données et générez des rapports
          </p>
        </div>

        <div className="text-center py-12">
          <BarChart3 className="w-16 h-16 text-aviation-sky mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Module Rapports en développement</h3>
          <p className="text-gray-500">Cette section permettra de générer des rapports détaillés et des statistiques.</p>
        </div>
      </div>
    </AppLayout>
  );
};

export default Reports;
