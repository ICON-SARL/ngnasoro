
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Landmark, CreditCard, Calendar } from 'lucide-react';
import { PurposeOption } from './types';

interface StepReviewProps {
  loanPurpose: string;
  loanAmount: string;
  loanDuration: string;
  purposeOptions: PurposeOption[];
}

const StepReview: React.FC<StepReviewProps> = ({ 
  loanPurpose, 
  loanAmount, 
  loanDuration,
  purposeOptions 
}) => {
  return (
    <div className="space-y-5">
      <Card className="border shadow-sm rounded-xl overflow-hidden">
        <CardHeader className="bg-[#0D6A51]/10 py-3 px-4">
          <CardTitle className="text-sm font-medium text-[#0D6A51]">Récapitulatif de votre demande</CardTitle>
        </CardHeader>
        <CardContent className="p-4 space-y-4">
          <div className="space-y-3">
            <div className="flex justify-between items-center py-2 border-b border-dashed border-gray-200">
              <div className="flex items-center">
                {purposeOptions.find(p => p.id === loanPurpose)?.icon || <Landmark className="h-5 w-5 mr-2 text-[#0D6A51]" />}
                <span className="text-gray-600 ml-2">Objet</span>
              </div>
              <span className="font-medium">{purposeOptions.find(p => p.id === loanPurpose)?.name || loanPurpose}</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-dashed border-gray-200">
              <div className="flex items-center">
                <CreditCard className="h-5 w-5 mr-2 text-[#0D6A51]" />
                <span className="text-gray-600">Montant</span>
              </div>
              <span className="font-medium">{parseInt(loanAmount).toLocaleString('fr-FR')} FCFA</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-dashed border-gray-200">
              <div className="flex items-center">
                <Calendar className="h-5 w-5 mr-2 text-[#0D6A51]" />
                <span className="text-gray-600">Durée</span>
              </div>
              <span className="font-medium">{loanDuration} mois</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-dashed border-gray-200">
              <div className="flex items-center">
                <Landmark className="h-5 w-5 mr-2 text-[#0D6A51]" />
                <span className="text-gray-600">Agence</span>
              </div>
              <span className="font-medium">Agence Centrale Bamako</span>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card className="border rounded-xl shadow-sm overflow-hidden">
        <CardContent className="p-4">
          <h3 className="font-medium mb-3">Conditions du prêt</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between items-center bg-gray-50 p-2 rounded">
              <span className="text-gray-600">Taux d'intérêt</span>
              <span className="font-medium">5.5% par an</span>
            </div>
            <div className="flex justify-between items-center bg-gray-50 p-2 rounded">
              <span className="text-gray-600">Mensualité estimée</span>
              <span className="font-medium">{(parseInt(loanAmount || '0') / parseInt(loanDuration || '1') * 1.055).toFixed(0)} FCFA</span>
            </div>
            <div className="flex justify-between items-center bg-gray-50 p-2 rounded">
              <span className="text-gray-600">Frais de dossier</span>
              <span className="font-medium">2,000 FCFA</span>
            </div>
            <div className="flex justify-between items-center bg-gray-50 p-2 rounded">
              <span className="text-gray-600">Total à rembourser</span>
              <span className="font-medium font-bold">{(parseInt(loanAmount || '0') * 1.055 + 2000).toFixed(0)} FCFA</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default StepReview;
