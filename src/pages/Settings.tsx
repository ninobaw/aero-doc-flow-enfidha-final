import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Settings as SettingsIcon, Save, Bell, Shield, Globe, Database, Mail } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useSettings } from '@/hooks/useSettings';

const Settings = () => {
  const { settings, isLoading, updateSettings, isUpdating } = useSettings();
  const [formData, setFormData] = useState({
    company_name: '',
    default_airport: 'ENFIDHA' as 'ENFIDHA' | 'MONASTIR',
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
  });

  // ===========================================
  // DÉBUT INTÉGRATION BACKEND SUPABASE - PAGE PARAMÈTRES
  // ===========================================

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
      });
    }
  }, [settings]);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings(formData);
  };

  const updateSetting = (key: string, value: any) => {
    setFormData(prev => ({ ...prev, [key]: value }));
  };

  // ===========================================
  // FIN INTÉGRATION BACKEND SUPABASE - PAGE PARAMÈTRES
  // ===========================================

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

  return (
    <AppLayout>
      <form onSubmit={handleSave} className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Paramètres</h1>
          <p className="text-gray-500 mt-1">
            Configurer les paramètres de l'application
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Paramètres généraux */}
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
                  onValueChange={(value: 'ENFIDHA' | 'MONASTIR') => updateSetting('default_airport', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ENFIDHA">Enfidha</SelectItem>
                    <SelectItem value="MONASTIR">Monastir</SelectItem>
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

          {/* Paramètres de notification */}
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

          {/* Paramètres de sécurité */}
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

          {/* Paramètres des documents */}
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

        {/* Configuration Email */}
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
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="smtpUsername">Nom d'utilisateur</Label>
                <Input
                  id="smtpUsername"
                  value={formData.smtp_username}
                  onChange={(e) => updateSetting('smtp_username', e.target.value)}
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

        {/* Bouton de sauvegarde */}
        <div className="flex justify-end">
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
    </AppLayout>
  );
};

export default Settings;
