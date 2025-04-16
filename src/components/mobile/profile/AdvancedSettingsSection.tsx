
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { Sun, Moon, Database, Trash2, AlertTriangle, LogOut } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface AdvancedSettingsSectionProps {
  onLogout?: () => Promise<void>;
}

const AdvancedSettingsSection = ({ onLogout }: AdvancedSettingsSectionProps) => {
  const { toast } = useToast();
  const { signOut } = useAuth();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  
  const handleThemeChange = (value: string) => {
    toast({
      title: "Thème modifié",
      description: `Le thème a été changé pour ${value === 'light' ? 'Clair' : value === 'dark' ? 'Sombre' : 'Auto'}`,
    });
  };
  
  const handleToggleOfflineMode = (enabled: boolean) => {
    toast({
      title: enabled ? "Mode hors-ligne activé" : "Mode hors-ligne désactivé",
      description: enabled 
        ? "Les données seront mises en cache pour un accès hors-ligne" 
        : "Les données ne seront pas mises en cache",
    });
  };
  
  const handleLogout = async () => {
    if (isLoggingOut) return;
    
    try {
      setIsLoggingOut(true);
      
      toast({
        title: "Déconnexion en cours",
        description: "Veuillez patienter..."
      });
      
      // Use the provided onLogout function or fall back to signOut
      if (onLogout) {
        await onLogout();
      } else {
        const { error } = await signOut();
        if (error) throw error;
      }
      
      toast({
        title: "Déconnexion réussie",
        description: "Vous avez été déconnecté avec succès"
      });
      
      // Force reload to clear state and go to splash screen
      window.location.href = '/';
    } catch (error: any) {
      console.error('Erreur lors de la déconnexion:', error);
      setIsLoggingOut(false);
      toast({
        title: "Erreur de déconnexion",
        description: error.message || "Une erreur s'est produite lors de la déconnexion",
        variant: "destructive"
      });
    }
  };
  
  const handleDeleteAccount = () => {
    // In a real app, this would delete the user's account after confirmation
    toast({
      title: "Compte supprimé",
      description: "Votre compte a été supprimé avec succès",
      variant: "destructive",
    });
    handleLogout();
  };

  return (
    <Card className="mb-4">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">Paramètres Avancés</CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-4">
          <div>
            <div className="flex items-center justify-between mb-2">
              <p className="font-medium flex items-center">
                <Sun className="h-4 w-4 mr-2" />
                Thème de l'application
              </p>
            </div>
            <ToggleGroup type="single" defaultValue="light" onValueChange={handleThemeChange} className="justify-start">
              <ToggleGroupItem value="light" className="text-sm">Clair</ToggleGroupItem>
              <ToggleGroupItem value="dark" className="text-sm">Sombre</ToggleGroupItem>
              <ToggleGroupItem value="auto" className="text-sm">Auto</ToggleGroupItem>
            </ToggleGroup>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="h-8 w-8 bg-purple-100 rounded-full flex items-center justify-center text-purple-600">
                <Database className="h-4 w-4" />
              </div>
              <div>
                <p className="font-medium">Mode hors-ligne</p>
                <p className="text-xs text-gray-500">
                  Conserver les données en local
                </p>
              </div>
            </div>
            <Switch onCheckedChange={handleToggleOfflineMode} />
          </div>
          
          <div className="pt-4 border-t border-gray-200 mt-4">
            <Button 
              variant="outline" 
              className="w-full text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
              onClick={handleLogout}
              disabled={isLoggingOut}
            >
              {isLoggingOut ? (
                <div className="h-4 w-4 rounded-full border-2 border-t-transparent border-red-500 animate-spin mr-2" />
              ) : (
                <LogOut className="h-4 w-4 mr-2" />
              )}
              Se déconnecter
            </Button>
            
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button 
                  variant="outline" 
                  className="w-full mt-2 text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Supprimer mon compte
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle className="flex items-center text-red-600">
                    <AlertTriangle className="h-5 w-5 mr-2" />
                    Supprimer définitivement votre compte ?
                  </AlertDialogTitle>
                  <AlertDialogDescription>
                    Cette action est irréversible. Cette action supprimera définitivement votre compte et toutes les données associées de nos serveurs.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Annuler</AlertDialogCancel>
                  <AlertDialogAction onClick={handleDeleteAccount} className="bg-red-600 hover:bg-red-700">
                    Supprimer définitivement
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default AdvancedSettingsSection;
