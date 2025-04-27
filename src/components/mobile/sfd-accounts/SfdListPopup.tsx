
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Check, Building } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import JoinSfdButton from './JoinSfdButton';
import { useToast } from '@/hooks/use-toast';
import { useAdhesionRequests } from '@/hooks/useAdhesionRequests';
import { AdhesionRequest } from '@/types/adhesionRequests';

interface SfdListPopupProps {
  isOpen: boolean;
  onClose: () => void;
}

interface Sfd {
  id: string;
  name: string;
  logo_url: string | null;
  region: string | null;
  status: string;
}

export default function SfdListPopup({ isOpen, onClose }: SfdListPopupProps) {
  const [sfds, setSfds] = useState<Sfd[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();
  const { adhesionRequests } = useAdhesionRequests();

  const fetchSfds = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('sfds')
        .select('*')
        .eq('status', 'active');
        
      if (error) throw error;
      setSfds(data || []);
    } catch (error) {
      console.error('Error fetching SFDs:', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger la liste des SFDs",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Check if user has a pending request for a specific SFD
  const hasPendingRequest = (sfdId: string): boolean => {
    return adhesionRequests?.some(
      request => request.sfd_id === sfdId && request.status === 'pending'
    ) || false;
  };

  useEffect(() => {
    if (isOpen) {
      fetchSfds();
    }
  }, [isOpen]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Choisir une SFD</DialogTitle>
          <DialogDescription>
            Sélectionnez une SFD à rejoindre pour accéder à ses services financiers.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 mt-4">
          {loading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#0D6A51]"></div>
            </div>
          ) : sfds.length === 0 ? (
            <div className="text-center py-6">
              <Building className="mx-auto h-12 w-12 text-gray-400" />
              <p className="mt-2 text-gray-500">Aucune SFD disponible pour le moment</p>
            </div>
          ) : (
            sfds.map(sfd => (
              <Card key={sfd.id} className={hasPendingRequest(sfd.id) ? "border-amber-200" : ""}>
                <CardContent className="flex items-center justify-between p-4">
                  <div className="flex items-center space-x-3">
                    <div className="flex-shrink-0 h-12 w-12 rounded-full bg-gray-100 flex items-center justify-center">
                      {sfd.logo_url ? (
                        <img src={sfd.logo_url} alt={sfd.name} className="h-8 w-8 object-contain" />
                      ) : (
                        <Building className="h-6 w-6 text-gray-500" />
                      )}
                    </div>
                    <div>
                      <h3 className="font-medium">{sfd.name}</h3>
                      {sfd.region && <p className="text-xs text-gray-500">{sfd.region}</p>}
                    </div>
                  </div>
                  <JoinSfdButton 
                    sfdId={sfd.id} 
                    sfdName={sfd.name} 
                    onSuccess={onClose}
                  />
                </CardContent>
              </Card>
            ))
          )}
        </div>
        
        <div className="flex justify-center mt-4">
          <Button variant="outline" onClick={onClose}>Fermer</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
