
import React from 'react';
import { Mail, AlertCircle } from 'lucide-react';

const SuccessState = ({ email }: { email: string }) => {
  return (
    <div className="rounded-lg bg-white p-6 shadow-lg border border-gray-100">
      <div className="flex flex-col items-center text-center space-y-4">
        <div className="h-16 w-16 rounded-full bg-green-100 flex items-center justify-center">
          <Mail className="h-8 w-8 text-green-600" />
        </div>
        
        <h3 className="text-xl font-semibold text-[#0D6A51]">Vérifiez votre e-mail</h3>
        
        <p className="text-gray-600">
          Nous avons envoyé un lien de connexion à <span className="font-medium">{email}</span>
        </p>
        
        <div className="bg-amber-50 p-4 rounded-lg text-amber-800 text-sm flex items-start mt-4 w-full">
          <AlertCircle className="h-5 w-5 mr-2 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-medium">Important:</p>
            <p>Le lien expire après 10 minutes. Si vous ne trouvez pas l'e-mail, vérifiez votre dossier de spam.</p>
          </div>
        </div>
        
        <p className="text-sm text-gray-500 mt-4">
          Vous pouvez fermer cette page une fois connecté.
        </p>
      </div>
    </div>
  );
};

export default SuccessState;
