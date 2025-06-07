import { useQuery } from '@tanstack/react-query';
import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api';

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
        console.log('Fetching dashboard stats from backend...');
        // Fetch all necessary data from backend endpoints
        const [documentsRes, usersRes, actionsRes, activityLogsRes] = await Promise.all([
          axios.get(`${API_BASE_URL}/documents`),
          axios.get(`${API_BASE_URL}/users`),
          axios.get(`${API_BASE_URL}/actions`),
          axios.get(`${API_BASE_URL}/activity-logs`),
        ]);

        const documents = documentsRes.data || [];
        const users = usersRes.data || [];
        const actions = actionsRes.data || [];
        const activityLogs = activityLogsRes.data || [];

        console.log('Raw Documents from backend:', documents);
        console.log('Raw Users from backend:', users);
        console.log('Raw Actions from backend:', actions);
        console.log('Raw Activity Logs from backend:', activityLogs);

        const now = new Date();
        const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);

        const totalDocuments = documents.length || 0;
        const activeUsers = users.filter((u: any) => u.isActive).length || 0; // Changed from is_active to isActive
        const completedActions = actions.filter((a: any) => a.status === 'COMPLETED').length || 0;
        const pendingActions = actions.filter((a: any) => a.status === 'PENDING').length || 0;
        const documentsThisMonth = documents.filter((d: any) => new Date(d.createdAt) >= thisMonth).length || 0; // Changed from created_at to createdAt
        const recentDocuments = documents.slice(0, 5) || [];
        const urgentActions = actions.filter((a: any) => a.priority === 'URGENT').slice(0, 5) || [];

        const completedActionsWithTime = actions.filter((a: any) => 
          a.status === 'COMPLETED' && a.actualHours !== undefined && a.actualHours !== null // Changed from actual_hours to actualHours
        ) || [];
        
        const averageCompletionTime = completedActionsWithTime.length > 0
          ? completedActionsWithTime.reduce((acc: number, action: any) => acc + (action.actualHours || 0), 0) / completedActionsWithTime.length
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
          activityLogs: activityLogs.map((log: any) => ({
            id: log.id,
            type: log.action as 'document_created' | 'user_added' | 'action_completed' | 'action_overdue',
            title: log.action.replace(/_/g, ' ').toUpperCase(), // Replace underscores and capitalize
            description: log.details,
            user: {
              name: `${log.user?.firstName || 'Utilisateur'} ${log.user?.lastName || 'Inconnu'}`, // Changed from first_name/last_name to firstName/lastName
              initials: `${log.user?.firstName?.[0] || 'U'}${log.user?.lastName?.[0] || 'I'}`, // Changed from first_name/last_name to firstName/lastName
            },
            timestamp: log.timestamp,
            priority: 'medium' as const, // Defaulting priority for activity logs
          })) || [],
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
    isLoading: statsLoading,
  };
};