
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useAccountSynchronization } from '@/hooks/useAccountSynchronization';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader } from 'lucide-react';

interface ClientDetailActionsProps {
  clientId: string;
  sfdId: string;
  accountNumber?: string;
  hasAccount: boolean;
  onAccountLinked?: () => void;
  onAccountUnlinked?: () => void;
}

export const ClientDetailActions = ({
  clientId,
  sfdId,
  accountNumber,
  hasAccount,
  onAccountLinked,
  onAccountUnlinked
}: ClientDetailActionsProps) => {
  const [isLinking, setIsLinking] = useState(false);
  const [isUnlinking, setIsUnlinking] = useState(false);
  const [isSynchronizing, setIsSynchronizing] = useState(false);
  
  const {
    linkClientAccount,
    unlinkClientAccount,
    synchronizeClientData,
    isLoading
  } = useAccountSynchronization();

  const handleLinkAccount = async () => {
    if (!accountNumber) return;
    
    setIsLinking(true);
    const result = await linkClientAccount(clientId, sfdId, accountNumber);
    setIsLinking(false);
    
    if (result.success && onAccountLinked) {
      onAccountLinked();
    }
  };

  const handleUnlinkAccount = async () => {
    if (!accountNumber) return;
    
    setIsUnlinking(true);
    const result = await unlinkClientAccount(clientId, sfdId, accountNumber);
    setIsUnlinking(false);
    
    if (result.success && onAccountUnlinked) {
      onAccountUnlinked();
    }
  };

  const handleSynchronize = async () => {
    setIsSynchronizing(true);
    await synchronizeClientData({ clientId, sfdId, accountNumber });
    setIsSynchronizing(false);
  };

  return (
    <Card className="mt-6">
      <CardHeader>
        <CardTitle>Actions</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        {hasAccount ? (
          <>
            <Button 
              disabled={isUnlinking || isSynchronizing || isLoading} 
              onClick={handleSynchronize}
              variant="outline"
            >
              {isSynchronizing ? (
                <>
                  <Loader className="mr-2 h-4 w-4 animate-spin" />
                  Synchronisation...
                </>
              ) : 'Synchroniser les données'}
            </Button>
            
            <Button 
              disabled={isUnlinking || isSynchronizing || isLoading} 
              onClick={handleUnlinkAccount} 
              variant="destructive"
            >
              {isUnlinking ? (
                <>
                  <Loader className="mr-2 h-4 w-4 animate-spin" />
                  Déliaison...
                </>
              ) : 'Délier le compte'}
            </Button>
          </>
        ) : (
          <Button 
            disabled={isLinking || isLoading} 
            onClick={handleLinkAccount}
          >
            {isLinking ? (
              <>
                <Loader className="mr-2 h-4 w-4 animate-spin" />
                Liaison...
              </>
            ) : 'Lier le compte SFD'}
          </Button>
        )}
      </CardContent>
    </Card>
  );
};
