
import React from 'react';
import { PlusCircle } from 'lucide-react';

interface MerefRequestHeaderProps {
  onNewRequest: () => void;
}

export const MerefRequestHeader: React.FC<MerefRequestHeaderProps> = ({ onNewRequest }) => {
  return (
    <div className="mb-6">
      <h2 className="text-2xl font-bold">Demandes de Financement MEREF</h2>
      <p className="text-muted-foreground">
        Soumettez vos demandes de financement auprès du MEREF pour obtenir des fonds à taux préférentiel
      </p>
      <button 
        onClick={onNewRequest} 
        className="mt-4 flex items-center gap-2 bg-[#0D6A51] text-white px-4 py-2 rounded hover:bg-[#0D6A51]/90"
      >
        <PlusCircle className="h-4 w-4" />
        Nouvelle demande
      </button>
    </div>
  );
};
