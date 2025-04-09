
import React, { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useSfdAccounts } from '@/hooks/useSfdAccounts';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import DiscoverSfdDialog from './sfd-accounts/DiscoverSfdDialog';
import { SfdData } from '@/hooks/sfd/types'; // Import SfdData type

interface SfdAccountsSectionProps {
  sfdData?: SfdData[]; // Add this prop to match usage in ProfilePage
  activeSfdId?: string | null;
  onSwitchSfd?: (sfdId: string) => Promise<boolean>;
}

const SfdAccountsSection: React.FC<SfdAccountsSectionProps> = ({ 
  sfdData,
  activeSfdId, 
  onSwitchSfd 
}) => {
  const [discoverOpen, setDiscoverOpen] = useState(false);
  const { user } = useAuth();
  const { sfdAccounts, activeSfdAccount, isLoading, refetch } = useSfdAccounts();
  const { toast } = useToast();

  const handleRequestSent = () => {
    toast({
      title: "Demande envoyée",
      description: "Votre demande a été envoyée avec succès. Vous serez notifié lorsqu'elle sera validée.",
    });
    refetch();
  };

  const handleSwitchSfd = async (sfdId: string) => {
    if (onSwitchSfd) {
      const result = await onSwitchSfd(sfdId);
      if (result) {
        refetch();
        return true;
      }
    }
    return false;
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-12 w-full" />
      </div>
    );
  }

  if (!sfdAccounts || sfdAccounts.length === 0) {
    return (
      <div className="text-center py-6">
        <p className="text-gray-500 mb-4">Vous n'avez pas encore de compte SFD associé.</p>
        <Button 
          onClick={() => setDiscoverOpen(true)}
          className="bg-[#0D6A51] hover:bg-[#0D6A51]/90"
        >
          <PlusCircle className="h-4 w-4 mr-2" />
          Découvrir les SFDs
        </Button>
        
        <DiscoverSfdDialog 
          isOpen={discoverOpen} 
          onOpenChange={setDiscoverOpen} 
          onRequestSent={handleRequestSent}
        />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="grid gap-3">
        {sfdAccounts.map(account => (
          <div 
            key={account.id} 
            className={`border rounded-lg p-3 ${
              activeSfdAccount?.id === account.id 
                ? 'border-[#0D6A51] bg-[#0D6A51]/5' 
                : 'border-gray-200'
            }`}
          >
            <div className="flex justify-between items-center">
              <div className="flex items-center space-x-3">
                {(account.logoUrl || account.logo_url) && (
                  <div className="h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden">
                    <img src={account.logoUrl || account.logo_url} alt={account.name} className="h-full w-full object-cover" />
                  </div>
                )}
                <div>
                  <h3 className="font-medium">{account.name}</h3>
                  {account.region && <p className="text-xs text-gray-500">{account.region}</p>}
                </div>
              </div>
              {activeSfdAccount?.id !== account.id && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleSwitchSfd(account.id)}
                >
                  Sélectionner
                </Button>
              )}
              {activeSfdAccount?.id === account.id && (
                <span className="text-xs bg-[#0D6A51] text-white px-2 py-1 rounded-full">
                  Actif
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
      
      <div className="pt-3">
        <Button 
          variant="outline" 
          className="w-full" 
          onClick={() => setDiscoverOpen(true)}
        >
          <PlusCircle className="h-4 w-4 mr-2" />
          Ajouter un compte SFD
        </Button>
        
        <DiscoverSfdDialog 
          isOpen={discoverOpen} 
          onOpenChange={setDiscoverOpen} 
          onRequestSent={handleRequestSent}
        />
      </div>
    </div>
  );
};

export default SfdAccountsSection;
