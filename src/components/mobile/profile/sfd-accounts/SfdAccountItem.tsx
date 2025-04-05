
import React from 'react';
import { ChevronRight, CheckCircle, Clock, ArrowUp } from 'lucide-react';
import { SfdAccountDisplay } from './AccountsList';
import { formatCurrencyAmount } from '@/utils/transactionUtils';

interface SfdAccountItemProps {
  sfd: SfdAccountDisplay;
  status: 'verified' | 'pending';
  isActive: boolean;
  isProcessing: boolean;
  onSwitchSfd: (sfdId: string) => Promise<void>;
}

const SfdAccountItem: React.FC<SfdAccountItemProps> = ({ 
  sfd, 
  status, 
  isActive, 
  isProcessing,
  onSwitchSfd 
}) => {
  const handleClick = async () => {
    if (!isActive && !isProcessing) {
      await onSwitchSfd(sfd.id);
    }
  };

  return (
    <div 
      className={`p-3 border rounded-lg flex items-center justify-between cursor-pointer ${
        isActive ? 'bg-green-50 border-green-200' : 'hover:bg-gray-50'
      } ${isProcessing ? 'opacity-70 pointer-events-none' : ''}`}
      onClick={handleClick}
    >
      <div className="flex items-center space-x-3">
        <div className="flex-shrink-0 w-10 h-10 bg-gray-100 rounded-full overflow-hidden flex items-center justify-center">
          {sfd.logoUrl ? (
            <img src={sfd.logoUrl} alt={sfd.name} className="w-full h-full object-cover" />
          ) : (
            <span className="text-lg font-bold text-gray-500">{sfd.name.charAt(0)}</span>
          )}
        </div>
        
        <div>
          <h4 className="font-medium">{sfd.name}</h4>
          <div className="flex items-center text-sm">
            <span className="text-gray-500 mr-2">{formatCurrencyAmount(sfd.balance)} {sfd.currency}</span>
            {status === 'verified' ? (
              <span className="text-green-600 flex items-center">
                <CheckCircle className="h-3 w-3 mr-1" />
                Vérifié
              </span>
            ) : (
              <span className="text-amber-600 flex items-center">
                <Clock className="h-3 w-3 mr-1" />
                En attente
              </span>
            )}
          </div>
        </div>
      </div>
      
      <div className="flex items-center">
        {isActive && (
          <span className="text-xs font-medium bg-green-100 text-green-800 py-1 px-2 rounded mr-2">
            Actif
          </span>
        )}
        {isProcessing ? (
          <div className="animate-spin h-4 w-4 border-2 border-gray-500 border-t-transparent rounded-full"></div>
        ) : isActive ? (
          <ArrowUp className="h-5 w-5 text-green-600" />
        ) : (
          <ChevronRight className="h-5 w-5 text-gray-400" />
        )}
      </div>
    </div>
  );
};

export default SfdAccountItem;
