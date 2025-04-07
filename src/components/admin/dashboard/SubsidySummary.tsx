
import React, { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileDown, PieChart } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

interface SubsidySummaryStats {
  totalAmount: number;
  allocatedAmount: number;
  pendingRequests: number;
  activeSfds: number;
  recentApprovals: {
    sfd_name: string;
    amount: number;
    date: string;
  }[];
}

export function SubsidySummary() {
  const [stats, setStats] = useState<SubsidySummaryStats>({
    totalAmount: 0,
    allocatedAmount: 0,
    pendingRequests: 0,
    activeSfds: 0,
    recentApprovals: []
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      setIsLoading(true);
      try {
        // Get total subsidies amount
        const { data: subsidiesData, error: subsidiesError } = await supabase
          .from('sfd_subsidies')
          .select('amount');
        
        if (subsidiesError) throw subsidiesError;
        
        // Get allocated amount (used)
        const { data: allocatedData, error: allocatedError } = await supabase
          .from('sfd_subsidies')
          .select('used_amount');
        
        if (allocatedError) throw allocatedError;
        
        // Get pending subsidy requests
        const { data: pendingData, error: pendingError } = await supabase
          .from('subsidy_requests')
          .select('*')
          .eq('status', 'pending');
        
        if (pendingError) throw pendingError;
        
        // Get active SFDs
        const { data: sfdsData, error: sfdsError } = await supabase
          .from('sfds')
          .select('*')
          .eq('status', 'active');
        
        if (sfdsError) throw sfdsError;
        
        // Get recent approvals
        const { data: recentData, error: recentError } = await supabase
          .from('subsidy_requests')
          .select(`
            amount, 
            reviewed_at,
            sfds:sfd_id (name)
          `)
          .eq('status', 'approved')
          .order('reviewed_at', { ascending: false })
          .limit(5);
        
        if (recentError) throw recentError;
        
        const totalAmount = subsidiesData.reduce((sum, item) => sum + (item.amount || 0), 0);
        const allocatedAmount = allocatedData.reduce((sum, item) => sum + (item.used_amount || 0), 0);
        
        const recentApprovals = recentData.map(item => ({
          sfd_name: item.sfds?.name || 'Unknown SFD',
          amount: item.amount,
          date: new Date(item.reviewed_at).toLocaleDateString()
        }));
        
        setStats({
          totalAmount,
          allocatedAmount,
          pendingRequests: pendingData.length,
          activeSfds: sfdsData.length,
          recentApprovals
        });
      } catch (error) {
        console.error('Error fetching subsidy stats:', error);
      } finally {
        setIsLoading(false);
      }
    }
    
    fetchStats();
    
    // Set up real-time subscription for updates
    const subsidyChannel = supabase
      .channel('subsidy_changes')
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'sfd_subsidies' 
      }, () => {
        fetchStats();
      })
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'subsidy_requests' 
      }, () => {
        fetchStats();
      })
      .subscribe();
      
    return () => {
      supabase.removeChannel(subsidyChannel);
    };
  }, []);

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', { 
      style: 'currency', 
      currency: 'XOF',
      maximumFractionDigits: 0
    }).format(amount);
  };
  
  const exportReport = () => {
    // In a real app, this would generate a detailed report
    alert("This would export a detailed subsidy allocation report!");
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-md font-medium">Prêts MEREF</CardTitle>
        <Button variant="outline" size="sm" onClick={exportReport}>
          <FileDown className="h-4 w-4 mr-2" />
          Exporter
        </Button>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-3">
            <Skeleton className="h-4 w-[250px]" />
            <Skeleton className="h-4 w-[200px]" />
            <Skeleton className="h-4 w-[220px]" />
            <Skeleton className="h-4 w-[180px]" />
          </div>
        ) : (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Montant Total</p>
                <p className="text-xl font-bold text-[#0D6A51]">
                  {formatAmount(stats.totalAmount)}
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Alloué</p>
                <p className="text-xl font-bold text-blue-600">
                  {formatAmount(stats.allocatedAmount)}
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">SFDs actives</p>
                <p className="text-xl font-bold">{stats.activeSfds}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Demandes en attente</p>
                <p className="text-xl font-bold text-amber-600">{stats.pendingRequests}</p>
              </div>
            </div>
            
            <div className="relative pt-6">
              <h4 className="text-sm font-medium mb-2">Utilisation des fonds</h4>
              <div className="h-2 w-full bg-gray-100 rounded">
                <div 
                  className="h-2 bg-[#0D6A51] rounded" 
                  style={{ 
                    width: `${Math.min(100, (stats.allocatedAmount / stats.totalAmount * 100) || 0)}%` 
                  }}
                ></div>
              </div>
              <div className="flex justify-between mt-1">
                <span className="text-xs text-muted-foreground">
                  {Math.round((stats.allocatedAmount / stats.totalAmount * 100) || 0)}%
                </span>
                <span className="text-xs text-muted-foreground">
                  {formatAmount(stats.totalAmount - stats.allocatedAmount)} disponible
                </span>
              </div>
            </div>
            
            {stats.recentApprovals.length > 0 && (
              <div className="space-y-2 pt-2">
                <h4 className="text-sm font-medium">Approbations récentes</h4>
                <ul className="space-y-1">
                  {stats.recentApprovals.map((approval, i) => (
                    <li key={i} className="text-sm flex justify-between">
                      <span>{approval.sfd_name}</span>
                      <span className="font-medium">{formatAmount(approval.amount)}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
