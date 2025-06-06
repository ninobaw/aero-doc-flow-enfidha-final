
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';

export interface ReportData {
  id: string;
  name: string;
  type: string;
  config: Record<string, any>;
  content?: Record<string, any>;
  status: string;
  frequency?: string;
  last_generated?: string;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export const useReports = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: reports = [], isLoading, error } = useQuery({
    queryKey: ['reports'],
    queryFn: async () => {
      if (!user?.id) throw new Error('Utilisateur non connecté');

      const { data, error } = await supabase
        .from('reports')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as ReportData[];
    },
    enabled: !!user?.id,
  });

  const generateReportData = async (type: string, config: Record<string, any>) => {
    let reportContent: Record<string, any> = {};

    try {
      switch (type) {
        case 'DOCUMENT_USAGE':
          const { data: documentsData } = await supabase
            .from('documents')
            .select(`
              *,
              author:profiles(first_name, last_name)
            `);
          
          reportContent = {
            totalDocuments: documentsData?.length || 0,
            documentsByType: documentsData?.reduce((acc: any, doc: any) => {
              acc[doc.type] = (acc[doc.type] || 0) + 1;
              return acc;
            }, {}) || {},
            documentsByAirport: documentsData?.reduce((acc: any, doc: any) => {
              acc[doc.airport] = (acc[doc.airport] || 0) + 1;
              return acc;
            }, {}) || {},
            totalViews: documentsData?.reduce((sum: number, doc: any) => sum + (doc.views_count || 0), 0) || 0,
            totalDownloads: documentsData?.reduce((sum: number, doc: any) => sum + (doc.downloads_count || 0), 0) || 0,
          };
          break;

        case 'USER_ACTIVITY':
          const { data: usersData } = await supabase
            .from('profiles')
            .select('*');
          
          reportContent = {
            totalUsers: usersData?.length || 0,
            activeUsers: usersData?.filter((user: any) => user.is_active).length || 0,
            usersByRole: usersData?.reduce((acc: any, user: any) => {
              acc[user.role] = (acc[user.role] || 0) + 1;
              return acc;
            }, {}) || {},
            usersByAirport: usersData?.reduce((acc: any, user: any) => {
              acc[user.airport] = (acc[user.airport] || 0) + 1;
              return acc;
            }, {}) || {},
          };
          break;

        case 'ACTION_STATUS':
          const { data: actionsData } = await supabase
            .from('actions')
            .select('*');
          
          reportContent = {
            totalActions: actionsData?.length || 0,
            actionsByStatus: actionsData?.reduce((acc: any, action: any) => {
              acc[action.status] = (acc[action.status] || 0) + 1;
              return acc;
            }, {}) || {},
            actionsByPriority: actionsData?.reduce((acc: any, action: any) => {
              acc[action.priority] = (acc[action.priority] || 0) + 1;
              return acc;
            }, {}) || {},
            averageProgress: actionsData?.reduce((sum: number, action: any) => sum + (action.progress || 0), 0) / (actionsData?.length || 1) || 0,
          };
          break;

        case 'PERFORMANCE':
          const [documentsRes, actionsRes, correspondancesRes] = await Promise.all([
            supabase.from('documents').select('created_at, updated_at'),
            supabase.from('actions').select('created_at, due_date, status'),
            supabase.from('correspondances').select('created_at, status')
          ]);

          const documents = documentsRes.data || [];
          const actions = actionsRes.data || [];
          const correspondances = correspondancesRes.data || [];

          reportContent = {
            productivity: {
              documentsCreatedThisMonth: documents.filter((doc: any) => 
                new Date(doc.created_at).getMonth() === new Date().getMonth()
              ).length,
              actionsCompletedThisMonth: actions.filter((action: any) => 
                action.status === 'COMPLETED' &&
                new Date(action.created_at).getMonth() === new Date().getMonth()
              ).length,
              correspondancesSentThisMonth: correspondances.filter((corr: any) => 
                new Date(corr.created_at).getMonth() === new Date().getMonth()
              ).length,
            },
            efficiency: {
              totalActions: actions.length,
              completedActions: actions.filter((action: any) => action.status === 'COMPLETED').length,
              overdueActions: actions.filter((action: any) => 
                action.status !== 'COMPLETED' && new Date(action.due_date) < new Date()
              ).length,
            }
          };
          break;

        default:
          reportContent = { message: 'Type de rapport non supporté' };
      }

      return reportContent;
    } catch (error) {
      console.error('Erreur génération données rapport:', error);
      return { error: 'Erreur lors de la génération des données' };
    }
  };

  const createReport = useMutation({
    mutationFn: async (reportData: {
      name: string;
      type: string;
      config: Record<string, any>;
      frequency?: string;
    }) => {
      if (!user?.id) throw new Error('Utilisateur non connecté');

      // Générer le contenu du rapport avec les vraies données
      const content = await generateReportData(reportData.type, reportData.config);

      const { data, error } = await supabase
        .from('reports')
        .insert({
          ...reportData,
          content,
          status: 'COMPLETED',
          last_generated: new Date().toISOString(),
          created_by: user.id,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reports'] });
      toast({
        title: 'Rapport créé',
        description: 'Le rapport a été créé avec succès avec les données actuelles.',
      });
    },
    onError: (error) => {
      console.error('Erreur création rapport:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de créer le rapport.',
        variant: 'destructive',
      });
    },
  });

  const deleteReport = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('reports')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reports'] });
      toast({
        title: 'Rapport supprimé',
        description: 'Le rapport a été supprimé avec succès.',
      });
    },
    onError: (error) => {
      console.error('Erreur suppression rapport:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de supprimer le rapport.',
        variant: 'destructive',
      });
    },
  });

  return {
    reports,
    isLoading,
    error,
    createReport: createReport.mutate,
    isCreating: createReport.isPending,
    deleteReport: deleteReport.mutate,
    isDeleting: deleteReport.isPending,
  };
};
