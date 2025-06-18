import React, { useState, useEffect } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Settings as SettingsIcon, Save, Bell, Shield, Code } from 'lucide-react';
import { useSettings } from '@/hooks/useSettings';
import { Airport } from '@/shared/types';
import { DocumentCodeConfigManagement } from '@/components/settings/DocumentCodeConfigManagement';
import { useAuth } from '@/contexts/AuthContext';

// Import new modular sections
import { GeneralSettingsSection } from '@/components/settings/GeneralSettingsSection';
import { DocumentSettingsSection } from '@/components/settings/DocumentSettingsSection';
import { NotificationSettingsSection } from '@/components/settings/NotificationSettingsSection';
import { EmailConfigSection } from '@/components/settings/EmailConfigSection';
import { SmsConfigSection } from '@/components/settings/SmsConfigSection';
import { SecuritySettingsSection } from '@/components/settings/SecuritySettingsSection';

const SettingsPage: React.FC = () => {
  const { settings, isLoading, updateSettings, isUpdating } = useSettings();
  const { hasPermission } = useAuth();

  const [formData, setFormData] = useState({
    company_name: '',
    default_airport: 'ENFIDHA' as Airport,
    language: 'fr',
    theme: 'light',
    email_notifications: true,
    sms_notifications: false,
    push_notifications: true,
    session_timeout: 60,
    require_two_factor: false,
    password_expiry: 90,
    document_retention: 365,
    auto_archive: true,
    max_file_size: 10,
    smtp_host: '',
    smtp_port: 587,
    smtp_username: '',
    use_ssl: true,
    twilio_account_sid: '',
    twilio_auth_token: '',
    twilio_phone_number: '',
  });

  useEffect(() => {
    if (settings) {
      setFormData({
        company_name: settings.company_name || '',
        default_airport: settings.default_airport || 'ENFIDHA',
        language: settings.language || 'fr',
        theme: settings.theme || 'light',
        email_notifications: settings.email_notifications ?? true,
        sms_notifications: settings.sms_notifications ?? false,
        push_notifications: settings.push_notifications ?? true,
        session_timeout: settings.session_timeout || 60,
        require_two_factor: settings.require_two_factor ?? false,
        password_expiry: settings.password_expiry || 90,
        document_retention: settings.document_retention || 365,
        auto_archive: settings.auto_archive ?? true,
        max_file_size: settings.max_file_size || 10,
        smtp_host: settings.smtp_host || '',
        smtp_port: settings.smtp_port || 587,
        smtp_username: settings.smtp_username || '',
        use_ssl: settings.use_ssl ?? true,
        twilio_account_sid: settings.twilio_account_sid || '',
        twilio_auth_token: settings.twilio_auth_token || '',
        twilio_phone_number: settings.twilio_phone_number || '',
      });
    }
  }, [settings]);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Frontend: handleSave function called.');
    console.log('Frontend: Données du formulaire avant envoi:', formData);
    updateSettings(formData);
  };

  const updateSetting = (key: string, value: any) => {
    setFormData(prev => ({ ...prev, [key]: value }));
  };

  console.log('Frontend: Settings component rendered. isUpdating:', isUpdating);

  if (isLoading) {
    return (
      <AppLayout>
        <div className="space-y-6">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-48 mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-64"></div>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-gray-100 p-6 rounded-lg shadow-sm">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        </div>
      </AppLayout>
    );
  }

  const canManageSettings = hasPermission('manage_settings');

  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Paramètres</h1>
          <p className="text-gray-500 mt-1">
            Configurer les paramètres de l'application
          </p>
        </div>

        <Tabs defaultValue="general" className="w-full">
          <TabsList className="grid w-full grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            <TabsTrigger value="general" className="flex items-center space-x-2">
              <SettingsIcon className="w-4 h-4" />
              <span>Général</span>
            </TabsTrigger>
            <TabsTrigger value="notifications" className="flex items-center space-x-2">
              <Bell className="w-4 h-4" />
              <span>Notifications</span>
            </TabsTrigger>
            <TabsTrigger value="security" className="flex items-center space-x-2">
              <Shield className="w-4 h-4" />
              <span>Sécurité</span>
            </TabsTrigger>
            {canManageSettings && (
              <TabsTrigger value="document-codes" className="flex items-center space-x-2">
                <Code className="w-4 h-4" />
                <span>Codes Doc</span>
              </TabsTrigger>
            )}
          </TabsList>

          <form onSubmit={handleSave} className="space-y-6">
            <TabsContent value="general" className="space-y-6 mt-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <GeneralSettingsSection
                  formData={{
                    company_name: formData.company_name,
                    default_airport: formData.default_airport,
                    language: formData.language,
                    theme: formData.theme,
                  }}
                  updateSetting={updateSetting}
                  isUpdating={isUpdating}
                />
                <DocumentSettingsSection
                  formData={{
                    document_retention: formData.document_retention,
                    auto_archive: formData.auto_archive,
                    max_file_size: formData.max_file_size,
                  }}
                  updateSetting={updateSetting}
                  isUpdating={isUpdating}
                />
              </div>
            </TabsContent>

            <TabsContent value="notifications" className="space-y-6 mt-6">
              <NotificationSettingsSection
                formData={{
                  email_notifications: formData.email_notifications,
                  sms_notifications: formData.sms_notifications,
                  push_notifications: formData.push_notifications,
                }}
                updateSetting={updateSetting}
                isUpdating={isUpdating}
              />
              <EmailConfigSection
                formData={{
                  smtp_host: formData.smtp_host,
                  smtp_port: formData.smtp_port,
                  smtp_username: formData.smtp_username,
                  use_ssl: formData.use_ssl,
                }}
                updateSetting={updateSetting}
                isUpdating={isUpdating}
              />
              <SmsConfigSection
                formData={{
                  twilio_account_sid: formData.twilio_account_sid,
                  twilio_auth_token: formData.twilio_auth_token,
                  twilio_phone_number: formData.twilio_phone_number,
                }}
                updateSetting={updateSetting}
                isUpdating={isUpdating}
              />
            </TabsContent>

            <TabsContent value="security" className="space-y-6 mt-6">
              <SecuritySettingsSection
                formData={{
                  session_timeout: formData.session_timeout,
                  require_two_factor: formData.require_two_factor,
                  password_expiry: formData.password_expiry,
                }}
                updateSetting={updateSetting}
                isUpdating={isUpdating}
              />
            </TabsContent>

            {canManageSettings && (
              <TabsContent value="document-codes" className="space-y-6 mt-6">
                <DocumentCodeConfigManagement />
              </TabsContent>
            )}

            {/* Save button for all tabs */}
            <div className="flex justify-end pt-4">
              <Button
                type="submit"
                disabled={isUpdating}
                className="bg-aviation-sky hover:bg-aviation-sky-dark"
              >
                <Save className="w-4 h-4 mr-2" />
                {isUpdating ? 'Sauvegarde...' : 'Sauvegarder les paramètres'}
              </Button>
            </div>
          </form>
        </Tabs>
      </div>
    </AppLayout>
  );
};

export default SettingsPage;