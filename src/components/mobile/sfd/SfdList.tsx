
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { JoinSfdButton } from './JoinSfdButton';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

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
  const navigate = useNavigate();
  
  const getRequestStatus = (sfdId: string): ExistingRequest | undefined => {
    return existingRequests.find(req => req.sfd_id === sfdId);
  };

  const handleRetryClick = (sfdId: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (onRetry) {
      onRetry(sfdId);
    } else {
      navigate(`/mobile-flow/sfd-adhesion/${sfdId}`);
    }
  };

  const handleEditClick = (sfdId: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (onEdit) {
      onEdit(sfdId);
    } else {
      navigate(`/mobile-flow/sfd-adhesion/${sfdId}?mode=edit`);
    }
  };

  const handleJoinClick = (sfdId: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (onSelectSfd) {
      onSelectSfd(sfdId);
    } else {
      navigate(`/mobile-flow/sfd-adhesion/${sfdId}`);
    }
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
                    <Button
                      onClick={(e) => handleRetryClick(sfd.id, e)}
                      className="w-full bg-red-600 hover:bg-red-700"
                    >
                      <RefreshCw className="mr-2 h-4 w-4" /> Réessayer
                    </Button>
                    <Button
                      onClick={(e) => handleEditClick(sfd.id, e)}
                      className="w-full bg-amber-600 hover:bg-amber-700"
                    >
                      <Edit2 className="mr-2 h-4 w-4" /> Modifier
                    </Button>
                  </div>
                ) : requestStatus?.status === 'pending' ? (
                  <div className="flex justify-between items-center">
                    <div className="bg-amber-50 text-amber-800 py-3 px-4 text-center text-sm flex-1">
                      Demande en cours de traitement
                    </div>
                    <Button
                      onClick={(e) => handleEditClick(sfd.id, e)}
                      className="bg-amber-600 hover:bg-amber-700"
                    >
                      <Edit2 className="mr-2 h-4 w-4" /> Modifier
                    </Button>
                  </div>
                ) : onSelectSfd ? (
                  <button
                    onClick={(e) => handleJoinClick(sfd.id, e)}
                    className="w-full py-3 px-4 text-center hover:bg-gray-50 transition-colors"
                  >
                    Rejoindre
                  </button>
                ) : (
                  <Button
                    onClick={(e) => handleJoinClick(sfd.id, e)}
                    className="w-full bg-[#0D6A51] hover:bg-[#0D6A51]/90"
                  >
                    Rejoindre <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
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
