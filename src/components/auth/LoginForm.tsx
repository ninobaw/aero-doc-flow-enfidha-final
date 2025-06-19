import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Lock, User, Plane } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export const LoginForm = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showTestAccounts, setShowTestAccounts] = useState(false);
  const { login, isLoading } = useAuth();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      toast({
        title: "Erreur",
        description: "Veuillez remplir tous les champs.",
        variant: "destructive"
      });
      return;
    }

    const success = await login(email, password);
    
    if (!success) {
      toast({
        title: "Erreur de connexion",
        description: "Email ou mot de passe incorrect.",
        variant: "destructive"
      });
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
      
      <Card className="w-full max-w-md shadow-xl relative z-10"> {/* z-10 pour que la carte soit au-dessus du calque */}
        <CardHeader className="text-center space-y-4">
          <div className="flex justify-center">
            <div className="bg-aviation-sky p-3 rounded-full relative overflow-hidden">
              <Plane className="w-8 h-8 text-white animate-fly-plane" /> {/* Application de l'animation */}
            </div>
          </div>
          <CardTitle className="text-2xl font-bold text-gray-900">
            AeroDoc Login
          </CardTitle>
          <CardDescription>
            Connectez-vous à votre espace documentaire aéroportuaire
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-6">
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
              {isLoading ? 'Connexion...' : 'Se connecter'}
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