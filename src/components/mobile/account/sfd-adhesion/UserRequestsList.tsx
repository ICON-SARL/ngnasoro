
import React, { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Edit, Eye } from 'lucide-react';
import { SfdClientRequest } from '@/components/mobile/profile/sfd-accounts/types/SfdAccountTypes';
import { EditAdhesionRequestDialog } from '@/components/mobile/profile/sfd-accounts/EditAdhesionRequestDialog';

interface UserRequestsListProps {
  requests: SfdClientRequest[];
  onRequestUpdated: () => void;
}

const UserRequestsList: React.FC<UserRequestsListProps> = ({ requests, onRequestUpdated }) => {
  const [selectedRequest, setSelectedRequest] = useState<SfdClientRequest | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

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

  const handleEdit = (request: SfdClientRequest) => {
    setSelectedRequest(request);
    setIsEditDialogOpen(true);
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
          <div className="flex items-center gap-2">
            {renderRequestStatus(request)}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleEdit(request)}
              disabled={request.status !== 'rejected'}
            >
              <Edit className="h-4 w-4" />
              <span className="sr-only">Modifier</span>
            </Button>
            <Button variant="ghost" size="sm">
              <Eye className="h-4 w-4" />
              <span className="sr-only">Voir détails</span>
            </Button>
          </div>
        </div>
      ))}

      {selectedRequest && (
        <EditAdhesionRequestDialog
          requestId={selectedRequest.id}
          isOpen={isEditDialogOpen}
          onClose={() => {
            setIsEditDialogOpen(false);
            setSelectedRequest(null);
          }}
          initialData={{
            full_name: selectedRequest.full_name || '',
            email: selectedRequest.email || '',
            phone: selectedRequest.phone || '',
          }}
          onRequestUpdated={onRequestUpdated}
        />
      )}
    </div>
  );
};

export default UserRequestsList;
