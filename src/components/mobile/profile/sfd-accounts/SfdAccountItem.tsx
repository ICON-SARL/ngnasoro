
import React from 'react';
import { ChevronRight, CheckCircle, Clock } from 'lucide-react';
import { SfdAccountDisplay } from './AccountsList';

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
        isActive ? 'bg-gray-50 border-gray-300' : 'hover:bg-gray-50'
      } ${isProcessing ? 'opacity-70 pointer-events-none' : ''}`}
      onClick={handleClick}
      data-testid={`sfd-account-${sfd.id}`}
    >
      <div className="flex items-center space-x-3">
        <div className="flex-shrink-0 w-10 h-10 bg-gray-200 rounded-full overflow-hidden flex items-center justify-center">
          {sfd.code ? (
            <span className="text-lg font-bold text-gray-500">{sfd.code}</span>
          ) : (
            <span className="text-lg font-bold text-gray-500">{sfd.name.charAt(0)}</span>
          )}
        </div>
        
        <div>
          <h4 className="font-medium">{sfd.name}</h4>
          <div className="flex items-center text-sm">
            <span className="text-gray-500 mr-2">{sfd.balance || 0} {sfd.currency || 'FCFA'}</span>
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
      
      <ChevronRight className="h-5 w-5 text-gray-400" />
    </div>
  );
};

export default SfdAccountItem;
