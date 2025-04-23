
import React from 'react';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

export function SfdStatusAlert() {
  const navigate = useNavigate();
  
  return (
    <Alert variant="warning" className="mb-6 bg-amber-50 border-amber-200">
      <AlertCircle className="h-5 w-5 text-amber-600" />
      <AlertTitle className="text-amber-800">Attention: Aucune SFD active détectée</AlertTitle>
      <AlertDescription className="text-amber-700">
        <p className="mb-2">
          Aucune SFD active n'a été détectée dans le système. Pour utiliser pleinement la plateforme, 
          vous devez créer au moins une SFD et lui associer un administrateur.
        </p>
        <Button 
          variant="outline"
          className="bg-amber-100 border-amber-300 hover:bg-amber-200 text-amber-800"
          onClick={() => navigate('/sfd-management')}
        >
          Gérer les SFDs
        </Button>
      </AlertDescription>
    </Alert>
  );
}
