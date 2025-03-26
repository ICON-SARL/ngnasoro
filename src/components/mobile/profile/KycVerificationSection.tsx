
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Check, FileText, Home, Calendar, Shield } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const KycVerificationSection = () => {
  const navigate = useNavigate();
  
  // Simulate KYC status and documents
  const kycStatus = 'verified'; // or 'pending', 'incomplete'
  const documents = [
    { type: 'id', name: 'Carte d\'identité', status: 'verified', date: '15/04/2023' },
    { type: 'address', name: 'Justificatif de domicile', status: 'verified', date: '15/04/2023' },
  ];
  
  const handleCompleteKyc = () => {
    navigate('/kyc');
  };

  return (
    <Card className="mb-4">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">KYC & Vérification</CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-3">
          <div className="flex items-center justify-between bg-green-50 p-3 rounded-lg">
            <span className="font-medium flex items-center">
              <Shield className="h-4 w-4 mr-2 text-green-600" />
              Statut KYC:
            </span>
            <span className="text-green-600 font-medium flex items-center">
              Vérifié <Check className="h-4 w-4 ml-1" />
            </span>
          </div>
          
          <div className="space-y-2 mt-3">
            <p className="font-medium text-sm">Documents vérifiés:</p>
            
            {documents.map((doc, index) => (
              <div key={index} className="flex items-center justify-between border p-2 rounded-lg">
                <div className="flex items-center">
                  {doc.type === 'id' ? (
                    <FileText className="h-4 w-4 mr-2 text-blue-600" />
                  ) : (
                    <Home className="h-4 w-4 mr-2 text-amber-600" />
                  )}
                  <span className="text-sm">{doc.name}</span>
                </div>
                <div className="flex items-center text-xs text-gray-500">
                  <Calendar className="h-3 w-3 mr-1" />
                  {doc.date}
                  {doc.status === 'verified' && (
                    <Check className="h-3 w-3 ml-1 text-green-600" />
                  )}
                </div>
              </div>
            ))}
            
            <Button 
              variant="outline" 
              className="w-full mt-3"
              onClick={handleCompleteKyc}
            >
              Historique de vérification KYC
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default KycVerificationSection;
