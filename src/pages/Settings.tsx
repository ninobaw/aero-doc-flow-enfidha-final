
import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Settings as SettingsIcon, Save, Bell, Shield, Globe, Database, Mail } from 'lucide-react';
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';

const Settings = () => {
  const { toast } = useToast();
  const [settings, setSettings] = useState({
    // Paramètres généraux
    companyName: 'AeroDoc - Gestion Documentaire',
    defaultAirport: 'ENFIDHA',
    language: 'fr',
    theme: 'light',
    
    // Paramètres de notification
    emailNotifications: true,
    smsNotifications: false,
    pushNotifications: true,
    
    // Paramètres de sécurité
    sessionTimeout: '60',
    requireTwoFactor: false,
    passwordExpiry: '90',
    
    // Paramètres de documents
    documentRetention: '365',
    autoArchive: true,
    maxFileSize: '10',
    
    // Paramètres d'email
    smtpHost: '',
    smtpPort: '587',
    smtpUsername: '',
    useSSL: true,
  });

  // ===========================================
  // DÉBUT INTÉGRATION BACKEND SUPABASE - PAGE PARAMÈTRES
  // ===========================================

  const handleSave = () => {
    // Ici on pourrait sauvegarder dans Supabase
    toast({
      title: 'Paramètres sauvegardés',
      description: 'Vos paramètres ont été mis à jour avec succès.',
    });
  };

  const updateSetting = (key: string, value: any) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  // ===========================================
  // FIN INTÉGRATION BACKEND SUPABASE - PAGE PARAMÈTRES
  // ===========================================

  return (
    <AppLayout>
      <div className="space-y-6">
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
                  value={settings.companyName}
                  onChange={(e) => updateSetting('companyName', e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="defaultAirport">Aéroport par défaut</Label>
                <Select 
                  value={settings.defaultAirport} 
                  onValueChange={(value) => updateSetting('defaultAirport', value)}
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
                  value={settings.language} 
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
                  value={settings.theme} 
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
                  checked={settings.emailNotifications}
                  onCheckedChange={(checked) => updateSetting('emailNotifications', checked)}
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
                  checked={settings.smsNotifications}
                  onCheckedChange={(checked) => updateSetting('smsNotifications', checked)}
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
                  checked={settings.pushNotifications}
                  onCheckedChange={(checked) => updateSetting('pushNotifications', checked)}
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
                  value={settings.sessionTimeout}
                  onChange={(e) => updateSetting('sessionTimeout', e.target.value)}
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
                  checked={settings.requireTwoFactor}
                  onCheckedChange={(checked) => updateSetting('requireTwoFactor', checked)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="passwordExpiry">Expiration des mots de passe (jours)</Label>
                <Input
                  id="passwordExpiry"
                  type="number"
                  value={settings.passwordExpiry}
                  onChange={(e) => updateSetting('passwordExpiry', e.target.value)}
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
                  value={settings.documentRetention}
                  onChange={(e) => updateSetting('documentRetention', e.target.value)}
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
                  checked={settings.autoArchive}
                  onCheckedChange={(checked) => updateSetting('autoArchive', checked)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="maxFileSize">Taille max des fichiers (MB)</Label>
                <Input
                  id="maxFileSize"
                  type="number"
                  value={settings.maxFileSize}
                  onChange={(e) => updateSetting('maxFileSize', e.target.value)}
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
                  value={settings.smtpHost}
                  onChange={(e) => updateSetting('smtpHost', e.target.value)}
                  placeholder="smtp.example.com"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="smtpPort">Port SMTP</Label>
                <Input
                  id="smtpPort"
                  type="number"
                  value={settings.smtpPort}
                  onChange={(e) => updateSetting('smtpPort', e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="smtpUsername">Nom d'utilisateur</Label>
                <Input
                  id="smtpUsername"
                  value={settings.smtpUsername}
                  onChange={(e) => updateSetting('smtpUsername', e.target.value)}
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
                  checked={settings.useSSL}
                  onCheckedChange={(checked) => updateSetting('useSSL', checked)}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Bouton de sauvegarde */}
        <div className="flex justify-end">
          <Button onClick={handleSave} className="bg-aviation-sky hover:bg-aviation-sky-dark">
            <Save className="w-4 h-4 mr-2" />
            Sauvegarder les paramètres
          </Button>
        </div>
      </div>
    </AppLayout>
  );
};

export default Settings;
