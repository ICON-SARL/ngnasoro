
import React, { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Clock, ExternalLink } from 'lucide-react';

interface PendingRequest {
  id: string;
  sfd_name: string;
  amount: number;
  purpose: string;
  created_at: string;
  priority: 'low' | 'normal' | 'high' | 'urgent';
}

export function PendingSubsidies() {
  const [pendingRequests, setPendingRequests] = useState<PendingRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    async function fetchPendingRequests() {
      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from('subsidy_requests')
          .select(`
            id,
            amount,
            purpose,
            created_at,
            priority,
            sfds:sfd_id (id, name)
          `)
          .eq('status', 'pending')
          .order('priority', { ascending: false })
          .order('created_at', { ascending: false })
          .limit(5);
        
        if (error) throw error;
        
        // Mock data since we don't have the actual DB yet
        const mockData = [
          {
            id: "1",
            sfd_name: "RCPB Ouagadougou",
            amount: 25000000,
            purpose: "Financement des activités agricoles",
            created_at: "2023-05-15T10:30:00Z",
            priority: "high" as 'low' | 'normal' | 'high' | 'urgent'
          },
          {
            id: "2",
            sfd_name: "Microcred Abidjan",
            amount: 15000000,
            purpose: "Programme de microfinance pour femmes entrepreneures",
            created_at: "2023-05-10T09:15:00Z",
            priority: "normal" as 'low' | 'normal' | 'high' | 'urgent'
          },
          {
            id: "3",
            sfd_name: "FUCEC Lomé",
            amount: 40000000,
            purpose: "Extension des services financiers dans les zones rurales",
            created_at: "2023-05-05T11:45:00Z",
            priority: "urgent" as 'low' | 'normal' | 'high' | 'urgent'
          }
        ];
        
        setPendingRequests(mockData);
      } catch (error) {
        console.error('Error fetching pending requests:', error);
      } finally {
        setIsLoading(false);
      }
    }
    
    fetchPendingRequests();
  }, []);

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', { 
      style: 'currency', 
      currency: 'XOF',
      maximumFractionDigits: 0
    }).format(amount);
  };
  
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR');
  };
  
  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return <Badge className="bg-red-100 text-red-800">Urgent</Badge>;
      case 'high':
        return <Badge className="bg-amber-100 text-amber-800">Haute</Badge>;
      case 'normal':
        return <Badge className="bg-blue-100 text-blue-800">Normale</Badge>;
      case 'low':
        return <Badge className="bg-green-100 text-green-800">Basse</Badge>;
      default:
        return <Badge className="bg-gray-100 text-gray-800">{priority}</Badge>;
    }
  };
  
  const viewAllRequests = () => {
    navigate('/super-admin?tab=subsidy_requests');
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div className="flex items-center">
          <Clock className="h-4 w-4 text-amber-500 mr-2" />
          <CardTitle className="text-md font-medium">Demandes en attente</CardTitle>
        </div>
        <Button variant="ghost" size="sm" onClick={viewAllRequests}>
          <ExternalLink className="h-4 w-4 mr-1" />
          Tout voir
        </Button>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-3">
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
          </div>
        ) : pendingRequests.length === 0 ? (
          <div className="text-center py-6 text-muted-foreground">
            <p>Aucune demande en attente</p>
          </div>
        ) : (
          <div className="space-y-3">
            {pendingRequests.map((request) => (
              <div key={request.id} className="border rounded-md p-3">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <div className="font-medium">{request.sfd_name}</div>
                    <div className="text-sm text-muted-foreground truncate max-w-[200px]">
                      {request.purpose}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold">{formatAmount(request.amount)}</div>
                    <div className="text-xs text-muted-foreground">
                      {formatDate(request.created_at)}
                    </div>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  {getPriorityBadge(request.priority)}
                  <Button 
                    size="sm" 
                    variant="outline" 
                    onClick={() => navigate(`/subsidy-request/${request.id}`)}
                  >
                    Examiner
                  </Button>
                </div>
              </div>
            ))}
            {pendingRequests.length > 0 && (
              <div className="pt-2 text-center">
                <Button variant="link" onClick={viewAllRequests}>
                  Voir toutes les demandes
                </Button>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
