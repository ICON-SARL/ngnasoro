
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Sfd } from '@/types/sfd-types';
import { useAuth } from '@/hooks/useAuth';
import { Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useSfdAdhesion } from '@/hooks/sfd/useSfdAdhesion';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";

interface AvailableSfdCardProps {
  sfd: Sfd;
}

export const AvailableSfdCard: React.FC<AvailableSfdCardProps> = ({ sfd }) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false);
  const { requestSfdAdhesion, isSubmitting } = useSfdAdhesion();
  
  const handleRequestAccess = async () => {
    if (!user) {
      navigate('/auth/login?redirect=/sfd-connection');
      return;
    }
    
    setIsConfirmDialogOpen(true);
  };
  
  const handleConfirmRequest = async () => {
    try {
      console.log('Confirming adhesion request for SFD:', sfd.id);
      
      const userInfo = {
        full_name: user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Unknown User',
        email: user?.email || '',
        phone: user?.user_metadata?.phone || '',
      };
      
      console.log('Submitting adhesion with user info:', userInfo);
      
      const success = await requestSfdAdhesion(sfd.id, userInfo);
      
      if (success) {
        setIsConfirmDialogOpen(false);
        
        toast({
          title: 'Demande envoyée',
          description: 'Votre demande d\'adhésion a été envoyée avec succès. Un administrateur la traitera prochainement.',
        });
        
        navigate('/mobile-flow/account?adhesion_requested=true');
      }
    } catch (error) {
      console.error('Error confirming request:', error);
      toast({
        title: 'Erreur',
        description: 'Une erreur est survenue lors de l\'envoi de la demande',
        variant: 'destructive'
      });
    }
  };
  
  return (
    <>
      <div className="bg-white p-4 rounded-lg border border-gray-200 flex items-center">
        <div className="mr-4 h-12 w-12 flex-shrink-0 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden">
          {sfd.logo_url ? (
            <img 
              src={sfd.logo_url} 
              alt={`Logo ${sfd.name}`}
              className="h-full w-full object-cover"
            />
          ) : (
            <span className="font-bold text-gray-500">{sfd.code?.substring(0, 2) || sfd.name.substring(0, 2)}</span>
          )}
        </div>
        
        <div className="flex-1">
          <h3 className="font-medium">{sfd.name}</h3>
          <p className="text-sm text-gray-500">
            {sfd.region && `${sfd.region} • `}{sfd.code}
          </p>
        </div>
        
        <Button 
          onClick={handleRequestAccess}
          className="bg-[#0D6A51] hover:bg-[#0D6A51]/90"
        >
          Adhérer
        </Button>
      </div>
      
      <Dialog open={isConfirmDialogOpen} onOpenChange={setIsConfirmDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Demande d'adhésion à {sfd.name}</DialogTitle>
            <DialogDescription>
              Vous êtes sur le point de demander l'adhésion à {sfd.name}. Après approbation par l'administrateur de la SFD, vous pourrez accéder à vos comptes.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsConfirmDialogOpen(false)} disabled={isSubmitting}>
              Annuler
            </Button>
            <Button 
              onClick={handleConfirmRequest} 
              disabled={isSubmitting}
              className="bg-[#0D6A51] hover:bg-[#0D6A51]/90"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Envoi en cours...
                </>
              ) : (
                'Confirmer la demande'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};
