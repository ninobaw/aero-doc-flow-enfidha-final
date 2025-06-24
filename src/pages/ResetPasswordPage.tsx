import React, { useState, useEffect } => 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Lock, Loader2 } from 'lucide-react';
import { usePasswordReset } from '@/hooks/usePasswordReset';
import { useToast } from '@/hooks/use-toast';

const ResetPasswordPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { resetPassword, isResettingPassword } = usePasswordReset();
  const { toast } = useToast();

  const [token, setToken] = useState<string | null>(null);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  useEffect(() => {
    const tokenFromUrl = searchParams.get('token');
    if (tokenFromUrl) {
      setToken(tokenFromUrl);
    } else {
      toast({
        title: 'Erreur',
        description: 'Jeton de réinitialisation manquant dans l\'URL.',
        variant: 'destructive',
      });
      navigate('/login'); // Rediriger vers la page de connexion ou une page d'erreur
    }
  }, [searchParams, navigate, toast]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!token) {
      toast({
        title: 'Erreur',
        description: 'Jeton de réinitialisation invalide.',
        variant: 'destructive',
      });
      return;
    }

    if (newPassword.length < 6) {
      toast({
        title: 'Erreur',
        description: 'Le nouveau mot de passe doit contenir au moins 6 caractères.',
        variant: 'destructive',
      });
      return;
    }

    if (newPassword !== confirmPassword) {
      toast({
        title: 'Erreur',
        description: 'Les mots de passe ne correspondent pas.',
        variant: 'destructive',
      });
      return;
    }

    resetPassword({ token, newPassword }, {
      onSuccess: () => {
        toast({
          title: 'Mot de passe réinitialisé',
          description: 'Votre mot de passe a été réinitialisé avec succès. Vous pouvez maintenant vous connecter.',
          variant: 'success',
        });
        navigate('/login'); // Rediriger vers la page de connexion
      },
      onError: (error) => {
        // Le toast d'erreur est déjà géré par le hook usePasswordReset
        console.error('Erreur lors de la réinitialisation du mot de passe:', error);
      },
    });
  };

  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <Card className="w-full max-w-md text-center p-8">
          <Loader2 className="h-16 w-16 animate-spin text-aviation-sky mx-auto mb-4" />
          <p className="text-gray-600">Vérification du jeton...</p>
        </Card>
      </div>
    );
  );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-wallpaper bg-cover bg-center p-4 relative">
      <div className="absolute inset-0 bg-black opacity-30"></div>
      <div className="absolute inset-0 bg-gradient-to-r from-aviation-sky-dark via-aviation-sky to-aviation-sky-dark opacity-20 animate-gradient-shift"
           style={{ backgroundSize: '200% 200%' }}></div>

      <Card className="w-full max-w-md shadow-xl relative z-10 animate-bounce-in">
        <CardHeader className="text-center space-y-4">
          <div className="flex justify-center">
            <div className="bg-aviation-sky p-3 rounded-full relative overflow-hidden">
              <Lock className="w-8 h-8 text-white" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold text-gray-900">
            Réinitialiser votre mot de passe
          </CardTitle>
          <CardDescription>
            Entrez votre nouveau mot de passe.
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="new-password">Nouveau mot de passe</Label>
              <Input
                id="new-password"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Minimum 6 caractères"
                required
                disabled={isResettingPassword}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirm-password">Confirmer le mot de passe</Label>
              <Input
                id="confirm-password"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirmer le nouveau mot de passe"
                required
                disabled={isResettingPassword}
              />
            </div>

            <Button 
              type="submit" 
              className="w-full bg-aviation-sky hover:bg-aviation-sky-dark"
              disabled={isResettingPassword || !newPassword || !confirmPassword}
            >
              {isResettingPassword ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Réinitialisation...
                </>
              ) : (
                'Réinitialiser le mot de passe'
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default ResetPasswordPage;