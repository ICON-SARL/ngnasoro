
import React from 'react';
import { AgencyHeader } from '@/components/AgencyHeader';
import { Button } from '@/components/ui/button';
import { Plus, CreditCard } from 'lucide-react';
import { useLoansPage } from '@/hooks/sfd/useLoansPage';
import LoanStatusTabs from '@/components/sfd/loans/LoanStatusTabs';
import NewLoanDialog from '@/components/sfd/loans/NewLoanDialog';
import SubsidyRequestDialog from '@/components/sfd/loans/SubsidyRequestDialog';

const SfdLoansPage = () => {
  const {
    loans,
    loading,
    activeTab,
    setActiveTab,
    openNewLoanDialog,
    setOpenNewLoanDialog,
    openSubsidyRequestDialog,
    setOpenSubsidyRequestDialog,
    loanForm,
    handleInputChange,
    handleSelectChange,
    handleCreateLoan,
    handleCreateSubsidyRequest,
    clients,
  } = useLoansPage();
  
  return (
    <div className="min-h-screen bg-gray-50">
      <AgencyHeader />
      
      <div className="container mx-auto py-6 px-4">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold">Gestion des Prêts SFD</h1>
            <p className="text-muted-foreground">Gestion et suivi des prêts de votre institution</p>
          </div>
          
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              onClick={() => setOpenSubsidyRequestDialog(true)}
            >
              <CreditCard className="h-4 w-4 mr-2" />
              Demande de Subvention
            </Button>
            
            <Button onClick={() => setOpenNewLoanDialog(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Nouveau Prêt
            </Button>
          </div>
        </div>
        
        <LoanStatusTabs 
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          loans={loans}
          loading={loading}
        />
        
        {/* Dialogs */}
        <NewLoanDialog 
          open={openNewLoanDialog}
          onOpenChange={setOpenNewLoanDialog}
          formData={loanForm}
          onInputChange={handleInputChange}
          onSelectChange={handleSelectChange}
          onSubmit={handleCreateLoan}
          clients={clients}
        />
        
        <SubsidyRequestDialog 
          open={openSubsidyRequestDialog}
          onOpenChange={setOpenSubsidyRequestDialog}
          onSubmit={handleCreateSubsidyRequest}
        />
      </div>
    </div>
  );
};

export default SfdLoansPage;
