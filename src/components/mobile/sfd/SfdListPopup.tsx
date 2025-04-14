
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, ChevronRight, Building, FileCheck } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useClientAdhesions } from '@/hooks/useClientAdhesions';

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
  const { user } = useAuth();
  const { userAdhesionRequests } = useClientAdhesions();

  useEffect(() => {
    const fetchActiveSfds = async () => {
      if (!isOpen) return;

      setIsLoading(true);
      setError(null);

      try {
        const { data, error } = await supabase
          .from('sfds')
          .select('id, name, region, logo_url')
          .eq('status', 'active')
          .order('name');

        if (error) throw error;
        
        const sortedSfds = sortPrioritySfds(data || []);
        setSfds(sortedSfds);
      } catch (err: any) {
        console.error('Erreur lors du chargement des SFDs:', err);
        setError('Impossible de charger la liste des SFDs. Veuillez réessayer plus tard.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchActiveSfds();
  }, [isOpen]);

  const sortPrioritySfds = (sfds: Sfd[]): Sfd[] => {
    const prioritySfdNames = ["premier sfd", "deuxieme", "troisieme"];
    
    return [...sfds].sort((a, b) => {
      const aIsPriority = prioritySfdNames.includes(a.name.toLowerCase());
      const bIsPriority = prioritySfdNames.includes(b.name.toLowerCase());
      
      if (aIsPriority && !bIsPriority) return -1;
      if (!aIsPriority && bIsPriority) return 1;
      
      if (aIsPriority && bIsPriority) {
        return prioritySfdNames.indexOf(a.name.toLowerCase()) - prioritySfdNames.indexOf(b.name.toLowerCase());
      }
      
      return a.name.localeCompare(b.name);
    });
  };

  const handleSelectSfd = (sfdId: string) => {
    navigate(`/mobile-flow/sfd-adhesion/${sfdId}`);
    onClose();
  };
  
  const getSfdRequestStatus = (sfdId: string) => {
    const request = userAdhesionRequests.find(r => r.sfd_id === sfdId);
    return request?.status || null;
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
              <div className="h-8 w-8 animate-spin rounded-full border-t-2 border-b-2 border-[#0D6A51]"></div>
            </div>
          ) : error ? (
            <div className="text-center py-8 text-red-500">
              <p>{error}</p>
              <Button 
                variant="outline" 
                className="mt-4"
                onClick={() => navigate('/mobile-flow/sfd-selector')}
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
                onClick={() => navigate('/mobile-flow/sfd-selector')}
              >
                Voir tous les SFDs
              </Button>
            </div>
          ) : (
            <div className="space-y-3 max-h-[60vh] overflow-y-auto py-2">
              {sfds.map((sfd) => {
                const status = getSfdRequestStatus(sfd.id);
                
                return (
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
                      <div className="flex items-center space-x-2">
                        <h3 className="font-medium text-gray-800">{sfd.name}</h3>
                        {status === 'pending' && (
                          <Badge variant="outline" className="bg-amber-100 border-amber-200 text-amber-700 text-xs">
                            En attente
                          </Badge>
                        )}
                        {status === 'approved' && (
                          <Badge variant="outline" className="bg-green-100 border-green-200 text-green-700 text-xs">
                            <FileCheck className="h-3 w-3 mr-1" />
                            Approuvée
                          </Badge>
                        )}
                      </div>
                      {sfd.region && (
                        <p className="text-sm text-gray-500">{sfd.region}</p>
                      )}
                    </div>
                    <ChevronRight className="h-5 w-5 text-gray-400" />
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="mt-4 flex justify-center">
          <Button
            onClick={() => navigate('/mobile-flow/sfd-selector')}
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
