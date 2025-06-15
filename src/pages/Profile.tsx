import React from 'react'; // Ajout de cette ligne
import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { User, Mail, Phone, Building2, Calendar, Save } from 'lucide-react';
import { useProfile } from '@/hooks/useProfile';
import { useAuth } from '@/contexts/AuthContext';
import { useState, useEffect } from 'react';
import { formatDate } from '@/shared/utils';
import { ProfilePhotoUpload } from '@/components/profile/ProfilePhotoUpload';
import { Airport } from '@/shared/types'; // Import Airport type

const Profile = () => {
  const { user } = useAuth();
  const { profile, isLoading, updateProfile, isUpdating } = useProfile();
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    department: '',
  });

  useEffect(() => {
    if (profile) {
      setFormData({
        firstName: profile.firstName || '',
        lastName: profile.lastName || '',
        email: profile.email || '',
        phone: profile.phone || '',
        department: profile.department || '',
      });
    }
  }, [profile]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfile(formData);
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  if (isLoading) {
    return (
      <AppLayout>
        <div className="space-y-6">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-48 mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-64"></div>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="animate-pulse">
              <CardContent className="p-6">
                <div className="flex flex-col items-center space-y-4">
                  <div className="w-24 h-24 bg-gray-200 rounded-full"></div>
                  <div className="h-6 bg-gray-200 rounded w-32"></div>
                  <div className="h-4 bg-gray-200 rounded w-24"></div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Mon Profil</h1>
          <p className="text-gray-500 mt-1">
            Gérer vos informations personnelles
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Carte de profil */}
          <Card>
            <CardContent className="p-6">
              <div className="flex flex-col items-center space-y-4">
                <ProfilePhotoUpload profile={profile} />
                <div className="text-center">
                  <h3 className="text-xl font-semibold">
                    {profile?.firstName} {profile?.lastName}
                  </h3>
                  <Badge variant="secondary" className="mt-1">
                    {profile?.role}
                  </Badge>
                </div>
                <div className="w-full space-y-2 text-sm text-gray-500">
                  <div className="flex items-center space-x-2">
                    <Mail className="w-4 h-4" />
                    <span>{profile?.email}</span>
                  </div>
                  {profile?.phone && (
                    <div className="flex items-center space-x-2">
                      <Phone className="w-4 h-4" />
                      <span>{profile.phone}</span>
                    </div>
                  )}
                  <div className="flex items-center space-x-2">
                    <Building2 className="w-4 h-4" />
                    <span>{profile?.airport}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Calendar className="w-4 h-4" />
                    <span>Inscrit le {formatDate(profile?.createdAt || '')}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Card>

          {/* Formulaire d'édition */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center">
                <User className="w-5 h-5 mr-2" />
                Informations Personnelles
              </CardTitle>
              <CardDescription>
                Modifiez vos informations personnelles
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">Prénom *</Label>
                    <Input
                      id="firstName"
                      value={formData.firstName}
                      onChange={(e) => handleInputChange('firstName', e.target.value)}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="lastName">Nom *</Label>
                    <Input
                      id="lastName"
                      value={formData.lastName}
                      onChange={(e) => handleInputChange('lastName', e.target.value)}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">Email *</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      required
                      disabled
                      className="bg-gray-50"
                    />
                    <p className="text-xs text-gray-500">
                      L'email ne peut pas être modifié
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone">Téléphone</Label>
                    <Input
                      id="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                      placeholder="+216 XX XXX XXX"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="department">Département</Label>
                    <Input
                      id="department"
                      value={formData.department}
                      onChange={(e) => handleInputChange('department', e.target.value)}
                      placeholder="Ex: Sécurité, Maintenance, Opérations..."
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Aéroport</Label>
                    <Input
                      value={profile?.airport || ''}
                      disabled
                      className="bg-gray-50"
                    />
                    <p className="text-xs text-gray-500">
                      L'aéroport d'affectation ne peut pas être modifié
                    </p>
                  </div>
                </div>

                <div className="flex justify-end space-x-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      if (profile) {
                        setFormData({
                          firstName: profile.firstName || '',
                          lastName: profile.lastName || '',
                          email: profile.email || '',
                          phone: profile.phone || '',
                          department: profile.department || '',
                        });
                      }
                    }}
                  >
                    Annuler
                  </Button>
                  <Button
                    type="submit"
                    disabled={isUpdating}
                    className="bg-aviation-sky hover:bg-aviation-sky-dark"
                  >
                    <Save className="w-4 h-4 mr-2" />
                    {isUpdating ? 'Enregistrement...' : 'Enregistrer'}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
};

export default Profile;