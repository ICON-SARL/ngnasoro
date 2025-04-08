
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { generateCsv, downloadCsv } from '@/utils/exports/csvExporter';
import { generatePdf, downloadPdf } from '@/utils/exports/pdfExporter';

interface UseSfdClientStatsOptions {
  timeFrame?: 'last-7-days' | 'last-30-days' | 'last-90-days' | 'this-year';
  sfdId?: string;
}

interface SfdClientDistribution {
  id: string;
  name: string;
  activeClients: number;
  inactiveClients: number;
}

interface SfdDetailedStats extends SfdClientDistribution {
  totalClients: number;
  newClients: number;
}

interface LoanStatusDistribution {
  name: string;
  value: number;
  color: string;
}

interface SfdLoanStats {
  id: string;
  name: string;
  totalLoans: number;
  activeLoans: number;
  totalAmount: number;
  repaidAmount: number;
  subsidyAmount: number;
}

interface SfdSubsidyStats {
  id: string;
  name: string;
  allocatedAmount: number;
  usedAmount: number;
  remainingAmount: number;
  usagePercent: number;
}

interface QuotaAlert {
  sfd_id: string;
  sfd_name: string;
  message: string;
  usagePercent: number;
  remainingAmount: number;
}

interface ClientStats {
  totalClients: number;
  activeClients: number;
  inactiveClients: number;
  sfds: { id: string; name: string }[];
  sfdClientDistribution: SfdClientDistribution[];
  sfdDetailedStats: SfdDetailedStats[];
}

interface LoanStats {
  totalAmount: number;
  activeLoans: number;
  completedLoans: number;
  subsidyAmount: number;
  subsidyUsageRate: number;
  loanStatusDistribution: LoanStatusDistribution[];
  sfdLoanStats: SfdLoanStats[];
  sfdSubsidyStats: SfdSubsidyStats[];
  quotaAlerts: QuotaAlert[];
}

