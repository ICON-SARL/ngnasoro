import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { supabase } from '@/integrations/supabase/client';
import { Alert, AlertDescription } from '@/components/ui/alert';

export default function SfdSelector() {
  const [sfds, setSfds] = useState<any[]>([]);
  const [pendingRequests, setPendingRequests] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const { user, activeSfd, setActiveSfd } = useAuth();
  const { toast } = useToast();
  
  useEffect(() => {
    const loadSfds = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        const { data: sfdsData } = await supabase
          .from('sfds')
          .select('*')
          .eq('status', 'active')
          .order('name');
        
        if (sfdsData) {
          setSfds(sfdsData);
        }
        
        // Load user's pending adhesion requests
        if (user?.id) {
          const { data: requestsData, error: requestsError } = await supabase
            .from('client_adhesion_requests')
            .select('*')
            .eq('user_id', user.id)
            .in('status', ['pending', 'in_review', 'verification_pending']);
            
          if (!requestsError && requestsData) {
            setPendingRequests(requestsData);
          }
        }
      } catch (err) {
        console.error('Error loading SFDs:', err);
        setError(err instanceof Error ? err.message : "Failed to fetch SFDs");
      } finally {
        setIsLoading(false);
      }
    };
    
    loadSfds();
  }, [user]);
  
  const handleSfdSelect = async (sfd: any) => {
    if (!user) {
      toast({
        title: "Erreur",
        description: "Vous devez être connecté pour sélectionner une SFD",
        variant: "destructive",
      });
      return;
    }
    
    try {
      setActiveSfd(sfd);
      
      toast({
        title: "SFD sélectionnée",
        description: `Vous avez sélectionné ${sfd.name} comme SFD active`,
      });
      
      navigate('/mobile-flow/home');
    } catch (err) {
      console.error("Error setting active SFD:", err);
      toast({
        title: "Erreur",
        description: "Impossible de sélectionner cette SFD",
        variant: "destructive",
      });
    }
  };
  
  const handleJoinSfd = () => {
    navigate('/mobile-flow/sfd-join');
  };
  
  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center p-6">
          Chargement des SFD...
        </CardContent>
      </Card>
    );
  }
  
  if (error) {
    return (
      <Card>
        <CardContent className="p-4">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4 mr-2" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card className="w-full">
      <CardContent className="p-4">
        <h2 className="text-lg font-semibold mb-4">
          Sélectionnez votre SFD
        </h2>
        
        {sfds.length === 0 ? (
          <Alert variant="info">
            <AlertCircle className="h-4 w-4 mr-2" />
            <AlertDescription>
              Aucune SFD active trouvée.
            </AlertDescription>
          </Alert>
        ) : (
          <div className="space-y-3">
            {sfds.map((sfd) => (
              <div key={sfd.id} className="border rounded-md">
                <div className="flex items-center justify-between p-3">
                  <div>
                    <h3 className="text-sm font-medium">{sfd.name}</h3>
                    <p className="text-xs text-gray-500">{sfd.description}</p>
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleSfdSelect(sfd)}
                  >
                    {activeSfd?.id === sfd.id ? (
                      <>
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Sélectionnée
                      </>
                    ) : (
                      "Sélectionner"
                    )}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
        
        <Separator className="my-4" />
        
        <Accordion type="single" collapsible className="w-full">
          <AccordionItem value="pending-requests">
            <AccordionTrigger>
              Demandes d'adhésion en attente ({pendingRequests.length})
            </AccordionTrigger>
            <AccordionContent>
              {pendingRequests.length === 0 ? (
                <p className="text-sm text-gray-500">
                  Aucune demande en attente pour le moment.
                </p>
              ) : (
                <ul className="list-none p-0">
                  {pendingRequests.map((request) => (
                    <li key={request.id} className="py-2 border-b last:border-b-0">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium">{request.full_name}</p>
                          <p className="text-xs text-gray-500">
                            SFD: {request.sfd_id} - Statut: {request.status}
                          </p>
                        </div>
                        <Badge variant="secondary">{request.status}</Badge>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </AccordionContent>
          </AccordionItem>
        </Accordion>
        
        <Button 
          variant="secondary" 
          className="w-full mt-4"
          onClick={handleJoinSfd}
        >
          Rejoindre une SFD
        </Button>
      </CardContent>
    </Card>
  );
}
