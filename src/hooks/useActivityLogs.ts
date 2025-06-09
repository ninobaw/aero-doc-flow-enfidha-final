import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext'; // Assuming activity logs might be user-specific or require auth

const API_BASE_URL = 'http://localhost:5000/api';

export interface ActivityLogData {
  id: string;
  action: string;
  details: string;
  entityId: string;
  entityType: string;
  userId: string;
  user?: {
    firstName: string; // Changed from first_name
    lastName: string;  // Changed from last_name
  };
  timestamp: string;
  ipAddress?: string;
  userAgent?: string;
}

export const useActivityLogs = () => {
  const { toast } = useToast();
  const { user } = useAuth(); // Use auth to enable/disable query if needed

  const { data: activityLogs = [], isLoading, error } = useQuery<ActivityLogData[], Error>({
    queryKey: ['activityLogs'],
    queryFn: async () => {
      // In a real app, you might pass a token or check user role here
      // For now, we assume the backend handles authentication for this endpoint
      const response = await axios.get(`${API_BASE_URL}/activity-logs`);
      return response.data as ActivityLogData[];
    },
    enabled: !!user, // Only fetch if a user is logged in
  });

  if (error) {
    console.error('Erreur récupération journaux d\'activités:', error.message);
    toast({
      title: 'Erreur',
      description: 'Impossible de charger les journaux d\'activités.',
      variant: 'destructive',
    });
  }

  return {
    activityLogs,
    isLoading,
    error,
  };
};