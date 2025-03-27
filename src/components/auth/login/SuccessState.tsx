
import React from 'react';
import { Mail, AlertCircle, Check } from 'lucide-react';
import VoiceAssistant from '@/components/VoiceAssistant';

const SuccessState = ({ email }: { email: string }) => {
  return (
    <div className="rounded-lg bg-white p-6 shadow-lg border border-gray-100">
      <div className="flex flex-col items-center text-center space-y-4">
        <div className="h-16 w-16 rounded-full bg-green-100 flex items-center justify-center">
          <Mail className="h-8 w-8 text-green-600" />
        </div>
        
        <h3 className="text-xl font-semibold text-[#0D6A51]">Email envoyé</h3>
        
        <div className="flex justify-center mb-2">
          <VoiceAssistant 
            message={`Nous avons envoyé un email à ${email}. Cliquez sur le lien dans l'email pour vous connecter.`}
            autoPlay={true}
          />
        </div>
        
        <div className="flex items-center bg-green-50 p-3 rounded-lg">
          <Check className="h-5 w-5 text-green-600 mr-2 flex-shrink-0" />
          <p className="text-green-700 font-medium">Email envoyé à: {email}</p>
        </div>
        
        <div className="bg-amber-50 p-4 rounded-lg flex items-start mt-2 w-full">
          <AlertCircle className="h-5 w-5 mr-2 flex-shrink-0 mt-0.5 text-amber-700" />
          <div className="text-left">
            <p className="text-amber-800 text-sm">Vérifiez votre email et cliquez sur le lien pour continuer</p>
          </div>
        </div>
        
        <div className="border rounded-lg p-3 w-full mt-4">
          <div className="flex items-center">
            <div className="bg-blue-100 rounded-full p-2 mr-3">
              <Mail className="h-5 w-5 text-blue-700" />
            </div>
            <div className="text-left">
              <p className="text-sm text-gray-500">Si vous ne trouvez pas l'email:</p>
              <p className="text-sm text-gray-700 font-medium">Vérifiez votre dossier spam</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SuccessState;
