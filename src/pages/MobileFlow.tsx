
import React from 'react';
import MobileNavigation from '@/components/MobileNavigation';
import LoanApplicationFlow from '@/components/LoanApplicationFlow';
import { useIsMobile } from '@/hooks/use-mobile';
import { SecurePaymentLayer } from '@/components/SecurePaymentLayer';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CreditCard, FileText, Shield } from 'lucide-react';

const MobileFlow = () => {
  const isMobile = useIsMobile();

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto pt-4 px-4 pb-2 flex justify-center items-center">
        <div className="flex flex-col items-center">
          <img 
            src="/lovable-uploads/08a3f3d2-0612-4e7e-8248-5ba5eb3fce63.png" 
            alt="NGNA SÔRÔ! Logo" 
            className="h-16 mb-1"
          />
          <h1 className="text-xl font-bold text-center">
            <span className="text-[#FFAB2E]">N'GNA</span> <span className="text-[#0D6A51]">SÔRÔ!</span>
          </h1>
          <p className="text-xs text-[#0D6A51] mb-2">MEREF - SFD</p>
        </div>
      </div>
      
      <div className="container mx-auto px-4 pb-20">
        <Tabs defaultValue="application" className="w-full">
          <TabsList className="grid grid-cols-3 mb-6">
            <TabsTrigger value="application">
              <FileText className="h-4 w-4 mr-2" />
              Demande
            </TabsTrigger>
            <TabsTrigger value="payment">
              <CreditCard className="h-4 w-4 mr-2" />
              Paiement
            </TabsTrigger>
            <TabsTrigger value="security">
              <Shield className="h-4 w-4 mr-2" />
              Sécurité
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="application">
            <LoanApplicationFlow />
          </TabsContent>
          
          <TabsContent value="payment">
            <SecurePaymentLayer />
          </TabsContent>
          
          <TabsContent value="security">
            <div className="bg-white p-4 rounded-lg border space-y-4">
              <h2 className="text-lg font-medium flex items-center">
                <Shield className="h-5 w-5 mr-2 text-[#0D6A51]" />
                Protocoles de Sécurité
              </h2>
              
              <div className="space-y-4">
                <div className="p-3 bg-green-50 rounded-md">
                  <h3 className="text-sm font-medium text-green-800">Tokenisation PCI DSS Level 1</h3>
                  <p className="text-xs text-green-700 mt-1">
                    Vos informations bancaires sont sécurisées selon les normes PCI DSS Level 1, 
                    garantissant une protection maximale de vos données.
                  </p>
                </div>
                
                <div className="p-3 bg-blue-50 rounded-md">
                  <h3 className="text-sm font-medium text-blue-800">Vérification Biométrique</h3>
                  <p className="text-xs text-blue-700 mt-1">
                    Pour les transactions supérieures à 50,000 FCFA, une vérification biométrique 
                    est requise pour renforcer la sécurité.
                  </p>
                </div>
                
                <div className="p-3 bg-amber-50 rounded-md">
                  <h3 className="text-sm font-medium text-amber-800">Double Approbation</h3>
                  <p className="text-xs text-amber-700 mt-1">
                    Les remboursements anticipés nécessitent une validation en deux étapes 
                    pour prévenir les transactions frauduleuses.
                  </p>
                </div>
                
                <div className="p-3 bg-purple-50 rounded-md">
                  <h3 className="text-sm font-medium text-purple-800">Réconciliation CAMT.053</h3>
                  <p className="text-xs text-purple-700 mt-1">
                    Le protocole CAMT.053 assure une réconciliation quotidienne précise 
                    de toutes vos transactions financières.
                  </p>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
      
      <MobileNavigation />
    </div>
  );
};

export default MobileFlow;
