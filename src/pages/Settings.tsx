import React, { useState, useEffect } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Settings as SettingsIcon, Save, Bell, Shield, Globe, Database, Mail, Code, MessageSquare } from 'lucide-react';
import { useSettings } from '@/hooks/useSettings';
import { Airport } from '@/shared/types';
import { DocumentCodeConfigManagement } from '@/components/settings/DocumentCodeConfigManagement';
import { useAuth } from '@/contexts/AuthContext';

const Settings: React.FC = () => { // Ajout de React.FC ici
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
              <Card key={i} className="animate-pulse">
                <CardContent className="p-6">
                  <div className="space-y-4">
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                  </div>
                </CardContent>
              </Card>
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

          <TabsContent value="general" className="space-y-6 mt-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <SettingsIcon className="w-5 h-5 mr-2" />
                    Paramètres Généraux
                  </CardTitle>
                  <CardDescription>
                    Configuration générale de l'application
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="companyName">Nom de l'organisation</Label>
                    <Input
                      id="companyName"
                      value={formData.company_name}
                      onChange={(e) => updateSetting('company_name', e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="defaultAirport">Aéroport par défaut</Label>
                    <Select 
                      value={formData.default_airport} 
                      onValueChange={(value: Airport) => updateSetting('default_airport', value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ENFIDHA">Enfidha</SelectItem>
                        <SelectItem value="MONASTIR">Monastir</SelectItem>
                        <SelectItem value="GENERALE">Général</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="language">Langue</Label>
                    <Select 
                      value={formData.language} 
                      onValueChange={(value) => updateSetting('language', value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="fr">Français</SelectItem>
                        <SelectItem value="en">English</SelectItem>
                        <SelectItem value="ar">العربية</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="theme">Thème</Label>
                    <Select 
                      value={formData.theme} 
                      onValueChange={(value) => updateSetting('theme', value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="light">Clair</SelectItem>
                        <SelectItem value="dark">Sombre</SelectItem>
                        <SelectItem value="auto">Automatique</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Database className="w-5 h-5 mr-2" />
                    Documents
                  </CardTitle>
                  <CardDescription>
                    Configuration de la gestion documentaire
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="documentRetention">Durée de rétention (jours)</Label>
                    <Input
                      id="documentRetention"
                      type="number"
                      value={formData.document_retention}
                      onChange={(e) => updateSetting('document_retention', parseInt(e.target.value))}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Archivage automatique</Label>
                      <p className="text-sm text-gray-500">
                        Archiver automatiquement les anciens documents
                      </p>
                    </div>
                    <Switch
                      checked={formData.auto_archive}
                      onCheckedChange={(checked) => updateSetting('auto_archive', checked)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="maxFileSize">Taille max des fichiers (MB)</Label>
                    <Input
                      id="maxFileSize"
                      type="number"
                      value={formData.max_file_size}
                      onChange={(e) => updateSetting('max_file_size', parseInt(e.target.value))}
                    />
                  </div>
                </CardContent>
              </Card>
            </div>
            <div className="flex justify-end">
              <Button 
                type="submit" 
                // disabled={isUpdating}
                className="bg-aviation-sky hover:bg-aviation-sky-dark"
              >
                <Save className="w-4 h-4 mr-2" />
                {isUpdating ? 'Sauvegarde...' : 'Sauvegarder les paramètres'}
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="notifications" className="space-y-6 mt-6">
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
                  />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Mail className="w-5 h-5 mr-2" />
                  Configuration Email
                </CardTitle>
                <CardDescription>
                  Paramètres SMTP pour l'envoi d'emails
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="smtpHost">Serveur SMTP</Label>
                    <Input
                      id="smtpHost"
                      value={formData.smtp_host}
                      onChange={(e) => updateSetting('smtp_host', e.target.value)}
                      placeholder="smtp.example.com"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="smtpPort">Port SMTP</Label>
                    <Input
                      id="smtpPort"
                      type="number"
                      value={formData.smtp_port}
                      onChange={(e) => updateSetting('smtp_port', parseInt(e.target.value))}
                      placeholder="587"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="smtpUsername">Nom d'utilisateur</Label>
                    <Input
                      id="smtpUsername"
                      value={formData.smtp_username}
                      onChange={(e) => updateSetting('smtp_username', e.target.value)}
                      placeholder="user@example.com"
                    />
                  </div>

                  <div className="flex items-center justify-between pt-6">
                    <div className="space-y-0.5">
                      <Label>Utiliser SSL</Label>
                      <p className="text-sm text-gray-500">
                        Connexion sécurisée SSL/TLS
                      </p>
                    </div>
                    <Switch
                      checked={formData.use_ssl}
                      onCheckedChange={(checked) => updateSetting('use_ssl', checked)}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <MessageSquare className="w-5 h-5 mr-2" />
                  Configuration SMS (Twilio)
                </CardTitle>
                <CardDescription>
                  Paramètres pour l'envoi de notifications SMS via Twilio
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="twilioAccountSid">Account SID</Label>
                    <Input
                      id="twilioAccountSid"
                      value={formData.twilio_account_sid}
                      onChange={(e) => updateSetting('twilio_account_sid', e.target.value)}
                      placeholder="ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="twilioAuthToken">Auth Token</LabeL>
                    <Input
                      id="twilioAuthToken"
                      type="password"
                      value={formData.twilio_auth_token}
                      onChange={(e) => updateSetting('twilio_auth_token', e.target.value)}
                      placeholder="your_auth_token"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="twilioPhoneNumber">Numéro de téléphone Twilio</Label>
                    <Input
                      id="twilioPhoneNumber"
                      value={formData.twilio_phone_number}
                      onChange={(e) => updateSetting('twilio_phone_number', e.target.value)}
                      placeholder="+1234567890"
                    />
                  </div>
                </div>
                <p className="text-xs text-gray-500 mt-4">
                  Ces informations sont nécessaires pour envoyer des SMS via Twilio. Vous pouvez les trouver sur votre tableau de bord Twilio.
                </p>
              </CardContent>
            </Card>
            <div className="flex justify-end">
              <Button 
                type="submit" 
                // disabled={isUpdating}
                className="bg-aviation-sky hover:bg-aviation-sky-dark"
              >
                <Save className="w-4 h-4 mr-2" />
                {isUpdating ? 'Sauvegarde...' : 'Sauvegarder les paramètres'}
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="security" className="space-y-6 mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Shield className="w-5 h-5 mr-2" />
                  Sécurité
                </CardTitle>
                <CardDescription>
                  Configuration de la sécurité et des accès
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="sessionTimeout">Délai d'expiration de session (minutes)</Label>
                  <Input
                    id="sessionTimeout"
                    type="number"
                    value={formData.session_timeout}
                    onChange={(e) => updateSetting('session_timeout', parseInt(e.target.value))}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Authentification à deux facteurs</Label>
                    <p className="text-sm text-gray-500">
                      Exiger l'A2F pour tous les utilisateurs
                    </p>
                  </div>
                  <Switch
                    checked={formData.require_two_factor}
                    onCheckedChange={(checked) => updateSetting('require_two_factor', checked)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="passwordExpiry">Expiration des mots de passe (jours)</Label>
                  <Input
                    id="passwordExpiry"
                    type="number"
                    value={formData.password_expiry}
                    onChange={(e) => updateSetting('password_expiry', parseInt(e.target.value))}
                  />
                </div>
              </CardContent>
            </Card>
            <div className="flex justify-end">
              <Button 
                type="submit" 
                // disabled={isUpdating}
                className="bg-aviation-sky hover:bg-aviation-sky-dark"
              >
                <Save className="w-4 h-4 mr-2" />
                {isUpdating ? 'Sauvegarde...' : 'Sauvegarder les paramètres'}
              </Button>
            </div>
          </TabsContent>

          {canManageSettings && (
            <TabsContent value="document-codes" className="space-y-6 mt-6">
              <DocumentCodeConfigManagement />
            </TabsContent>
          )}
        </Tabs>
      </div>
    </AppLayout>
  );
};

export default Settings;