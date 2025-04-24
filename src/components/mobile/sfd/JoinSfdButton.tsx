
import React from 'react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { ArrowRight } from 'lucide-react';

interface JoinSfdButtonProps {
  sfdId: string;
  sfdName: string;
  isRetry?: boolean;
  variant?: "default" | "secondary" | "outline" | "link";
  className?: string;
}

export const JoinSfdButton = ({ 
  sfdId, 
  sfdName, 
  isRetry = false, 
  variant = "default", 
  className = "bg-[#0D6A51] hover:bg-[#0D6A51]/90" 
}: JoinSfdButtonProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const handleJoinRequest = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    try {
      if (!user) {
        console.log("Utilisateur non authentifié, redirection vers la page d'authentification");
        toast({
          title: 'Connexion requise',
          description: "Vous devez être connecté pour envoyer une demande d'adhésion",
          variant: 'destructive',
        });
        
        // Sauvegarder la redirection pour revenir après connexion
        localStorage.setItem('redirectAfterAuth', `/mobile-flow/sfd-adhesion/${sfdId}`);
        navigate('/auth');
        return;
      }

      // Redirection directe vers la page d'adhésion avec l'ID de la SFD
      console.log(`Navigation vers la page d'adhésion pour SFD: ${sfdId} (${sfdName})`);
      navigate(`/mobile-flow/sfd-adhesion/${sfdId}`);
      
    } catch (err) {
      console.error('Erreur lors du traitement de la demande:', err);
      toast({
        title: 'Erreur',
        description: "Un problème est survenu lors du traitement de votre demande",
        variant: 'destructive',
      });
    }
  };

  return (
    <Button 
      onClick={handleJoinRequest}
      variant={variant === "default" ? undefined : variant}
      className={className}
    >
      {isRetry ? "Réessayer" : "Adhérer"} <ArrowRight className="ml-2 h-4 w-4" />
    </Button>
  );
};
