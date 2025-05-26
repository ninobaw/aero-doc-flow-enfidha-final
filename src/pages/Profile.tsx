
import { useState } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { 
  User, 
  Camera, 
  Save, 
  Lock, 
  Activity, 
  FileText, 
  Clock,
  MapPin,
  Phone,
  Mail
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const Profile = () => {
  const { toast } = useToast();
  const [profileImage, setProfileImage] = useState<string | null>(null);

  // Données utilisateur fictives
  const user = {
    id: 'user-1',
    firstName: 'Ahmed',
    lastName: 'Ben Ali',
    email: 'ahmed.benali@aerodoc.tn',
    role: 'ADMINISTRATOR',
    airport: 'ENFIDHA',
    phone: '+216 20 123 456',
    department: 'Sécurité Aéroportuaire',
    joinDate: '2023-01-15',
    lastLogin: '2025-01-26 14:30'
  };

  const activityStats = [
    { label: 'Documents créés', value: '23', icon: FileText, color: 'blue' },
    { label: 'Actions complétées', value: '45', icon: Activity, color: 'green' },
    { label: 'Heures connecté', value: '127h', icon: Clock, color: 'purple' },
    { label: 'Dernière connexion', value: 'Aujourd\'hui', icon: User, color: 'orange' }
  ];

  const recentActivities = [
    {
      id: '1',
      action: 'Création document',
      details: 'Rapport Sécurité Terminal A',
      timestamp: '2025-01-26 14:30',
      type: 'CREATE'
    },
    {
      id: '2',
      action: 'Action complétée',
      details: 'Vérification équipements sécurité',
      timestamp: '2025-01-26 12:15',
      type: 'COMPLETE'
    },
    {
      id: '3',
      action: 'Document approuvé',
      details: 'PV Réunion Sécurité',
      timestamp: '2025-01-25 16:45',
      type: 'APPROVE'
    }
  ];

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setProfileImage(e.target?.result as string);
      };
      reader.readAsDataURL(file);
      
      toast({
        title: "Photo mise à jour",
        description: "Votre photo de profil a été mise à jour."
      });
    }
  };

  const handleSaveProfile = () => {
    toast({
      title: "Profil sauvegardé",
      description: "Vos informations ont été mises à jour avec succès."
    });
  };

  const handleChangePassword = () => {
    toast({
      title: "Mot de passe modifié",
      description: "Votre mot de passe a été mis à jour avec succès."
    });
  };

  const getRoleLabel = (role: string) => {
    const roles = {
      'SUPER_ADMIN': 'Super Administrateur',
      'ADMINISTRATOR': 'Administrateur',
      'APPROVER': 'Approbateur',
      'USER': 'Utilisateur',
      'VISITOR': 'Visiteur'
    };
    return roles[role as keyof typeof roles] || role;
  };

  const getTypeColor = (type: string) => {
    const colors = {
      'CREATE': 'blue',
      'COMPLETE': 'green',
      'APPROVE': 'purple',
      'UPDATE': 'orange'
    };
    return colors[type as keyof typeof colors] || 'gray';
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Mon Profil</h1>
          <p className="text-gray-500 mt-1">
            Gérez vos informations personnelles et préférences
          </p>
        </div>

        {/* En-tête profil */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-6">
              <div className="relative">
                <Avatar className="w-24 h-24">
                  <AvatarImage src={profileImage || undefined} />
                  <AvatarFallback className="text-2xl bg-aviation-sky text-white">
                    {user.firstName[0]}{user.lastName[0]}
                  </AvatarFallback>
                </Avatar>
                <label 
                  htmlFor="profile-image"
                  className="absolute bottom-0 right-0 bg-aviation-sky text-white p-2 rounded-full cursor-pointer hover:bg-aviation-sky-dark transition-colors"
                >
                  <Camera className="w-4 h-4" />
                  <input
                    id="profile-image"
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                </label>
              </div>
              
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-gray-900">
                  {user.firstName} {user.lastName}
                </h2>
                <div className="flex items-center space-x-4 mt-2">
                  <Badge className="bg-aviation-sky text-white">
                    {getRoleLabel(user.role)}
                  </Badge>
                  <div className="flex items-center text-gray-500">
                    <MapPin className="w-4 h-4 mr-1" />
                    {user.airport}
                  </div>
                  <div className="flex items-center text-gray-500">
                    <Mail className="w-4 h-4 mr-1" />
                    {user.email}
                  </div>
                </div>
                <p className="text-gray-600 mt-1">{user.department}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Statistiques d'activité */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {activityStats.map((stat, index) => (
            <Card key={index}>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <stat.icon className={`h-8 w-8 text-${stat.color}-500 mr-4`} />
                  <div>
                    <p className="text-sm font-medium text-gray-600">{stat.label}</p>
                    <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <Tabs defaultValue="profile" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="profile">Informations Personnelles</TabsTrigger>
            <TabsTrigger value="security">Sécurité</TabsTrigger>
            <TabsTrigger value="activity">Activité</TabsTrigger>
          </TabsList>

          <TabsContent value="profile" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <User className="w-5 h-5 mr-2 text-aviation-sky" />
                  Informations Personnelles
                </CardTitle>
                <CardDescription>
                  Modifiez vos informations personnelles
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="first-name">Prénom</Label>
                    <Input
                      id="first-name"
                      defaultValue={user.firstName}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="last-name">Nom</Label>
                    <Input
                      id="last-name"
                      defaultValue={user.lastName}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      defaultValue={user.email}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone">Téléphone</Label>
                    <Input
                      id="phone"
                      defaultValue={user.phone}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="department">Département</Label>
                    <Input
                      id="department"
                      defaultValue={user.department}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="airport">Aéroport</Label>
                    <Select defaultValue={user.airport.toLowerCase()}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="enfidha">Enfidha</SelectItem>
                        <SelectItem value="monastir">Monastir</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bio">Biographie</Label>
                  <Textarea
                    id="bio"
                    placeholder="Parlez-nous de vous..."
                    rows={4}
                  />
                </div>

                <div className="flex justify-end">
                  <Button 
                    onClick={handleSaveProfile}
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
                  <Lock className="w-5 h-5 mr-2 text-aviation-sky" />
                  Paramètres de Sécurité
                </CardTitle>
                <CardDescription>
                  Modifiez votre mot de passe et paramètres de sécurité
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="current-password">Mot de passe actuel</Label>
                    <Input
                      id="current-password"
                      type="password"
                      placeholder="••••••••"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="new-password">Nouveau mot de passe</Label>
                    <Input
                      id="new-password"
                      type="password"
                      placeholder="••••••••"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="confirm-password">Confirmer le mot de passe</Label>
                    <Input
                      id="confirm-password"
                      type="password"
                      placeholder="••••••••"
                    />
                  </div>
                </div>

                <div className="flex justify-end">
                  <Button 
                    onClick={handleChangePassword}
                    className="bg-aviation-sky hover:bg-aviation-sky-dark"
                  >
                    <Lock className="w-4 h-4 mr-2" />
                    Changer le mot de passe
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="activity" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Activity className="w-5 h-5 mr-2 text-aviation-sky" />
                  Activité Récente
                </CardTitle>
                <CardDescription>
                  Historique de vos dernières actions
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentActivities.map((activity) => (
                    <div key={activity.id} className="flex items-center space-x-4 p-4 border rounded-lg">
                      <div className={`w-3 h-3 rounded-full bg-${getTypeColor(activity.type)}-500`}></div>
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">{activity.action}</p>
                        <p className="text-sm text-gray-500">{activity.details}</p>
                      </div>
                      <div className="text-sm text-gray-400">
                        {activity.timestamp}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
};

export default Profile;
