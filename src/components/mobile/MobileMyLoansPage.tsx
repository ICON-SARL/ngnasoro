
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { useClientLoans } from '@/hooks/useClientLoans';
import LoansTabs from './loans/LoansTabs';

const MobileMyLoansPage: React.FC = () => {
  const navigate = useNavigate();
  const [tabValue, setTabValue] = useState('all');
  
  const { 
    loans, 
    isLoading,
    refetchLoans 
  } = useClientLoans();
  
  return (
    <div className="bg-gray-50 min-h-screen pb-20">
      <div className="bg-[#0D6A51] text-white p-4 flex items-center shadow-md">
        <Button 
          variant="ghost" 
          size="icon" 
          className="mr-2 text-white hover:bg-[#0D6A51]/20" 
          onClick={() => navigate('/mobile-flow/main')}
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-xl font-semibold">Mes demandes de prêts</h1>
      </div>
      
      <div className="mt-2">
        <Card className="border-0 rounded-none shadow-none">
          <LoansTabs
            loans={loans || []}
            isLoading={isLoading}
            tabValue={tabValue}
            setTabValue={setTabValue}
            canApplyForLoan={true}
          />
        </Card>
      </div>
    </div>
  );
};

export default MobileMyLoansPage;
