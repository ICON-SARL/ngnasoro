
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  ArrowRight, 
  ArrowDown, 
  CheckCircle, 
  MessageSquare, 
  Smartphone, 
  QrCode, 
  Building, 
  CreditCard,
  User
} from 'lucide-react';

const LoanWorkflowDiagram = () => {
  return (
    <Card className="shadow-md">
      <CardHeader className="bg-gray-50">
        <CardTitle className="text-center text-lg font-medium">
          Workflow de Gestion des Fonds & Paiements
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-6 pb-8">
        <div className="flex flex-col items-center">
          {/* Client to App: Loan Request */}
          <div className="flex items-center justify-center w-full mb-6">
            <div className="flex-1 text-right pr-3">
              <div className="inline-flex items-center bg-blue-50 px-3 py-2 rounded-lg">
                <User className="h-5 w-5 mr-2 text-blue-600" />
                <span className="font-medium">Client</span>
              </div>
            </div>
            <ArrowRight className="h-6 w-6 text-gray-400 mx-2" />
            <div className="flex-1 pl-3">
              <div className="inline-flex items-center bg-emerald-50 px-3 py-2 rounded-lg">
                <Smartphone className="h-5 w-5 mr-2 text-emerald-600" />
                <span className="font-medium">Application</span>
              </div>
              <div className="text-sm text-gray-600 mt-1">Demande de prêt</div>
            </div>
          </div>

          {/* App to SFD: Solvency Verification */}
          <div className="w-px h-8 bg-gray-300"></div>
          <div className="flex items-center justify-center w-full mb-6">
            <div className="flex-1 text-right pr-3">
              <div className="inline-flex items-center bg-emerald-50 px-3 py-2 rounded-lg">
                <Smartphone className="h-5 w-5 mr-2 text-emerald-600" />
                <span className="font-medium">Application</span>
              </div>
            </div>
            <ArrowRight className="h-6 w-6 text-gray-400 mx-2" />
            <div className="flex-1 pl-3">
              <div className="inline-flex items-center bg-purple-50 px-3 py-2 rounded-lg">
                <Building className="h-5 w-5 mr-2 text-purple-600" />
                <span className="font-medium">SFD API</span>
              </div>
              <div className="text-sm text-gray-600 mt-1">Vérification solvabilité</div>
            </div>
          </div>

          {/* SFD to App: Approval */}
          <div className="w-px h-8 bg-gray-300"></div>
          <div className="flex items-center justify-center w-full mb-6">
            <div className="flex-1 text-right pr-3">
              <div className="inline-flex items-center bg-purple-50 px-3 py-2 rounded-lg">
                <Building className="h-5 w-5 mr-2 text-purple-600" />
                <span className="font-medium">SFD API</span>
              </div>
            </div>
            <ArrowRight className="h-6 w-6 text-gray-400 mx-2 rotate-180" />
            <div className="flex-1 pl-3">
              <div className="inline-flex items-center bg-emerald-50 px-3 py-2 rounded-lg">
                <Smartphone className="h-5 w-5 mr-2 text-emerald-600" />
                <span className="font-medium">Application</span>
              </div>
              <div className="text-sm text-gray-600 mt-1">Approbation + Montant</div>
            </div>
          </div>

          {/* Client to App: Contract Acceptance */}
          <div className="w-px h-8 bg-gray-300"></div>
          <div className="flex items-center justify-center w-full mb-6">
            <div className="flex-1 text-right pr-3">
              <div className="inline-flex items-center bg-blue-50 px-3 py-2 rounded-lg">
                <User className="h-5 w-5 mr-2 text-blue-600" />
                <span className="font-medium">Client</span>
              </div>
            </div>
            <ArrowRight className="h-6 w-6 text-gray-400 mx-2" />
            <div className="flex-1 pl-3">
              <div className="inline-flex items-center bg-emerald-50 px-3 py-2 rounded-lg">
                <Smartphone className="h-5 w-5 mr-2 text-emerald-600" />
                <span className="font-medium">Application</span>
              </div>
              <div className="text-sm text-gray-600 mt-1">Acceptation contractuelle</div>
            </div>
          </div>

          {/* App to Core Banking: Credit account */}
          <div className="w-px h-8 bg-gray-300"></div>
          <div className="flex items-center justify-center w-full mb-6">
            <div className="flex-1 text-right pr-3">
              <div className="inline-flex items-center bg-emerald-50 px-3 py-2 rounded-lg">
                <Smartphone className="h-5 w-5 mr-2 text-emerald-600" />
                <span className="font-medium">Application</span>
              </div>
            </div>
            <ArrowRight className="h-6 w-6 text-gray-400 mx-2" />
            <div className="flex-1 pl-3">
              <div className="inline-flex items-center bg-orange-50 px-3 py-2 rounded-lg">
                <Building className="h-5 w-5 mr-2 text-orange-600" />
                <span className="font-medium">Core Banking</span>
              </div>
              <div className="text-sm text-gray-600 mt-1">Crédit compte SFD client</div>
            </div>
          </div>

          {/* Core Banking to Client: SMS Confirmation */}
          <div className="w-px h-8 bg-gray-300"></div>
          <div className="flex items-center justify-center w-full mb-6">
            <div className="flex-1 text-right pr-3">
              <div className="inline-flex items-center bg-orange-50 px-3 py-2 rounded-lg">
                <Building className="h-5 w-5 mr-2 text-orange-600" />
                <span className="font-medium">Core Banking</span>
              </div>
            </div>
            <ArrowRight className="h-6 w-6 text-gray-400 mx-2 rotate-180" />
            <div className="flex-1 pl-3">
              <div className="inline-flex items-center bg-blue-50 px-3 py-2 rounded-lg">
                <User className="h-5 w-5 mr-2 text-blue-600" />
                <span className="font-medium">Client</span>
              </div>
              <div className="text-sm text-gray-600 mt-1">SMS de confirmation</div>
            </div>
          </div>

          {/* Client to App: Disbursement Choice */}
          <div className="w-px h-8 bg-gray-300"></div>
          <div className="flex items-center justify-center w-full mb-6">
            <div className="flex-1 text-right pr-3">
              <div className="inline-flex items-center bg-blue-50 px-3 py-2 rounded-lg">
                <User className="h-5 w-5 mr-2 text-blue-600" />
                <span className="font-medium">Client</span>
              </div>
            </div>
            <ArrowRight className="h-6 w-6 text-gray-400 mx-2" />
            <div className="flex-1 pl-3">
              <div className="inline-flex items-center bg-emerald-50 px-3 py-2 rounded-lg">
                <Smartphone className="h-5 w-5 mr-2 text-emerald-600" />
                <span className="font-medium">Application</span>
              </div>
              <div className="text-sm text-gray-600 mt-1">Choix de décaissement</div>
            </div>
          </div>

          {/* Disbursement Options */}
          <div className="w-px h-8 bg-gray-300"></div>
          <div className="flex justify-center w-full mb-6">
            <div className="grid grid-cols-2 gap-6 w-full max-w-lg">
              {/* Mobile Money Option */}
              <div className="flex flex-col items-center">
                <div className="flex items-center justify-center mb-2">
                  <div className="inline-flex items-center bg-emerald-50 px-3 py-2 rounded-lg">
                    <Smartphone className="h-5 w-5 mr-2 text-emerald-600" />
                    <span className="font-medium">Application</span>
                  </div>
                  <ArrowDown className="h-6 w-6 text-gray-400 mx-2 my-2" />
                </div>
                <div className="inline-flex items-center bg-yellow-50 px-3 py-2 rounded-lg">
                  <Smartphone className="h-5 w-5 mr-2 text-yellow-600" />
                  <span className="font-medium">Mobile Money</span>
                </div>
                <div className="text-sm text-gray-600 mt-1 text-center">Transfert direct</div>
              </div>

              {/* Agency QR Code Option */}
              <div className="flex flex-col items-center">
                <div className="flex items-center justify-center mb-2">
                  <div className="inline-flex items-center bg-emerald-50 px-3 py-2 rounded-lg">
                    <Smartphone className="h-5 w-5 mr-2 text-emerald-600" />
                    <span className="font-medium">Application</span>
                  </div>
                  <ArrowDown className="h-6 w-6 text-gray-400 mx-2 my-2" />
                </div>
                <div className="inline-flex items-center bg-indigo-50 px-3 py-2 rounded-lg">
                  <Building className="h-5 w-5 mr-2 text-indigo-600" />
                  <span className="font-medium">SFD Agence</span>
                </div>
                <div className="text-sm text-gray-600 mt-1 text-center">QR Code pour retrait</div>
              </div>
            </div>
          </div>

          {/* Final Status */}
          <div className="mt-4 text-center">
            <div className="bg-green-50 px-4 py-3 rounded-lg inline-flex items-center">
              <CheckCircle className="h-5 w-5 mr-2 text-green-600" />
              <span className="font-medium">Fonds Décaissés</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default LoanWorkflowDiagram;
