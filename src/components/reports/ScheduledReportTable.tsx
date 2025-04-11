
import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Download, Eye, Clock } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface ScheduledReport {
  id: number;
  name: string;
  frequency: string;
  lastRun: string;
  nextRun: string;
  status: 'active' | 'pending' | 'completed' | 'failed';
}

interface ScheduledReportTableProps {
  reports: ScheduledReport[];
  onExport: (reportId: number) => void;
  onView: (reportId: number) => void;
}

export const ScheduledReportTable: React.FC<ScheduledReportTableProps> = ({
  reports,
  onExport,
  onView
}) => {
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-100 text-green-800">Actif</Badge>;
      case 'pending':
        return <Badge className="bg-amber-100 text-amber-800">En attente</Badge>;
      case 'completed':
        return <Badge className="bg-blue-100 text-blue-800">Terminé</Badge>;
      case 'failed':
        return <Badge className="bg-red-100 text-red-800">Échoué</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  return (
    <div className="border rounded-lg overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nom</TableHead>
            <TableHead>Fréquence</TableHead>
            <TableHead>Dernière exécution</TableHead>
            <TableHead>Prochaine exécution</TableHead>
            <TableHead>Statut</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {reports.length > 0 ? (
            reports.map((report) => (
              <TableRow key={report.id}>
                <TableCell className="font-medium">{report.name}</TableCell>
                <TableCell>
                  <div className="flex items-center">
                    <Clock className="h-4 w-4 mr-1 text-muted-foreground" />
                    {report.frequency}
                  </div>
                </TableCell>
                <TableCell>{report.lastRun}</TableCell>
                <TableCell>{report.nextRun}</TableCell>
                <TableCell>{getStatusBadge(report.status)}</TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => onView(report.id)}
                    >
                      <Eye className="h-4 w-4 mr-1" />
                      Voir
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => onExport(report.id)}
                    >
                      <Download className="h-4 w-4 mr-1" />
                      Exporter
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                Aucun rapport planifié
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
};
