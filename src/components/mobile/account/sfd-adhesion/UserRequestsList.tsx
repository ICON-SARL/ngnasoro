
import React from 'react';
import { SfdClientRequest } from '@/components/mobile/profile/sfd-accounts/types/SfdAccountTypes';
import { Badge } from '@/components/ui/badge';
import { formatDate } from '@/utils/formatters';
import { JoinSfdButton } from '@/components/mobile/sfd/JoinSfdButton';

interface UserRequestsListProps {
  requests: SfdClientRequest[];
  onRequestUpdated?: () => void;
}

const UserRequestsList: React.FC<UserRequestsListProps> = ({ requests, onRequestUpdated }) => {
  if (requests.length === 0) {
    return null;
  }
  
  const getStatusColor = (status: 'pending' | 'approved' | 'rejected') => {
    switch (status) {
      case 'pending':
        return { bg: 'bg-yellow-100', text: 'text-yellow-800', variant: 'outline' as const };
      case 'approved':
        return { bg: 'bg-green-100', text: 'text-green-800', variant: 'outline' as const };
      case 'rejected':
        return { bg: 'bg-red-100', text: 'text-red-800', variant: 'outline' as const };
    }
  };
  
  const getStatusText = (status: 'pending' | 'approved' | 'rejected') => {
    switch (status) {
      case 'pending':
        return 'En attente';
      case 'approved':
        return 'Approuvée';
      case 'rejected':
        return 'Rejetée';
    }
  };
  
  return (
    <div>
      <h3 className="font-medium text-sm mb-3">Demandes d'adhésion</h3>
      <div className="space-y-2">
        {requests.map(request => {
          const statusStyle = getStatusColor(request.status);
          
          return (
            <div 
              key={request.id}
              className="p-3 bg-white border border-gray-200 rounded-md"
            >
              <div className="flex justify-between items-start mb-2">
                <div>
                  <p className="font-medium">{request.sfd_name}</p>
                  <p className="text-xs text-gray-500">
                    Demande du {formatDate(request.created_at)}
                  </p>
                </div>
                <Badge 
                  variant={statusStyle.variant}
                  className={`${statusStyle.bg} ${statusStyle.text} border-0`}
                >
                  {getStatusText(request.status)}
                </Badge>
              </div>
              
              {request.status === 'rejected' && (
                <div className="mt-2">
                  <JoinSfdButton 
                    sfdId={request.sfd_id} 
                    sfdName={request.sfd_name || 'SFD'} 
                    isRetry={true}
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default UserRequestsList;
