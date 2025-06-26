import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Lock, User, Plane, Loader2, Eye, EyeOff } from 'lucide-react'; // Import Eye and EyeOff
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { ForgotPasswordDialog } from './ForgotPasswordDialog'; // Import the new dialog

export const LoginForm = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isShaking, setIsShaking] = useState(false); // Nouveau state pour l'animation
  const [isForgotPasswordDialogOpen, setIsForgotPasswordDialogOpen] = useState(false); // State for forgot password dialog
  const [showPassword, setShowPassword] = useState(false); // New state for password visibility
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
      setIsShaking(true); // Déclenche l'animation
      setTimeout(() => setIsShaking(false), 700); // Réinitialise après 700ms (correspond à la durée de l'animation)
      return;
    }

    const success = await login(email, password);
    
    if (!success) {
      // Le toast d'erreur est déjà géré par le hook useAuth
      setIsShaking(true); // Déclenche l'animation
      setTimeout(() => setIsShaking(false), 700); // Réinitialise après 700ms
    }
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
                  type={showPassword ? "text" : "password"} // Dynamic type
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="pl-10 pr-10" // Add padding for the eye icon
                  disabled={isLoading}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8 p-0"
                  onClick={() => setShowPassword((prev) => !prev)}
                  disabled={isLoading}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4 text-gray-500" />
                  ) : (
                    <Eye className="h-4 w-4 text-gray-500" />
                  )}
                </Button>
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

          <div className="text-center text-sm">
            <Button 
              variant="link" 
              className="text-aviation-sky hover:text-aviation-sky-dark"
              onClick={() => setIsForgotPasswordDialogOpen(true)}
            >
              Mot de passe oublié ?
            </Button>
          </div>
        </CardContent>
      </Card>

      <ForgotPasswordDialog 
        open={isForgotPasswordDialogOpen} 
        onOpenChange={setIsForgotPasswordDialogOpen} 
      />
    </div>
  );
};