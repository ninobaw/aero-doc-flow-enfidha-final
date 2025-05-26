
import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Activity, Clock, CheckCircle, AlertTriangle, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';

const Actions = () => {
  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Actions & Tâches</h1>
            <p className="text-gray-500 mt-1">
              Suivi des actions et gestion des tâches
            </p>
          </div>
          <Button className="bg-aviation-sky hover:bg-aviation-sky-dark">
            <Plus className="w-4 h-4 mr-2" />
            Nouvelle Action
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[
            { title: 'Total Actions', value: '47', icon: Activity, color: 'text-aviation-sky' },
            { title: 'En Cours', value: '23', icon: Clock, color: 'text-aviation-warning' },
            { title: 'Complétées', value: '18', icon: CheckCircle, color: 'text-aviation-success' },
            { title: 'Urgentes', value: '6', icon: AlertTriangle, color: 'text-red-600' }
          ].map((stat, index) => (
            <Card key={index}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                    <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                  </div>
                  <stat.icon className={`h-8 w-8 ${stat.color}`} />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="text-center py-12">
          <Activity className="w-16 h-16 text-aviation-sky mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Module Actions en développement</h3>
          <p className="text-gray-500">Cette section permettra de gérer toutes les actions et tâches du système.</p>
        </div>
      </div>
    </AppLayout>
  );
};

export default Actions;
