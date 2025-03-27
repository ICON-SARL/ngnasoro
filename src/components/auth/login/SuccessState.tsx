
import React from 'react';
import { Mail, AlertCircle, Check } from 'lucide-react';
import VoiceAssistant from '@/components/VoiceAssistant';

const SuccessState = ({ email }: { email: string }) => {
  return (
    <div className="rounded-xl bg-white p-8 shadow-xl border border-white/30">
      <div className="flex flex-col items-center text-center space-y-5">
        <div className="h-20 w-20 rounded-full bg-green-100 flex items-center justify-center">
          <Mail className="h-10 w-10 text-green-600" />
        </div>
        
        <h3 className="text-2xl font-bold text-[#0D6A51]">Email envoyé</h3>
        
        <div className="flex justify-center mb-3">
          <VoiceAssistant 
            message={`Nous avons envoyé un email à ${email}. Cliquez sur le lien dans l'email pour vous connecter.`}
            autoPlay={true}
          />
        </div>
        
        <div className="flex items-center bg-green-50 p-4 rounded-xl w-full">
          <Check className="h-7 w-7 text-green-600 mr-3 flex-shrink-0" />
          <p className="text-green-700 font-medium text-lg">Email envoyé à: {email}</p>
        </div>
        
        <div className="bg-amber-50 p-5 rounded-xl flex items-start mt-2 w-full">
          <AlertCircle className="h-6 w-6 mr-3 flex-shrink-0 mt-0.5 text-amber-700" />
          <div className="text-left">
            <p className="text-amber-800 text-lg font-medium">Vérifiez votre email</p>
            <p className="text-amber-700 mt-1">Cliquez sur le lien dans l'email pour continuer</p>
          </div>
        </div>
        
        <div className="border-2 border-blue-100 rounded-xl p-4 w-full mt-4 bg-blue-50">
          <div className="flex items-center">
            <div className="bg-blue-100 rounded-full p-3 mr-4">
              <Mail className="h-6 w-6 text-blue-700" />
            </div>
            <div className="text-left">
              <p className="text-blue-900 font-medium text-lg">Si vous ne trouvez pas l'email:</p>
              <p className="text-blue-700 mt-1">Vérifiez votre dossier spam</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SuccessState;
