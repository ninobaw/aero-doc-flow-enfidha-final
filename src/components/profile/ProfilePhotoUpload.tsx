import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Camera, Upload, X } from 'lucide-react';
import { useProfile } from '@/hooks/useProfile';
import { useToast } from '@/hooks/use-toast';
import { useFileUpload } from '@/hooks/useFileUpload'; // Import the new hook

interface ProfilePhotoUploadProps {
  profile: any;
}

export const ProfilePhotoUpload = ({ profile }: ProfilePhotoUploadProps) => {
  const { updateProfile } = useProfile();
  const { toast } = useToast();
  const { uploadFile, deleteFile, uploading, progress } = useFileUpload(); // Use the new hook

  const uploadPhoto = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      if (!event.target.files || event.target.files.length === 0) {
        throw new Error('Vous devez sélectionner une image à uploader.');
      }

      const file = event.target.files[0];
      
      // Validate file type and size using the hook's internal validation
      const uploaded = await uploadFile(file, {
        bucket: 'profiles', // Logical bucket name
        folder: 'avatars',
        allowedTypes: ['image/jpeg', 'image/png', 'image/gif'],
        maxSize: 5 // 5MB
      });

      if (uploaded) {
        // Simulate deletion of old photo if it exists
        if (profile?.profile_photo) {
          // In a real scenario, you'd extract the path from the old URL
          // For simulation, we'll just call deleteFile with a dummy path
          await deleteFile('profiles', 'old-avatar-path'); 
        }
        
        // Update the profile with the new photo URL
        updateProfile({ profile_photo: uploaded.url });

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
      // Réinitialiser le champ file input
      event.target.value = '';
    }
  };

  const removePhoto = async () => {
    try {
      if (profile?.profile_photo) {
        // Simulate deletion
        await deleteFile('profiles', 'current-avatar-path'); // Use a dummy path for simulation
      }

      // Update the profile to remove the photo
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