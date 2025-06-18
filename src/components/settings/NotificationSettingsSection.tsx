import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Bell } from 'lucide-react';

interface NotificationSettingsSectionProps {
  formData: {
    email_notifications: boolean;
    sms_notifications: boolean;
    push_notifications: boolean;
  };
  updateSetting: (key: string, value: any) => void;
  isUpdating: boolean;
}

export const NotificationSettingsSection: React.FC<NotificationSettingsSectionProps> = ({
  formData,
  updateSetting,
  isUpdating,
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Bell className="w-5 h-5 mr-2" />
          Notifications
        </CardTitle>
        <CardDescription>
          Gérer vos préférences de notification
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label>Notifications par email</Label>
            <p className="text-sm text-gray-500">
              Recevoir des emails pour les actions importantes
            </p>
          </div>
          <Switch
            checked={formData.email_notifications}
            onCheckedChange={(checked) => updateSetting('email_notifications', checked)}
            disabled={isUpdating}
          />
        </div>

        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label>Notifications SMS</Label>
            <p className="text-sm text-gray-500">
              Recevoir des SMS pour les alertes urgentes
            </p>
          </div>
          <Switch
            checked={formData.sms_notifications}
            onCheckedChange={(checked) => updateSetting('sms_notifications', checked)}
            disabled={isUpdating}
          />
        </div>

        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label>Notifications push</Label>
            <p className="text-sm text-gray-500">
              Notifications dans le navigateur
            </p>
          </div>
          <Switch
            checked={formData.push_notifications}
            onCheckedChange={(checked) => updateSetting('push_notifications', checked)}
            disabled={isUpdating}
          />
        </div>
      </CardContent>
    </Card>
  );
};