
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Building } from 'lucide-react';
import { JoinSfdButton } from './JoinSfdButton';

interface Sfd {
  id: string;
  name: string;
  code: string;
  region?: string;
  status: string;
  logo_url?: string;
  description?: string;
}

interface SfdListProps {
  sfds: Sfd[];
  existingRequests: { sfd_id: string, status: string }[];
  isSubmitting?: boolean;
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
  
  // Function to check if a SFD has a request and its status
  const getRequestStatus = (sfdId: string) => {
    const request = existingRequests.find(req => req.sfd_id === sfdId);
    return request ? request.status : null;
  };
  
  // Sort SFDs to prioritize important ones
  const sortedSfds = [...sfds].sort((a, b) => {
    // You can implement your own sorting logic here
    return a.name.localeCompare(b.name);
  });
  
  if (sortedSfds.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-600">Aucune SFD disponible pour le moment.</p>
        <p className="text-sm text-gray-500 mt-2">
          Essayez de vous reconnecter plus tard ou contactez l'administrateur.
        </p>
      </div>
    );
  }
  
  return (
    <div className="space-y-4">
      {sortedSfds.map(sfd => {
        const requestStatus = getRequestStatus(sfd.id);
        
        return (
          <Card key={sfd.id} className="overflow-hidden">
            <CardContent className="p-0">
              <div className="p-4 flex items-center">
                <div className="mr-3 h-10 w-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-700">
                  {sfd.logo_url ? (
                    <img 
                      src={sfd.logo_url} 
                      alt={sfd.name} 
                      className="h-10 w-10 rounded-full object-cover"
                    />
                  ) : (
                    <Building className="h-5 w-5" />
                  )}
                </div>
                <div className="flex-1">
                  <h3 className="font-medium text-slate-800">{sfd.name}</h3>
                  <p className="text-sm text-slate-500">{sfd.region || sfd.code}</p>
                </div>
              </div>
              
              <div className="px-4 pb-4">
                {requestStatus ? (
                  <>
                    {requestStatus === 'pending' && (
                      <div className="bg-amber-50 text-amber-700 px-3 py-2 rounded text-sm mb-2">
                        Votre demande est en cours de traitement
                      </div>
                    )}
                    {requestStatus === 'rejected' && (
                      <div className="flex flex-col gap-2">
                        <div className="bg-red-50 text-red-700 px-3 py-2 rounded text-sm">
                          Votre demande précédente a été rejetée
                        </div>
                        <JoinSfdButton 
                          sfdId={sfd.id} 
                          sfdName={sfd.name} 
                          isRetry={true}
                          onClick={() => onRetry(sfd.id)}
                        />
                      </div>
                    )}
                    {requestStatus === 'approved' && (
                      <div className="bg-green-50 text-green-700 px-3 py-2 rounded text-sm">
                        Votre demande a été approuvée
                      </div>
                    )}
                    {requestStatus === 'pending_validation' && (
                      <div className="flex flex-col gap-2">
                        <div className="bg-blue-50 text-blue-700 px-3 py-2 rounded text-sm">
                          Information complémentaire requise
                        </div>
                        <JoinSfdButton 
                          sfdId={sfd.id} 
                          sfdName={sfd.name} 
                          isEdit={true}
                          onClick={() => onEdit(sfd.id)}
                        />
                      </div>
                    )}
                  </>
                ) : (
                  <JoinSfdButton 
                    sfdId={sfd.id} 
                    sfdName={sfd.name} 
                    onClick={() => onSelectSfd(sfd.id)}
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
