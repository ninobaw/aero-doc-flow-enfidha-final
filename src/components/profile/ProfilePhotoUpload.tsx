
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Camera, Upload, X } from 'lucide-react';
import { useProfile } from '@/hooks/useProfile';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface ProfilePhotoUploadProps {
  profile: any;
}

export const ProfilePhotoUpload = ({ profile }: ProfilePhotoUploadProps) => {
  const [uploading, setUploading] = useState(false);
  const { updateProfile } = useProfile();
  const { toast } = useToast();

  const uploadPhoto = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setUploading(true);

      if (!event.target.files || event.target.files.length === 0) {
        throw new Error('Vous devez sélectionner une image à uploader.');
      }

      const file = event.target.files[0];
      
      // Vérifier le type de fichier
      if (!file.type.startsWith('image/')) {
        throw new Error('Veuillez sélectionner un fichier image valide.');
      }

      // Vérifier la taille du fichier (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        throw new Error('La taille du fichier ne doit pas dépasser 5MB.');
      }

      const fileExt = file.name.split('.').pop();
      const fileName = `${profile.id}-${Date.now()}.${fileExt}`;

      // Supprimer l'ancienne photo si elle existe
      if (profile?.profile_photo) {
        const oldFileName = profile.profile_photo.split('/').pop();
        if (oldFileName) {
          await supabase.storage
            .from('profiles')
            .remove([oldFileName]);
        }
      }

      // Upload vers Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('profiles')
        .upload(fileName, file, { 
          cacheControl: '3600',
          upsert: false 
        });

      if (uploadError) {
        throw uploadError;
      }

      // Obtenir l'URL publique
      const { data } = supabase.storage
        .from('profiles')
        .getPublicUrl(fileName);

      // Mettre à jour le profil avec la nouvelle photo
      updateProfile({ profile_photo: data.publicUrl });

      toast({
        title: 'Photo mise à jour',
        description: 'Votre photo de profil a été mise à jour avec succès.',
      });

    } catch (error: any) {
      console.error('Erreur upload photo:', error);
      toast({
        title: 'Erreur',
        description: error.message || 'Erreur lors de l\'upload de la photo.',
        variant: 'destructive',
      });
    } finally {
      setUploading(false);
      // Réinitialiser le champ file input
      event.target.value = '';
    }
  };

  const removePhoto = async () => {
    try {
      setUploading(true);

      if (profile?.profile_photo) {
        const fileName = profile.profile_photo.split('/').pop();
        if (fileName) {
          await supabase.storage
            .from('profiles')
            .remove([fileName]);
        }
      }

      // Mettre à jour le profil pour supprimer la photo
      updateProfile({ profile_photo: null });

      toast({
        title: 'Photo supprimée',
        description: 'Votre photo de profil a été supprimée.',
      });

    } catch (error: any) {
      console.error('Erreur suppression photo:', error);
      toast({
        title: 'Erreur',
        description: 'Erreur lors de la suppression de la photo.',
        variant: 'destructive',
      });
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="flex flex-col items-center space-y-4">
      <div className="relative">
        <Avatar className="w-24 h-24">
          <AvatarImage src={profile?.profile_photo} alt="Photo de profil" />
          <AvatarFallback className="bg-aviation-sky text-white text-xl">
            {profile?.first_name?.[0]}{profile?.last_name?.[0]}
          </AvatarFallback>
        </Avatar>
        
        <div className="absolute -bottom-2 -right-2 flex space-x-1">
          <Input
            type="file"
            accept="image/*"
            onChange={uploadPhoto}
            disabled={uploading}
            className="hidden"
            id="photo-upload"
          />
          <Button
            size="sm"
            variant="outline"
            className="rounded-full w-8 h-8 p-0"
            disabled={uploading}
            asChild
          >
            <label htmlFor="photo-upload" className="cursor-pointer">
              {uploading ? (
                <Upload className="w-4 h-4 animate-spin" />
              ) : (
                <Camera className="w-4 h-4" />
              )}
            </label>
          </Button>
          
          {profile?.profile_photo && (
            <Button
              size="sm"
              variant="outline"
              className="rounded-full w-8 h-8 p-0 text-red-600 hover:text-red-700"
              disabled={uploading}
              onClick={removePhoto}
            >
              <X className="w-4 h-4" />
            </Button>
          )}
        </div>
      </div>
      
      <div className="text-center">
        <p className="text-xs text-gray-500">
          Cliquez sur l'icône pour changer votre photo de profil
        </p>
        <p className="text-xs text-gray-400 mt-1">
          Formats acceptés: JPG, PNG, GIF (max 5MB)
        </p>
      </div>
    </div>
  );
};
