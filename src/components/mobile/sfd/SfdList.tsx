
import React from 'react';
import { Building, MapPin, Clock, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface Sfd {
  id: string;
  name: string;
  code: string;
  region?: string;
  logo_url?: string;
}

interface SfdListProps {
  sfds: Sfd[];
  existingRequests: any[];
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
      <div className="text-center py-8 bg-gray-50 rounded-lg border border-gray-200">
        <Building className="h-12 w-12 text-gray-300 mx-auto mb-3" />
        <p className="text-gray-500">Aucune SFD disponible pour le moment.</p>
      </div>
    );
  }
  
  return (
    <div className="space-y-3">
      {sfds.map(sfd => {
        const existingRequest = existingRequests?.find(r => r.sfd_id === sfd.id);
        const status = existingRequest?.status;
        
        return (
          <div key={sfd.id} className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center">
              <div className="h-12 w-12 bg-lime-100 rounded-full flex items-center justify-center mr-3">
                {sfd.logo_url ? (
                  <img
                    src={sfd.logo_url}
                    alt={`Logo ${sfd.name}`}
                    className="h-8 w-8 object-contain"
                  />
                ) : (
                  <Building className="h-6 w-6 text-lime-600" />
                )}
              </div>
              
              <div className="flex-1">
                <h3 className="font-medium">{sfd.name}</h3>
                <div className="flex items-center text-xs text-gray-500">
                  <MapPin className="h-3 w-3 mr-1" />
                  <span>{sfd.region || sfd.code}</span>
                </div>
              </div>
            </div>
            
            {status === 'pending' ? (
              <div className="mt-3 bg-amber-50 border border-amber-200 rounded p-2">
                <div className="flex items-start">
                  <Clock className="h-4 w-4 text-amber-500 mt-0.5 mr-2 flex-shrink-0" />
                  <div>
                    <p className="text-sm text-amber-800">Demande en attente</p>
                    <div className="mt-2 flex gap-2">
                      <Button 
                        size="sm"
                        variant="outline"
                        className="border-amber-300 text-amber-700 hover:bg-amber-50"
                        onClick={() => onEdit(sfd.id)}
                      >
                        Modifier ma demande
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            ) : status === 'rejected' ? (
              <div className="mt-3 bg-red-50 border border-red-200 rounded p-2">
                <div className="flex items-start">
                  <AlertCircle className="h-4 w-4 text-red-500 mt-0.5 mr-2 flex-shrink-0" />
                  <div>
                    <p className="text-sm text-red-800">Demande rejetée</p>
                    <div className="mt-2">
                      <Button 
                        size="sm"
                        className="bg-red-600 hover:bg-red-700 text-white"
                        onClick={() => onRetry(sfd.id)}
                      >
                        Réessayer
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="mt-3 flex justify-end">
                <Button 
                  size="sm"
                  className="bg-lime-600 hover:bg-lime-700 text-white"
                  onClick={() => onSelectSfd(sfd.id)}
                  disabled={isSubmitting}
                >
                  Adhérer
                </Button>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default SfdList;
