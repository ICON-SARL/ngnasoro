
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { XCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const AccessDeniedPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <div className="flex flex-col items-center gap-4">
            <div className="h-12 w-12 bg-red-50 text-red-600 rounded-full flex items-center justify-center">
              <XCircle className="h-6 w-6" />
            </div>
            <CardTitle className="text-2xl text-center">
              Accès Refusé
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent className="text-center">
          <p className="text-gray-600 mb-6">
            Vous n'avez pas les permissions nécessaires pour accéder à cette page.
          </p>
          <Button onClick={() => navigate('/auth')} className="bg-[#0D6A51] hover:bg-[#0D6A51]/90">
            Retour à l'accueil
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default AccessDeniedPage;
