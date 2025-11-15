
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft, CreditCard, Loader2, AlertTriangle, Info, RefreshCw } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/hooks/useAuth';
import SfdLoanPlansTable from '@/components/mobile/loan/SfdLoanPlansTable';
import { useSfdLoanPlans } from '@/hooks/useSfdLoanPlans';
import { useToast } from '@/hooks/use-toast';
import { useSfdDataAccess } from '@/hooks/useSfdDataAccess';
import { Alert, AlertDescription } from '@/components/ui/alert';

const MobileLoanPlansPage: React.FC = () => {
  const navigate = useNavigate();
  const { activeSfdId, user } = useAuth();
  const [activeTab, setActiveTab] = useState('standard');
  const { data: plans = [], isLoading, error, refetch } = useSfdLoanPlans();
  const { sfds } = useSfdDataAccess();
  const { toast } = useToast();
  
  // State to display debug information
  const [showDebug, setShowDebug] = useState(false);
  
  // Debug information
  const activeSfd = sfds.find(sfd => sfd.id === activeSfdId);
  
  useEffect(() => {
    console.log('MobileLoanPlansPage - Current state:', {
      activeSfdId,
      activeSfd: activeSfd?.name,
      userSfds: sfds.length,
      plans: plans.length
    });
    
    // Check if active SFD is set
    if (!activeSfdId && sfds.length > 0) {
      toast({
        title: "Attention",
        description: "Aucune SFD active n'a été sélectionnée. Certains contenus peuvent être limités.",
        variant: "default",
      });
    }
  }, [activeSfdId, plans, sfds]);
  
  // Count standard and subsidized plans
  const standardPlans = plans.filter(plan => 
    !(plan.name.toLowerCase().includes('subvention') || 
    plan.description?.toLowerCase().includes('subvention'))
  ).length;
  
  const subsidizedPlans = plans.filter(plan => 
    plan.name.toLowerCase().includes('subvention') || 
    plan.description?.toLowerCase().includes('subvention')
  ).length;
  
  const toggleDebug = () => {
    setShowDebug(!showDebug);
  };

  const handleRefresh = () => {
    refetch();
    toast({
      title: "Actualisation",
      description: "Les plans de prêt sont en cours d'actualisation...",
    });
  };
  
  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <div className="bg-white p-4 shadow-sm flex items-center justify-between">
        <div className="flex items-center">
          <Button 
            variant="ghost" 
            size="sm" 
            className="mr-2 p-0" 
            onClick={() => navigate('/mobile-flow/loans')}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-xl font-bold">Plans de prêt</h1>
            <p className="text-gray-500 text-sm">
              {activeSfd ? `${activeSfd.name}` : 'Découvrez nos offres de financement'}
            </p>
          </div>
        </div>
        
        <Button
          variant="ghost"
          size="sm"
          onClick={handleRefresh}
          className="mr-2"
        >
          <RefreshCw className="h-4 w-4" />
        </Button>

        {/* Secret debug toggle */}
        <div onClick={toggleDebug} className="p-2"></div>
      </div>
      
      {/* Debug information */}
      {showDebug && (
        <div className="p-4 bg-black text-green-400 font-mono text-xs overflow-auto">
          <p>User: {user?.id || 'Not logged in'}</p>
          <p>Active SFD ID: {activeSfdId || 'None'}</p>
          <p>Active SFD: {activeSfd?.name || 'None'}</p>
          <p>Available SFDs: {sfds.map(s => s.name).join(', ') || 'None'}</p>
          <p>Plans count: {plans.length}</p>
          <p>Standard: {standardPlans}, Subsidized: {subsidizedPlans}</p>
          <p>Error: {error ? 'Yes' : 'No'}</p>
        </div>
      )}
      
      <div className="p-4">
        {/* Display warning when no active SFD is selected */}
        {!activeSfdId && sfds.length > 0 && (
          <Alert className="mb-4 border-amber-200 bg-amber-50 text-amber-800">
            <AlertDescription>
              Aucune SFD active n'a été sélectionnée. Veuillez sélectionner une SFD pour voir ses plans de prêt.
            </AlertDescription>
          </Alert>
        )}
      
        {isLoading ? (
          <div className="flex justify-center items-center h-40 flex-col">
            <Loader2 className="h-8 w-8 text-[#0D6A51] animate-spin mb-2" />
            <span className="text-gray-600">Chargement des plans...</span>
          </div>
        ) : error ? (
          <div className="p-4 my-4 bg-red-50 border border-red-200 rounded-md text-center flex flex-col items-center">
            <AlertTriangle className="h-6 w-6 text-red-500 mb-2" />
            <p className="text-red-600">Impossible de charger les plans de prêt</p>
            <Button 
              variant="outline" 
              size="sm" 
              className="mt-2" 
              onClick={() => refetch()}
            >
              Réessayer
            </Button>
          </div>
        ) : !activeSfdId ? (
          <div className="p-4 my-4 bg-amber-50 border border-amber-200 rounded-md text-center flex flex-col items-center">
            <Info className="h-6 w-6 text-amber-500 mb-2" />
            <p className="text-amber-800 font-medium">Aucune SFD active</p>
            <p className="text-amber-700 text-sm mt-1">Veuillez sélectionner une SFD pour voir ses plans de prêt</p>
            <Button 
              variant="outline" 
              size="sm" 
              className="mt-3 border-amber-400 text-amber-700" 
              onClick={() => navigate('/mobile-flow/profile')}
            >
              Gérer mes SFDs
            </Button>
          </div>
        ) : plans.length === 0 ? (
          <div className="p-4 my-4 bg-blue-50 border border-blue-200 rounded-md text-center flex flex-col items-center">
            <Info className="h-6 w-6 text-blue-500 mb-2" />
            <p className="text-blue-800 font-medium">Aucun plan de prêt disponible</p>
            <p className="text-blue-700 text-sm mt-1">
              Les plans de prêt pour {activeSfd?.name || 'cette SFD'} ne sont pas encore disponibles ou sont en cours de chargement.
            </p>
            <Button 
              variant="outline" 
              size="sm" 
              className="mt-3 border-blue-400 text-blue-700" 
              onClick={() => refetch()}
            >
              Actualiser
            </Button>
          </div>
        ) : (
          <Tabs defaultValue="standard" value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-4">
              <TabsTrigger value="standard">
                Prêts standards ({standardPlans})
              </TabsTrigger>
              <TabsTrigger value="subsidized">
                Prêts subventionnés ({subsidizedPlans})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="standard" className="mt-0">
              <SfdLoanPlansTable sfdId={activeSfdId} />
            </TabsContent>

            <TabsContent value="subsidized" className="mt-0">
              <div className="bg-amber-50 p-4 rounded-lg mb-4 border border-amber-200">
                <h3 className="font-medium text-amber-800">Prêts subventionnés</h3>
                <p className="text-sm text-amber-700 mt-1">
                  Les prêts subventionnés bénéficient d'un taux d'intérêt réduit grâce à une subvention de l'État ou d'un partenaire.
                </p>
              </div>
              <SfdLoanPlansTable sfdId={activeSfdId} subsidizedOnly={true} />
            </TabsContent>
          </Tabs>
        )}
        
        <div className="fixed bottom-0 left-0 right-0 bg-white p-4 border-t">
          <div className="text-center text-sm text-gray-600">
            <Info className="h-4 w-4 inline-block mr-1" />
            Sélectionnez un plan ci-dessus pour faire une demande
          </div>
        </div>
      </div>
    </div>
  );
};

export default MobileLoanPlansPage;
