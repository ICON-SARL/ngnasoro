
import React, { useState } from 'react';
import { Sfd } from '../types/sfd-types';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { SfdStatusBadge } from './SfdStatusBadge';
import { Button } from '@/components/ui/button';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  Download,
  Users,
  CreditCard,
  BarChart,
  ChevronLeft,
  Mail,
  Phone
} from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import { cn } from '@/lib/utils';

interface SfdDetailViewProps {
  sfd: Sfd;
  onBack: () => void;
}

// Interface for SFD admin data
interface SfdAdmin {
  user_id: string;
  role: string;
  admin_users: {
    full_name: string;
    email: string;
  } | null;
}

export function SfdDetailView({ sfd, onBack }: SfdDetailViewProps) {
  const [activeTab, setActiveTab] = useState('general');

  // Fetch SFD stats
  const { data: loanStats, isLoading: isLoadingLoanStats } = useQuery({
    queryKey: ['sfd-loan-stats', sfd.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('sfd_loans')
        .select('created_at, amount, status')
        .eq('sfd_id', sfd.id);

      if (error) throw error;
      return data;
    },
    enabled: activeTab === 'stats'
  });

  // Fetch SFD admins using the RPC function
  const { data: sfdAdmins, isLoading: isLoadingAdmins } = useQuery({
    queryKey: ['sfd-admins', sfd.id],
    queryFn: async () => {
      // Use the Supabase RPC function
      const { data, error } = await supabase
        .rpc('get_sfd_admins', { sfd_id_param: sfd.id });

      if (error) {
        console.error("Error fetching SFD admins:", error);
        return [] as SfdAdmin[];
      }
      return (data || []) as SfdAdmin[];
    },
    enabled: activeTab === 'admins'
  });

  // Generate monthly loan data for the chart
  const generateMonthlyData = () => {
    if (!loanStats) return [];
    
    const monthlyData: Record<string, { month: string, totalAmount: number, count: number }> = {};
    
    loanStats.forEach(loan => {
      const date = new Date(loan.created_at);
      const monthYear = `${date.getMonth() + 1}/${date.getFullYear()}`;
      
      if (!monthlyData[monthYear]) {
        monthlyData[monthYear] = { month: monthYear, totalAmount: 0, count: 0 };
      }
      
      monthlyData[monthYear].totalAmount += Number(loan.amount);
      monthlyData[monthYear].count += 1;
    });
    
    return Object.values(monthlyData).sort((a, b) => {
      const [aMonth, aYear] = a.month.split('/').map(Number);
      const [bMonth, bYear] = b.month.split('/').map(Number);
      
      if (aYear !== bYear) return aYear - bYear;
      return aMonth - bMonth;
    });
  };

  const monthlyLoanData = generateMonthlyData();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <Button 
            variant="ghost" 
            onClick={onBack}
            className="mr-2"
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
            Retour
          </Button>
          <h2 className="text-2xl font-semibold">{sfd.name}</h2>
          <SfdStatusBadge status={sfd.status} variant="outline" className="ml-3" />
        </div>
        {sfd.legal_document_url && (
          <Button variant="outline" className="flex items-center">
            <Download className="mr-2 h-4 w-4" />
            Télécharger l'agrément
          </Button>
        )}
      </div>
      
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-4">
          <TabsTrigger value="general">Informations générales</TabsTrigger>
          <TabsTrigger value="stats">Statistiques</TabsTrigger>
          <TabsTrigger value="admins">Administrateurs SFD</TabsTrigger>
        </TabsList>
        
        <TabsContent value="general">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="p-6 space-y-4">
              <h3 className="text-lg font-medium">Coordonnées</h3>
              <div className="space-y-2">
                <div className="flex items-start">
                  <div className="w-1/3 text-muted-foreground">Code:</div>
                  <div className="w-2/3 font-medium">{sfd.code}</div>
                </div>
                <div className="flex items-start">
                  <div className="w-1/3 text-muted-foreground">Région:</div>
                  <div className="w-2/3">{sfd.region || '-'}</div>
                </div>
                <div className="flex items-start">
                  <div className="w-1/3 text-muted-foreground">Email:</div>
                  <div className="w-2/3">
                    {sfd.contact_email ? (
                      <div className="flex items-center">
                        <Mail className="h-4 w-4 mr-2 text-muted-foreground" />
                        <a href={`mailto:${sfd.contact_email}`} className="text-blue-600 hover:underline">
                          {sfd.contact_email}
                        </a>
                      </div>
                    ) : (
                      '-'
                    )}
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="w-1/3 text-muted-foreground">Téléphone:</div>
                  <div className="w-2/3">
                    {sfd.phone ? (
                      <div className="flex items-center">
                        <Phone className="h-4 w-4 mr-2 text-muted-foreground" />
                        <a href={`tel:${sfd.phone}`} className="text-blue-600 hover:underline">
                          {sfd.phone}
                        </a>
                      </div>
                    ) : (
                      '-'
                    )}
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="w-1/3 text-muted-foreground">Créé le:</div>
                  <div className="w-2/3">{new Date(sfd.created_at).toLocaleDateString()}</div>
                </div>
              </div>
            </Card>
            
            <Card className="p-6 space-y-4">
              <h3 className="text-lg font-medium">Subventions</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Solde actuel:</span>
                  <span className="text-2xl font-bold">
                    {sfd.subsidy_balance !== undefined 
                      ? new Intl.NumberFormat('fr-FR').format(sfd.subsidy_balance) 
                      : '0'} FCFA
                  </span>
                </div>
                
                <div className="grid grid-cols-3 gap-4 mt-4">
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <div className="text-sm text-muted-foreground mb-1">Clients</div>
                    <div className="flex items-center">
                      <Users className="h-4 w-4 mr-2 text-blue-600" />
                      <span className="text-xl font-medium">
                        {sfd.sfd_stats?.total_clients || 0}
                      </span>
                    </div>
                  </div>
                  
                  <div className="bg-green-50 p-4 rounded-lg">
                    <div className="text-sm text-muted-foreground mb-1">Prêts</div>
                    <div className="flex items-center">
                      <CreditCard className="h-4 w-4 mr-2 text-green-600" />
                      <span className="text-xl font-medium">
                        {sfd.sfd_stats?.total_loans || 0}
                      </span>
                    </div>
                  </div>
                  
                  <div className="bg-amber-50 p-4 rounded-lg">
                    <div className="text-sm text-muted-foreground mb-1">Remboursement</div>
                    <div className="flex items-center">
                      <BarChart className="h-4 w-4 mr-2 text-amber-600" />
                      <span className="text-xl font-medium">
                        {sfd.sfd_stats?.repayment_rate 
                          ? `${Math.round(sfd.sfd_stats.repayment_rate)}%` 
                          : '-'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="stats">
          <Card className="p-6 space-y-6">
            <h3 className="text-lg font-medium">Volume de prêts par mois</h3>
            
            {isLoadingLoanStats ? (
              <Skeleton className="h-[300px] w-full" />
            ) : monthlyLoanData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={monthlyLoanData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis yAxisId="left" />
                  <YAxis yAxisId="right" orientation="right" />
                  <Tooltip formatter={(value) => new Intl.NumberFormat('fr-FR').format(Number(value))} />
                  <Legend />
                  <Line 
                    yAxisId="left"
                    type="monotone" 
                    dataKey="totalAmount" 
                    name="Volume (FCFA)" 
                    stroke="#8884d8" 
                    activeDot={{ r: 8 }} 
                  />
                  <Line 
                    yAxisId="right"
                    type="monotone" 
                    dataKey="count" 
                    name="Nombre de prêts" 
                    stroke="#82ca9d" 
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-center py-10 text-muted-foreground">
                Aucune donnée disponible
              </div>
            )}
          </Card>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
            <Card className="p-6">
              <h3 className="text-lg font-medium mb-4">Statistiques des prêts</h3>
              {isLoadingLoanStats ? (
                <div className="space-y-2">
                  {Array(3).fill(0).map((_, i) => (
                    <Skeleton key={i} className="h-6 w-full" />
                  ))}
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Total des prêts:</span>
                    <span className="font-medium">{loanStats?.length || 0}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Volume total:</span>
                    <span className="font-medium">
                      {loanStats 
                        ? new Intl.NumberFormat('fr-FR').format(
                            loanStats.reduce((sum, loan) => sum + Number(loan.amount), 0)
                          ) 
                        : 0} FCFA
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Prêts en cours:</span>
                    <span className="font-medium">
                      {loanStats?.filter(loan => loan.status === 'active').length || 0}
                    </span>
                  </div>
                </div>
              )}
            </Card>
            
            <Card className="p-6">
              <h3 className="text-lg font-medium mb-4">Performance</h3>
              {isLoadingLoanStats ? (
                <div className="space-y-2">
                  {Array(3).fill(0).map((_, i) => (
                    <Skeleton key={i} className="h-6 w-full" />
                  ))}
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Taux de remboursement:</span>
                    <span className="font-medium">{sfd.sfd_stats?.repayment_rate || 0}%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Dernière mise à jour:</span>
                    <span className="font-medium">
                      {sfd.sfd_stats?.last_updated 
                        ? new Date(sfd.sfd_stats.last_updated).toLocaleDateString() 
                        : '-'}
                    </span>
                  </div>
                </div>
              )}
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="admins">
          <Card className="p-6">
            <h3 className="text-lg font-medium mb-4">Administrateurs de la SFD</h3>
            
            {isLoadingAdmins ? (
              <div className="space-y-2">
                {Array(3).fill(0).map((_, i) => (
                  <Skeleton key={i} className="h-10 w-full" />
                ))}
              </div>
            ) : sfdAdmins && sfdAdmins.length > 0 ? (
              <div className="border rounded-md">
                <div className="grid grid-cols-3 bg-muted p-3 rounded-t-md font-medium">
                  <div>Nom</div>
                  <div>Email</div>
                  <div>Rôle</div>
                </div>
                <div className="divide-y">
                  {sfdAdmins.map((admin) => (
                    <div key={admin.user_id} className="grid grid-cols-3 p-3">
                      <div>{admin.admin_users?.full_name || '-'}</div>
                      <div>{admin.admin_users?.email || '-'}</div>
                      <div>
                        {admin.role === 'admin_sfd' ? 'Administrateur SFD' : 'Support'}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="text-center py-10 text-muted-foreground">
                Aucun administrateur assigné à cette SFD
              </div>
            )}
            
            <Button className="mt-4">
              Ajouter un administrateur
            </Button>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
