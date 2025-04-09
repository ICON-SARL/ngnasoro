
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { StarIcon, TrendingUpIcon, ShieldCheckIcon, AwardIcon } from 'lucide-react';
import { Progress } from '@/components/ui/progress';

interface SfdScore {
  sfdId: string;
  sfdName: string;
  repaymentRate: number;
  activeClients: number;
  complianceScore: number;
  overallScore: number;
  label: 'Standard' | 'Silver' | 'Gold' | 'Platinum';
}

// Mock data - in a real implementation, this would come from an API call
const mockSfdScores: SfdScore[] = [
  {
    sfdId: '1',
    sfdName: 'MicroFinance Plus',
    repaymentRate: 92,
    activeClients: 2500,
    complianceScore: 88,
    overallScore: 90,
    label: 'Gold'
  },
  {
    sfdId: '2',
    sfdName: 'Crédit Rural',
    repaymentRate: 85,
    activeClients: 1800,
    complianceScore: 95,
    overallScore: 86,
    label: 'Silver'
  },
  {
    sfdId: '3',
    sfdName: 'SFD Démo',
    repaymentRate: 98,
    activeClients: 3200,
    complianceScore: 96,
    overallScore: 97,
    label: 'Platinum'
  }
];

const getLabelColor = (label: string) => {
  switch(label) {
    case 'Platinum': return 'bg-purple-100 text-purple-800 border-purple-300';
    case 'Gold': return 'bg-amber-100 text-amber-800 border-amber-300';
    case 'Silver': return 'bg-slate-100 text-slate-800 border-slate-300';
    default: return 'bg-gray-100 text-gray-800 border-gray-300';
  }
};

export const SfdScoringSystem = () => {
  const [scores, setScores] = useState<SfdScore[]>(mockSfdScores);
  
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <AwardIcon className="mr-2 h-6 w-6 text-primary" />
            Système de notation des SFDs
          </CardTitle>
          <CardDescription>
            Évaluation basée sur les taux de remboursement, nombre de clients actifs, et respect des réglementations
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {scores.map((sfd) => (
              <div key={sfd.sfdId} className="border rounded-lg p-4">
                <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
                  <div>
                    <h3 className="text-lg font-medium">{sfd.sfdName}</h3>
                    <Badge className={`mt-1 ${getLabelColor(sfd.label)}`}>
                      {sfd.label}
                    </Badge>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold">{sfd.overallScore}/100</div>
                    <div className="text-sm text-muted-foreground">Score global</div>
                  </div>
                </div>
                
                <div className="grid gap-4 md:grid-cols-3">
                  <div>
                    <div className="flex items-center mb-1">
                      <TrendingUpIcon className="h-4 w-4 mr-1 text-green-600" />
                      <div className="text-sm font-medium">Taux de remboursement</div>
                    </div>
                    <Progress value={sfd.repaymentRate} className="h-2" />
                    <div className="mt-1 text-sm text-right">{sfd.repaymentRate}%</div>
                  </div>
                  
                  <div>
                    <div className="flex items-center mb-1">
                      <StarIcon className="h-4 w-4 mr-1 text-blue-600" />
                      <div className="text-sm font-medium">Clients actifs</div>
                    </div>
                    <Progress 
                      value={Math.min(100, (sfd.activeClients / 5000) * 100)} 
                      className="h-2" 
                    />
                    <div className="mt-1 text-sm text-right">{sfd.activeClients}</div>
                  </div>
                  
                  <div>
                    <div className="flex items-center mb-1">
                      <ShieldCheckIcon className="h-4 w-4 mr-1 text-indigo-600" />
                      <div className="text-sm font-medium">Conformité</div>
                    </div>
                    <Progress value={sfd.complianceScore} className="h-2" />
                    <div className="mt-1 text-sm text-right">{sfd.complianceScore}%</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
