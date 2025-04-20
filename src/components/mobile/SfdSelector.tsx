
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ChevronDown } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { 
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Loader2 } from 'lucide-react';

interface SfdSelectorProps {
  compact?: boolean;
}

const SfdSelector: React.FC<SfdSelectorProps> = ({ compact = false }) => {
  const { user, activeSfdId, setActiveSfdId } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [activeSfds, setActiveSfds] = useState<Array<{id: string, name: string}>>([]);
  const navigate = useNavigate();
  
  // Get current active SFD name
  const currentSfd = activeSfds.find(sfd => sfd.id === activeSfdId);
  
  useEffect(() => {
    const fetchActiveSfds = async () => {
      if (!user) return;
      
      setIsLoading(true);
      console.info('Fetching active SFDs for popup display');
      
      try {
        // Fetch user's SFDs from user_sfds table
        const { data, error } = await fetch('/api/get-user-sfds').then(res => res.json());
        
        if (error) {
          console.error('Error fetching SFDs:', error);
          return;
        }
        
        if (Array.isArray(data)) {
          console.info('Fetched', data.length, 'active SFDs from Edge function');
          setActiveSfds(data);
          
          // If no active SFD is set but we have SFDs, set the first one
          if (!activeSfdId && data.length > 0) {
            setActiveSfdId(data[0].id);
          }
        } else {
          console.warn('Unexpected data format for SFDs', data);
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
        className={`${compact ? 'h-8 text-xs px-2' : ''} bg-white/80 border-gray-200`}
        disabled
      >
        <Loader2 className="h-3 w-3 mr-1 animate-spin" />
        Chargement...
      </Button>
    );
  }
  
  if (activeSfds.length === 0) {
    return (
      <Button 
        variant="outline" 
        size="sm" 
        className={`${compact ? 'h-8 text-xs px-2' : ''} bg-white/80 border-gray-200`}
        onClick={handleAddSfd}
      >
        Ajouter une SFD
      </Button>
    );
  }
  
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button 
          variant="outline" 
          size="sm" 
          className={`${compact ? 'h-8 text-xs px-2' : ''} bg-white/80 border-gray-200 flex items-center justify-between`}
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
              variant={activeSfdId === sfd.id ? "subtle" : "ghost"}
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
