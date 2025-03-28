
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/hooks/auth';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Users, Building, CircleDollarSign, ArrowLeftRight, UserPlus } from 'lucide-react';
import { LoanManagement } from '@/components/sfd/LoanManagement';
import { supabase } from '@/integrations/supabase/client';

export default function AgencyDashboard() {
  const { user, session, activeSfdId } = useAuth();
  const navigate = useNavigate();
  const [sfdName, setSfdName] = useState('');
  const [clientsCount, setClientsCount] = useState(0);
  const [loansCount, setLoansCount] = useState(0);
  const [activeLoanAmount, setActiveLoanAmount] = useState(0);

  // Verify user is SFD admin
  useEffect(() => {
    if (session && user?.app_metadata?.role !== 'sfd_admin') {
      navigate('/auth?sfd=true');
    }
  }, [session, user, navigate]);

  // Load SFD info
  useEffect(() => {
    if (activeSfdId) {
      const loadSfdInfo = async () => {
        try {
          // Get SFD name
          const { data: sfdData, error: sfdError } = await supabase
            .from('sfds')
            .select('name')
            .eq('id', activeSfdId)
            .single();
          
          if (sfdError) throw sfdError;
          setSfdName(sfdData.name);
          
          // Get clients count
          const { count: clientsCount, error: clientsError } = await supabase
            .from('sfd_clients')
            .select('id', { count: 'exact', head: true })
            .eq('sfd_id', activeSfdId);
          
          if (clientsError) throw clientsError;
          setClientsCount(clientsCount || 0);
          
          // Get loans count
          const { count: loansCount, error: loansError } = await supabase
            .from('sfd_loans')
            .select('id', { count: 'exact', head: true })
            .eq('sfd_id', activeSfdId);
          
          if (loansError) throw loansError;
          setLoansCount(loansCount || 0);
          
          // Get active loans amount
          const { data: activeLoansData, error: activeLoansError } = await supabase
            .from('sfd_loans')
            .select('amount')
            .eq('sfd_id', activeSfdId)
            .eq('status', 'active');
          
          if (activeLoansError) throw activeLoansError;
          const totalAmount = activeLoansData.reduce((sum, loan) => sum + (loan.amount || 0), 0);
          setActiveLoanAmount(totalAmount);
          
        } catch (error) {
          console.error('Error loading SFD info:', error);
        }
      };
      
      loadSfdInfo();
    }
  }, [activeSfdId]);

  if (!user || !session) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#0D6A51]"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Tableau de Bord SFD</h1>
          <p className="text-muted-foreground">
            {sfdName} - {user.user_metadata?.full_name || user.email}
          </p>
        </div>
        <Button variant="outline" onClick={() => navigate('/auth')}>
          Déconnexion
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Clients</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{clientsCount}</div>
            <Button 
              variant="link" 
              className="p-0 h-auto text-xs text-muted-foreground"
              onClick={() => navigate('/clients')}
            >
              Gérer les clients
            </Button>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Prêts</CardTitle>
            <CircleDollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{loansCount}</div>
            <Button 
              variant="link" 
              className="p-0 h-auto text-xs text-muted-foreground"
              onClick={() => navigate('/loans')}
            >
              Gérer les prêts
            </Button>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Prêts actifs</CardTitle>
            <Building className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeLoanAmount.toLocaleString()} FCFA</div>
            <p className="text-xs text-muted-foreground">Total des prêts en cours</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Nouveau Client</CardTitle>
            <UserPlus className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <Button 
              className="w-full mt-2" 
              onClick={() => navigate('/clients')}
            >
              Ajouter
            </Button>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="loans" className="space-y-4">
        <TabsList>
          <TabsTrigger value="loans">Prêts</TabsTrigger>
          <TabsTrigger value="clients">Clients</TabsTrigger>
          <TabsTrigger value="subsidies">Subventions</TabsTrigger>
          <TabsTrigger value="reports">Rapports</TabsTrigger>
        </TabsList>
        
        <TabsContent value="loans">
          <LoanManagement />
        </TabsContent>
        
        <TabsContent value="clients">
          <Card>
            <CardHeader>
              <CardTitle>Gestion des Clients</CardTitle>
              <CardDescription>
                Gérez les clients de votre SFD
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button onClick={() => navigate('/clients')}>
                Aller à la gestion des clients
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
