
import { useState, useEffect } from 'react';

interface ClientStats {
  sfdName: string;
  activeClients: number;
  inactiveClients: number;
  totalClients: number;
  totalLoans: number;
  loanVolume: number;
  defaultRate: number;
}

interface StatsItem {
  label: string;
  value: number | string;
}

interface TableData {
  headers: string[];
  rows: string[][];
}

interface ReportSection {
  title: string;
  data?: StatsItem[];
  table?: TableData;
}

export function useSfdClientStats() {
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [clientStats, setClientStats] = useState<ClientStats[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [period, setPeriod] = useState<string>('30d');
  
  // Mock data for demonstration
  useEffect(() => {
    const fetchStats = async () => {
      try {
        setIsLoading(true);
        // Mock API call
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Mock response data
        const mockData: ClientStats[] = [
          {
            sfdName: 'Microfinance Plus',
            activeClients: 1245,
            inactiveClients: 342,
            totalClients: 1587,
            totalLoans: 856,
            loanVolume: 456000000,
            defaultRate: 4.3
          },
          {
            sfdName: 'Crédit Rural',
            activeClients: 987,
            inactiveClients: 213,
            totalClients: 1200,
            totalLoans: 645,
            loanVolume: 320000000,
            defaultRate: 3.8
          },
          {
            sfdName: 'Finance Agricole',
            activeClients: 764,
            inactiveClients: 156,
            totalClients: 920,
            totalLoans: 512,
            loanVolume: 280000000,
            defaultRate: 5.1
          },
          {
            sfdName: 'Épargne Solidaire',
            activeClients: 543,
            inactiveClients: 98,
            totalClients: 641,
            totalLoans: 387,
            loanVolume: 190000000,
            defaultRate: 2.9
          },
          {
            sfdName: 'Microcrédit Express',
            activeClients: 432,
            inactiveClients: 76,
            totalClients: 508,
            totalLoans: 289,
            loanVolume: 135000000,
            defaultRate: 6.2
          }
        ];
        
        setClientStats(mockData);
        setError(null);
      } catch (err) {
        console.error('Error fetching client stats:', err);
        setError('Erreur lors du chargement des statistiques');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchStats();
  }, [period]);
  
  // Calculate aggregate statistics
  const aggregateStats = {
    totalActiveClients: clientStats.reduce((sum, stat) => sum + stat.activeClients, 0),
    totalInactiveClients: clientStats.reduce((sum, stat) => sum + stat.inactiveClients, 0),
    totalClients: clientStats.reduce((sum, stat) => sum + stat.totalClients, 0),
    totalLoans: clientStats.reduce((sum, stat) => sum + stat.totalLoans, 0),
    totalLoanVolume: clientStats.reduce((sum, stat) => sum + stat.loanVolume, 0),
    averageDefaultRate: clientStats.length 
      ? clientStats.reduce((sum, stat) => sum + stat.defaultRate, 0) / clientStats.length 
      : 0
  };
  
  // Format for chart data
  const barChartData = clientStats.map(stat => ({
    name: stat.sfdName,
    activeClients: stat.activeClients,
    inactiveClients: stat.inactiveClients
  }));
  
  // Format for pie chart data
  const pieChartData = [
    { 
      name: 'Clients Actifs', 
      value: aggregateStats.totalActiveClients, 
      color: '#22c55e' 
    },
    { 
      name: 'Clients Inactifs', 
      value: aggregateStats.totalInactiveClients, 
      color: '#ef4444' 
    }
  ];
  
  // Format for stats reports
  const statsReports: ReportSection[] = [
    {
      title: "Statistiques Globales",
      data: [
        { label: "Total Clients", value: aggregateStats.totalClients },
        { label: "Clients Actifs", value: aggregateStats.totalActiveClients },
        { label: "Taux d'Activité", value: `${((aggregateStats.totalActiveClients / aggregateStats.totalClients) * 100).toFixed(1)}%` },
        { label: "Prêts En Cours", value: aggregateStats.totalLoans },
        { label: "Volume Total Prêts", value: `${(aggregateStats.totalLoanVolume / 1000000).toFixed(1)}M FCFA` },
        { label: "Taux de Défaut Moyen", value: `${aggregateStats.averageDefaultRate.toFixed(1)}%` }
      ]
    },
    {
      title: "Récapitulatif par SFD",
      table: {
        headers: ["SFD", "Clients", "Actifs", "Inactifs", "Prêts", "Volume (MFCFA)"],
        rows: clientStats.map(stat => [
          stat.sfdName,
          stat.totalClients.toString(),
          stat.activeClients.toString(),
          stat.inactiveClients.toString(),
          stat.totalLoans.toString(),
          (stat.loanVolume / 1000000).toFixed(1)
        ])
      }
    }
  ];
  
  // Let's fix the issue by removing the 'alerts' property
  // The original code was trying to add 'alerts' to a ReportSection, but it's not part of the interface
  // Instead, we'll create a separate variable for alerts
  
  const quotaAlerts = [
    {
      sfdName: "Finance Agricole",
      message: "Quota de prêts atteint à 92%",
      severity: "warning"
    },
    {
      sfdName: "Microcrédit Express",
      message: "Quota de prêts dépassé de 5%",
      severity: "danger"
    }
  ];
  
  return {
    isLoading,
    error,
    clientStats,
    aggregateStats,
    barChartData,
    pieChartData,
    statsReports,
    quotaAlerts, // separate variable for alerts
    period,
    setPeriod
  };
}
