
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface DashboardStats {
  totalDocuments: number;
  activeUsers: number;
  completedActions: number;
  pendingActions: number;
  documentsThisMonth: number;
  averageCompletionTime: number;
  recentDocuments: any[];
  urgentActions: any[];
  activityLogs: any[];
}

export interface DashboardActivity {
  id: string;
  type: 'document_created' | 'user_added' | 'action_completed' | 'action_overdue';
  title: string;
  description: string;
  user: {
    name: string;
    initials: string;
  };
  timestamp: string;
  priority?: 'low' | 'medium' | 'high' | 'urgent';
}

export const useDashboard = () => {
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: async (): Promise<DashboardStats> => {
      try {
        // Récupérer les documents avec leurs auteurs
        const { data: documents } = await supabase
          .from('documents')
          .select(`
            *,
            author:profiles(first_name, last_name)
          `)
          .order('created_at', { ascending: false });

        // Récupérer les utilisateurs actifs
        const { data: users } = await supabase
          .from('profiles')
          .select('id, is_active')
          .eq('is_active', true);

        // Récupérer les actions
        const { data: actions } = await supabase
          .from('actions')
          .select(`
            *,
            document:documents(title, type)
          `)
          .order('created_at', { ascending: false });

        // Récupérer les logs d'activité
        const { data: activityLogs } = await supabase
          .from('activity_logs')
          .select('*')
          .order('timestamp', { ascending: false })
          .limit(10);

        const now = new Date();
        const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);

        const totalDocuments = documents?.length || 0;
        const activeUsers = users?.length || 0;
        const completedActions = actions?.filter(a => a.status === 'COMPLETED').length || 0;
        const pendingActions = actions?.filter(a => a.status === 'PENDING').length || 0;
        const documentsThisMonth = documents?.filter(d => new Date(d.created_at) >= thisMonth).length || 0;
        const recentDocuments = documents?.slice(0, 5) || [];
        const urgentActions = actions?.filter(a => a.priority === 'URGENT').slice(0, 5) || [];

        // Calculer le temps moyen de completion
        const completedActionsWithTime = actions?.filter(a => 
          a.status === 'COMPLETED' && a.actual_hours
        ) || [];
        
        const averageCompletionTime = completedActionsWithTime.length > 0
          ? completedActionsWithTime.reduce((acc, action) => acc + (action.actual_hours || 0), 0) / completedActionsWithTime.length
          : 0;

        return {
          totalDocuments,
          activeUsers,
          completedActions,
          pendingActions,
          documentsThisMonth,
          averageCompletionTime,
          recentDocuments,
          urgentActions,
          activityLogs: activityLogs || [],
        };
      } catch (error) {
        console.error('Erreur récupération stats dashboard:', error);
        return {
          totalDocuments: 0,
          activeUsers: 0,
          completedActions: 0,
          pendingActions: 0,
          documentsThisMonth: 0,
          averageCompletionTime: 0,
          recentDocuments: [],
          urgentActions: [],
          activityLogs: [],
        };
      }
    },
  });

  const { data: activities, isLoading: activitiesLoading } = useQuery({
    queryKey: ['dashboard-activities'],
    queryFn: async (): Promise<DashboardActivity[]> => {
      try {
        // Récupérer les activités récentes depuis les logs d'activité
        const { data: logs } = await supabase
          .from('activity_logs')
          .select(`
            *,
            user:profiles(first_name, last_name)
          `)
          .order('timestamp', { ascending: false })
          .limit(20);

        if (!logs) return [];

        return logs.map(log => ({
          id: log.id,
          type: log.action as 'document_created' | 'user_added' | 'action_completed' | 'action_overdue',
          title: log.action.replace('_', ' ').toUpperCase(),
          description: log.details,
          user: {
            name: `${log.user?.first_name || 'Utilisateur'} ${log.user?.last_name || 'Inconnu'}`,
            initials: `${log.user?.first_name?.[0] || 'U'}${log.user?.last_name?.[0] || 'I'}`,
          },
          timestamp: log.timestamp,
          priority: 'medium' as const,
        }));
      } catch (error) {
        console.error('Erreur récupération activités dashboard:', error);
        return [];
      }
    },
  });

  return {
    stats: stats || {
      totalDocuments: 0,
      activeUsers: 0,
      completedActions: 0,
      pendingActions: 0,
      documentsThisMonth: 0,
      averageCompletionTime: 0,
      recentDocuments: [],
      urgentActions: [],
      activityLogs: [],
    },
    activities: activities || [],
    isLoading: statsLoading || activitiesLoading,
    statsLoading,
    activitiesLoading,
  };
};
