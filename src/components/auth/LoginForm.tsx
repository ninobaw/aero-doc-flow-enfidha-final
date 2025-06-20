import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Lock, User, Plane, Loader2 } from 'lucide-react'; // Import Loader2
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

export const LoginForm = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showTestAccounts, setShowTestAccounts] = useState(false);
  const [isShaking, setIsShaking] = useState(false); // Nouveau state pour l'animation
  const { login, isLoading } = useAuth();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      toast({
        title: "Erreur",
        description: "Veuillez remplir tous les champs.",
        variant: "destructive" // Rouge pour l'erreur de validation
      });
      setIsShaking(true); // Déclenche l'animation
      setTimeout(() => setIsShaking(false), 500); // Réinitialise après 500ms
      return;
    }

    const success = await login(email, password);
    
    if (!success) {
      // Le toast d'échec de connexion est déjà géré dans AuthContext,
      // mais si vous voulez un toast spécifique ici, assurez-vous qu'il est rouge.
      // Pour l'instant, je laisse le toast de AuthContext gérer le message.
      setIsShaking(true); // Déclenche l'animation
      setTimeout(() => setIsShaking(false), 500); // Réinitialise après 500ms
    }
  };

  const handleTestLogin = (testEmail: string, testPassword: string) => {
    setEmail(testEmail);
    setPassword(testPassword);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-wallpaper bg-cover bg-center p-4 relative">
      {/* Calque pour améliorer la lisibilité du texte sur l'image de fond */}
      <div className="absolute inset-0 bg-black opacity-30"></div>
      
      {/* Nouvelle animation de fond subtile */}
      <div className="absolute inset-0 bg-gradient-to-r from-aviation-sky-dark via-aviation-sky to-aviation-sky-dark opacity-20 animate-gradient-shift"
           style={{ backgroundSize: '200% 200%' }}></div>

      <Card className={cn(
        "w-full max-w-md shadow-xl relative z-10 animate-bounce-in"
        // Removed { "animate-shake": isShaking } from here
      )}>
        <CardHeader className="text-center space-y-4">
          <div className="flex justify-center">
            <div className="bg-aviation-sky p-3 rounded-full relative overflow-hidden">
              <Plane className="w-8 h-8 text-white animate-fly-plane" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold text-gray-900">
            AeroDoc Login
          </CardTitle>
          <CardDescription>
            Connectez-vous à votre espace documentaire aéroportuaire
          </CardDescription>
        </CardHeader>
        
        <CardContent className={cn("space-y-6", { "animate-shake": isShaking })}> {/* Applied animate-shake here */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="votre.email@aerodoc.tn"
                  className="pl-10"
                  disabled={isLoading}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Mot de passe</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="pl-10"
                  disabled={isLoading}
                />
              </div>
            </div>

            <Button 
              type="submit" 
              className="w-full bg-aviation-sky hover:bg-aviation-sky-dark"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Connexion...
                </>
              ) : (
                'Se connecter'
              )}
            </Button>
          </form>

          <Separator />

          <div className="space-y-3">
            <Button
              variant="outline"
              onClick={() => setShowTestAccounts(!showTestAccounts)}
              className="w-full"
            >
              {showTestAccounts ? 'Masquer' : 'Afficher'} les comptes de test
            </Button>

            {showTestAccounts && (
              <div className="space-y-2 p-4 bg-gray-50 rounded-lg">
                <p className="text-sm font-medium text-gray-700">Comptes de test :</p>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleTestLogin('superadmin@aerodoc.tn', 'admin123')}
                  className="w-full justify-start text-xs"
                >
                  Super Admin - superadmin@aerodoc.tn / admin123
                </Button>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleTestLogin('user@aerodoc.tn', 'user123')}
                  className="w-full justify-start text-xs"
                >
                  Utilisateur - user@aerodoc.tn / user123
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};