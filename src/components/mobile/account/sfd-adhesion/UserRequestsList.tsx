
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { SfdClientRequest } from '@/components/mobile/profile/sfd-accounts/types/SfdAccountTypes';

interface UserRequestsListProps {
  requests: SfdClientRequest[];
}

const UserRequestsList: React.FC<UserRequestsListProps> = ({ requests }) => {
  const renderRequestStatus = (request: SfdClientRequest) => {
    if (request.status === 'pending') {
      return (
        <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-300">
          En attente
        </Badge>
      );
    } else if (request.status === 'approved') {
      return (
        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-300">
          Approuvée
        </Badge>
      );
    } else if (request.status === 'rejected') {
      return (
        <Badge variant="outline" className="bg-red-50 text-red-700 border-red-300">
          Rejetée
        </Badge>
      );
    }
    return null;
  };

  if (!requests.length) return null;

  return (
    <div className="space-y-3">
      <p className="text-sm font-medium">Vos demandes d'adhésion</p>
      {requests.map(request => (
        <div key={request.id} className="flex items-center justify-between bg-gray-50 p-3 rounded-md">
          <div>
            <p className="font-medium">{request.sfd_name}</p>
            <p className="text-xs text-gray-500">
              {new Date(request.created_at).toLocaleDateString('fr-FR')}
            </p>
          </div>
          {renderRequestStatus(request)}
        </div>
      ))}
    </div>
  );
};

export default UserRequestsList;
