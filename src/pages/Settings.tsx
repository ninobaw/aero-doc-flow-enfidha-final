
import { useState } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Settings as SettingsIcon, 
  Save, 
  Building, 
  Mail, 
  Shield, 
  Palette,
  Globe,
  Database,
  Bell
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const Settings = () => {
  const { toast } = useToast();
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [systemAlerts, setSystemAlerts] = useState(true);

  const handleSaveSettings = (section: string) => {
    toast({
      title: "Paramètres sauvegardés",
      description: `Les paramètres ${section} ont été mis à jour avec succès.`
    });
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Paramètres</h1>
          <p className="text-gray-500 mt-1">
            Configurez l'application selon vos besoins
          </p>
        </div>

        <Tabs defaultValue="general" className="w-full">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="general" className="flex items-center">
              <Building className="w-4 h-4 mr-2" />
              Général
            </TabsTrigger>
            <TabsTrigger value="email" className="flex items-center">
              <Mail className="w-4 h-4 mr-2" />
              Email
            </TabsTrigger>
            <TabsTrigger value="security" className="flex items-center">
              <Shield className="w-4 h-4 mr-2" />
              Sécurité
            </TabsTrigger>
            <TabsTrigger value="appearance" className="flex items-center">
              <Palette className="w-4 h-4 mr-2" />
              Apparence
            </TabsTrigger>
            <TabsTrigger value="system" className="flex items-center">
              <Database className="w-4 h-4 mr-2" />
              Système
            </TabsTrigger>
            <TabsTrigger value="notifications" className="flex items-center">
              <Bell className="w-4 h-4 mr-2" />
              Notifications
            </TabsTrigger>
          </TabsList>

          <TabsContent value="general" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Building className="w-5 h-5 mr-2 text-aviation-sky" />
                  Paramètres Généraux
                </CardTitle>
                <CardDescription>
                  Configuration de base de l'application
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="company-name">Nom de l'organisation</Label>
                    <Input
                      id="company-name"
                      defaultValue="Aéroports de Tunisie"
                      placeholder="Nom de votre organisation"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="language">Langue par défaut</Label>
                    <Select defaultValue="fr">
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
                    <Label htmlFor="timezone">Fuseau horaire</Label>
                    <Select defaultValue="africa/tunis">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="africa/tunis">Afrique/Tunis (GMT+1)</SelectItem>
                        <SelectItem value="europe/paris">Europe/Paris (GMT+1)</SelectItem>
                        <SelectItem value="utc">UTC (GMT+0)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="currency">Devise</Label>
                    <Select defaultValue="tnd">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="tnd">Dinar Tunisien (TND)</SelectItem>
                        <SelectItem value="eur">Euro (EUR)</SelectItem>
                        <SelectItem value="usd">Dollar US (USD)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description de l'organisation</Label>
                  <Textarea
                    id="description"
                    placeholder="Description de votre organisation..."
                    rows={3}
                    defaultValue="Gestion des aéroports d'Enfidha et Monastir"
                  />
                </div>

                <div className="flex justify-end">
                  <Button 
                    onClick={() => handleSaveSettings('généraux')}
                    className="bg-aviation-sky hover:bg-aviation-sky-dark"
                  >
                    <Save className="w-4 h-4 mr-2" />
                    Sauvegarder
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="email" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Mail className="w-5 h-5 mr-2 text-aviation-sky" />
                  Configuration Email
                </CardTitle>
                <CardDescription>
                  Paramètres de serveur de messagerie
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="smtp-host">Serveur SMTP</Label>
                    <Input
                      id="smtp-host"
                      placeholder="smtp.gmail.com"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="smtp-port">Port SMTP</Label>
                    <Input
                      id="smtp-port"
                      placeholder="587"
                      type="number"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="smtp-user">Nom d'utilisateur</Label>
                    <Input
                      id="smtp-user"
                      placeholder="votre-email@domain.com"
                      type="email"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="smtp-password">Mot de passe</Label>
                    <Input
                      id="smtp-password"
                      placeholder="••••••••"
                      type="password"
                    />
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch id="use-ssl" />
                  <Label htmlFor="use-ssl">Utiliser SSL/TLS</Label>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="sender-email">Email expéditeur par défaut</Label>
                  <Input
                    id="sender-email"
                    placeholder="noreply@aerodoc.tn"
                    type="email"
                  />
                </div>

                <div className="flex justify-end space-x-4">
                  <Button variant="outline">
                    Tester la configuration
                  </Button>
                  <Button 
                    onClick={() => handleSaveSettings('email')}
                    className="bg-aviation-sky hover:bg-aviation-sky-dark"
                  >
                    <Save className="w-4 h-4 mr-2" />
                    Sauvegarder
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="security" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Shield className="w-5 h-5 mr-2 text-aviation-sky" />
                  Paramètres de Sécurité
                </CardTitle>
                <CardDescription>
                  Configuration de la sécurité et des accès
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="session-timeout">Timeout de session (minutes)</Label>
                    <Input
                      id="session-timeout"
                      type="number"
                      defaultValue="60"
                      placeholder="60"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="max-login-attempts">Tentatives de connexion max</Label>
                    <Input
                      id="max-login-attempts"
                      type="number"
                      defaultValue="5"
                      placeholder="5"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="password-min-length">Longueur min du mot de passe</Label>
                    <Input
                      id="password-min-length"
                      type="number"
                      defaultValue="8"
                      placeholder="8"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="backup-retention">Rétention des sauvegardes (jours)</Label>
                    <Input
                      id="backup-retention"
                      type="number"
                      defaultValue="30"
                      placeholder="30"
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Switch id="require-2fa" />
                    <Label htmlFor="require-2fa">Exiger l'authentification à deux facteurs</Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Switch id="password-complexity" defaultChecked />
                    <Label htmlFor="password-complexity">Exiger des mots de passe complexes</Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Switch id="audit-logs" defaultChecked />
                    <Label htmlFor="audit-logs">Activer les logs d'audit</Label>
                  </div>
                </div>

                <div className="flex justify-end">
                  <Button 
                    onClick={() => handleSaveSettings('sécurité')}
                    className="bg-aviation-sky hover:bg-aviation-sky-dark"
                  >
                    <Save className="w-4 h-4 mr-2" />
                    Sauvegarder
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="appearance" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Palette className="w-5 h-5 mr-2 text-aviation-sky" />
                  Apparence
                </CardTitle>
                <CardDescription>
                  Personnalisez l'apparence de l'interface
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="theme">Thème</Label>
                    <Select defaultValue="light">
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

                  <div className="space-y-2">
                    <Label htmlFor="color-scheme">Schéma de couleurs</Label>
                    <Select defaultValue="aviation">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="aviation">Aviation (Bleu)</SelectItem>
                        <SelectItem value="corporate">Corporate (Gris)</SelectItem>
                        <SelectItem value="modern">Modern (Violet)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="sidebar-position">Position du menu</Label>
                    <Select defaultValue="left">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="left">Gauche</SelectItem>
                        <SelectItem value="right">Droite</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="font-size">Taille de police</Label>
                    <Select defaultValue="medium">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="small">Petite</SelectItem>
                        <SelectItem value="medium">Moyenne</SelectItem>
                        <SelectItem value="large">Grande</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="flex justify-end">
                  <Button 
                    onClick={() => handleSaveSettings('apparence')}
                    className="bg-aviation-sky hover:bg-aviation-sky-dark"
                  >
                    <Save className="w-4 h-4 mr-2" />
                    Sauvegarder
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="system" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Database className="w-5 h-5 mr-2 text-aviation-sky" />
                  Paramètres Système
                </CardTitle>
                <CardDescription>
                  Configuration avancée du système
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="max-file-size">Taille max des fichiers (MB)</Label>
                    <Input
                      id="max-file-size"
                      type="number"
                      defaultValue="10"
                      placeholder="10"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="auto-backup">Sauvegarde automatique</Label>
                    <Select defaultValue="daily">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="never">Jamais</SelectItem>
                        <SelectItem value="daily">Quotidienne</SelectItem>
                        <SelectItem value="weekly">Hebdomadaire</SelectItem>
                        <SelectItem value="monthly">Mensuelle</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="log-level">Niveau de logs</Label>
                    <Select defaultValue="info">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="debug">Debug</SelectItem>
                        <SelectItem value="info">Info</SelectItem>
                        <SelectItem value="warn">Warning</SelectItem>
                        <SelectItem value="error">Error</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="cache-duration">Durée du cache (heures)</Label>
                    <Input
                      id="cache-duration"
                      type="number"
                      defaultValue="24"
                      placeholder="24"
                    />
                  </div>
                </div>

                <div className="flex justify-end space-x-4">
                  <Button variant="outline">
                    Vider le cache
                  </Button>
                  <Button 
                    onClick={() => handleSaveSettings('système')}
                    className="bg-aviation-sky hover:bg-aviation-sky-dark"
                  >
                    <Save className="w-4 h-4 mr-2" />
                    Sauvegarder
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="notifications" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Bell className="w-5 h-5 mr-2 text-aviation-sky" />
                  Notifications
                </CardTitle>
                <CardDescription>
                  Gérez vos préférences de notification
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="email-notifications">Notifications par email</Label>
                      <p className="text-sm text-gray-500">
                        Recevoir des notifications par email pour les actions importantes
                      </p>
                    </div>
                    <Switch 
                      id="email-notifications"
                      checked={emailNotifications}
                      onCheckedChange={setEmailNotifications}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="system-alerts">Alertes système</Label>
                      <p className="text-sm text-gray-500">
                        Afficher les alertes système dans l'interface
                      </p>
                    </div>
                    <Switch 
                      id="system-alerts"
                      checked={systemAlerts}
                      onCheckedChange={setSystemAlerts}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="task-reminders">Rappels de tâches</Label>
                      <p className="text-sm text-gray-500">
                        Recevoir des rappels pour les tâches en retard
                      </p>
                    </div>
                    <Switch id="task-reminders" />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="document-updates">Mises à jour de documents</Label>
                      <p className="text-sm text-gray-500">
                        Être notifié des modifications de documents
                      </p>
                    </div>
                    <Switch id="document-updates" defaultChecked />
                  </div>
                </div>

                <div className="flex justify-end">
                  <Button 
                    onClick={() => handleSaveSettings('notifications')}
                    className="bg-aviation-sky hover:bg-aviation-sky-dark"
                  >
                    <Save className="w-4 h-4 mr-2" />
                    Sauvegarder
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
};

export default Settings;
