
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
  onSwitchSfd: (sfdId: string) => Promise<boolean | void> | void;
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
        "flex items-center justify-between p-4 border-2 rounded-2xl transition-all",
        isActive ? "bg-[#176455]/10 border-[#176455]" : "bg-white border-gray-200",
        isProcessing ? "opacity-70" : "hover:bg-gray-50 cursor-pointer"
      )}
      onClick={handleClick}
    >
      <div className="flex items-center">
        <div className="h-12 w-12 rounded-full bg-gradient-to-br from-[#176455] to-[#1a7a65] flex items-center justify-center mr-3 text-white font-bold text-lg shadow-md overflow-hidden">
          {sfd.logo_url ? (
            <img 
              src={sfd.logo_url} 
              alt={sfd.name} 
              className="h-full w-full object-cover"
            />
          ) : (
            sfd.code || sfd.name.charAt(0)
          )}
        </div>
        
        <div>
          <h3 className={cn(
            "font-semibold text-base",
            isActive ? "text-[#176455]" : "text-gray-800"
          )}>
            {sfd.name}
          </h3>
          
          <div className="flex items-center space-x-2 text-sm text-gray-500">
            {sfd.region && <span>{sfd.region}</span>}
            {sfd.code && (
              <span className="text-xs bg-gray-100 px-2 py-0.5 rounded">
                {sfd.code}
              </span>
            )}
          </div>
        </div>
      </div>
      
      <div className="flex items-center">
        {isActive && (
          <Badge variant="outline" className="border-[#176455] text-[#176455] bg-[#176455]/10 mr-2 font-medium">
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
