
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';

interface PendingRequest {
  id: string;
  created_at: string;
}

interface PendingRequestsListProps {
  requests: PendingRequest[];
}

const PendingRequestsList: React.FC<PendingRequestsListProps> = ({ requests }) => {
  return (
    <div className="mb-6">
      <h3 className="font-medium text-lg mb-2">Demandes en cours</h3>
      <div className="space-y-2">
        {requests.map(request => (
          <Card key={request.id} className="bg-amber-50 border-amber-200">
            <CardContent className="p-3 flex justify-between items-center">
              <div>
                <p className="font-medium">Demande en attente</p>
                <p className="text-sm text-muted-foreground">
                  {new Date(request.created_at).toLocaleDateString()}
                </p>
              </div>
              <div>
                <span className="px-2 py-1 bg-amber-100 text-amber-800 rounded text-xs">
                  En attente
                </span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default PendingRequestsList;
