
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { PlusCircle, Building, BadgePercent, FileText } from 'lucide-react';
import { MerefFundRequestForm } from './MerefFundRequestForm';
import LoanList from './loans/LoanList';
import LoanPlanManagement from './loans/LoanPlanManagement';
import { useSfdLoans } from '@/hooks/useSfdLoans';
import LoanPlanDialog from './LoanPlanDialog';

export function LoanManagement() {
  const [activeTab, setActiveTab] = useState('loans');
  const { data: loans, isLoading } = useSfdLoans();
  const [isLoanPlanDialogOpen, setIsLoanPlanDialogOpen] = useState(false);
  const [planToEdit, setPlanToEdit] = useState<any>(null);
  
  const handleOpenNewPlanDialog = () => {
    setPlanToEdit(null);
    setIsLoanPlanDialogOpen(true);
  };

  const handleEditPlan = (plan: any) => {
    setPlanToEdit(plan);
    setIsLoanPlanDialogOpen(true);
  };

  const handleClosePlanDialog = () => {
    setIsLoanPlanDialogOpen(false);
  };
  
  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <div className="flex items-center justify-between">
          <TabsList>
            <TabsTrigger value="loans" className="flex items-center">
              <FileText className="h-4 w-4 mr-2" />
              Prêts Clients
            </TabsTrigger>
            <TabsTrigger value="plans" className="flex items-center">
              <BadgePercent className="h-4 w-4 mr-2" />
              Plans de Prêt
            </TabsTrigger>
            <TabsTrigger value="meref" className="flex items-center">
              <Building className="h-4 w-4 mr-2" />
              Demandes MEREF
            </TabsTrigger>
          </TabsList>
          
          {activeTab === 'meref' && (
            <Button 
              onClick={() => setActiveTab('meref-new')} 
              size="sm"
              className="flex items-center gap-2"
            >
              <PlusCircle className="h-4 w-4" />
              Nouvelle demande
            </Button>
          )}
        </div>
        
        <TabsContent value="loans" className="space-y-4 mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Prêts Clients</CardTitle>
              <CardDescription>
                Gérez les prêts octroyés à vos clients
              </CardDescription>
            </CardHeader>
            <CardContent>
              <LoanList loans={loans || []} loading={isLoading} />
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="plans" className="space-y-4 mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Plans de Prêt</CardTitle>
              <CardDescription>
                Créez et gérez vos offres de prêts pour les clients
              </CardDescription>
            </CardHeader>
            <CardContent>
              <LoanPlanManagement 
                onNewPlan={handleOpenNewPlanDialog}
                onEditPlan={handleEditPlan}
              />
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="meref" className="space-y-4 mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Demandes de financement MEREF</CardTitle>
              <CardDescription>
                Vos demandes de financement auprès du MEREF
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                La liste des demandes de financement MEREF sera implémentée ici.
              </p>
              
              <Separator className="my-4" />
              
              <div className="flex justify-center">
                <Button 
                  onClick={() => setActiveTab('meref-new')} 
                  className="flex items-center gap-2"
                >
                  <PlusCircle className="h-4 w-4" />
                  Nouvelle demande de financement
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="meref-new" className="space-y-4 mt-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Nouvelle demande de financement MEREF</h2>
            <Button variant="outline" onClick={() => setActiveTab('meref')}>
              Retour aux demandes
            </Button>
          </div>
          
          <MerefFundRequestForm />
        </TabsContent>
      </Tabs>

      {/* Loan Plan Dialog */}
      <LoanPlanDialog 
        isOpen={isLoanPlanDialogOpen} 
        onClose={handleClosePlanDialog}
        planToEdit={planToEdit}
      />
    </div>
  );
}
