import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { DataTable } from '@/components/shared/DataTable';
import { AmountDisplay } from '@/components/shared/AmountDisplay';
import { DateDisplay } from '@/components/shared/DateDisplay';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { UserPlus, Wallet, Clock, Users, TrendingUp, AlertCircle } from 'lucide-react';
import { Loader } from '@/components/ui/loader';

interface CashierManagementProps {
  sfdId: string;
}

export function CashierManagement({ sfdId }: CashierManagementProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [cashiers, setCashiers] = useState<any[]>([]);
  const [sessions, setSessions] = useState<any[]>([]);
  const [stats, setStats] = useState({
    totalCashiers: 0,
    activeSessions: 0,
    totalOperationsToday: 0,
    totalAmountToday: 0
  });
  
  // New cashier form
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [creating, setCreating] = useState(false);
  const [newCashier, setNewCashier] = useState({
    email: '',
    full_name: '',
    phone: ''
  });

  useEffect(() => {
    if (sfdId) {
      fetchData();
    }
  }, [sfdId]);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Fetch cashiers (users with cashier role linked to this SFD)
      const { data: cashierData, error: cashierError } = await supabase
        .from('user_sfds')
        .select(`
          user_id,
          profiles:user_id(id, full_name, email, phone)
        `)
        .eq('sfd_id', sfdId);

      if (cashierError) throw cashierError;

      // Filter only users with cashier role
      const cashierIds = cashierData?.map(c => c.user_id) || [];
      
      if (cashierIds.length > 0) {
        const { data: roles } = await supabase
          .from('user_roles')
          .select('user_id')
          .eq('role', 'cashier')
          .in('user_id', cashierIds);

        const cashierUserIds = roles?.map(r => r.user_id) || [];
        const filteredCashiers = cashierData?.filter(c => 
          cashierUserIds.includes(c.user_id)
        ) || [];
        
        setCashiers(filteredCashiers.map(c => {
          const profile = c.profiles as { id?: string; full_name?: string; email?: string; phone?: string } | null;
          return {
            id: c.user_id,
            full_name: profile?.full_name || '',
            email: profile?.email || '',
            phone: profile?.phone || ''
          };
        }));
      }

      // Fetch today's sessions
      const today = new Date().toISOString().split('T')[0];
      const { data: sessionData } = await supabase
        .from('cash_sessions')
        .select(`
          *,
          cashier:profiles!cash_sessions_cashier_id_fkey(full_name)
        `)
        .eq('sfd_id', sfdId)
        .gte('opened_at', today)
        .order('opened_at', { ascending: false });

      setSessions(sessionData || []);

      // Calculate stats
      const activeSessions = sessionData?.filter(s => s.status === 'open') || [];
      
      // Get operations count for today
      const sessionIds = sessionData?.map(s => s.id) || [];
      let totalOps = 0;
      let totalAmount = 0;

      if (sessionIds.length > 0) {
        const { data: operations } = await supabase
          .from('cash_operations')
          .select('amount')
          .in('session_id', sessionIds);

        totalOps = operations?.length || 0;
        totalAmount = operations?.reduce((sum, op) => sum + Math.abs(op.amount), 0) || 0;
      }

      setStats({
        totalCashiers: cashiers.length,
        activeSessions: activeSessions.length,
        totalOperationsToday: totalOps,
        totalAmountToday: totalAmount
      });

    } catch (error) {
      console.error('Error fetching cashier data:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de charger les données des caissiers',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const createCashier = async () => {
    try {
      setCreating(true);

      // Create user via edge function (for proper auth setup)
      const { data, error } = await supabase.functions.invoke('create-sfd-user', {
        body: {
          email: newCashier.email,
          full_name: newCashier.full_name,
          phone: newCashier.phone,
          role: 'cashier',
          sfd_id: sfdId
        }
      });

      if (error) throw error;

      if (data?.success) {
        toast({
          title: 'Caissier créé',
          description: `${newCashier.full_name} a été ajouté comme caissier`
        });
        
        setShowCreateDialog(false);
        setNewCashier({ email: '', full_name: '', phone: '' });
        fetchData();
      } else {
        throw new Error(data?.error || 'Erreur lors de la création');
      }
    } catch (error: any) {
      console.error('Error creating cashier:', error);
      toast({
        title: 'Erreur',
        description: error.message || 'Impossible de créer le caissier',
        variant: 'destructive'
      });
    } finally {
      setCreating(false);
    }
  };

  const sessionColumns = [
    {
      header: 'Caissier',
      accessor: (row: any) => row.cashier?.full_name || '-'
    },
    {
      header: 'Station',
      accessor: 'station_name'
    },
    {
      header: 'Ouverture',
      accessor: (row: any) => new Date(row.opened_at).toLocaleTimeString('fr-FR', { 
        hour: '2-digit', 
        minute: '2-digit' 
      })
    },
    {
      header: 'Solde ouverture',
      accessor: (row: any) => <AmountDisplay amount={row.opening_balance} />
    },
    {
      header: 'Solde fermeture',
      accessor: (row: any) => row.closing_balance !== null ? (
        <AmountDisplay amount={row.closing_balance} />
      ) : '-'
    },
    {
      header: 'Statut',
      accessor: (row: any) => (
        <Badge variant={row.status === 'open' ? 'default' : 'secondary'}>
          {row.status === 'open' ? 'En cours' : 'Fermée'}
        </Badge>
      )
    }
  ];

  const cashierColumns = [
    {
      header: 'Nom',
      accessor: 'full_name'
    },
    {
      header: 'Email',
      accessor: 'email'
    },
    {
      header: 'Téléphone',
      accessor: 'phone'
    }
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Caissiers</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalCashiers}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Sessions actives</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.activeSessions}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Opérations (jour)</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalOperationsToday}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Volume (jour)</CardTitle>
            <Wallet className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              <AmountDisplay amount={stats.totalAmountToday} />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Sessions */}
      <Card>
        <CardHeader>
          <CardTitle>Sessions de caisse du jour</CardTitle>
          <CardDescription>
            Historique des sessions ouvertes et fermées aujourd'hui
          </CardDescription>
        </CardHeader>
        <CardContent>
          {sessions.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Clock className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Aucune session aujourd'hui</p>
            </div>
          ) : (
            <DataTable
              data={sessions}
              columns={sessionColumns}
              searchable
              searchPlaceholder="Rechercher une session..."
            />
          )}
        </CardContent>
      </Card>

      {/* Cashiers List */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Caissiers</CardTitle>
            <CardDescription>
              Gérez les comptes caissiers de votre SFD
            </CardDescription>
          </div>
          
          <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
            <DialogTrigger asChild>
              <Button>
                <UserPlus className="h-4 w-4 mr-2" />
                Ajouter un caissier
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Nouveau caissier</DialogTitle>
                <DialogDescription>
                  Créez un compte caissier pour votre SFD
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="full_name">Nom complet</Label>
                  <Input
                    id="full_name"
                    value={newCashier.full_name}
                    onChange={(e) => setNewCashier(prev => ({ ...prev, full_name: e.target.value }))}
                    placeholder="Jean Dupont"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={newCashier.email}
                    onChange={(e) => setNewCashier(prev => ({ ...prev, email: e.target.value }))}
                    placeholder="caissier@sfd.com"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="phone">Téléphone</Label>
                  <Input
                    id="phone"
                    value={newCashier.phone}
                    onChange={(e) => setNewCashier(prev => ({ ...prev, phone: e.target.value }))}
                    placeholder="+223 XX XX XX XX"
                  />
                </div>
              </div>
              
              <div className="flex justify-end gap-3">
                <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                  Annuler
                </Button>
                <Button 
                  onClick={createCashier} 
                  disabled={creating || !newCashier.email || !newCashier.full_name}
                >
                  {creating && <Loader size="sm" className="mr-2" />}
                  Créer le caissier
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </CardHeader>
        <CardContent>
          {cashiers.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Aucun caissier enregistré</p>
              <Button 
                variant="outline" 
                className="mt-4"
                onClick={() => setShowCreateDialog(true)}
              >
                <UserPlus className="h-4 w-4 mr-2" />
                Ajouter le premier caissier
              </Button>
            </div>
          ) : (
            <DataTable
              data={cashiers}
              columns={cashierColumns}
              searchable
              searchPlaceholder="Rechercher un caissier..."
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
