
import React from 'react';
import { Mail, ArrowRight, Check } from 'lucide-react';

interface SuccessStateProps {
  email: string;
}

const SuccessState = ({ email }: SuccessStateProps) => {
  return (
    <div className="p-6 space-y-6">
      <div className="text-center">
        <div className="h-16 w-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
          <Check className="h-8 w-8 text-green-600" />
        </div>
        <h3 className="text-xl font-semibold text-gray-800 mb-2">
          Email envoyé!
        </h3>
        <p className="text-gray-600 text-sm">
          Un lien de connexion a été envoyé à l'adresse suivante:
        </p>
      </div>
      
      <div className="bg-gray-50 rounded-lg p-4 flex items-center gap-3">
        <Mail className="text-[#0D6A51] h-6 w-6 flex-shrink-0" />
        <span className="font-medium text-gray-800">{email}</span>
      </div>
      
      <div className="border-t border-gray-200 pt-5 mt-5">
        <p className="text-gray-600 text-sm mb-4">
          Veuillez vérifier votre boîte de réception et cliquer sur le lien que vous avez reçu pour vous connecter.
        </p>
        
        <a 
          href={`https://${email.split('@')[1]}`} 
          target="_blank" 
          rel="noopener noreferrer" 
          className="flex items-center justify-center gap-2 w-full p-3 rounded-lg bg-[#0D6A51]/10 text-[#0D6A51] font-medium transition-colors hover:bg-[#0D6A51]/20"
        >
          <span>Aller vers ma messagerie</span>
          <ArrowRight className="h-4 w-4" />
        </a>
      </div>
    </div>
  );
};

export default SuccessState;
