import React, { useState, useEffect } from 'react';
import { SuperAdminHeader } from '@/components/SuperAdminHeader';
import { Footer } from '@/components';
import { SfdApprovalQueue } from '@/components/admin/meref/sfd-approval/SfdApprovalQueue';
import { SfdApprovalForm } from '@/components/admin/meref/sfd-approval/SfdApprovalForm';
import { SfdApprovalHistory } from '@/components/admin/meref/sfd-approval/SfdApprovalHistory';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface SfdPending {
  id: string;
  name: string;
  code: string;
  region: string;
  contact_email: string;
  phone: string;
  status: string;
  submitted_at: string;
  description: string;
  address: string;
}

export default function SfdApprovalManagementPage() {
  const [pendingSfds, setPendingSfds] = useState<SfdPending[]>([]);
  const [selectedSfd, setSelectedSfd] = useState<SfdPending | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchPendingSfds();
  }, []);

  const fetchPendingSfds = async () => {
    try {
      setIsLoading(true);
      
      const { data, error } = await supabase
        .from('sfds')
        .select('*')
        .eq('status', 'pending')
        .order('created_at', { ascending: false });

      if (error) throw error;

      setPendingSfds(data || []);
    } catch (error: any) {
      console.error('Error fetching pending SFDs:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de charger les demandes en attente',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectSfd = (sfd: SfdPending) => {
    setSelectedSfd(sfd);
  };

  const handleApproved = () => {
    setSelectedSfd(null);
    fetchPendingSfds();
  };

  const handleRejected = () => {
    setSelectedSfd(null);
    fetchPendingSfds();
  };

  const handleCancel = () => {
    setSelectedSfd(null);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <SuperAdminHeader />
      
      <main className="flex-1 container mx-auto p-4 md:p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold">Approbation des SFDs</h1>
          <p className="text-muted-foreground">
            Examiner et approuver les demandes d'enregistrement des structures de microfinance
          </p>
        </div>

        <Tabs defaultValue="pending" className="space-y-6">
          <TabsList>
            <TabsTrigger value="pending">
              En Attente ({pendingSfds.length})
            </TabsTrigger>
            <TabsTrigger value="history">
              Historique
            </TabsTrigger>
          </TabsList>

          <TabsContent value="pending" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <SfdApprovalQueue 
                pendingSfds={pendingSfds}
                isLoading={isLoading}
                onSelectSfd={handleSelectSfd}
              />
              <SfdApprovalForm
                sfd={selectedSfd}
                onApproved={handleApproved}
                onRejected={handleRejected}
                onCancel={handleCancel}
              />
            </div>
          </TabsContent>

          <TabsContent value="history">
            <SfdApprovalHistory />
          </TabsContent>
        </Tabs>
      </main>
      
      <Footer />
    </div>
  );
}
