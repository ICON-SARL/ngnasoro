
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useLoanApplication } from './hooks/useLoanApplication';
import LoanApplicationForm from './LoanApplicationForm';
import LoanApplicationHeader from './LoanApplicationHeader';
import LoanApplicationFooter from './LoanApplicationFooter';

const LoanApplicationPage: React.FC = () => {
  const {
    form,
    sfds,
    isLoading,
    selectedPlan,
    handlePlanSelect,
    onSubmit,
    navigateToRepayment,
    navigate
  } = useLoanApplication();
  
  return (
    <div className="container px-4 py-6 pb-20">
      <LoanApplicationHeader onBack={() => navigate(-1)} />
      
      <Card>
        <CardHeader>
          <CardTitle className="text-xl text-[#0D6A51]">Demande de prêt</CardTitle>
          <CardDescription>
            Remplissez le formulaire ci-dessous pour soumettre votre demande de prêt
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          <LoanApplicationForm 
            form={form}
            sfds={sfds}
            selectedPlan={selectedPlan}
            isLoading={isLoading}
            onPlanSelect={handlePlanSelect}
            onSubmit={onSubmit}
          />
        </CardContent>
      </Card>
      
      <LoanApplicationFooter onRepaymentClick={navigateToRepayment} />
    </div>
  );
};

export default LoanApplicationPage;
