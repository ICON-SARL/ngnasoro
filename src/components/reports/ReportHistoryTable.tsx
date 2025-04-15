
import React from 'react';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { 
  DownloadCloud, 
  AlertCircle, 
  CheckCircle2, 
  Clock, 
  Loader2 
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { GeneratedReport } from '@/types/report';
import { format } from 'date-fns';

interface ReportHistoryTableProps {
  reports: GeneratedReport[];
  isLoading: boolean;
}

export function ReportHistoryTable({ reports, isLoading }: ReportHistoryTableProps) {
  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Chargement des rapports...</span>
      </div>
    );
  }

  if (!reports || reports.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        Aucun rapport généré
      </div>
    );
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return (
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
            <CheckCircle2 className="h-3.5 w-3.5 mr-1" />
            Terminé
          </Badge>
        );
      case 'processing':
        return (
          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
            <Clock className="h-3.5 w-3.5 mr-1" />
            En cours
          </Badge>
        );
      case 'failed':
        return (
          <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
            <AlertCircle className="h-3.5 w-3.5 mr-1" />
            Échoué
          </Badge>
        );
      default:
        return (
          <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
            <Clock className="h-3.5 w-3.5 mr-1" />
            En attente
          </Badge>
        );
    }
  };

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'dd/MM/yyyy HH:mm');
    } catch (e) {
      return 'Date invalide';
    }
  };

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Date</TableHead>
            <TableHead>Format</TableHead>
            <TableHead>Statut</TableHead>
            <TableHead className="text-right">Action</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {reports.map((report) => (
            <TableRow key={report.id}>
              <TableCell>{formatDate(report.created_at)}</TableCell>
              <TableCell className="uppercase">{report.format}</TableCell>
              <TableCell>{getStatusBadge(report.status)}</TableCell>
              <TableCell className="text-right">
                {report.status === 'completed' && report.result_url ? (
                  <Button variant="outline" size="sm" asChild>
                    <a href={report.result_url} target="_blank" rel="noreferrer">
                      <DownloadCloud className="h-4 w-4 mr-1" />
                      Télécharger
                    </a>
                  </Button>
                ) : (
                  <Button variant="outline" size="sm" disabled>
                    <DownloadCloud className="h-4 w-4 mr-1" />
                    Télécharger
                  </Button>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
