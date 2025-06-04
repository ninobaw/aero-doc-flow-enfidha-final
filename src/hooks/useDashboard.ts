
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface DashboardStats {
  totalDocuments: number;
  activeUsers: number;
  completedActions: number;
  pendingActions: number;
  documentsThisMonth: number;
  averageCompletionTime: number;
  recentDocuments?: any[];
  urgentActions?: any[];
  activityLogs?: any[];
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
      // Récupérer les statistiques des documents
      const { data: documents } = await supabase
        .from('documents')
        .select('*, author:profiles(first_name, last_name)')
        .order('created_at', { ascending: false });

      // Récupérer les utilisateurs actifs
      const { data: users } = await supabase
        .from('profiles')
        .select('id, is_active')
        .eq('is_active', true);

      // Récupérer les actions
      const { data: actions } = await supabase
        .from('actions')
        .select('*')
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

      return {
        totalDocuments,
        activeUsers,
        completedActions,
        pendingActions,
        documentsThisMonth,
        averageCompletionTime: 5, // Valeur mockée pour l'instant
        recentDocuments,
        urgentActions,
        activityLogs: activityLogs || [],
      };
    },
  });

  const { data: activities, isLoading: activitiesLoading } = useQuery({
    queryKey: ['dashboard-activities'],
    queryFn: async (): Promise<DashboardActivity[]> => {
      // Récupérer les activités récentes depuis les logs d'activité
      const { data: logs } = await supabase
        .from('activity_logs')
        .select('*')
        .order('timestamp', { ascending: false })
        .limit(10);

      // Pour l'instant, retourner des données mockées
      return [
        {
          id: '1',
          type: 'document_created',
          title: 'Nouveau document créé',
          description: 'Document "Procédure de sécurité" ajouté',
          user: { name: 'Admin User', initials: 'AU' },
          timestamp: new Date().toISOString(),
          priority: 'medium',
        },
        {
          id: '2',
          type: 'action_completed',
          title: 'Action terminée',
          description: 'Révision du manuel de qualité complétée',
          user: { name: 'John Doe', initials: 'JD' },
          timestamp: new Date(Date.now() - 3600000).toISOString(),
          priority: 'high',
        },
      ];
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
