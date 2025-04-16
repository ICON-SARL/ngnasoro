
import React from 'react';
import { ChevronRight, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Loader } from '@/components/ui/loader';
import { Badge } from '@/components/ui/badge';
import { SfdAccountDisplay } from './types/SfdAccountTypes';
import { cn } from '@/lib/utils';
import { AccountStatus } from './utils/accountStatus';

interface SfdAccountItemProps {
  sfd: SfdAccountDisplay;
  status: AccountStatus;
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
  const handleClick = (e: React.MouseEvent) => {
    // Empêcher la propagation de l'événement pour éviter toute redirection non désirée
    e.preventDefault();
    e.stopPropagation();
    
    if (!isActive && !isProcessing) {
      onSwitchSfd(sfd.id);
    }
  };

  return (
    <div 
      className={cn(
        "flex items-center justify-between p-3 border rounded-lg transition-colors",
        isActive ? "bg-green-50 border-green-200" : "bg-white border-gray-200",
        isProcessing ? "opacity-70" : "hover:bg-gray-50 cursor-pointer"
      )}
      onClick={handleClick}
    >
      <div className="flex items-center">
        <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center mr-3 text-gray-500 font-medium">
          {sfd.code || sfd.name.charAt(0)}
        </div>
        
        <div>
          <h3 className={cn(
            "font-medium",
            isActive ? "text-green-800" : "text-gray-800"
          )}>
            {sfd.name}
          </h3>
          
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-500">
              {sfd.balance?.toLocaleString() || 0} {sfd.currency || 'FCFA'}
            </span>
            
            {sfd.isVerified && (
              <span className="flex items-center text-sm text-green-600">
                <CheckCircle2 className="h-4 w-4 mr-1" />
                Vérifié
              </span>
            )}
          </div>
        </div>
      </div>
      
      <div className="flex items-center">
        {isActive && (
          <Badge variant="outline" className="border-green-200 text-green-800 bg-green-50 mr-2">
            Actif
          </Badge>
        )}
        
        {isProcessing ? (
          <Loader size="sm" />
        ) : (
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-8 w-8" 
            tabIndex={-1}
            onClick={(e) => {
              // Empêcher la propagation pour éviter le double déclenchement
              e.stopPropagation();
              if (!isActive && !isProcessing) {
                onSwitchSfd(sfd.id);
              }
            }}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  );
};

export default SfdAccountItem;
