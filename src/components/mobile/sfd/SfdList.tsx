
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Loader2, AlertCircle, CheckCircle, XCircle } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface SfdListProps {
  sfds: Array<{
    id: string;
    name: string;
    region?: string;
    code?: string;
    logo_url?: string;
    status: string;
  }>;
  existingRequests: Array<{
    sfd_id: string;
    status: string;
  }>;
  isSubmitting: boolean;
  onSelectSfd: (sfdId: string) => void;
  onRetry?: (sfdId: string) => void;
}

const SfdList: React.FC<SfdListProps> = ({
  sfds,
  existingRequests,
  isSubmitting,
  onSelectSfd,
  onRetry
}) => {
  // Rendu des cartes SFD
  const renderSfdCards = () => {
    if (sfds.length === 0) {
      return (
        <div className="text-center py-6 bg-gray-50 rounded-lg">
          <AlertCircle className="h-10 w-10 text-gray-400 mx-auto mb-3" />
          <p className="text-gray-600 font-medium">Aucune SFD disponible</p>
          <p className="text-sm text-gray-500 mt-1">
            Il n'y a pas de SFD disponible actuellement.
          </p>
        </div>
      );
    }

    return sfds.map(sfd => {
      // Vérifier si une demande existe déjà pour cette SFD
      const existingRequest = existingRequests.find(req => req.sfd_id === sfd.id);
      
      const isPending = existingRequest?.status === 'pending';
      const isApproved = existingRequest?.status === 'approved';
      const isRejected = existingRequest?.status === 'rejected';
      
      return (
        <Card key={sfd.id} className="overflow-hidden">
          <CardContent className="p-4 flex flex-col">
            <div className="flex items-center space-x-3 mb-3">
              {sfd.logo_url ? (
                <img 
                  src={sfd.logo_url} 
                  alt={sfd.name}
                  className="w-12 h-12 rounded-full object-cover"
                />
              ) : (
                <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
                  <span className="text-lg font-semibold text-gray-500">
                    {sfd.name.charAt(0).toUpperCase()}
                  </span>
                </div>
              )}
              <div className="flex-1">
                <h3 className="font-medium text-lg">{sfd.name}</h3>
                <p className="text-sm text-gray-600">{sfd.region || sfd.code}</p>
              </div>
              {isPending && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="px-3 py-1 bg-amber-100 text-amber-800 rounded-full text-xs font-medium flex items-center">
                        <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                        En attente
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Votre demande est en cours d'examen</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
              {isApproved && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium flex items-center">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Approuvée
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Vous êtes déjà membre de cette SFD</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
              {isRejected && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-xs font-medium flex items-center">
                        <XCircle className="h-3 w-3 mr-1" />
                        Rejetée
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Votre demande précédente a été rejetée</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
            </div>
            
            <div className="mt-2">
              {isPending ? (
                <Button 
                  disabled
                  className="w-full" 
                  variant="outline"
                >
                  Demande en attente
                </Button>
              ) : isApproved ? (
                <Button 
                  disabled
                  className="w-full"
                  variant="outline"
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Déjà membre
                </Button>
              ) : isRejected && onRetry ? (
                <Button
                  variant="outline"
                  onClick={() => onRetry(sfd.id)}
                  className="w-full"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : null}
                  Réessayer
                </Button>
              ) : (
                <Button
                  className="w-full bg-[#0D6A51] hover:bg-[#0D6A51]/90"
                  onClick={() => onSelectSfd(sfd.id)}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : null}
                  Rejoindre
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      );
    });
  };

  return (
    <div className="space-y-4">
      {renderSfdCards()}
    </div>
  );
};

export default SfdList;
