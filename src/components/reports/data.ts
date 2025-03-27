
export const reportTemplates = [
  {
    id: 1,
    name: 'Rapport Mensuel d\'Activité',
    description: 'Résumé mensuel des opérations financières et des indicateurs de performance.',
    format: 'PDF/Excel',
    frequency: 'Mensuel',
    lastGenerated: '01/04/2023',
  },
  {
    id: 2,
    name: 'Rapport de Conformité Réglementaire',
    description: 'Analyse de la conformité aux exigences réglementaires et aux normes du secteur.',
    format: 'PDF',
    frequency: 'Trimestriel',
    lastGenerated: '31/03/2023',
  },
  {
    id: 3,
    name: 'Analyse des Risques de Portefeuille',
    description: 'Évaluation des risques associés au portefeuille de prêts et recommandations.',
    format: 'PDF/Excel',
    frequency: 'Mensuel',
    lastGenerated: '01/04/2023',
  },
  {
    id: 4,
    name: 'Rapport de Performance des Agences',
    description: 'Comparaison des performances entre les différentes agences SFD.',
    format: 'PDF/Excel',
    frequency: 'Mensuel',
    lastGenerated: '01/04/2023',
  },
];

export const scheduledReports = [
  {
    id: 101,
    name: 'Rapport Mensuel d\'Activité - Avril 2023',
    format: 'PDF',
    status: 'scheduled' as const,
    scheduledDate: '01/05/2023',
  },
  {
    id: 102,
    name: 'Analyse des Risques de Portefeuille - Avril 2023',
    format: 'Excel',
    status: 'processing' as const,
    scheduledDate: '01/05/2023',
  },
  {
    id: 103,
    name: 'Rapport de Performance des Agences - Avril 2023',
    format: 'PDF',
    status: 'completed' as const,
    scheduledDate: '01/05/2023',
    completedDate: '01/05/2023',
  },
];
