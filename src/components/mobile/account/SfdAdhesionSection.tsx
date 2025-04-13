
import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Building } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useAvailableSfds } from '@/hooks/sfd/useAvailableSfds';
import { useAuth } from '@/hooks/useAuth';
import { ClientAdhesionForm } from '@/components/client/ClientAdhesionForm';
import { Loader } from '@/components/ui/loader';
import { HoverCard, HoverCardContent, HoverCardTrigger } from '@/components/ui/hover-card';

const SfdAdhesionSection: React.FC = () => {
  const [selectedSfdId, setSelectedSfdId] = useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { user } = useAuth();
  const { availableSfds, pendingRequests, isLoading } = useAvailableSfds(user?.id);

  const handleSfdSelect = (sfdId: string) => {
    setSelectedSfdId(sfdId);
    setIsDialogOpen(true);
  };

  const handleClose = () => {
    setIsDialogOpen(false);
    setSelectedSfdId(null);
  };

  const selectedSfd = availableSfds.find(sfd => sfd.id === selectedSfdId);

  return (
    <div className="mt-4">
      <h3 className="text-lg font-medium mb-3">Adhésion SFD</h3>
      
      {isLoading ? (
        <Card>
          <CardContent className="p-4 flex justify-center">
            <Loader className="h-6 w-6" />
          </CardContent>
        </Card>
      ) : pendingRequests.length > 0 ? (
        <Card>
          <CardContent className="p-4">
            <h4 className="font-medium mb-2">Demandes en cours</h4>
            <div className="space-y-2">
              {pendingRequests.map(request => (
                <div key={request.id} className="flex items-center justify-between p-2 bg-amber-50 rounded-md border border-amber-200">
                  <div className="flex items-center">
                    <Building className="h-4 w-4 text-amber-600 mr-2" />
                    <span>{request.sfd_name || 'SFD'}</span>
                  </div>
                  <span className="text-xs bg-amber-100 text-amber-800 px-2 py-1 rounded">En attente</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      ) : null}

      <Card className="mt-3">
        <CardContent className="p-4">
          <h4 className="font-medium mb-2">SFDs disponibles</h4>
          {availableSfds.length === 0 ? (
            <p className="text-center text-gray-500 py-2">Aucune SFD disponible pour adhésion</p>
          ) : (
            <div className="grid grid-cols-2 gap-2">
              {availableSfds.map(sfd => (
                <HoverCard key={sfd.id}>
                  <HoverCardTrigger asChild>
                    <Button 
                      variant="outline" 
                      className="flex flex-col items-center justify-center h-24 w-full text-center"
                      onClick={() => handleSfdSelect(sfd.id)}
                    >
                      {sfd.logo_url ? (
                        <img 
                          src={sfd.logo_url} 
                          alt={sfd.name} 
                          className="h-8 w-8 object-contain mb-2" 
                        />
                      ) : (
                        <Building className="h-8 w-8 text-[#0D6A51] mb-2" />
                      )}
                      <span className="text-sm">{sfd.name}</span>
                    </Button>
                  </HoverCardTrigger>
                  <HoverCardContent className="w-80">
                    <div className="space-y-2">
                      <h4 className="font-bold">{sfd.name}</h4>
                      <p className="text-sm text-gray-500">{sfd.region || 'Région non spécifiée'}</p>
                      {sfd.description && (
                        <p className="text-sm">{sfd.description}</p>
                      )}
                      <Button 
                        className="w-full bg-[#0D6A51] hover:bg-[#0D6A51]/90 mt-2"
                        onClick={() => handleSfdSelect(sfd.id)}
                      >
                        Demander une adhésion
                      </Button>
                    </div>
                  </HoverCardContent>
                </HoverCard>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Demande d'adhésion à {selectedSfd?.name}</DialogTitle>
          </DialogHeader>
          
          {selectedSfdId && (
            <ClientAdhesionForm 
              sfdId={selectedSfdId}
              sfdName={selectedSfd?.name}
              onSuccess={handleClose}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SfdAdhesionSection;
