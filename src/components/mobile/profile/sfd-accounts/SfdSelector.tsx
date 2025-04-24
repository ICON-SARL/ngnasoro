
import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, Check, AlertCircle } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { useSfdAdhesion } from '@/hooks/sfd/useSfdAdhesion';
import { fetchActiveSfds, fetchSfdsFromEdgeFunction, normalizeSfdData } from '@/utils/sfdUtils';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Badge } from '@/components/ui/badge';

interface SfdSelectorProps {
  userId: string;
  onRequestSent?: () => void;
}

const SfdSelector: React.FC<SfdSelectorProps> = ({ userId, onRequestSent }) => {
  const { availableSfds, userRequests, isLoading: isLoadingHook, isSubmitting, requestSfdAdhesion } = useSfdAdhesion();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSfdId, setSelectedSfdId] = useState<string | null>(null);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [localSfds, setLocalSfds] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  
  // Essayer de récupérer les SFDs directement si aucune n'est disponible via le hook
  useEffect(() => {
    const loadBackupSfds = async () => {
      if (availableSfds.length === 0 && !isLoadingHook) {
        setIsLoading(true);
        try {
          console.log('No SFDs from hook, trying direct database fetch');
          
          // Essayer d'abord la base de données
          let sfds = await fetchActiveSfds();
          
          // Si rien en DB, essayer l'edge function
          if (!sfds || sfds.length === 0) {
            console.log('No SFDs from database, trying edge function');
            sfds = await fetchSfdsFromEdgeFunction(userId);
          }
          
          if (sfds && sfds.length > 0) {
            console.log(`Found ${sfds.length} SFDs via alternative methods`);
            setLocalSfds(normalizeSfdData(sfds));
          } else {
            // Données de test en dernier recours
            console.log('Using test SFDs as last resort');
            setLocalSfds([
              {
                id: 'test-sfd1',
                name: 'RMCR (Test)',
                code: 'RMCR',
                region: 'Centre',
                status: 'active',
                logo_url: null
              },
              {
                id: 'test-sfd2',
                name: 'NYESIGISO (Test)',
                code: 'NYESIGISO',
                region: 'Sud',
                status: 'active',
                logo_url: null
              }
            ]);
          }
        } catch (error) {
          console.error('Error fetching backup SFDs:', error);
        } finally {
          setIsLoading(false);
        }
      } else {
        setIsLoading(isLoadingHook);
      }
    };
    
    loadBackupSfds();
  }, [availableSfds, isLoadingHook, userId]);
  
  // Utiliser les SFDs du hook ou les SFDs locales si disponibles
  const effectiveSfds = availableSfds.length > 0 ? availableSfds : localSfds;
  
  const filteredSfds = effectiveSfds.filter(sfd => 
    sfd.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    sfd.code?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (sfd.region && sfd.region.toLowerCase().includes(searchTerm.toLowerCase()))
  );
  
  const handleRequestAdhesion = async (sfdId: string) => {
    setSelectedSfdId(sfdId);
    setIsConfirmOpen(true);
  };
  
  const confirmRequest = async () => {
    if (!selectedSfdId) return;
    
    // Fix: Add the userId as the second argument to requestSfdAdhesion
    const success = await requestSfdAdhesion(selectedSfdId, userId);
    
    if (success) {
      setIsConfirmOpen(false);
      onRequestSent?.();
    }
  };
  
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
        <p className="text-muted-foreground">Chargement des SFDs disponibles...</p>
      </div>
    );
  }
  
  if (effectiveSfds.length === 0 && userRequests.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-8 bg-muted/20 rounded-lg">
        <AlertCircle className="h-8 w-8 text-muted-foreground mb-4" />
        <h3 className="font-medium text-lg mb-2">Aucune SFD disponible</h3>
        <p className="text-muted-foreground text-center mb-6">
          Il n'y a actuellement aucune SFD disponible pour l'adhésion.
        </p>
      </div>
    );
  }
  
  const pendingRequests = userRequests.filter(req => req.status === 'pending');
  
  return (
    <div className="space-y-6">
      {pendingRequests.length > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
          <h3 className="font-medium text-lg mb-2 text-yellow-800">Demandes en attente</h3>
          <p className="text-yellow-700 mb-3">
            Vous avez {pendingRequests.length} demande(s) d'adhésion en attente d'approbation.
          </p>
          <div className="space-y-2">
            {pendingRequests.map(request => (
              <div key={request.id} className="flex justify-between items-center p-2 bg-white rounded border border-yellow-100">
                <span>{request.sfd_name}</span>
                <Badge variant="outline" className="bg-yellow-100 text-yellow-800">
                  En attente
                </Badge>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {effectiveSfds.length > 0 && (
        <>
          <div className="relative">
            <Input
              placeholder="Rechercher une SFD..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8"
            />
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4 absolute left-2.5 top-1/2 transform -translate-y-1/2 text-gray-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>
          
          <div className="grid gap-4">
            {filteredSfds.length === 0 ? (
              <p className="text-center text-muted-foreground p-4">
                Aucune SFD ne correspond à votre recherche
              </p>
            ) : (
              filteredSfds.map(sfd => (
                <Card key={sfd.id} className="p-4 overflow-hidden border-gray-200">
                  <div className="flex justify-between">
                    <div>
                      <h3 className="font-medium">{sfd.name}</h3>
                      <p className="text-sm text-muted-foreground">
                        {sfd.code} {sfd.region && `• ${sfd.region}`}
                      </p>
                      {sfd.description && (
                        <p className="text-sm mt-2 line-clamp-2">{sfd.description}</p>
                      )}
                    </div>
                    <Button 
                      onClick={() => handleRequestAdhesion(sfd.id)}
                      className="bg-[#0D6A51] hover:bg-[#0D6A51]/90"
                    >
                      Adhérer
                    </Button>
                  </div>
                </Card>
              ))
            )}
          </div>
        </>
      )}
      
      <Dialog open={isConfirmOpen} onOpenChange={setIsConfirmOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmer la demande d'adhésion</DialogTitle>
            <DialogDescription>
              Voulez-vous vraiment demander l'adhésion à cette SFD? Après approbation, vous pourrez accéder à vos comptes, prêts et épargnes.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsConfirmOpen(false)} disabled={isSubmitting}>
              Annuler
            </Button>
            <Button 
              onClick={confirmRequest} 
              disabled={isSubmitting}
              className="bg-[#0D6A51] hover:bg-[#0D6A51]/90"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Envoi en cours...
                </>
              ) : (
                'Confirmer'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SfdSelector;
