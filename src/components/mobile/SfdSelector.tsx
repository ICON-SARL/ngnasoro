
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ChevronDown } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';
import { useSfdAdhesion } from '@/hooks/sfd/useSfdAdhesion';

interface SfdSelectorProps {
  compact?: boolean;
  className?: string;
}

const SfdSelector: React.FC<SfdSelectorProps> = ({
  compact = false,
  className
}) => {
  const {
    user,
    activeSfdId,
    setActiveSfdId
  } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [activeSfds, setActiveSfds] = useState<Array<{
    id: string;
    name: string;
  }>>([]);
  const navigate = useNavigate();

  // Get current active SFD name
  const currentSfd = activeSfds.find(sfd => sfd.id === activeSfdId);

  useEffect(() => {
    const fetchActiveSfds = async () => {
      if (!user) return;
      setIsLoading(true);
      console.info('Fetching active SFDs for popup display');
      try {
        // First check if user is a client in any SFD
        const { data: clientData, error: clientError } = await supabase
          .from('sfd_clients')
          .select('sfd_id, sfds:sfd_id(id, name)')
          .eq('user_id', user.id);
          
        if (clientError) throw clientError;
        
        // If user is a client in any SFD, only show those SFDs
        if (Array.isArray(clientData) && clientData.length > 0) {
          console.info('User is a client in', clientData.length, 'SFDs');
          const clientSfds = clientData.map(item => ({
            id: item.sfds.id,
            name: item.sfds.name
          }));
          setActiveSfds(clientSfds);
          
          // If no active SFD is set but we have SFDs, set the first one
          if (!activeSfdId && clientSfds.length > 0) {
            setActiveSfdId(clientSfds[0].id);
          }
          setIsLoading(false);
          return;
        }
        
        // If user is not a client, fall back to user_sfds
        const {
          data: userSfds,
          error: userSfdsError
        } = await supabase.from('user_sfds').select('sfd_id, sfds:sfd_id(id, name)').eq('user_id', user.id);
        
        if (userSfdsError) throw userSfdsError;
        
        if (Array.isArray(userSfds) && userSfds.length > 0) {
          // Transform data to expected format
          const sfdsData = userSfds.map(item => ({
            id: item.sfds.id,
            name: item.sfds.name
          }));
          console.info('Fetched', sfdsData.length, 'active SFDs from user_sfds');
          setActiveSfds(sfdsData);

          // If no active SFD is set but we have SFDs, set the first one
          if (!activeSfdId && sfdsData.length > 0) {
            setActiveSfdId(sfdsData[0].id);
          }
        } else {
          console.warn('User has no associated SFDs');
          setActiveSfds([]);
        }
      } catch (error) {
        console.error('Error fetching active SFDs:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchActiveSfds();
  }, [user, activeSfdId, setActiveSfdId]);

  const handleSwitchSfd = (sfdId: string) => {
    if (activeSfdId === sfdId) return;
    setActiveSfdId(sfdId);
  };

  const handleAddSfd = () => {
    navigate('/sfd-setup');
  };

  if (isLoading) {
    return (
      <Button 
        variant="outline" 
        size="sm" 
        className={cn(`${compact ? 'h-8 text-xs px-2' : ''} bg-white/80 border-gray-200`, className)} 
        disabled
      >
        <Loader2 className="h-3 w-3 mr-1 animate-spin" />
        Chargement...
      </Button>
    );
  }

  if (activeSfds.length === 0) {
    return null;
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button 
          variant="outline" 
          size="sm" 
          className={cn(`${compact ? 'h-8 text-xs px-2' : ''} bg-white/80 border-gray-200 flex items-center justify-between`, className)}
        >
          <span className="truncate mr-1 max-w-28">
            {currentSfd?.name || "Sélectionner une SFD"}
          </span>
          <ChevronDown className="h-3 w-3 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-48 p-1">
        <div className="space-y-1">
          {activeSfds.map(sfd => (
            <Button 
              key={sfd.id} 
              variant={activeSfdId === sfd.id ? "secondary" : "ghost"} 
              size="sm" 
              className="w-full justify-start font-normal" 
              onClick={() => handleSwitchSfd(sfd.id)}
            >
              {sfd.name}
            </Button>
          ))}
          
          <Button 
            variant="ghost" 
            size="sm" 
            className="w-full justify-start font-normal text-blue-600" 
            onClick={handleAddSfd}
          >
            + Ajouter une SFD
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default SfdSelector;
