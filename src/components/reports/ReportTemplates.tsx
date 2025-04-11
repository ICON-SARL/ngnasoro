
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileText, Plus } from 'lucide-react';
import { ReportTemplateCard } from './ReportTemplateCard';

// Données d'exemple pour les modèles de rapport
const reportTemplates = [
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

export const ReportTemplates: React.FC = () => {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Modèles de rapport</CardTitle>
        <Button variant="secondary" size="sm">
          <Plus className="h-4 w-4 mr-1" />
          Nouveau modèle
        </Button>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {reportTemplates.map((template) => (
            <ReportTemplateCard key={template.id} template={template} />
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
