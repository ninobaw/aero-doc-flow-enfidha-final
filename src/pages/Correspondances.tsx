import { useState } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Mail, Plus, Search, Filter } from 'lucide-react';
import { CorrespondancesList } from '@/components/correspondances/CorrespondancesList';
import { useCorrespondances } from '@/hooks/useCorrespondances';

const Correspondances = () => {
  const { correspondances, isLoading } = useCorrespondances();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterPriority, setFilterPriority] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  // ===========================================
  // DÉBUT INTÉGRATION BACKEND SUPABASE - PAGE CORRESPONDANCES
  // ===========================================
  
  const filteredCorrespondances = correspondances.filter(corr => {
    const matchesSearch = corr.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         corr.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         corr.from_address.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         corr.to_address.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesPriority = filterPriority === 'all' || corr.priority === filterPriority;
    const matchesStatus = filterStatus === 'all' || corr.status === filterStatus;
    
    return matchesSearch && matchesPriority && matchesStatus;
  });

  // ===========================================
  // FIN INTÉGRATION BACKEND SUPABASE - PAGE CORRESPONDANCES
  // ===========================================

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Correspondances</h1>
            <p className="text-gray-500 mt-1">
              Gérer les correspondances officielles
            </p>
          </div>
          <Button className="bg-aviation-sky hover:bg-aviation-sky-dark">
            <Plus className="w-4 h-4 mr-2" />
            Nouvelle Correspondance
          </Button>
        </div>

        {/* Filtres et recherche */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Filter className="w-5 h-5 mr-2" />
              Filtres et Recherche
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Rechercher dans les correspondances..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              
              <Select value={filterPriority} onValueChange={setFilterPriority}>
                <SelectTrigger>
                  <SelectValue placeholder="Toutes les priorités" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Toutes les priorités</SelectItem>
                  <SelectItem value="LOW">Faible</SelectItem>
                  <SelectItem value="MEDIUM">Moyenne</SelectItem>
                  <SelectItem value="HIGH">Haute</SelectItem>
                  <SelectItem value="URGENT">Urgente</SelectItem>
                </SelectContent>
              </Select>

              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger>
                  <SelectValue placeholder="Tous les statuts" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les statuts</SelectItem>
                  <SelectItem value="DRAFT">Brouillon</SelectItem>
                  <SelectItem value="SENT">Envoyée</SelectItem>
                  <SelectItem value="RECEIVED">Reçue</SelectItem>
                  <SelectItem value="ARCHIVED">Archivée</SelectItem>
                </SelectContent>
              </Select>

              <Button variant="outline" onClick={() => {
                setSearchTerm('');
                setFilterPriority('all');
                setFilterStatus('all');
              }}>
                Réinitialiser
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Liste des correspondances */}
        <CorrespondancesList 
          correspondances={filteredCorrespondances}
          isLoading={isLoading}
        />
      </div>
    </AppLayout>
  );
};

export default Correspondances;
