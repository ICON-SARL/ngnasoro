
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { TestResult } from '../hooks/useIntegrationTester';
import { ScrollArea } from '@/components/ui/scroll-area';
import { InfoIcon, CheckCircle, XCircle, Clock } from 'lucide-react';

interface TestResultsSectionProps {
  results: TestResult;
}

export function TestResultsSection({ results }: TestResultsSectionProps) {
  const getStatusBadge = (status: number | null) => {
    if (!status) return (
      <Badge variant="outline" className="flex items-center gap-1">
        <Clock className="h-3 w-3" />
        Inconnu
      </Badge>
    );
    
    if (status >= 200 && status < 300) return (
      <Badge variant="secondary" className="flex items-center gap-1 bg-green-100 text-green-800 hover:bg-green-200">
        <CheckCircle className="h-3 w-3" />
        Succès
      </Badge>
    );
    
    if (status >= 400) return (
      <Badge variant="destructive" className="flex items-center gap-1">
        <XCircle className="h-3 w-3" />
        Erreur
      </Badge>
    );
    
    return (
      <Badge variant="secondary" className="flex items-center gap-1">
        <InfoIcon className="h-3 w-3" />
        {status}
      </Badge>
    );
  };

  return (
    <div className="space-y-4 border rounded-md p-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Résultats du test</h3>
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Statut:</span>
          {getStatusBadge(results.status)}
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-2 text-sm">
        <div>
          <span className="font-medium">Durée:</span> {results.duration}ms
        </div>
        <div>
          <span className="font-medium">Date:</span> {new Date(results.timestamp).toLocaleString()}
        </div>
      </div>
      
      <div className="space-y-2">
        <h4 className="text-sm font-medium">Réponse</h4>
        <ScrollArea className="h-[200px] w-full rounded-md border p-4">
          <pre className="text-xs font-mono whitespace-pre-wrap">
            {JSON.stringify(results.data, null, 2)}
          </pre>
        </ScrollArea>
      </div>
    </div>
  );
}
