
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Database, Clock, CheckCircle, AlertTriangle, XCircle } from 'lucide-react';

export const DataPipelineStatus = () => {
  const pipelineJobs = [
    {
      id: 'SFD001-ETL',
      source: 'UNACOOPEC-CI',
      status: 'success',
      records: 1245,
      lastRun: '26/03/2023 - 08:15',
      duration: '3m 42s',
      progress: 100,
    },
    {
      id: 'SFD002-ETL',
      source: 'RCPB',
      status: 'success',
      records: 872,
      lastRun: '26/03/2023 - 08:10',
      duration: '2m 56s',
      progress: 100,
    },
    {
      id: 'SFD003-ETL',
      source: 'FUCEC-TOGO',
      status: 'warning',
      records: 650,
      lastRun: '26/03/2023 - 08:05',
      duration: '4m 12s',
      progress: 100,
      warningMessage: 'Schéma inconsistant détecté',
    },
    {
      id: 'SFD004-ETL',
      source: 'Microcred',
      status: 'running',
      records: 513,
      lastRun: '26/03/2023 - 08:20',
      duration: '2m 30s',
      progress: 65,
    },
    {
      id: 'SFD005-ETL',
      source: 'Baobab',
      status: 'error',
      records: 0,
      lastRun: '26/03/2023 - 08:00',
      duration: '0m 45s',
      progress: 20,
      errorMessage: 'API inaccessible',
    },
  ];

  const renderStatusBadge = (status: string) => {
    switch (status) {
      case 'success':
        return <Badge className="bg-green-100 text-green-800"><CheckCircle className="h-3 w-3 mr-1" /> Succès</Badge>;
      case 'warning':
        return <Badge className="bg-amber-100 text-amber-800"><AlertTriangle className="h-3 w-3 mr-1" /> Avertissement</Badge>;
      case 'error':
        return <Badge className="bg-red-100 text-red-800"><XCircle className="h-3 w-3 mr-1" /> Erreur</Badge>;
      case 'running':
        return <Badge className="bg-blue-100 text-blue-800"><Clock className="h-3 w-3 mr-1" /> En cours</Badge>;
      default:
        return <Badge>Inconnu</Badge>;
    }
  };

  const renderProgressBar = (job: typeof pipelineJobs[0]) => {
    if (job.status === 'running') {
      return <Progress value={job.progress} className="h-2" />;
    }
    if (job.status === 'error') {
      return <Progress value={job.progress} className="h-2 bg-red-100" />;
    }
    return null;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Database className="h-5 w-5 mr-2 text-[#0D6A51]" />
          Pipeline de données ETL
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID du Job</TableHead>
              <TableHead>Source SFD</TableHead>
              <TableHead>Statut</TableHead>
              <TableHead>Enregistrements</TableHead>
              <TableHead>Dernière exécution</TableHead>
              <TableHead>Durée</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {pipelineJobs.map((job) => (
              <TableRow key={job.id}>
                <TableCell className="font-medium">{job.id}</TableCell>
                <TableCell>{job.source}</TableCell>
                <TableCell>
                  {renderStatusBadge(job.status)}
                  {job.errorMessage && <div className="text-xs text-red-600 mt-1">{job.errorMessage}</div>}
                  {job.warningMessage && <div className="text-xs text-amber-600 mt-1">{job.warningMessage}</div>}
                  {renderProgressBar(job)}
                </TableCell>
                <TableCell>{job.records}</TableCell>
                <TableCell>{job.lastRun}</TableCell>
                <TableCell>{job.duration}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        
        <div className="mt-6 p-4 bg-muted rounded-lg">
          <h3 className="text-sm font-medium mb-2">Informations sur le Pipeline</h3>
          <div className="text-sm space-y-2">
            <p><span className="font-medium">Fréquence d'actualisation:</span> Toutes les 6 heures</p>
            <p><span className="font-medium">Validation des schémas:</span> JSON Schema v7</p>
            <p><span className="font-medium">Data warehouse:</span> Snowflake - 5 tables normalisées</p>
            <p><span className="font-medium">Orchestration:</span> Apache Airflow DAGs</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
