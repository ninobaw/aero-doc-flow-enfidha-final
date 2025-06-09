import { useState } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Mail, Plus, Search, Filter, Tag } from 'lucide-react'; // Import Tag icon
import { CorrespondancesList } from '@/components/correspondances/CorrespondancesList';
import { CreateCorrespondanceDialog } from '@/components/correspondances/CreateCorrespondanceDialog';
import { useCorrespondances } from '@/hooks/useCorrespondances';
import { TagInput } from '@/components/ui/TagInput'; // Import TagInput

const Correspondances = () => {
  const { correspondances, isLoading } = useCorrespondances();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterPriority, setFilterPriority] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterTags, setFilterTags] = useState<string[]>([]); // New state for tag filter

  const filteredCorrespondances = correspondances.filter(corr => {
    const matchesSearch = corr.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         corr.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         corr.from_address.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         corr.to_address.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesPriority = filterPriority === 'all' || corr.priority === filterPriority;
    const matchesStatus = filterStatus === 'all' || corr.status === filterStatus;
    
    // New tag filtering logic
    const matchesTags = filterTags.length === 0 || 
                        (corr.tags && filterTags.every(tag => corr.tags.includes(tag)));
    
    return matchesSearch && matchesPriority && matchesStatus && matchesTags;
  });

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
          <CreateCorrespondanceDialog />
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
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
              <div className="relative md:col-span-2"> {/* Span 2 columns for search */}
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

              {/* New TagInput for filtering */}
              <div className="md:col-span-3"> {/* Span 3 columns for tags */}
                <TagInput
                  tags={filterTags}
                  onTagsChange={setFilterTags}
                  placeholder="Filtrer par tags (ex: urgent, réunion, suivi)"
                />
              </div>

              <Button variant="outline" onClick={() => {
                setSearchTerm('');
                setFilterPriority('all');
                setFilterStatus('all');
                setFilterTags([]); // Reset tags filter
              }} className="md:col-span-1"> {/* Span 1 column for reset */}
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