
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  LogOut, 
  Trash2, 
  Shield, 
  HelpCircle 
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface AdvancedSettingsSectionProps {
  onLogout?: () => Promise<void>;
}

const AdvancedSettingsSection: React.FC<AdvancedSettingsSectionProps> = ({ 
  onLogout 
}) => {
  const { toast } = useToast();
  
  const handleLogout = async () => {
    if (onLogout) {
      try {
        await onLogout();
        toast({
          title: "Déconnexion réussie",
          description: "Vous avez été déconnecté avec succès",
        });
      } catch (error) {
        toast({
          title: "Erreur",
          description: "Une erreur est survenue lors de la déconnexion",
          variant: "destructive",
        });
      }
    } else {
      toast({
        title: "Action indisponible",
        description: "La fonction de déconnexion n'est pas disponible actuellement",
        variant: "destructive",
      });
    }
  };
  
  return (
    <Card className="mt-6 mb-4">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">Paramètres avancés</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button 
          variant="destructive" 
          className="w-full flex justify-between items-center"
          onClick={handleLogout}
        >
          <span>Se déconnecter</span>
          <LogOut className="h-4 w-4" />
        </Button>
        
        <Button 
          variant="outline" 
          className="w-full flex justify-between items-center border-amber-500 text-amber-700"
          onClick={() => {
            toast({
              title: "Action sécurisée",
              description: "Cette action nécessite une vérification supplémentaire",
            });
          }}
        >
          <span>Paramètres de confidentialité</span>
          <Shield className="h-4 w-4" />
        </Button>
        
        <Button 
          variant="outline" 
          className="w-full flex justify-between items-center border-gray-300 text-gray-600"
          onClick={() => {
            toast({
              title: "Support & Aide",
              description: "Contactez notre service client au +223 7X XX XX XX",
            });
          }}
        >
          <span>Obtenir de l'aide</span>
          <HelpCircle className="h-4 w-4" />
        </Button>
      </CardContent>
    </Card>
  );
};

export default AdvancedSettingsSection;
