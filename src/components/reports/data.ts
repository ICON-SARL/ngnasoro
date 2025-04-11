
// Données d'exemple pour les modèles de rapport
export const reportTemplates = [
  {
    id: 1,
    title: 'Rapport mensuel de transactions',
    description: 'Vue d\'ensemble des transactions du mois',
    lastGenerated: '10/04/2025',
    downloadCount: 15,
    frequency: 'Mensuel',
    icon: 'calendar' as const
  },
  {
    id: 2,
    title: 'Performance des prêts',
    description: 'Analyse détaillée de la performance des prêts',
    lastGenerated: '05/04/2025',
    downloadCount: 8,
    frequency: 'Hebdomadaire',
    icon: 'file' as const
  },
  {
    id: 3,
    title: 'Rapport clients en retard',
    description: 'Liste des clients ayant des échéances dépassées',
    lastGenerated: '08/04/2025',
    downloadCount: 12,
    frequency: 'Quotidien',
    icon: 'clock' as const
  },
  {
    id: 4,
    title: 'Rapport de remboursement',
    description: 'Suivi des remboursements par période',
    downloadCount: 5,
    frequency: 'Mensuel',
    icon: 'file' as const
  }
];

// Données d'exemple pour les rapports programmés
export const scheduledReports = [
  {
    id: 1,
    name: 'Rapport mensuel - Avril 2025',
    frequency: 'Mensuel',
    lastRun: '01/04/2025',
    nextRun: '01/05/2025',
    status: 'active' as const
  },
  {
    id: 2,
    name: 'Rapport hebdomadaire - Semaine 15',
    frequency: 'Hebdomadaire',
    lastRun: '08/04/2025',
    nextRun: '15/04/2025',
    status: 'pending' as const
  },
  {
    id: 3,
    name: 'Performance des prêts - T1 2025',
    frequency: 'Trimestriel',
    lastRun: '31/03/2025',
    nextRun: '30/06/2025',
    status: 'completed' as const
  },
  {
    id: 4,
    name: 'Audit clients - Mars 2025',
    frequency: 'Mensuel',
    lastRun: '31/03/2025',
    nextRun: '30/04/2025',
    status: 'failed' as const
  }
];
