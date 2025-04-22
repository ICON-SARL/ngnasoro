
import React from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Building } from 'lucide-react';
import { JoinSfdButton } from './JoinSfdButton';
import { Skeleton } from '@/components/ui/skeleton';

interface Sfd {
  id: string;
  name: string;
  code: string;
  region?: string;
  status: string;
  logo_url?: string;
}

interface SfdListProps {
  sfds: Sfd[];
  existingRequests: { sfd_id: string; status: string }[];
  isSubmitting: boolean;
  onSelectSfd: (sfdId: string) => void;
  onRetry: (sfdId: string) => void;
  onEdit: (sfdId: string) => void;
}

const SfdList: React.FC<SfdListProps> = ({
  sfds,
  existingRequests,
  isSubmitting,
  onSelectSfd,
  onRetry,
  onEdit
}) => {
  if (sfds.length === 0) {
    return (
      <Card className="p-6 text-center">
        <Building className="h-12 w-12 text-gray-300 mx-auto mb-4" />
        <h3 className="text-lg font-medium mb-2">Aucune SFD disponible</h3>
        <p className="text-sm text-gray-500">
          Il n'y a actuellement aucune SFD disponible pour une nouvelle adhésion.
        </p>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {sfds.map((sfd) => {
        const existingRequest = existingRequests.find(req => req.sfd_id === sfd.id);
        const requestStatus = existingRequest?.status;
        
        return (
          <Card key={sfd.id} className="overflow-hidden">
            <div className="p-4">
              <div className="flex items-center">
                <div className="h-10 w-10 bg-gray-100 rounded-full flex items-center justify-center mr-3">
                  {sfd.logo_url ? (
                    <img src={sfd.logo_url} alt={sfd.name} className="h-8 w-8 rounded-full" />
                  ) : (
                    <Building className="h-5 w-5 text-gray-500" />
                  )}
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h3 className="font-medium">{sfd.name}</h3>
                    {requestStatus && (
                      <Badge 
                        className={
                          requestStatus === 'approved' 
                            ? 'bg-green-100 text-green-800 border-green-200' 
                            : requestStatus === 'rejected'
                            ? 'bg-red-100 text-red-800 border-red-200'
                            : 'bg-amber-100 text-amber-800 border-amber-200'
                        }
                      >
                        {requestStatus === 'approved' 
                          ? 'Approuvée' 
                          : requestStatus === 'rejected' 
                          ? 'Rejetée' 
                          : 'En attente'}
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-gray-500">{sfd.region || sfd.code}</p>
                </div>
              </div>
              
              {/* Bouton d'action */}
              <div className="mt-3">
                {requestStatus === 'rejected' ? (
                  <JoinSfdButton 
                    sfdId={sfd.id} 
                    sfdName={sfd.name} 
                    isRetry={true}
                    onClick={() => onRetry(sfd.id)}
                  />
                ) : requestStatus === 'pending' ? (
                  <JoinSfdButton 
                    sfdId={sfd.id} 
                    sfdName={sfd.name} 
                    isEdit={true}
                    onClick={() => onEdit(sfd.id)}
                  />
                ) : requestStatus === 'approved' ? (
                  <Badge className="w-full justify-center py-2 bg-green-100 text-green-800 border-green-200">
                    Déjà membre
                  </Badge>
                ) : (
                  <JoinSfdButton 
                    sfdId={sfd.id} 
                    sfdName={sfd.name}
                    onClick={() => onSelectSfd(sfd.id)}
                  />
                )}
              </div>
            </div>
          </Card>
        );
      })}
    </div>
  );
};

export const SfdListSkeleton = () => {
  return (
    <div className="space-y-4">
      {[1, 2, 3].map((i) => (
        <Card key={i} className="p-4">
          <div className="flex items-center">
            <Skeleton className="h-10 w-10 rounded-full mr-3" />
            <div className="space-y-2 flex-1">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-3 w-16" />
            </div>
          </div>
          <Skeleton className="h-9 w-full mt-3" />
        </Card>
      ))}
    </div>
  );
};

export default SfdList;
