
import React from 'react';
import { AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

interface ErrorStateProps {
  message?: string;
  retryFn?: () => void;
}

const ErrorState: React.FC<ErrorStateProps> = ({ 
  message = "Impossible de récupérer les informations de votre compte",
  retryFn
}) => {
  const navigate = useNavigate();

  return (
    <div className="bg-white rounded-xl p-6 text-center shadow-sm">
      <div className="bg-red-100 text-red-600 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
        <AlertCircle className="h-8 w-8" />
      </div>
      <h3 className="text-lg font-medium mb-3 text-red-600">Erreur</h3>
      <p className="text-gray-600 mb-6">
        {message}
      </p>
      <div className="flex flex-col gap-3">
        {retryFn && (
          <Button 
            onClick={retryFn}
            className="bg-[#0D6A51] hover:bg-[#0D6A51]/90"
          >
            Réessayer
          </Button>
        )}
        <Button 
          variant="outline" 
          onClick={() => navigate('/sfd-selector')}
        >
          Ajouter une SFD
        </Button>
      </div>
    </div>
  );
};

export default ErrorState;
