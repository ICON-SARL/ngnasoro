
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { TestHistoryItem } from '../hooks/useIntegrationTester';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { CheckCircle, XCircle, Calendar, Clock } from 'lucide-react';

interface TestHistorySectionProps {
  history: TestHistoryItem[];
}

export function TestHistorySection({ history }: TestHistorySectionProps) {
  if (!history.length) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center border rounded-md">
        <Calendar className="h-12 w-12 text-muted-foreground mb-4" />
        <h3 className="text-lg font-medium">Aucun test dans l'historique</h3>
        <p className="text-sm text-muted-foreground mt-1">
          Les tests que vous exécutez apparaîtront ici
        </p>
      </div>
    );
  }

  return (
    <ScrollArea className="h-[400px] w-full">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nom du test</TableHead>
            <TableHead>Point d'accès</TableHead>
            <TableHead>Méthode</TableHead>
            <TableHead>Statut</TableHead>
            <TableHead>Durée</TableHead>
            <TableHead>Date</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {history.map((item, index) => (
            <TableRow key={index}>
              <TableCell className="font-medium">{item.testName}</TableCell>
              <TableCell className="max-w-[200px] truncate">{item.endpoint}</TableCell>
              <TableCell>{item.method}</TableCell>
              <TableCell>
                {item.status >= 200 && item.status < 300 ? (
                  <Badge variant="secondary" className="flex items-center gap-1 bg-green-100 text-green-800 hover:bg-green-200">
                    <CheckCircle className="h-3 w-3" />
                    {item.status}
                  </Badge>
                ) : (
                  <Badge variant="destructive" className="flex items-center gap-1">
                    <XCircle className="h-3 w-3" />
                    {item.status}
                  </Badge>
                )}
              </TableCell>
              <TableCell>
                <div className="flex items-center">
                  <Clock className="h-3 w-3 mr-1 text-muted-foreground" />
                  {item.duration}ms
                </div>
              </TableCell>
              <TableCell>{new Date(item.timestamp).toLocaleString()}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </ScrollArea>
  );
}
