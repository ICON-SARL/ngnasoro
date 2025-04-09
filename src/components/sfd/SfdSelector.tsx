
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Loader } from '@/components/ui/loader';
import { useToast } from '@/hooks/use-toast';
import { AlertCircle } from 'lucide-react';

interface SfdSelectorProps {
  onSfdSelected?: () => void;
  isOpen: boolean;
  onClose: () => void;
}

interface SfdItem {
  id: string;
  name: string;
  code: string;
  region?: string;
  logo_url?: string;
}

export const SfdSelector: React.FC<SfdSelectorProps> = ({ onSfdSelected, isOpen, onClose }) => {
  const [sfds, setSfds] = useState<SfdItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user, activeSfdId, setActiveSfdId } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    const fetchSfds = async () => {
      if (!user) return;
      
      setIsLoading(true);
      setError(null);
      
      try {
        // Check if the user already has SFD associations
        const { data: userSfds, error: userSfdsError } = await supabase
          .from('user_sfds')
          .select(`
            id,
            sfd_id,
            is_default,
            sfds:sfd_id (id, name, code, region, logo_url)
          `)
          .eq('user_id', user.id);
        
        if (userSfdsError) throw userSfdsError;
        
        if (userSfds && userSfds.length > 0) {
          // User already has SFD associations
          const formattedSfds = userSfds.map(item => ({
            id: item.sfds.id,
            name: item.sfds.name,
            code: item.sfds.code,
            region: item.sfds.region,
            logo_url: item.sfds.logo_url
          }));
          
          setSfds(formattedSfds);
          
          // If no activeSfdId is set, use the default one
          if (!activeSfdId) {
            const defaultSfd = userSfds.find(item => item.is_default);
            if (defaultSfd) {
              setActiveSfdId(defaultSfd.sfd_id);
            }
          }
        } else {
          // Fetch all available SFDs if user doesn't have associations yet
          const { data: allSfds, error: sfdsError } = await supabase
            .from('sfds')
            .select('id, name, code, region, logo_url')
            .eq('status', 'active');
          
          if (sfdsError) throw sfdsError;
          
          setSfds(allSfds || []);
        }
      } catch (err: any) {
        console.error('Error fetching SFDs:', err);
        setError(err.message || 'Une erreur est survenue lors du chargement des SFDs');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchSfds();
  }, [user, activeSfdId, setActiveSfdId]);
  
  const handleSelectSfd = async (sfdId: string) => {
    if (!user) return;
    
    try {
      // Update active SFD in user's state
      setActiveSfdId(sfdId);
      
      // Check if association exists, otherwise create it
      const { data: existing } = await supabase
        .from('user_sfds')
        .select('id')
        .eq('user_id', user.id)
        .eq('sfd_id', sfdId)
        .maybeSingle();
      
      if (!existing) {
        // Create association
        await supabase
          .from('user_sfds')
          .insert({
            user_id: user.id,
            sfd_id: sfdId,
            is_default: true
          });
        
        // Update app_metadata in auth.users
        await supabase.auth.updateUser({
          data: { sfd_id: sfdId }
        });
      }
      
      toast({
        title: "SFD sélectionné",
        description: "Vous avez changé de SFD avec succès",
      });
      
      if (onSfdSelected) {
        onSfdSelected();
      }
      
      onClose();
    } catch (err: any) {
      console.error('Error selecting SFD:', err);
      toast({
        title: "Erreur",
        description: "Impossible de sélectionner ce SFD",
        variant: "destructive"
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Sélectionner un SFD</DialogTitle>
        </DialogHeader>
        
        {isLoading ? (
          <div className="flex justify-center py-8">
            <Loader size="lg" />
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
            <AlertCircle className="h-6 w-6 text-red-500 mx-auto mb-2" />
            <p className="text-red-600">{error}</p>
          </div>
        ) : sfds.length === 0 ? (
          <div className="text-center py-6">
            <p className="text-muted-foreground mb-4">Aucun SFD disponible</p>
            <Button onClick={onClose}>Fermer</Button>
          </div>
        ) : (
          <div className="space-y-2 max-h-[60vh] overflow-y-auto p-1">
            {sfds.map((sfd) => (
              <div
                key={sfd.id}
                className={`flex items-center justify-between p-3 rounded-lg cursor-pointer border
                  ${activeSfdId === sfd.id ? 'border-primary bg-primary/5' : 'border-gray-200 hover:bg-gray-50'}`}
                onClick={() => handleSelectSfd(sfd.id)}
              >
                <div className="flex items-center">
                  {sfd.logo_url ? (
                    <div className="h-10 w-10 rounded-full overflow-hidden mr-3">
                      <img src={sfd.logo_url} alt={sfd.name} className="h-full w-full object-cover" />
                    </div>
                  ) : (
                    <div className="h-10 w-10 bg-primary/10 text-primary rounded-full flex items-center justify-center mr-3">
                      {sfd.name.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div>
                    <p className="font-medium">{sfd.name}</p>
                    {sfd.region && <p className="text-xs text-muted-foreground">{sfd.region}</p>}
                  </div>
                </div>
                
                {activeSfdId === sfd.id ? (
                  <span className="text-xs bg-primary text-primary-foreground px-2 py-1 rounded-full">
                    Actif
                  </span>
                ) : (
                  <Button variant="outline" size="sm">
                    Sélectionner
                  </Button>
                )}
              </div>
            ))}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default SfdSelector;
