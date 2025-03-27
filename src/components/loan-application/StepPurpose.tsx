
import React from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { ShoppingBag, BadgeEuro, User, ShieldCheck, Home, Wallet } from 'lucide-react';
import { PurposeOption } from './types';

interface StepPurposeProps {
  loanPurpose: string;
  setPurpose: (purpose: string) => void;
}

const StepPurpose: React.FC<StepPurposeProps> = ({ loanPurpose, setPurpose }) => {
  const purposeOptions: PurposeOption[] = [
    { id: 'agriculture', name: 'Agriculture', icon: <ShoppingBag className="h-6 w-6 mb-2 text-green-500" />, description: "Financement agricole" },
    { id: 'commerce', name: 'Commerce', icon: <BadgeEuro className="h-6 w-6 mb-2 text-blue-500" />, description: "Développement commercial" },
    { id: 'education', name: 'Éducation', icon: <User className="h-6 w-6 mb-2 text-purple-500" />, description: "Frais de scolarité" },
    { id: 'sante', name: 'Santé', icon: <ShieldCheck className="h-6 w-6 mb-2 text-red-500" />, description: "Dépenses médicales" },
    { id: 'logement', name: 'Logement', icon: <Home className="h-6 w-6 mb-2 text-amber-500" />, description: "Amélioration habitat" },
    { id: 'autre', name: 'Autre', icon: <Wallet className="h-6 w-6 mb-2 text-gray-500" />, description: "Autre besoin" },
  ];

  return (
    <div className="space-y-4">
      <Label htmlFor="purpose" className="text-lg font-medium">Objet du prêt</Label>
      <p className="text-sm text-gray-500 mb-3">Sélectionnez la raison principale pour laquelle vous avez besoin de ce financement</p>
      
      <div className="grid grid-cols-2 gap-3">
        {purposeOptions.map(option => (
          <Button
            key={option.id}
            variant={loanPurpose === option.id ? "default" : "outline"}
            className={`h-auto py-4 px-3 flex flex-col gap-1 justify-center items-center transition-all ${
              loanPurpose === option.id 
                ? 'bg-[#0D6A51] hover:bg-[#0D6A51]/90 text-white shadow-md scale-105' 
                : 'hover:border-[#0D6A51]/40 hover:bg-[#0D6A51]/5'
            }`}
            onClick={() => setPurpose(option.id)}
          >
            {option.icon}
            <span className="font-medium">{option.name}</span>
            <span className="text-xs opacity-80">{option.description}</span>
          </Button>
        ))}
      </div>
    </div>
  );
};

export default StepPurpose;
