
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Calendar, ChevronRight } from 'lucide-react';

const LoanPlansPage: React.FC = () => {
  const navigate = useNavigate();
  
  const loanPlans = [
    {
      id: 1,
      name: "Prêt Express",
      amount: "50,000 - 200,000 FCFA",
      term: "3 - 6 mois",
      interestRate: "5% - 8%",
      color: "bg-green-100 text-green-800",
      description: "Prêt rapide pour les besoins urgents"
    },
    {
      id: 2,
      name: "Prêt Entreprise",
      amount: "200,000 - 1,000,000 FCFA",
      term: "6 - 12 mois",
      interestRate: "9% - 12%",
      color: "bg-blue-100 text-blue-800",
      description: "Financement pour les entrepreneurs et petites entreprises"
    },
    {
      id: 3,
      name: "Prêt Agricole",
      amount: "100,000 - 500,000 FCFA",
      term: "6 - 24 mois",
      interestRate: "4% - 7%",
      color: "bg-amber-100 text-amber-800",
      description: "Soutien aux activités agricoles et d'élevage"
    }
  ];
  
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white p-4 shadow-sm flex items-center gap-3">
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={() => navigate(-1)}
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-xl font-semibold">Plans de prêt</h1>
      </div>
      
      <div className="p-4">
        <div className="mb-4">
          <h2 className="text-lg font-medium mb-2">Prêts disponibles</h2>
          <p className="text-gray-600 text-sm">
            Sélectionnez un plan de prêt qui correspond à vos besoins.
          </p>
        </div>
        
        <div className="space-y-4">
          {loanPlans.map(plan => (
            <div 
              key={plan.id} 
              className="bg-white rounded-lg shadow p-4 border-l-4 border-lime-500"
              onClick={() => navigate('/mobile-flow/loan-application')}
            >
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-semibold text-lg">{plan.name}</h3>
                <span className={`px-2 py-1 rounded-full text-xs ${plan.color}`}>
                  {plan.interestRate}
                </span>
              </div>
              
              <p className="text-gray-600 text-sm mb-3">{plan.description}</p>
              
              <div className="flex justify-between text-sm text-gray-700">
                <div>
                  <p className="font-medium">Montant</p>
                  <p>{plan.amount}</p>
                </div>
                
                <div className="flex items-center">
                  <Calendar className="h-4 w-4 mr-1" />
                  <span>{plan.term}</span>
                </div>
              </div>
              
              <div className="mt-4 flex justify-end">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="text-lime-600"
                  onClick={() => navigate('/mobile-flow/loan-application')}
                >
                  Voir détails
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default LoanPlansPage;
