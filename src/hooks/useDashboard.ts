
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface DashboardStats {
  totalDocuments: number;
  activeUsers: number;
  completedActions: number;
  pendingActions: number;
  recentDocuments: any[];
  urgentActions: any[];
  activityLogs: any[];
}

export const useDashboard = () => {
  // ===========================================
  // DÉBUT INTÉGRATION BACKEND SUPABASE - DASHBOARD
  // ===========================================

  const { data: stats, isLoading, error } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: async () => {
      // Récupération des statistiques
      const [
        documentsCount,
        usersCount,
        actionsStats,
        recentDocs,
        urgentActions,
        activityLogs
      ] = await Promise.all([
        supabase.from('documents').select('id', { count: 'exact' }),
        supabase.from('profiles').select('id', { count: 'exact' }).eq('is_active', true),
        supabase.from('actions').select('status', { count: 'exact' }),
        supabase
          .from('documents')
          .select('id, title, type, status, created_at, airport')
          .order('created_at', { ascending: false })
          .limit(5),
        supabase
          .from('actions')
          .select('id, title, due_date, priority, assigned_to')
          .in('priority', ['HIGH', 'URGENT'])
          .eq('status', 'PENDING')
          .order('due_date', { ascending: true })
          .limit(5),
        supabase
          .from('activity_logs')
          .select('*')
          .order('timestamp', { ascending: false })
          .limit(10)
      ]);

      if (documentsCount.error) throw documentsCount.error;
      if (usersCount.error) throw usersCount.error;
      if (actionsStats.error) throw actionsStats.error;
      if (recentDocs.error) throw recentDocs.error;
      if (urgentActions.error) throw urgentActions.error;
      if (activityLogs.error) throw activityLogs.error;

      // Calcul des actions complétées
      const completedActionsCount = await supabase
        .from('actions')
        .select('id', { count: 'exact' })
        .eq('status', 'COMPLETED');

      const pendingActionsCount = await supabase
        .from('actions')
        .select('id', { count: 'exact' })
        .eq('status', 'PENDING');

      return {
        totalDocuments: documentsCount.count || 0,
        activeUsers: usersCount.count || 0,
        completedActions: completedActionsCount.data?.length || 0,
        pendingActions: pendingActionsCount.data?.length || 0,
        recentDocuments: recentDocs.data || [],
        urgentActions: urgentActions.data || [],
        activityLogs: activityLogs.data || [],
      } as DashboardStats;
    },
  });

  // ===========================================
  // FIN INTÉGRATION BACKEND SUPABASE - DASHBOARD
  // ===========================================

  return {
    stats,
    isLoading,
    error,
  };
};
