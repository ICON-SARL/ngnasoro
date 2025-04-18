
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { JoinSfdButton } from './JoinSfdButton';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Sfd {
  id: string;
  name: string;
  logo_url?: string;
  code?: string;
  region?: string;
}

interface ExistingRequest {
  sfd_id: string;
  status: string;
}

interface SfdListProps {
  sfds: Sfd[];
  existingRequests?: {sfd_id: string, status: string}[];
  isSubmitting?: boolean;
  onSelectSfd?: (sfdId: string) => void;
  onRetry?: (sfdId: string) => void;
  onEdit?: (sfdId: string) => void;
}

const SfdList: React.FC<SfdListProps> = ({ 
  sfds, 
  existingRequests = [],
  isSubmitting,
  onSelectSfd,
  onRetry,
  onEdit
}) => {
  const getRequestStatus = (sfdId: string): ExistingRequest | undefined => {
    return existingRequests.find(req => req.sfd_id === sfdId);
  };

  if (sfds.length === 0) {
    return (
      <div className="text-center py-8 bg-gray-50 rounded-lg">
        <p className="text-gray-600">Aucune SFD disponible pour le moment.</p>
        <p className="text-sm text-gray-500 mt-1">
          Toutes les SFDs sont déjà associées à votre compte ou en attente de validation.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {sfds.map(sfd => {
        const requestStatus = getRequestStatus(sfd.id);
        
        return (
          <Card key={sfd.id} className="overflow-hidden">
            <CardContent className="p-0">
              <div className="p-4">
                <div className="flex items-center">
                  {sfd.logo_url ? (
                    <img 
                      src={sfd.logo_url} 
                      alt={sfd.name} 
                      className="h-10 w-10 mr-3 rounded-full object-cover" 
                    />
                  ) : (
                    <div className="h-10 w-10 mr-3 rounded-full bg-gray-200 flex items-center justify-center">
                      <span className="font-bold text-gray-500">{sfd.name.charAt(0)}</span>
                    </div>
                  )}
                  
                  <div>
                    <div className="flex items-center">
                      <h3 className="text-lg font-medium">{sfd.name}</h3>
                      {requestStatus && (
                        <Badge 
                          className={`ml-2 ${
                            requestStatus.status === 'rejected' 
                              ? 'bg-red-100 text-red-800 hover:bg-red-100' 
                              : requestStatus.status === 'pending'
                                ? 'bg-yellow-100 text-yellow-800 hover:bg-yellow-100'
                                : 'bg-green-100 text-green-800 hover:bg-green-100'
                          }`}
                        >
                          {requestStatus.status === 'rejected' 
                            ? 'Rejetée' 
                            : requestStatus.status === 'pending' 
                              ? 'En attente' 
                              : 'Approuvée'}
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-gray-500">{sfd.region || sfd.code}</p>
                  </div>
                </div>
              </div>
              
              <div className="mt-2 border-t">
                {isSubmitting ? (
                  <div className="flex justify-center py-3">
                    <Loader2 className="h-5 w-5 animate-spin text-gray-500" />
                  </div>
                ) : requestStatus?.status === 'rejected' ? (
                  <div className="grid grid-cols-2 gap-2 p-2">
                    <JoinSfdButton
                      sfdId={sfd.id}
                      sfdName={sfd.name}
                      isRetry={true}
                    />
                    <JoinSfdButton
                      sfdId={sfd.id}
                      sfdName={sfd.name}
                      isEdit={true}
                    />
                  </div>
                ) : requestStatus?.status === 'pending' ? (
                  <div className="flex justify-between items-center">
                    <div className="bg-amber-50 text-amber-800 py-3 px-4 text-center text-sm flex-1">
                      Demande en cours de traitement
                    </div>
                    <JoinSfdButton
                      sfdId={sfd.id}
                      sfdName={sfd.name}
                      isEdit={true}
                    />
                  </div>
                ) : onSelectSfd ? (
                  <button
                    onClick={() => onSelectSfd(sfd.id)}
                    className="w-full py-3 px-4 text-center hover:bg-gray-50 transition-colors"
                  >
                    Rejoindre
                  </button>
                ) : (
                  <JoinSfdButton
                    sfdId={sfd.id}
                    sfdName={sfd.name}
                  />
                )}
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};

export default SfdList;
