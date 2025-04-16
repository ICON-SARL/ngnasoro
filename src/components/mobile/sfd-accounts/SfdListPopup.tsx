
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, Building } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { Loader } from '@/components/ui/loader';
import { useToast } from '@/hooks/use-toast';

interface SfdListPopupProps {
  isOpen: boolean;
  onClose: () => void;
}

interface Sfd {
  id: string;
  name: string;
  region?: string;
  logo_url?: string;
}

const SfdListPopup: React.FC<SfdListPopupProps> = ({ isOpen, onClose }) => {
  const [sfds, setSfds] = useState<Sfd[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const fetchActiveSfds = async () => {
      if (!isOpen) return;

      setIsLoading(true);
      setError(null);

      try {
        console.log('Fetching active SFDs for popup display');
        
        // Option 1: Direct database query
        const { data: directData, error: directError } = await supabase
          .from('sfds')
          .select('id, name, region, logo_url')
          .eq('status', 'active')
          .order('name');
          
        if (directError) throw directError;
        
        if (directData && directData.length > 0) {
          setSfds(directData);
          setIsLoading(false);
          return;
        }
        
        // Option 2: Edge function as fallback
        const { data: edgeData, error: edgeError } = await supabase.functions.invoke('fetch-sfds');
        
        if (edgeError) throw edgeError;
        
        if (Array.isArray(edgeData)) {
          console.log(`Fetched ${edgeData.length} active SFDs from Edge function`);
          setSfds(edgeData);
        } else {
          throw new Error('Aucune SFD active trouvée');
        }
      } catch (err: any) {
        console.error('Erreur lors du chargement des SFDs:', err);
        setError('Impossible de charger la liste des SFDs. Veuillez réessayer plus tard.');
        toast({
          title: "Erreur de chargement",
          description: "Impossible de récupérer les SFDs disponibles",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchActiveSfds();
  }, [isOpen, toast]);

  const handleSelectSfd = (sfdId: string) => {
    // Rediriger directement vers la page de sélection SFD avec le paramètre
    navigate('/sfd-selector', { state: { selectedSfdId: sfdId } });
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center text-xl text-[#0D6A51]">
            SFDs Partenaires MEREF
          </DialogTitle>
        </DialogHeader>

        <div className="mt-2">
          {isLoading ? (
            <div className="flex justify-center py-12">
              <Loader className="h-8 w-8 text-[#0D6A51]" />
            </div>
          ) : error ? (
            <div className="text-center py-8 text-red-500">
              <p>{error}</p>
              <Button 
                variant="outline" 
                className="mt-4"
                onClick={() => navigate('/sfd-selector')}
              >
                Voir tous les SFDs
              </Button>
            </div>
          ) : sfds.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500">Aucun SFD actif trouvé.</p>
              <Button 
                variant="outline" 
                className="mt-4"
                onClick={() => navigate('/sfd-selector')}
              >
                Voir tous les SFDs
              </Button>
            </div>
          ) : (
            <div className="space-y-3 max-h-[60vh] overflow-y-auto py-2">
              {sfds.map((sfd) => (
                <div 
                  key={sfd.id}
                  className="flex items-center p-3 rounded-lg border border-gray-200 hover:bg-gray-50 cursor-pointer transition-colors"
                  onClick={() => handleSelectSfd(sfd.id)}
                >
                  <div className="h-12 w-12 flex-shrink-0 bg-gray-100 rounded-md flex items-center justify-center mr-3 overflow-hidden">
                    {sfd.logo_url ? (
                      <img 
                        src={sfd.logo_url} 
                        alt={sfd.name} 
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <span className="text-lg font-bold text-gray-500">
                        {sfd.name.charAt(0)}
                      </span>
                    )}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-800">{sfd.name}</h3>
                    {sfd.region && (
                      <p className="text-sm text-gray-500">{sfd.region}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="mt-4 flex justify-center">
          <Button
            onClick={() => navigate('/sfd-selector')}
            className="bg-[#0D6A51] hover:bg-[#0D6A51]/90 w-full"
          >
            <Building className="h-4 w-4 mr-2" />
            Voir tous les SFDs disponibles
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SfdListPopup;
