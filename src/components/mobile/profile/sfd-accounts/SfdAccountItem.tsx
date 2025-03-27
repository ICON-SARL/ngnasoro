
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { CheckCircle, Clock, AlertCircle, Copy, RefreshCw } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface SfdAccountItemProps {
  sfd: {
    id: string;
    name: string;
    logoUrl?: string;
  };
  status: 'verified' | 'pending';
  isActive: boolean;
  onSwitchSfd: (sfdId: string) => Promise<void>;
  isProcessing: boolean;
}

const SfdAccountItem: React.FC<SfdAccountItemProps> = ({
  sfd,
  status,
  isActive,
  onSwitchSfd,
  isProcessing
}) => {
  const { toast } = useToast();
  const [otpData, setOtpData] = useState<{code: string, expiresAt: Date} | null>(null);
  
  const generateOTP = () => {
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiryTime = new Date();
    expiryTime.setMinutes(expiryTime.getMinutes() + 15);
    setOtpData({
      code: otp,
      expiresAt: expiryTime
    });
    toast({
      title: "Code OTP généré",
      description: "Partagez ce code avec votre agent SFD pour valider votre compte",
    });
  };

  const copyOTP = () => {
    if (otpData) {
      navigator.clipboard.writeText(otpData.code);
      toast({
        title: "Code copié",
        description: "Le code OTP a été copié dans le presse-papier",
      });
    }
  };

  return (
    <div className="flex items-center justify-between border p-3 rounded-lg">
      <div className="flex items-center space-x-3">
        <div className="h-10 w-10 bg-gray-100 rounded-full flex items-center justify-center">
          {sfd.name.substring(0, 2)}
        </div>
        <div>
          <p className="font-medium">{sfd.name}</p>
          <div className="flex items-center space-x-1">
            {isActive ? (
              <span className="text-xs text-green-600 flex items-center">
                <CheckCircle className="h-3 w-3 mr-1" />
                Compte actif
              </span>
            ) : status === 'pending' ? (
              <span className="text-xs text-amber-600 flex items-center">
                <Clock className="h-3 w-3 mr-1" />
                En attente de validation
              </span>
            ) : (
              <span className="text-xs text-gray-500 flex items-center">
                <AlertCircle className="h-3 w-3 mr-1" />
                Inactif
              </span>
            )}
          </div>
        </div>
      </div>
      
      <div className="flex items-center space-x-2">
        {!isActive && status === 'verified' && (
          <Button 
            size="sm" 
            variant="outline"
            className="text-xs"
            onClick={() => onSwitchSfd(sfd.id)}
            disabled={isProcessing}
          >
            {isProcessing ? 'Changement...' : 'Basculer'}
          </Button>
        )}
        
        {!isActive && status === 'pending' && (
          <>
            {otpData ? (
              <div className="flex flex-col space-y-1">
                <div className="flex items-center space-x-1">
                  <div className="px-2 py-1 bg-gray-100 rounded text-xs font-mono">
                    {otpData.code}
                  </div>
                  <Button 
                    size="sm" 
                    variant="ghost" 
                    className="h-6 w-6 p-0" 
                    onClick={copyOTP}
                  >
                    <Copy className="h-3 w-3" />
                  </Button>
                  <Button 
                    size="sm" 
                    variant="ghost" 
                    className="h-6 w-6 p-0" 
                    onClick={generateOTP}
                  >
                    <RefreshCw className="h-3 w-3" />
                  </Button>
                </div>
                <span className="text-[10px] text-gray-500">
                  Valide jusqu'à {otpData.expiresAt.toLocaleTimeString()}
                </span>
              </div>
            ) : (
              <Button 
                size="sm" 
                variant="outline"
                className="text-xs text-amber-600"
                onClick={generateOTP}
              >
                Générer OTP
              </Button>
            )}
          </>
        )}
        
        {isActive && (
          <span className="text-xs font-medium text-green-600 px-2 py-1 bg-green-50 rounded-md">
            Active
          </span>
        )}
      </div>
    </div>
  );
};

export default SfdAccountItem;
