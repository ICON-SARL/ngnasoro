
import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Download } from 'lucide-react';

interface ScheduledReport {
  id: number;
  name: string;
  format: string;
  status: 'scheduled' | 'processing' | 'completed';
  scheduledDate: string;
  completedDate?: string;
}

interface ScheduledReportTableProps {
  reports: ScheduledReport[];
}

export const ScheduledReportTable: React.FC<ScheduledReportTableProps> = ({ reports }) => {
  return (
    <div className="border rounded-lg overflow-hidden">
      <table className="min-w-full">
        <thead className="bg-muted/50">
          <tr>
            <th className="px-4 py-3 text-left text-sm font-medium">Nom du rapport</th>
            <th className="px-4 py-3 text-left text-sm font-medium">Format</th>
            <th className="px-4 py-3 text-left text-sm font-medium">Statut</th>
            <th className="px-4 py-3 text-left text-sm font-medium">Date</th>
            <th className="px-4 py-3 text-right text-sm font-medium">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {reports.map((report) => (
            <tr key={report.id}>
              <td className="px-4 py-3 text-sm">{report.name}</td>
              <td className="px-4 py-3 text-sm">{report.format}</td>
              <td className="px-4 py-3 text-sm">
                {report.status === 'scheduled' && (
                  <Badge variant="outline" className="bg-blue-50 text-blue-600">Programmé</Badge>
                )}
                {report.status === 'processing' && (
                  <Badge variant="outline" className="bg-amber-50 text-amber-600">En cours</Badge>
                )}
                {report.status === 'completed' && (
                  <Badge variant="outline" className="bg-green-50 text-green-600">Terminé</Badge>
                )}
              </td>
              <td className="px-4 py-3 text-sm">
                {report.status === 'completed' ? report.completedDate : report.scheduledDate}
              </td>
              <td className="px-4 py-3 text-sm text-right">
                {report.status === 'completed' && (
                  <Button variant="ghost" size="sm">
                    <Download className="h-4 w-4 mr-1" />
                    Télécharger
                  </Button>
                )}
                {report.status === 'scheduled' && (
                  <Button variant="ghost" size="sm">
                    Modifier
                  </Button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
