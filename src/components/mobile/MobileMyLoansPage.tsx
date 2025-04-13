
import React, { useState } from 'react';
import MobileNavigation from '@/components/mobile/MobileNavigation';
import { useClientLoans } from '@/hooks/useClientLoans';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import MobileHeader from '@/components/mobile/MobileHeader';
import { usePermissions } from '@/hooks/auth/usePermissions';
import LoansTabs from './loans/LoansTabs';

const MobileMyLoansPage: React.FC = () => {
  const { loans, isLoading } = useClientLoans();
  const [tabValue, setTabValue] = useState("all");
  const navigate = useNavigate();
  const { hasPermission } = usePermissions();
  const canApplyForLoan = hasPermission('apply_for_loan');
  
  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <div className="bg-gradient-to-r from-[#0D6A51] to-[#064032] text-white rounded-b-3xl shadow-lg">
        <MobileHeader title="Mes demandes de prêt" />
        <p className="text-white/80 text-sm px-4 pb-8">
          Suivez l'état de vos demandes de prêt et leur traitement
        </p>
      </div>
      
      <div className="p-4 -mt-4">
        <Card className="shadow-lg border-0 rounded-2xl overflow-hidden">
          <CardContent className="p-0">
            <LoansTabs 
              loans={loans}
              isLoading={isLoading}
              tabValue={tabValue}
              setTabValue={setTabValue}
              canApplyForLoan={canApplyForLoan}
            />
          </CardContent>
        </Card>
      </div>
      
      {canApplyForLoan && (
        <div className="fixed bottom-24 right-4">
          <Button 
            onClick={() => navigate('/loans/apply')}
            className="bg-[#0D6A51] hover:bg-[#0D6A51]/90 h-14 w-14 rounded-full shadow-lg flex items-center justify-center"
          >
            <Plus className="h-6 w-6" />
          </Button>
        </div>
      )}
      
      <MobileNavigation />
    </div>
  );
};

export default MobileMyLoansPage;