export function useSfdClientStats(options: UseSfdClientStatsOptions = {}) {
  const { toast } = useToast();
  const { timeFrame = 'last-30-days', sfdId } = options;
  
  // Get time period based on timeFrame
  const getStartDate = (): string => {
    const now = new Date();
    switch (timeFrame) {
      case 'last-7-days':
        const sevenDaysAgo = new Date(now);
        sevenDaysAgo.setDate(now.getDate() - 7);
        return sevenDaysAgo.toISOString();
      case 'last-30-days':
        const thirtyDaysAgo = new Date(now);
        thirtyDaysAgo.setDate(now.getDate() - 30);
        return thirtyDaysAgo.toISOString();
      case 'last-90-days':
        const ninetyDaysAgo = new Date(now);
        ninetyDaysAgo.setDate(now.getDate() - 90);
        return ninetyDaysAgo.toISOString();
      case 'this-year':
        return new Date(now.getFullYear(), 0, 1).toISOString();
      default:
        const defaultDaysAgo = new Date(now);
        defaultDaysAgo.setDate(now.getDate() - 30);
        return defaultDaysAgo.toISOString();
    }
  };
  
  const startDate = getStartDate();
  
  // Fetch client statistics
  const fetchClientStats = async (): Promise<ClientStats> => {
    try {
      // Fetch SFDs
      const { data: sfdsData, error: sfdsError } = await supabase
        .from('sfds')
        .select('id, name')
        .order('name');
        
      if (sfdsError) throw sfdsError;
      
      let sfds = sfdsData || [];
      
      // If specific SFD is selected, filter to just that one
      if (sfdId) {
        sfds = sfds.filter(sfd => sfd.id === sfdId);
      }
      
      // Get client counts
      const { data: clientData, error: clientError } = await supabase
        .from('sfd_clients')
        .select('id, sfd_id, status, created_at')
        .gte('created_at', startDate);
        
      if (clientError) throw clientError;
      
      const clients = clientData || [];
      
      // Calculate totals
      const totalClients = clients.length;
      const activeClients = clients.filter(c => c.status === 'validated').length;
      const inactiveClients = clients.filter(c => c.status === 'rejected').length;
      
      // Create distribution data for chart
      const sfdClientDistribution: SfdClientDistribution[] = sfds.map(sfd => {
        const sfdClients = clients.filter(c => c.sfd_id === sfd.id);
        return {
          id: sfd.id,
          name: sfd.name,
          activeClients: sfdClients.filter(c => c.status === 'validated').length,
          inactiveClients: sfdClients.filter(c => c.status === 'rejected').length
        };
      });
      
      // Create detailed stats by SFD
      const sfdDetailedStats: SfdDetailedStats[] = sfds.map(sfd => {
        const sfdClients = clients.filter(c => c.sfd_id === sfd.id);
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
        
        return {
          id: sfd.id,
          name: sfd.name,
          totalClients: sfdClients.length,
          activeClients: sfdClients.filter(c => c.status === 'validated').length,
          inactiveClients: sfdClients.filter(c => c.status === 'rejected').length,
          newClients: sfdClients.filter(c => new Date(c.created_at) >= new Date(startOfMonth)).length
        };
      });
      
      return {
        totalClients,
        activeClients,
        inactiveClients,
        sfds,
        sfdClientDistribution,
        sfdDetailedStats
      };
    } catch (error) {
      console.error('Error fetching client statistics:', error);
      throw error;
    }
  };
  
  // Fetch loan statistics
  const fetchLoanStats = async (): Promise<LoanStats> => {
    try {
      // Fetch all loans
      const { data: loansData, error: loansError } = await supabase
        .from('sfd_loans')
        .select('*, sfd:sfds(id, name)')
        .gte('created_at', startDate);
        
      if (loansError) throw loansError;
      
      let loans = loansData || [];
      
      // If specific SFD is selected, filter to just that one
      if (sfdId) {
        loans = loans.filter(loan => loan.sfd_id === sfdId);
      }
      
      // Calculate loan statistics
      const totalAmount = loans.reduce((sum, loan) => sum + (loan.amount || 0), 0);
      const activeLoans = loans.filter(loan => loan.status === 'active').length;
      const completedLoans = loans.filter(loan => loan.status === 'completed').length;
      const subsidyAmount = loans.reduce((sum, loan) => sum + (loan.subsidy_amount || 0), 0);
      
      // Calculate subsidy usage rate - assuming we have a total subsidy allocation figure
      // For now using a placeholder calculation
      const subsidyUsageRate = 65; // This would come from actual data
      
      // Get loan status distribution for pie chart
      const statusColors = {
        pending: '#f59e0b',    // amber
        approved: '#3b82f6',   // blue
        active: '#22c55e',     // green
        completed: '#0d9488',  // teal
        rejected: '#ef4444',   // red
        defaulted: '#b91c1c'   // dark red
      };
      
      const loanStatusCounts: Record<string, number> = {};
      loans.forEach(loan => {
        loanStatusCounts[loan.status] = (loanStatusCounts[loan.status] || 0) + 1;
      });
      
      const loanStatusDistribution: LoanStatusDistribution[] = Object.keys(loanStatusCounts).map(status => ({
        name: status.charAt(0).toUpperCase() + status.slice(1),
        value: loanStatusCounts[status],
        color: statusColors[status as keyof typeof statusColors] || '#6b7280'
      }));
      
      // Get SFD loan stats
      const { data: sfdsData } = await supabase.from('sfds').select('id, name');
      const sfds = sfdsData || [];
      
      const sfdLoanStats: SfdLoanStats[] = sfds
        .filter(sfd => !sfdId || sfd.id === sfdId)
        .map(sfd => {
          const sfdLoans = loans.filter(loan => loan.sfd_id === sfd.id);
          return {
            id: sfd.id,
            name: sfd.name,
            totalLoans: sfdLoans.length,
            activeLoans: sfdLoans.filter(loan => loan.status === 'active').length,
            totalAmount: sfdLoans.reduce((sum, loan) => sum + (loan.amount || 0), 0),
            repaidAmount: sfdLoans
              .filter(loan => loan.status === 'completed')
              .reduce((sum, loan) => sum + (loan.amount || 0), 0),
            subsidyAmount: sfdLoans.reduce((sum, loan) => sum + (loan.subsidy_amount || 0), 0)
          };
        });
      
      // Get subsidy stats
      const { data: subsidiesData } = await supabase
        .from('sfd_subsidies')
        .select('*, sfd:sfds(id, name)');
      
      const subsidies = subsidiesData || [];
      
      const sfdSubsidyStats: SfdSubsidyStats[] = sfds
        .filter(sfd => !sfdId || sfd.id === sfdId)
        .map(sfd => {
          const sfdSubsidies = subsidies.filter(subsidy => subsidy.sfd_id === sfd.id);
          const allocatedAmount = sfdSubsidies.reduce((sum, subsidy) => sum + (subsidy.amount || 0), 0);
          const usedAmount = sfdSubsidies.reduce((sum, subsidy) => sum + (subsidy.used_amount || 0), 0);
          const remainingAmount = allocatedAmount - usedAmount;
          const usagePercent = allocatedAmount > 0 ? Math.round((usedAmount / allocatedAmount) * 100) : 0;
          
          return {
            id: sfd.id,
            name: sfd.name,
            allocatedAmount,
            usedAmount,
            remainingAmount,
            usagePercent
          };
        });
      
      // Generate quota alerts - SFDs using more than 80% of their quota
      const quotaAlerts: QuotaAlert[] = sfdSubsidyStats
        .filter(stat => stat.usagePercent >= 80)
        .map(stat => ({
          sfd_id: stat.id,
          sfd_name: stat.name,
          message: stat.usagePercent >= 95 
            ? "Cette SFD a presque épuisé sa subvention MEREF" 
            : "Cette SFD approche sa limite de subvention MEREF",
          usagePercent: stat.usagePercent,
          remainingAmount: stat.remainingAmount
        }));
      
      return {
        totalAmount,
        activeLoans,
        completedLoans,
        subsidyAmount,
        subsidyUsageRate,
        loanStatusDistribution,
        sfdLoanStats,
        sfdSubsidyStats,
        quotaAlerts
      };
    } catch (error) {
      console.error('Error fetching loan statistics:', error);
      throw error;
    }
  };
  
  // Run both queries
  const clientStatsQuery = useQuery({
    queryKey: ['client-stats', timeFrame, sfdId],
    queryFn: fetchClientStats
  });
  
  const loanStatsQuery = useQuery({
    queryKey: ['loan-stats', timeFrame, sfdId],
    queryFn: fetchLoanStats
  });
  
  // Export functions
  const exportStatsAsCsv = () => {
    try {
      if (!clientStatsQuery.data || !loanStatsQuery.data) {
        toast({
          title: "Erreur d'exportation",
          description: "Les données ne sont pas encore chargées",
          variant: "destructive"
        });
        return;
      }
      
      // Create client statistics CSV
      const clientStats = clientStatsQuery.data.sfdDetailedStats.map(sfd => ({
        'SFD': sfd.name,
        'Clients Total': sfd.totalClients,
        'Clients Actifs': sfd.activeClients,
        'Clients Inactifs': sfd.inactiveClients,
        'Nouveaux Clients (ce mois)': sfd.newClients
      }));
      
      // Create loan statistics CSV
      const loanStats = loanStatsQuery.data.sfdLoanStats.map(sfd => ({
        'SFD': sfd.name,
        'Prêts Total': sfd.totalLoans,
        'Prêts Actifs': sfd.activeLoans,
        'Montant Total (FCFA)': sfd.totalAmount,
        'Montant Remboursé (FCFA)': sfd.repaidAmount,
        'Subvention MEREF (FCFA)': sfd.subsidyAmount
      }));
      
      // Combine data
      const csvData = {
        'Statistiques Clients': clientStats,
        'Statistiques Prêts': loanStats,
        'Statistiques Subventions': loanStatsQuery.data.sfdSubsidyStats.map(sfd => ({
          'SFD': sfd.name,
          'Subvention Allouée (FCFA)': sfd.allocatedAmount,
          'Subvention Utilisée (FCFA)': sfd.usedAmount,
          'Pourcentage Utilisé': `${sfd.usagePercent}%`,
          'Subvention Restante (FCFA)': sfd.remainingAmount
        }))
      };
      
      // Generate and download the CSV
      const csv = generateCsv(csvData);
      const dateStr = new Date().toISOString().split('T')[0];
      downloadCsv(csv, `statistiques-sfds-${dateStr}.csv`);
      
      toast({
        title: "Export réussi",
        description: "Les statistiques ont été exportées au format CSV"
      });
    } catch (error) {
      console.error('Error exporting CSV:', error);
      toast({
        title: "Erreur d'exportation",
        description: "Une erreur est survenue lors de l'exportation",
        variant: "destructive"
      });
    }
  };
  
  const exportStatsAsPdf = () => {
    try {
      if (!clientStatsQuery.data || !loanStatsQuery.data) {
        toast({
          title: "Erreur d'exportation",
          description: "Les données ne sont pas encore chargées",
          variant: "destructive"
        });
        return;
      }
      
      // Generate PDF data
      const pdfData = {
        title: "Rapport Statistique MEREF - SFDs",
        subtitle: `Période: ${getTimeFrameLabel(timeFrame)}`,
        date: new Date().toLocaleDateString(),
        sections: [
          {
            title: "Résumé Global",
            data: [
              { label: "Clients Total", value: clientStatsQuery.data.totalClients },
              { label: "Clients Actifs", value: clientStatsQuery.data.activeClients },
              { label: "Montant Total des Prêts", value: `${loanStatsQuery.data.totalAmount.toLocaleString()} FCFA` },
              { label: "Subventions Utilisées", value: `${loanStatsQuery.data.subsidyAmount.toLocaleString()} FCFA` }
            ]
          },
          {
            title: "Statistiques Clients par SFD",
            table: {
              headers: ["SFD", "Total", "Actifs", "Inactifs", "Nouveaux"],
              rows: clientStatsQuery.data.sfdDetailedStats.map(sfd => [
                sfd.name,
                sfd.totalClients.toString(),
                sfd.activeClients.toString(),
                sfd.inactiveClients.toString(),
                sfd.newClients.toString()
              ])
            }
          },
          {
            title: "Statistiques Prêts par SFD",
            table: {
              headers: ["SFD", "Total Prêts", "Prêts Actifs", "Montant Total", "Subvention MEREF"],
              rows: loanStatsQuery.data.sfdLoanStats.map(sfd => [
                sfd.name,
                sfd.totalLoans.toString(),
                sfd.activeLoans.toString(),
                `${sfd.totalAmount.toLocaleString()} FCFA`,
                `${sfd.subsidyAmount.toLocaleString()} FCFA`
              ])
            }
          }
        ]
      };
      
      // Add quota alerts if any
      if (loanStatsQuery.data.quotaAlerts.length > 0) {
        pdfData.sections.push({
          title: "Alertes de Quota",
          alerts: loanStatsQuery.data.quotaAlerts.map(alert => ({
            title: alert.sfd_name,
            message: alert.message,
            detail: `${alert.usagePercent}% utilisé, ${alert.remainingAmount.toLocaleString()} FCFA restant`
          }))
        });
      }
      
      // Generate and download PDF
      const dateStr = new Date().toISOString().split('T')[0];
      generatePdf(pdfData, `rapport-meref-sfds-${dateStr}.pdf`);
      
      toast({
        title: "Export réussi",
        description: "Le rapport a été exporté au format PDF"
      });
    } catch (error) {
      console.error('Error exporting PDF:', error);
      toast({
        title: "Erreur d'exportation",
        description: "Une erreur est survenue lors de l'exportation",
        variant: "destructive"
      });
    }
  };
  
  // Helper to get human-readable time frame label
  const getTimeFrameLabel = (timeFrame: string): string => {
    switch (timeFrame) {
      case 'last-7-days': return '7 derniers jours';
      case 'last-30-days': return '30 derniers jours';
      case 'last-90-days': return '90 derniers jours';
      case 'this-year': return 'Cette année';
      default: return '30 derniers jours';
    }
  };
  
  return {
    isLoading: clientStatsQuery.isLoading || loanStatsQuery.isLoading,
    clientStats: clientStatsQuery.data,
    loanStats: loanStatsQuery.data,
    exportStatsAsCsv,
    exportStatsAsPdf
  };
}
