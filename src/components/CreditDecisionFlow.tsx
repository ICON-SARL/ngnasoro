
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  FileCheck, 
  FileX, 
  FileCog, 
  ChevronRight, 
  AlertTriangle,
  Shield
} from 'lucide-react';

export const CreditDecisionFlow = () => {
  const loanApplications = [
    {
      id: 'LA-2023-042',
      applicant: 'Kofi Mensah',
      sfd: 'UNACOOPEC-CI',
      amount: 350000,
      score: 82,
      status: 'approved',
      date: '26/03/2023'
    },
    {
      id: 'LA-2023-041',
      applicant: 'Aminata Diallo',
      sfd: 'RCPB',
      amount: 500000,
      score: 68,
      status: 'manual-review',
      date: '25/03/2023'
    },
    {
      id: 'LA-2023-040',
      applicant: 'Jean-Pierre Koffi',
      sfd: 'FUCEC-TOGO',
      amount: 250000,
      score: 56,
      status: 'manual-review',
      date: '25/03/2023'
    },
    {
      id: 'LA-2023-039',
      applicant: 'Fatou Camara',
      sfd: 'Microcred',
      amount: 700000,
      score: 35,
      status: 'rejected',
      date: '24/03/2023'
    }
  ];
  
  const renderStatusBadge = (status: string, score: number) => {
    switch (status) {
      case 'approved':
        return <Badge className="bg-green-100 text-green-800"><FileCheck className="h-3 w-3 mr-1" /> Approuvé</Badge>;
      case 'rejected':
        return <Badge className="bg-red-100 text-red-800"><FileX className="h-3 w-3 mr-1" /> Rejeté</Badge>;
      case 'manual-review':
        return <Badge className="bg-amber-100 text-amber-800"><FileCog className="h-3 w-3 mr-1" /> Revue manuelle</Badge>;
      default:
        return <Badge>Inconnu</Badge>;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <FileCog className="h-5 w-5 mr-2 text-[#0D6A51]" />
          Workflow de Décision de Crédit
        </CardTitle>
        <CardDescription>
          Processus automatisé de prise de décision basé sur le score de solvabilité
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>Demandeur</TableHead>
              <TableHead>SFD</TableHead>
              <TableHead>Montant (FCFA)</TableHead>
              <TableHead>Score</TableHead>
              <TableHead>Statut</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loanApplications.map((app) => (
              <TableRow key={app.id}>
                <TableCell className="font-medium">{app.id}</TableCell>
                <TableCell>{app.applicant}</TableCell>
                <TableCell>{app.sfd}</TableCell>
                <TableCell>{app.amount.toLocaleString()}</TableCell>
                <TableCell>
                  <div className="flex items-center">
                    <div 
                      className={`w-8 h-8 rounded-full flex items-center justify-center mr-2 ${
                        app.score >= 70 ? 'bg-green-100 text-green-800' : 
                        app.score >= 40 ? 'bg-amber-100 text-amber-800' : 
                        'bg-red-100 text-red-800'
                      }`}
                    >
                      {app.score}
                    </div>
                  </div>
                </TableCell>
                <TableCell>{renderStatusBadge(app.status, app.score)}</TableCell>
                <TableCell>{app.date}</TableCell>
                <TableCell>
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        
        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 bg-muted rounded-lg">
            <h3 className="text-sm font-medium mb-2 flex items-center">
              <FileCheck className="h-4 w-4 mr-2 text-green-600" />
              Approbation automatique
            </h3>
            <p className="text-sm text-muted-foreground">Score &gt; 70: Approbation directe avec notification</p>
          </div>
          
          <div className="p-4 bg-muted rounded-lg">
            <h3 className="text-sm font-medium mb-2 flex items-center">
              <FileCog className="h-4 w-4 mr-2 text-amber-600" />
              Revue manuelle
            </h3>
            <p className="text-sm text-muted-foreground">Score 40-70: Analyse supplémentaire par agent</p>
          </div>
          
          <div className="p-4 bg-muted rounded-lg">
            <h3 className="text-sm font-medium mb-2 flex items-center">
              <FileX className="h-4 w-4 mr-2 text-red-600" />
              Rejet automatique
            </h3>
            <p className="text-sm text-muted-foreground">Score &lt; 40: Rejet avec explication et alternatives</p>
          </div>
        </div>
        
        <div className="mt-4 p-4 bg-[#0D6A51]/5 border border-[#0D6A51]/20 rounded-lg">
          <div className="flex items-start">
            <Shield className="h-5 w-5 mr-2 text-[#0D6A51] mt-0.5" />
            <div>
              <h3 className="text-sm font-medium text-[#0D6A51]">Audit Trail Blockchain</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Toutes les décisions sont enregistrées sur Hyperledger Fabric pour une traçabilité complète et immuable.
                Les clients peuvent vérifier la transparence du processus de décision via l'application mobile.
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
