
import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface FundsHeaderProps {
  onBack: () => void;
}

const FundsHeader: React.FC<FundsHeaderProps> = ({ onBack }) => {
  return (
    <div className="bg-gradient-to-r from-[#0D6A51] to-[#0D6A51]/90 text-white p-4">
      <div className="flex items-center mb-2">
        <Button variant="ghost" className="p-1 text-white" onClick={onBack}>
          <ArrowLeft className="h-6 w-6" />
        </Button>
        <h1 className="text-lg font-bold ml-2">Gestion des Fonds</h1>
      </div>
    </div>
  );
};

export default FundsHeader;
