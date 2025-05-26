
import { AppLayout } from '@/components/layout/AppLayout';
import { QrCode } from 'lucide-react';

const QRCodes = () => {
  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Gestion des QR Codes</h1>
          <p className="text-gray-500 mt-1">
            Générez et gérez les QR codes des documents
          </p>
        </div>

        <div className="text-center py-12">
          <QrCode className="w-16 h-16 text-aviation-sky mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Module QR Codes en développement</h3>
          <p className="text-gray-500">Cette section permettra de générer et gérer les QR codes pour tous les documents.</p>
        </div>
      </div>
    </AppLayout>
  );
};

export default QRCodes;
