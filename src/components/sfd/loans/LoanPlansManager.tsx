import React, { useState } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Edit, Trash } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

// This is a placeholder for the actual component
// In a real implementation, this would fetch loan plans from the database
const LoanPlansManager = () => {
  const [loanPlans, setLoanPlans] = useState([
    {
      id: '1',
      name: 'Prêt Express',
      description: 'Prêt rapide à court terme pour les besoins urgents',
      min_amount: 50000,
      max_amount: 500000,
      min_duration: 3,
      max_duration: 12,
      interest_rate: 6.5,
      fees: 2,
      requirements: ['Pièce d\'identité', 'Preuve de résidence', 'Relevé bancaire'],
      is_active: true
    },
    {
      id: '2',
      name: 'Prêt Agricole',
      description: 'Financement pour les activités agricoles avec taux préférentiel',
      min_amount: 100000,
      max_amount: 2000000,
      min_duration: 6,
      max_duration: 36,
      interest_rate: 4.5,
      fees: 1,
      requirements: ['Pièce d\'identité', 'Preuve de résidence', 'Plan d\'affaires', 'Titre foncier'],
      is_active: true
    },
    {
      id: '3',
      name: 'Prêt Éducation',
      description: 'Financement des études et formations professionnelles',
      min_amount: 75000,
      max_amount: 1000000,
      min_duration: 6,
      max_duration: 24,
      interest_rate: 5,
      fees: 1.5,
      requirements: ['Pièce d\'identité', 'Attestation d\'inscription', 'Facture de l\'établissement'],
      is_active: false
    }
  ]);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-semibold">Plans de Prêt</h2>
          <p className="text-sm text-muted-foreground">
            Configurez les différents types de prêts proposés par votre SFD
          </p>
        </div>
        
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Nouveau Plan
        </Button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {loanPlans.map((plan) => (
          <Card key={plan.id} className={!plan.is_active ? 'opacity-70' : ''}>
            <CardHeader>
              <div className="flex justify-between items-start">
                <CardTitle>{plan.name}</CardTitle>
                {plan.is_active ? (
                  <Badge className="bg-green-100 text-green-800">Actif</Badge>
                ) : (
                  <Badge variant="outline">Inactif</Badge>
                )}
              </div>
              <CardDescription>{plan.description}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <h4 className="text-sm font-medium mb-1">Montant</h4>
                <p className="text-sm">{plan.min_amount.toLocaleString()} - {plan.max_amount.toLocaleString()} FCFA</p>
              </div>
              <div>
                <h4 className="text-sm font-medium mb-1">Durée</h4>
                <p className="text-sm">{plan.min_duration} - {plan.max_duration} mois</p>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <h4 className="text-sm font-medium mb-1">Taux d'intérêt</h4>
                  <p className="text-sm">{plan.interest_rate}%</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium mb-1">Frais</h4>
                  <p className="text-sm">{plan.fees}%</p>
                </div>
              </div>
              <div>
                <h4 className="text-sm font-medium mb-1">Documents requis</h4>
                <ul className="text-sm pl-5 list-disc">
                  {plan.requirements.slice(0, 3).map((req, index) => (
                    <li key={index}>{req}</li>
                  ))}
                  {plan.requirements.length > 3 && (
                    <li>+{plan.requirements.length - 3} autres</li>
                  )}
                </ul>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline" size="sm">
                <Edit className="h-4 w-4 mr-2" />
                Modifier
              </Button>
              <Button variant="outline" size="sm" className="text-red-500">
                <Trash className="h-4 w-4 mr-2" />
                Supprimer
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default LoanPlansManager;
