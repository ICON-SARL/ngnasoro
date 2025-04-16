import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Building } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';

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
  onSelectSfd?: (sfdId: string) => void;
}

const SfdList: React.FC<SfdListProps> = ({
  sfds,
  existingRequests,
  isSubmitting,
  onSelectSfd,
}) => {
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSfdClick = (sfd: Sfd) => {
    const existingRequest = existingRequests.find(req => req.sfd_id === sfd.id);
    
    if (existingRequest) {
      if (existingRequest.status === 'pending') {
        toast({
          title: "Demande en cours",
          description: "Vous avez déjà une demande en attente pour cette SFD",
        });
      } else if (onSelectSfd) {
        onSelectSfd(sfd.id);
      }
      return;
    }
    
    navigate(`/mobile-flow/sfd-adhesion/${sfd.id}`);
  };

  if (sfds.length === 0) {
    return (
      <div className="text-center p-6 bg-gray-50 rounded-lg">
        <Building className="h-12 w-12 mx-auto text-gray-400 mb-2" />
        <p className="text-gray-600">Aucune SFD disponible pour le moment</p>
      </div>
    );
  }

  return (
    <div className="grid gap-4">
      {sfds.map((sfd) => (
        <Card 
          key={sfd.id}
          className="cursor-pointer hover:bg-gray-50 transition-colors"
          onClick={() => handleSfdClick(sfd)}
        >
          <CardContent className="p-4 flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="h-12 w-12 bg-primary/10 rounded-full flex items-center justify-center">
                {sfd.logo_url ? (
                  <img 
                    src={sfd.logo_url} 
                    alt={sfd.name}
                    className="h-8 w-8 rounded-full object-cover"
                  />
                ) : (
                  <Building className="h-6 w-6 text-primary" />
                )}
              </div>
              <div>
                <h3 className="font-medium">{sfd.name}</h3>
                <p className="text-sm text-muted-foreground">
                  {sfd.region || sfd.code}
                </p>
              </div>
            </div>
            <Button 
              variant="secondary" 
              className="ml-4"
              disabled={existingRequests.some(req => req.sfd_id === sfd.id)}
            >
              {existingRequests.some(req => req.sfd_id === sfd.id && req.status === 'pending') 
                ? 'Demande en cours'
                : 'Rejoindre'}
            </Button>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default SfdList;
