
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus } from 'lucide-react';
import { useSubsidyRequests } from '@/hooks/useSubsidyRequests';
import { useNavigate } from 'react-router-dom';
import { Skeleton } from '@/components/ui/skeleton';

export const PendingSubsidies = () => {
  const navigate = useNavigate();
  const { subsidyRequests, isLoading } = useSubsidyRequests({ status: 'pending' });
  
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'XOF' })
      .format(amount)
      .replace(/\u00a0/g, ' ');
  };
  
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: '2-digit'
    });
  };
  
  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return <Badge className="bg-red-100 text-red-800">Urgent</Badge>;
      case 'high':
        return <Badge className="bg-orange-100 text-orange-800">Élevée</Badge>;
      case 'normal':
        return <Badge className="bg-blue-100 text-blue-800">Normale</Badge>;
      case 'low':
        return <Badge className="bg-green-100 text-green-800">Basse</Badge>;
      default:
        return <Badge className="bg-gray-100 text-gray-800">{priority}</Badge>;
    }
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Demandes de Subvention</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-4">
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-16 w-full" />
          </div>
        ) : subsidyRequests.length === 0 ? (
          <div className="text-center py-6">
            <p className="text-muted-foreground mb-4">Aucune demande en attente</p>
            <Button 
              onClick={() => navigate('/sfd-subsidy-requests?tab=create')}
              className="bg-[#0D6A51] hover:bg-[#0D6A51]/90"
            >
              <Plus className="h-4 w-4 mr-1" />
              Nouvelle Demande
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {subsidyRequests.slice(0, 3).map((request) => (
              <div key={request.id} className="border rounded p-3 flex justify-between items-center">
                <div>
                  <p className="font-medium truncate max-w-[180px]">{request.purpose}</p>
                  <div className="mt-1">{getPriorityBadge(request.priority)}</div>
                </div>
                <div className="text-right">
                  <p className="font-bold">{formatCurrency(request.amount)}</p>
                  <p className="text-xs text-muted-foreground">{formatDate(request.created_at)}</p>
                  <Button 
                    variant="outline" 
                    size="sm"
                    className="mt-2"
                    onClick={() => navigate(`/sfd-subsidy-requests/${request.id}`)}
                  >
                    Détails
                  </Button>
                </div>
              </div>
            ))}
            
            {subsidyRequests.length > 3 && (
              <Button 
                variant="link" 
                className="w-full text-[#0D6A51]" 
                onClick={() => navigate('/sfd-subsidy-requests')}
              >
                Voir toutes les demandes ({subsidyRequests.length})
              </Button>
            )}
            
            <Button 
              className="w-full bg-[#0D6A51] hover:bg-[#0D6A51]/90"
              onClick={() => navigate('/sfd-subsidy-requests?tab=create')}
            >
              <Plus className="h-4 w-4 mr-1" />
              Nouvelle Demande
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
