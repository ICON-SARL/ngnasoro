
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowLeft, FileText, CreditCard } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import MobileNavigation from '@/components/MobileNavigation';

export const LoanActivityPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <div className="bg-white p-4 shadow-sm flex items-center gap-3">
        <Button 
          variant="ghost" 
          size="icon"
          onClick={() => navigate('/mobile-flow/main')}
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-xl font-semibold">Activité de prêt</h1>
      </div>

      <div className="p-4 space-y-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-center py-8">
              <FileText className="h-12 w-12 mx-auto text-gray-400 mb-3" />
              <h2 className="text-lg font-medium mb-2">Aucun prêt actif</h2>
              <p className="text-sm text-gray-500 mb-4">
                Vous n'avez pas encore de prêt en cours. Commencez par faire une demande de prêt.
              </p>
              <Button 
                onClick={() => navigate('/mobile-flow/loan-plans')}
                className="bg-[#0D6A51] hover:bg-[#0D6A51]/90"
              >
                <CreditCard className="h-4 w-4 mr-2" />
                Demander un prêt
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <MobileNavigation />
    </div>
  );
};
