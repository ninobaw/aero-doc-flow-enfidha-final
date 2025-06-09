import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Clock, User, FileText, Settings, Mail, CheckSquare } from 'lucide-react';
import { formatDateTime } from '@/shared/utils';
import type { ActivityLogData } from '@/hooks/useActivityLogs';

interface ActivityLogListProps {
  logs: ActivityLogData[];
  isLoading: boolean;
}

export const ActivityLogList: React.FC<ActivityLogListProps> = ({ logs, isLoading }) => {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Journaux d'Audit</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-aviation-sky"></div>
            <p className="ml-4 text-gray-600">Chargement des journaux d'audit...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (logs.length === 0) {
    return (
      <Card className="text-center p-8">
        <CardContent>
          <Clock className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Aucun journal d'activité trouvé
          </h3>
          <p className="text-gray-500">
            Le système n'a pas encore enregistré d'activités.
          </p>
        </CardContent>
      </Card>
    );
  }

  const getActionIcon = (action: string) => {
    switch (action) {
      case 'USER_LOGIN': return <User className="w-4 h-4 text-green-600" />;
      case 'USER_LOGOUT': return <User className="w-4 h-4 text-red-600" />;
      case 'DOCUMENT_CREATED': return <FileText className="w-4 h-4 text-blue-600" />;
      case 'DOCUMENT_UPDATED': return <FileText className="w-4 h-4 text-orange-600" />;
      case 'DOCUMENT_DELETED': return <FileText className="w-4 h-4 text-red-600" />;
      case 'DOCUMENT_APPROVED': return <FileText className="w-4 h-4 text-emerald-600" />;
      case 'ACTION_CREATED': return <CheckSquare className="w-4 h-4 text-purple-600" />;
      case 'ACTION_UPDATED': return <CheckSquare className="w-4 h-4 text-orange-600" />;
      case 'ACTION_COMPLETED': return <CheckSquare className="w-4 h-4 text-green-600" />;
      case 'REPORT_GENERATED': return <Settings className="w-4 h-4 text-indigo-600" />;
      case 'CORRESPONDANCE_SENT': return <Mail className="w-4 h-4 text-blue-600" />;
      case 'PROCES_VERBAL_CREATED': return <Clock className="w-4 h-4 text-orange-600" />;
      case 'SETTINGS_UPDATED': return <Settings className="w-4 h-4 text-gray-600" />;
      default: return <Clock className="w-4 h-4 text-gray-500" />;
    }
  };

  const getActionBadgeColor = (action: string) => {
    switch (action) {
      case 'USER_LOGIN': return 'bg-green-100 text-green-800';
      case 'USER_LOGOUT': return 'bg-red-100 text-red-800';
      case 'DOCUMENT_CREATED': return 'bg-blue-100 text-blue-800';
      case 'DOCUMENT_UPDATED': return 'bg-orange-100 text-orange-800';
      case 'DOCUMENT_DELETED': return 'bg-red-100 text-red-800';
      case 'DOCUMENT_APPROVED': return 'bg-emerald-100 text-emerald-800';
      case 'ACTION_CREATED': return 'bg-purple-100 text-purple-800';
      case 'ACTION_UPDATED': return 'bg-orange-100 text-orange-800';
      case 'ACTION_COMPLETED': return 'bg-green-100 text-green-800';
      case 'REPORT_GENERATED': return 'bg-indigo-100 text-indigo-800';
      case 'CORRESPONDANCE_SENT': return 'bg-blue-100 text-blue-800';
      case 'PROCES_VERBAL_CREATED': return 'bg-orange-100 text-orange-800';
      case 'SETTINGS_UPDATED': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Clock className="w-5 h-5 mr-2 text-aviation-sky" />
          Journaux d'Audit ({logs.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[150px]">Date & Heure</TableHead>
                <TableHead>Utilisateur</TableHead>
                <TableHead>Action</TableHead>
                <TableHead>Détails</TableHead>
                <TableHead>Type d'Entité</TableHead>
                <TableHead>ID Entité</TableHead>
                <TableHead>IP</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {logs.map((log) => (
                <TableRow key={log.id}>
                  <TableCell className="font-medium text-sm">
                    {formatDateTime(log.timestamp)}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      {getActionIcon('USER_LOGIN')} {/* Generic user icon for display */}
                      <span>{log.user?.firstName} {log.user?.lastName || 'Système'}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge className={getActionBadgeColor(log.action)}>
                      {log.action.replace(/_/g, ' ')}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm text-gray-700 max-w-xs truncate">
                    {log.details}
                  </TableCell>
                  <TableCell className="text-sm text-gray-600">
                    {log.entityType}
                  </TableCell>
                  <TableCell className="text-xs font-mono text-gray-500">
                    {log.entityId.substring(0, 8)}...
                  </TableCell>
                  <TableCell className="text-xs text-gray-500">
                    {log.ipAddress || 'N/A'}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};