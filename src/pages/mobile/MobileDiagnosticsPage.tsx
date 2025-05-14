
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ChevronLeft } from 'lucide-react';
import ClientStatusCheck from '@/components/mobile/diagnostics/ClientStatusCheck';

const MobileDiagnosticsPage: React.FC = () => {
  const navigate = useNavigate();

  // Handle back button press
  const handleBack = () => {
    navigate(-1);
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="bg-[#0D6A51] text-white p-4">
        <div className="flex items-center">
          <Button 
            variant="ghost" 
            size="icon" 
            className="text-white mr-2" 
            onClick={handleBack}
          >
            <ChevronLeft className="h-6 w-6" />
          </Button>
          <h1 className="text-xl font-semibold">Diagnostics</h1>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 space-y-4">
        <p className="text-sm text-gray-600 mb-2">
          Utilisez ces outils pour vérifier le statut de votre compte et résoudre les problèmes courants.
        </p>
        
        <ClientStatusCheck />
        
        <p className="text-xs text-gray-500 mt-6 text-center">
          Si vous rencontrez des problèmes avec l'application, contactez le support technique.
        </p>
      </div>
    </div>
  );
};

export default MobileDiagnosticsPage;
