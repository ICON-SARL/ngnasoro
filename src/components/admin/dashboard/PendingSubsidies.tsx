
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { PendingRequest } from '@/hooks/useAdminDashboardData';
import { useNavigate } from 'react-router-dom';

interface PendingSubsidiesProps {
  pendingRequests?: PendingRequest[];
  isLoading?: boolean;
}

export const PendingSubsidies: React.FC<PendingSubsidiesProps> = ({ 
  pendingRequests = [], 
  isLoading = false 
}) => {
  const navigate = useNavigate();

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-FR').format(amount) + ' XOF';
  };

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('fr-FR', { day: '2-digit', month: '2-digit', year: '2-digit' }).format(date);
  };

  // Get priority badge color
  const getPriorityBadgeColor = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return 'bg-red-100 text-red-600 hover:bg-red-100';
      case 'high':
        return 'bg-orange-100 text-orange-600 hover:bg-orange-100';
      case 'normal':
        return 'bg-blue-100 text-blue-600 hover:bg-blue-100';
      case 'low':
        return 'bg-green-100 text-green-600 hover:bg-green-100';
      default:
        return 'bg-gray-100 text-gray-600 hover:bg-gray-100';
    }
  };

  // Get priority label in French
  const getPriorityLabel = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return 'Urgent';
      case 'high':
        return 'Élevée';
      case 'normal':
        return 'Normale';
      case 'low':
        return 'Basse';
      default:
        return priority;
    }
  };

  const handleExamine = (requestId: string) => {
    navigate(`/subsidy-requests/${requestId}`);
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle className="text-lg">Demandes en attente</CardTitle>
            <CardDescription>
              {pendingRequests.length} demande{pendingRequests.length !== 1 ? 's' : ''} en attente d'approbation
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="py-8 text-center text-gray-500">Chargement des demandes...</div>
        ) : pendingRequests.length === 0 ? (
          <div className="py-8 text-center text-gray-500">Aucune demande en attente</div>
        ) : (
          <div className="space-y-4">
            {pendingRequests.slice(0, 3).map((request) => (
              <div key={request.id} className="p-4 border rounded-lg bg-white">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-medium">{request.sfd_name}</h4>
                    <p className="text-sm text-gray-500 truncate max-w-[250px]">
                      {request.purpose}
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="font-bold">
                      {formatCurrency(request.amount)}
                    </div>
                    <div className="text-xs text-gray-500">{formatDate(request.created_at)}</div>
                  </div>
                </div>
                <div className="flex items-center justify-between mt-4">
                  <Badge className={`font-normal ${getPriorityBadgeColor(request.priority)}`}>
                    {getPriorityLabel(request.priority)}
                  </Badge>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => handleExamine(request.id)}
                  >
                    Examiner
                  </Button>
                </div>
              </div>
            ))}

            {pendingRequests.length > 3 && (
              <Button 
                variant="link" 
                className="w-full text-sm text-[#0D6A51]"
                onClick={() => navigate('/subsidy-requests')}
              >
                Voir toutes les demandes
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
