import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { useAuth } from '@/contexts/AuthContext'; // Import useAuth

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
  const { user } = useAuth(); // Get the current user from AuthContext

  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['dashboard-stats', user?.id, user?.role], // Include user ID and role in query key
    queryFn: async (): Promise<DashboardStats> => {
      try {
        if (!user?.id) {
          // If no user is logged in, return default empty stats
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

        console.log('Fetching dashboard stats from backend...');
        // Pass userId and userRole as query parameters
        const response = await axios.get(`${API_BASE_URL}/dashboard/stats`, {
          params: {
            userId: user.id,
            userRole: user.role,
          },
        });
        const dashboardData = response.data;

        console.log('Dashboard data from backend:', dashboardData);

        return {
          totalDocuments: dashboardData.totalDocuments || 0,
          activeUsers: dashboardData.activeUsers || 0,
          completedActions: dashboardData.completedActions || 0,
          pendingActions: dashboardData.pendingActions || 0,
          documentsThisMonth: dashboardData.documentsThisMonth || 0,
          averageCompletionTime: dashboardData.averageCompletionTime || 0,
          recentDocuments: dashboardData.recentDocuments || [],
          urgentActions: dashboardData.urgentActions || [],
          activityLogs: dashboardData.activityLogs || [],
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
    enabled: !!user?.id, // Only enable query if user ID is available
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