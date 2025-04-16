
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Building } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { SfdListItem } from './SfdListItem';

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
        >
          <SfdListItem
            sfd={sfd}
            isPending={existingRequests.some(
              req => req.sfd_id === sfd.id && req.status === 'pending'
            )}
            onClick={() => handleSfdClick(sfd)}
          />
        </Card>
      ))}
    </div>
  );
};

export default SfdList;
