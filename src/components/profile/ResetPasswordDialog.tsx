import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Mail, Loader2 } from 'lucide-react';
import { usePasswordReset } from '@/hooks/usePasswordReset';
import { useAuth } from '@/contexts/AuthContext';

interface ResetPasswordDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const ResetPasswordDialog: React.FC<ResetPasswordDialogProps> = ({ open, onOpenChange }) => {
  const { user } = useAuth();
  const { requestPasswordReset, isRequestingReset } = usePasswordReset();
  const [email, setEmail] = useState('');

  useEffect(() => {
    if (user?.email) {
      setEmail(user.email); // Pré-remplir avec l'email de l'utilisateur connecté
    }
  }, [user]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    requestPasswordReset(email, {
      onSuccess: () => {
        onOpenChange(false);
      },
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <Mail className="w-5 h-5 mr-2" />
            Réinitialiser le mot de passe
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <p className="text-sm text-gray-600">
            Entrez votre adresse email pour recevoir un lien de réinitialisation de mot de passe.
          </p>
          <div>
            <Label htmlFor="email-reset">Email</Label>
            <Input
              id="email-reset"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="votre.email@aerodoc.tn"
              required
              disabled={isRequestingReset}
            />
          </div>
          <div className="flex justify-end">
            <Button type="submit" disabled={isRequestingReset || !email}>
              {isRequestingReset ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Envoi...
                </>
              ) : (
                'Envoyer le lien de réinitialisation'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};