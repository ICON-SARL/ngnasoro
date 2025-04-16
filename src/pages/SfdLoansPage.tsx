
import React, { useState, useEffect } from 'react';
import { SfdHeader } from '@/components/sfd/SfdHeader';
import { Card, CardContent } from '@/components/ui/card';
import { LoanManagement } from '@/components/sfd/LoanManagement';
import { setupLoanRealtimeSubscription } from '@/services/loans/loanRealtimeService';
import { useToast } from '@/hooks/use-toast';
import { Bell } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

const SfdLoansPage: React.FC = () => {
  const { toast } = useToast();
  const [hasUpdates, setHasUpdates] = useState(false);
  
  // Set up global loan update notifications
  useEffect(() => {
    // Function to handle loan updates at the page level
    const handleLoanUpdate = (update: any) => {
      console.log('Loan update received in SfdLoansPage:', update);
      setHasUpdates(true);
      
      // Show toast notification for new loan applications
      if (update.status === 'pending' && !update.updated_at) {
        toast({
          title: 'Nouvelle demande de prêt',
          description: 'Une nouvelle demande de prêt a été reçue',
        });
      }
    };
    
    // Subscribe to all loan updates
    const cleanup = setupLoanRealtimeSubscription(handleLoanUpdate);
    
    return cleanup;
  }, [toast]);
  
  // Reset updates flag when loans are refreshed
  const handleLoansRefresh = () => {
    setHasUpdates(false);
  };
  
  return (
    <div className="min-h-screen bg-gray-50">
      <SfdHeader />
      
      <main className="container mx-auto p-4 md:p-6">
        <div className="mb-6 flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold">Gestion des Prêts</h2>
            <p className="text-muted-foreground">
              Gérez les prêts, demandes de crédit et approuver les applications
            </p>
          </div>
          
          {hasUpdates && (
            <Badge variant="outline" className="bg-amber-50 text-amber-800 flex items-center gap-1 px-3 py-1">
              <Bell className="h-4 w-4" />
              Mises à jour disponibles
            </Badge>
          )}
        </div>
        
        <Card>
          <CardContent className="p-6">
            <LoanManagement onRefresh={handleLoansRefresh} />
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default SfdLoansPage;
