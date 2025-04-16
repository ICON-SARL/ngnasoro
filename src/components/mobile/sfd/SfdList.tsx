
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface SfdListProps {
  sfds: Array<{
    id: string;
    name: string;
    region?: string;
    logo_url?: string;
  }>;
  existingRequests: Array<{
    sfd_id: string;
    status: string;
  }>;
  isSubmitting: boolean;
  onSelectSfd: (sfdId: string) => void;
  onRetry?: (sfdId: string) => void;
}

export default function SfdList({
  sfds,
  existingRequests,
  isSubmitting,
  onSelectSfd,
  onRetry
}: SfdListProps) {
  const getRequestStatus = (sfdId: string) => {
    const request = existingRequests.find(r => r.sfd_id === sfdId);
    return request?.status;
  };

  return (
    <div className="space-y-4">
      {sfds.map((sfd) => {
        const status = getRequestStatus(sfd.id);
        
        return (
          <Card key={sfd.id} className="relative overflow-hidden">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  {sfd.logo_url ? (
                    <img 
                      src={sfd.logo_url} 
                      alt={sfd.name} 
                      className="w-12 h-12 object-contain"
                    />
                  ) : (
                    <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                      <span className="text-lg font-semibold text-gray-400">
                        {sfd.name.charAt(0)}
                      </span>
                    </div>
                  )}
                  
                  <div>
                    <h3 className="font-medium text-lg">{sfd.name}</h3>
                    {sfd.region && (
                      <p className="text-sm text-muted-foreground">{sfd.region}</p>
                    )}
                  </div>
                </div>

                <div>
                  {status === 'pending' ? (
                    <Badge variant="outline" className="bg-yellow-50 text-yellow-600 border-yellow-200">
                      En attente
                    </Badge>
                  ) : status === 'approved' ? (
                    <Badge variant="outline" className="bg-green-50 text-green-600 border-green-200">
                      Approuvée
                    </Badge>
                  ) : status === 'rejected' ? (
                    <>
                      <Badge variant="outline" className="bg-red-50 text-red-600 border-red-200 mb-2">
                        Rejetée
                      </Badge>
                      {onRetry && (
                        <Button
                          variant="outline"
                          size="sm"
                          disabled={isSubmitting}
                          onClick={() => onRetry(sfd.id)}
                          className="ml-2"
                        >
                          Réessayer
                        </Button>
                      )}
                    </>
                  ) : (
                    <Button
                      onClick={() => onSelectSfd(sfd.id)}
                      disabled={isSubmitting}
                      className="bg-[#0D6A51] hover:bg-[#0D6A51]/90"
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Patientez...
                        </>
                      ) : (
                        'Rejoindre'
                      )}
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}

      {sfds.length === 0 && (
        <Card className="p-6 text-center text-muted-foreground">
          Aucune SFD disponible pour le moment
        </Card>
      )}
    </div>
  );
}
