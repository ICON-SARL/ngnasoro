
import React from 'react';
import { useNavigate } from 'react-router-dom';
import MobileLayout from '@/components/mobile/layout/MobileLayout';
import LoanProcessDiagram from '@/components/mobile/loan/LoanProcessDiagram';
import { Button } from '@/components/ui/button';
import { ArrowLeft, FileText, CheckCircle, AlertCircle } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

const LoanProcessFlowPage: React.FC = () => {
  const navigate = useNavigate();
  
  return (
    <MobileLayout>
      <div className="bg-white p-4 shadow-sm flex items-center gap-2">
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={() => navigate('/mobile-flow/loans')}
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-xl font-semibold">Processus de Prêt</h1>
      </div>
      
      <div className="p-4 pb-16">
        <p className="text-gray-500 mb-6">
          Ce diagramme illustre les étapes du processus d'obtention d'un prêt, depuis la demande jusqu'au décaissement.
        </p>
        
        <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
          <h2 className="text-lg font-semibold mb-4">Étapes du processus</h2>
          <LoanProcessDiagram currentStage="application" />
        </div>
        
        <div className="space-y-4 mt-8">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-start">
                <div className="flex-shrink-0 mr-3 mt-1">
                  <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                    <FileText className="h-4 w-4 text-blue-600" />
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold mb-1">1. Demande</h3>
                  <p className="text-sm text-gray-500">
                    Remplissez le formulaire de demande et soumettez les documents requis. Notre système évaluera automatiquement votre éligibilité.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-start">
                <div className="flex-shrink-0 mr-3 mt-1">
                  <div className="h-8 w-8 rounded-full bg-amber-100 flex items-center justify-center">
                    <AlertCircle className="h-4 w-4 text-amber-600" />
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold mb-1">2. Vérification</h3>
                  <p className="text-sm text-gray-500">
                    Nos agents vérifient les informations fournies et évaluent votre capacité de remboursement selon nos critères.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-start">
                <div className="flex-shrink-0 mr-3 mt-1">
                  <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold mb-1">3. Approbation</h3>
                  <p className="text-sm text-gray-500">
                    Une fois votre demande approuvée, vous recevrez une notification et les conditions de votre prêt.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-start">
                <div className="flex-shrink-0 mr-3 mt-1">
                  <div className="h-8 w-8 rounded-full bg-purple-100 flex items-center justify-center">
                    <FileText className="h-4 w-4 text-purple-600" />
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold mb-1">4. Décaissement</h3>
                  <p className="text-sm text-gray-500">
                    Les fonds sont transférés sur votre compte. Vous pouvez suivre le statut du décaissement dans l'application.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-start">
                <div className="flex-shrink-0 mr-3 mt-1">
                  <div className="h-8 w-8 rounded-full bg-teal-100 flex items-center justify-center">
                    <CheckCircle className="h-4 w-4 text-teal-600" />
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold mb-1">5. Terminé</h3>
                  <p className="text-sm text-gray-500">
                    Le prêt est actif et vous pouvez commencer à effectuer vos remboursements mensuels selon le calendrier établi.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        
        <div className="mt-8">
          <Button 
            onClick={() => navigate('/mobile-flow/loan-plans')} 
            className="w-full bg-[#0D6A51] hover:bg-[#0D6A51]/90"
          >
            Voir les plans de prêt disponibles
          </Button>
        </div>
      </div>
    </MobileLayout>
  );
};

export default LoanProcessFlowPage;
