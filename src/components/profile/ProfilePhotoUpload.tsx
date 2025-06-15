import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Camera, Upload, X } from 'lucide-react';
import { useProfile } from '@/hooks/useProfile';
import { useToast } from '@/hooks/use-toast';
import { useFileUpload } from '@/hooks/useFileUpload';
import { getAbsoluteFilePath } from '@/shared/utils'; // Import getAbsoluteFilePath

interface ProfilePhotoUploadProps {
  profile: any;
}

export const ProfilePhotoUpload = ({ profile }: ProfilePhotoUploadProps) => {
  const { updateProfile } = useProfile();
  const { toast } = useToast();
  const { uploadFile, deleteFile, uploading, progress } = useFileUpload();

  const uploadPhoto = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      if (!event.target.files || event.target.files.length === 0) {
        throw new Error('Vous devez sélectionner une image à uploader.');
      }

      const file = event.target.files[0];
      
      const uploaded = await uploadFile(file, {
        documentType: 'profiles', // Logical bucket name
        allowedTypes: ['image/jpeg', 'image/png', 'image/gif'],
        maxSize: 5 // 5MB
      });

      if (uploaded) {
        // If a new photo was successfully uploaded, delete the old one if it exists
        if (profile?.profilePhoto) {
          // The profilePhoto stored is now the relative path, so we can directly use it for deletion
          const oldFileDeleted = await deleteFile(profile.profilePhoto); 
          if (!oldFileDeleted) {
            console.warn(`Failed to delete old profile photo: ${profile.profilePhoto}. Proceeding with profile update.`);
          }
        }
        
        // Update the profile with the new photo's relative path
        updateProfile({ profilePhoto: uploaded.path }); // Store the relative path

        toast({
          title: 'Photo mise à jour',
          description: 'Votre photo de profil a été mise à jour avec succès.',
        });
      }

    } catch (error: any) {
      console.error('Erreur upload photo:', error);
      toast({
        title: 'Erreur',
        description: error.message || 'Erreur lors de l\'upload de la photo.',
        variant: 'destructive',
      });
    } finally {
      event.target.value = '';
    }
  };

  const removePhoto = async () => {
    try {
      if (profile?.profilePhoto) {
        // Delete the physical file using its relative path
        const fileDeleted = await deleteFile(profile.profilePhoto);
        if (!fileDeleted) {
          console.warn(`Failed to delete profile photo file: ${profile.profilePhoto}. Proceeding with profile update.`);
        }
      }

      // Update the profile to remove the photo reference
      updateProfile({ profilePhoto: null });

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
    }
  };

  // Construct the absolute URL for display
  const avatarSrc = profile?.profilePhoto ? getAbsoluteFilePath(profile.profilePhoto) : undefined;

  return (
    <div className="flex flex-col items-center space-y-4">
      <div className="relative">
        <Avatar className="w-24 h-24">
          <AvatarImage src={avatarSrc} alt="Photo de profil" />
          <AvatarFallback className="bg-aviation-sky text-white text-xl">
            {profile?.firstName?.[0]}{profile?.lastName?.[0]}
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
          
          {profile?.profilePhoto && (
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