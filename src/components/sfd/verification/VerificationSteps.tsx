
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check, X, AlertCircle, Clock } from 'lucide-react';

interface VerificationStepsProps {
  currentStage: 'id_verification' | 'selfie_verification' | 'completed';
  onVerify: (type: 'id_card' | 'selfie') => void;
  onReject: (type: 'id_card' | 'selfie') => void;
  documents: {
    id_card?: { status: string; url: string };
    selfie?: { status: string; url: string };
  };
}

export function VerificationSteps({ currentStage, onVerify, onReject, documents }: VerificationStepsProps) {
  const getStepStatus = (type: 'id_card' | 'selfie') => {
    const doc = documents[type];
    if (!doc) return 'pending';
    return doc.status;
  };

  const renderStatusBadge = (status: string) => {
    switch (status) {
      case 'verified':
        return <Badge className="bg-green-50 text-green-700">Vérifié</Badge>;
      case 'rejected':
        return <Badge variant="destructive">Rejeté</Badge>;
      default:
        return <Badge variant="outline" className="bg-yellow-50 text-yellow-700">En attente</Badge>;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Étapes de vérification</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* ID Card Verification Step */}
        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
          <div className="flex items-center space-x-4">
            <div className={`p-2 rounded-full ${
              getStepStatus('id_card') === 'verified' ? 'bg-green-100' :
              getStepStatus('id_card') === 'rejected' ? 'bg-red-100' : 'bg-yellow-100'
            }`}>
              {getStepStatus('id_card') === 'verified' ? (
                <Check className="h-5 w-5 text-green-600" />
              ) : getStepStatus('id_card') === 'rejected' ? (
                <X className="h-5 w-5 text-red-600" />
              ) : (
                <Clock className="h-5 w-5 text-yellow-600" />
              )}
            </div>
            <div>
              <h3 className="font-medium">Vérification CNI</h3>
              <p className="text-sm text-gray-500">Étape 1/2</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            {renderStatusBadge(getStepStatus('id_card'))}
            {currentStage === 'id_verification' && getStepStatus('id_card') === 'pending' && (
              <div className="space-x-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => onVerify('id_card')}
                  className="bg-green-50 text-green-700 hover:bg-green-100"
                >
                  <Check className="h-4 w-4 mr-1" />
                  Valider
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => onReject('id_card')}
                  className="bg-red-50 text-red-700 hover:bg-red-100"
                >
                  <X className="h-4 w-4 mr-1" />
                  Rejeter
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Selfie Verification Step */}
        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
          <div className="flex items-center space-x-4">
            <div className={`p-2 rounded-full ${
              getStepStatus('selfie') === 'verified' ? 'bg-green-100' :
              getStepStatus('selfie') === 'rejected' ? 'bg-red-100' : 'bg-yellow-100'
            }`}>
              {getStepStatus('selfie') === 'verified' ? (
                <Check className="h-5 w-5 text-green-600" />
              ) : getStepStatus('selfie') === 'rejected' ? (
                <X className="h-5 w-5 text-red-600" />
              ) : (
                <Clock className="h-5 w-5 text-yellow-600" />
              )}
            </div>
            <div>
              <h3 className="font-medium">Vérification Selfie</h3>
              <p className="text-sm text-gray-500">Étape 2/2</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            {renderStatusBadge(getStepStatus('selfie'))}
            {currentStage === 'selfie_verification' && getStepStatus('selfie') === 'pending' && (
              <div className="space-x-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => onVerify('selfie')}
                  className="bg-green-50 text-green-700 hover:bg-green-100"
                >
                  <Check className="h-4 w-4 mr-1" />
                  Valider
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => onReject('selfie')}
                  className="bg-red-50 text-red-700 hover:bg-red-100"
                >
                  <X className="h-4 w-4 mr-1" />
                  Rejeter
                </Button>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
