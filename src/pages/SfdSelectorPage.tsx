
import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArrowLeft } from 'lucide-react';
import { useForm } from 'react-hook-form';
import SfdList from '@/components/mobile/sfd/SfdList';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { useAvailableSfds } from '@/hooks/sfd/useAvailableSfds';

const SfdSelectorPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const { toast } = useToast();
  const [isRequestDialogOpen, setIsRequestDialogOpen] = useState(false);
  const [selectedSfdId, setSelectedSfdId] = useState<string | null>(location.state?.selectedSfdId || null);
  const [selectedSfdName, setSelectedSfdName] = useState<string>('');
  
  const { 
    availableSfds, 
    pendingRequests, 
    requestSfdAccess,
    isLoading 
  } = useAvailableSfds(user?.id);
  
  // Form pour la demande d'association
  const { register, handleSubmit, formState: { errors }, reset } = useForm({
    defaultValues: {
      phoneNumber: ''
    }
  });
  
  const handleSfdSelect = (sfdId: string, sfdName: string) => {
    setSelectedSfdId(sfdId);
    setSelectedSfdName(sfdName);
    setIsRequestDialogOpen(true);
  };
  
  const onSubmitRequest = async (data: { phoneNumber: string }) => {
    if (!selectedSfdId || !user) return;
    
    try {
      const success = await requestSfdAccess(selectedSfdId, data.phoneNumber);
      
      if (success) {
        toast({
          title: "Demande envoyée",
          description: `Votre demande d'accès à ${selectedSfdName} a été envoyée avec succès`,
        });
        setIsRequestDialogOpen(false);
        reset();
      }
    } catch (error) {
      console.error('Erreur lors de la demande d\'accès:', error);
      toast({
        title: "Erreur",
        description: "Impossible d'envoyer votre demande. Veuillez réessayer.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="container max-w-md mx-auto py-4 px-4">
      <Button 
        variant="ghost" 
        className="mb-4" 
        onClick={() => navigate(-1)}
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Retour
      </Button>
      
      <Card>
        <CardHeader>
          <CardTitle className="text-xl text-center text-[#0D6A51]">
            SFDs Disponibles
          </CardTitle>
        </CardHeader>
        
        <CardContent className="pb-6">
          {!user ? (
            <div className="text-center py-4">
              <p className="text-muted-foreground mb-4">Vous devez être connecté pour voir les SFDs disponibles</p>
              <Button onClick={() => navigate('/login')}>Se connecter</Button>
            </div>
          ) : (
            <>
              {pendingRequests.length > 0 && (
                <div className="bg-amber-50 border border-amber-200 rounded-md p-3 mb-4">
                  <h3 className="font-medium text-amber-800 mb-1">Demandes en cours</h3>
                  <ul className="list-disc list-inside text-sm text-amber-700">
                    {pendingRequests.map(request => {
                      // Trouver le nom de la SFD correspondante
                      const sfdName = availableSfds.find(sfd => sfd.id === request.sfd_id)?.name || request.sfd_id;
                      
                      return (
                        <li key={request.id}>
                          Demande pour {sfdName} en attente
                        </li>
                      );
                    })}
                  </ul>
                </div>
              )}
              
              <CustomSfdList 
                sfds={availableSfds} 
                isLoading={isLoading}
                onSelectSfd={handleSfdSelect}
              />
            </>
          )}
        </CardContent>
      </Card>
      
      {/* Dialog pour demande d'association à une SFD */}
      <Dialog open={isRequestDialogOpen} onOpenChange={setIsRequestDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Demande d'accès SFD</DialogTitle>
            <DialogDescription>
              Envoyez une demande pour rejoindre {selectedSfdName}. Votre demande sera examinée par un administrateur.
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={handleSubmit(onSubmitRequest)}>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="phoneNumber">
                  Numéro de téléphone <span className="text-xs text-muted-foreground">(optionnel)</span>
                </Label>
                <Input 
                  id="phoneNumber"
                  placeholder="Entrez votre numéro de téléphone"
                  {...register('phoneNumber')}
                />
                {errors.phoneNumber && (
                  <p className="text-sm text-red-500">{errors.phoneNumber.message}</p>
                )}
              </div>
            </div>
            
            <DialogFooter className="mt-4">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setIsRequestDialogOpen(false)}
              >
                Annuler
              </Button>
              <Button 
                type="submit" 
                className="bg-[#0D6A51] hover:bg-[#0D6A51]/90"
              >
                Envoyer la demande
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

// Composant personnalisé pour la liste des SFDs
interface CustomSfdListProps {
  sfds: { id: string; name: string; region?: string; code?: string; logo_url?: string | null; }[];
  isLoading: boolean;
  onSelectSfd: (sfdId: string, sfdName: string) => void;
}

const CustomSfdList: React.FC<CustomSfdListProps> = ({ sfds, isLoading, onSelectSfd }) => {
  if (isLoading) {
    return <div className="text-center py-6">Chargement des SFDs...</div>;
  }
  
  if (sfds.length === 0) {
    return (
      <div className="text-center py-6">
        <p className="text-muted-foreground mb-2">Aucune SFD disponible pour le moment</p>
        <p className="text-sm text-muted-foreground">Vous êtes peut-être déjà associé à toutes les SFDs disponibles</p>
      </div>
    );
  }
  
  return (
    <div className="space-y-3">
      {sfds.map((sfd) => (
        <div
          key={sfd.id}
          onClick={() => onSelectSfd(sfd.id, sfd.name)}
          className="flex items-center p-4 bg-white rounded-lg shadow-sm border border-gray-100 cursor-pointer hover:bg-gray-50 transition-colors"
        >
          <div className="h-12 w-12 flex-shrink-0 bg-gray-100 rounded-md flex items-center justify-center mr-4 overflow-hidden">
            {sfd.logo_url ? (
              <img
                src={sfd.logo_url}
                alt={sfd.name}
                className="h-full w-full object-cover"
              />
            ) : (
              <span className="text-xl font-bold text-gray-400">
                {sfd.code || sfd.name.charAt(0)}
              </span>
            )}
          </div>
          <div className="flex-1">
            <h3 className="font-medium text-gray-800">{sfd.name}</h3>
            {sfd.region && (
              <p className="text-sm text-gray-500">{sfd.region}</p>
            )}
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            className="ml-2 border-[#0D6A51] text-[#0D6A51]"
          >
            Demander
          </Button>
        </div>
      ))}
    </div>
  );
};

export default SfdSelectorPage;
