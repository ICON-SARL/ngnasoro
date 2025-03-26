
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  FileCog, 
  UserCheck, 
  UserX, 
  Clock, 
  Check, 
  X,
  FileText,
  ExternalLink
} from 'lucide-react';

export const CreditDecisionFlow = () => {
  const recentDecisions = [
    {
      id: 'DEC-78921',
      client: 'Ousmane Diallo',
      score: 82,
      decision: 'approved',
      amount: '450,000 FCFA',
      date: '26/03/2023 - 09:15',
      automatic: true,
    },
    {
      id: 'DEC-78920',
      client: 'Aminata Koné',
      score: 72,
      decision: 'approved',
      amount: '250,000 FCFA',
      date: '26/03/2023 - 08:42',
      automatic: true,
    },
    {
      id: 'DEC-78919',
      client: 'Ibrahim Coulibaly',
      score: 63,
      decision: 'manual_review',
      amount: '750,000 FCFA',
      date: '26/03/2023 - 08:30',
      automatic: false,
      reviewer: 'Mariam Toure',
    },
    {
      id: 'DEC-78918',
      client: 'Fatou Camara',
      score: 35,
      decision: 'rejected',
      amount: '1,200,000 FCFA',
      date: '26/03/2023 - 08:15',
      automatic: true,
      rejectionReason: 'Score de crédit insuffisant',
    },
    {
      id: 'DEC-78917',
      client: 'Mohammed Cissé',
      score: 58,
      decision: 'manual_review',
      amount: '500,000 FCFA',
      date: '26/03/2023 - 08:02',
      automatic: false,
      reviewer: 'En attente',
    },
  ];

  const renderDecisionBadge = (decision: string) => {
    switch (decision) {
      case 'approved':
        return <Badge className="bg-green-100 text-green-800"><Check className="h-3 w-3 mr-1" /> Approuvé</Badge>;
      case 'rejected':
        return <Badge className="bg-red-100 text-red-800"><X className="h-3 w-3 mr-1" /> Rejeté</Badge>;
      case 'manual_review':
        return <Badge className="bg-amber-100 text-amber-800"><Clock className="h-3 w-3 mr-1" /> Revue manuelle</Badge>;
      default:
        return <Badge>Inconnu</Badge>;
    }
  };
  
  const renderScoreBadge = (score: number) => {
    if (score >= 70) {
      return <Badge className="bg-green-100 text-green-800">{score}</Badge>;
    } else if (score >= 40) {
      return <Badge className="bg-amber-100 text-amber-800">{score}</Badge>;
    } else {
      return <Badge className="bg-red-100 text-red-800">{score}</Badge>;
    }
  };

  return (
    <div>
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center">
            <FileCog className="h-5 w-5 mr-2 text-[#0D6A51]" />
            Workflow de décision de crédit
          </CardTitle>
          <CardDescription>
            Décisions automatisées basées sur le score de solvabilité
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Client</TableHead>
                <TableHead>Score</TableHead>
                <TableHead>Décision</TableHead>
                <TableHead>Montant</TableHead>
                <TableHead>Date</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {recentDecisions.map((decision) => (
                <TableRow key={decision.id}>
                  <TableCell className="font-medium">{decision.id}</TableCell>
                  <TableCell>{decision.client}</TableCell>
                  <TableCell>{renderScoreBadge(decision.score)}</TableCell>
                  <TableCell>
                    {renderDecisionBadge(decision.decision)}
                    {decision.rejectionReason && <div className="text-xs text-red-600 mt-1">{decision.rejectionReason}</div>}
                    {decision.decision === 'manual_review' && <div className="text-xs text-amber-600 mt-1">Revue: {decision.reviewer}</div>}
                  </TableCell>
                  <TableCell>{decision.amount}</TableCell>
                  <TableCell>{decision.date}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm">
                      <FileText className="h-4 w-4 mr-1" />
                      Détails
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
        <CardFooter className="flex justify-between">
          <div className="text-sm text-muted-foreground">
            Affichage des 5 dernières décisions
          </div>
          <Button variant="outline" size="sm">
            <ExternalLink className="h-4 w-4 mr-1" />
            Voir tout l'historique
          </Button>
        </CardFooter>
      </Card>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center">
              <UserCheck className="h-4 w-4 mr-2 text-green-600" />
              Approbations automatiques
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">72%</div>
            <p className="text-sm text-muted-foreground">Taux d'approbation automatique</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center">
              <UserX className="h-4 w-4 mr-2 text-red-600" />
              Rejets automatiques
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">18%</div>
            <p className="text-sm text-muted-foreground">Taux de rejet automatique</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center">
              <Clock className="h-4 w-4 mr-2 text-amber-600" />
              Revues manuelles
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">10%</div>
            <p className="text-sm text-muted-foreground">Nécessitant une intervention humaine</p>
          </CardContent>
        </Card>
      </div>
      
      <div className="mt-6 p-4 bg-muted rounded-lg">
        <h3 className="text-sm font-medium mb-2">Audit Trail et Conformité</h3>
        <div className="text-sm space-y-2">
          <p><span className="font-medium">Technologie:</span> Hyperledger Fabric blockchain</p>
          <p><span className="font-medium">Conservation:</span> 7 ans d'historique complet</p>
          <p><span className="font-medium">Templates de notification:</span> Liquid, multilingue</p>
          <p><span className="font-medium">Conformité:</span> BCEAO Digital Financial Services Guidelines</p>
        </div>
      </div>
    </div>
  );
};
