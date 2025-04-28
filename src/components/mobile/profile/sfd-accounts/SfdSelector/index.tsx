
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Building, Loader2, Check } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/useAuth';
import { useSfdDataAccess } from '@/hooks/useSfdDataAccess';
import { AdhesionRequest } from '@/types/adhesionTypes';

interface SfdSelectorProps {
  pendingRequests: AdhesionRequest[];
}

const SfdSelector: React.FC<SfdSelectorProps> = ({ pendingRequests = [] }) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { 
    sfdData, 
    activeSfdId, 
    setActiveSfdId, 
    isLoading 
  } = useSfdDataAccess();
  
  const [selectedSfd, setSelectedSfd] = useState<string | null>(activeSfdId);
  
  useEffect(() => {
    if (activeSfdId) {
      setSelectedSfd(activeSfdId);
    }
  }, [activeSfdId]);

  const handleSelect = (sfdId: string) => {
    setSelectedSfd(sfdId);
  };

  const handleSwitchSfd = async () => {
    if (!selectedSfd || selectedSfd === activeSfdId) return;
    
    try {
      setActiveSfdId(selectedSfd);
      navigate('/mobile-flow/dashboard');
    } catch (error) {
      console.error('Error switching SFD:', error);
    }
  };

  // Check if a pending request exists for a specific SFD
  const isPending = (sfdId: string) => {
    return pendingRequests.some(req => req.sfd_id === sfdId);
  };

  // Format the status badge for an SFD
  const getSfdStatusBadge = (sfdId: string) => {
    const pending = isPending(sfdId);
    
    if (pending) {
      return (
        <span className="text-xs px-2 py-0.5 bg-yellow-100 text-yellow-800 rounded-full">
          En attente
        </span>
      );
    }
    
    if (sfdId === activeSfdId) {
      return (
        <span className="text-xs px-2 py-0.5 bg-green-100 text-green-800 rounded-full flex items-center">
          <Check className="h-3 w-3 mr-1" />
          Actif
        </span>
      );
    }
    
    return null;
  };

  if (isLoading) {
    return (
      <Card className="w-full">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">Sélectionnez une SFD</CardTitle>
        </CardHeader>
        <CardContent className="pb-4">
          <div className="space-y-2">
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm">Sélectionnez une SFD</CardTitle>
      </CardHeader>
      <CardContent className="pb-4">
        {sfdData && sfdData.length > 0 ? (
          <>
            <div className="space-y-2">
              {sfdData.map(sfd => (
                <div 
                  key={sfd.id}
                  className={cn(
                    'p-3 border rounded-lg cursor-pointer flex items-center justify-between',
                    selectedSfd === sfd.id 
                      ? 'border-[#0D6A51] bg-[#0D6A51]/5' 
                      : 'hover:bg-gray-50'
                  )}
                  onClick={() => handleSelect(sfd.id)}
                >
                  <div className="flex items-center">
                    <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center mr-3">
                      {sfd.logo_url ? (
                        <img src={sfd.logo_url} alt={sfd.name} className="w-6 h-6 rounded-full object-cover" />
                      ) : (
                        <Building className="h-4 w-4 text-gray-500" />
                      )}
                    </div>
                    <div>
                      <p className="text-sm font-medium">{sfd.name}</p>
                      <p className="text-xs text-gray-500">{sfd.region || sfd.code}</p>
                    </div>
                  </div>
                  {getSfdStatusBadge(sfd.id)}
                </div>
              ))}
            </div>
            
            <Button 
              className="w-full mt-4 bg-[#0D6A51] hover:bg-[#0D6A51]/90"
              disabled={!selectedSfd || selectedSfd === activeSfdId}
              onClick={handleSwitchSfd}
            >
              Basculer vers cette SFD
            </Button>
          </>
        ) : (
          <div className="text-center py-4">
            <Building className="h-10 w-10 mx-auto text-gray-400 mb-2" />
            <p className="text-sm text-gray-600 mb-4">Vous n'êtes associé à aucune SFD</p>
            <Button 
              className="bg-[#0D6A51] hover:bg-[#0D6A51]/90"
              onClick={() => navigate('/sfd-selector')}
            >
              Trouver une SFD
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default SfdSelector;
