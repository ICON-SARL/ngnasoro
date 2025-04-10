
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Loader } from '@/components/ui/loader';
import { Building2, Check, AlertCircle } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

interface SfdAccountsSectionProps {
  onSwitchSfd: (sfdId: string) => Promise<boolean>;
}

const SfdAccountsSection: React.FC<SfdAccountsSectionProps> = ({ onSwitchSfd }) => {
  const { user, activeSfdId } = useAuth();
  const [userSfds, setUserSfds] = useState<any[]>([]);
  const [pendingRequests, setPendingRequests] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isChanging, setIsChanging] = useState(false);
  const [changingSfdId, setChangingSfdId] = useState<string | null>(null);
  
  useEffect(() => {
    const loadUserSfds = async () => {
      if (!user) return;
      
      setIsLoading(true);
      try {
        // Get validated SFDs the user is part of
        const { data: validatedSfds, error: validatedError } = await supabase
          .from('sfd_clients')
          .select(`
            id, 
            status, 
            validated_at,
            sfds:sfd_id (
              id, 
              name, 
              code, 
              region
            )
          `)
          .eq('user_id', user.id)
          .eq('status', 'validated');
          
        if (validatedError) throw validatedError;
        
        // Get pending SFD requests
        const { data: pendingSfds, error: pendingError } = await supabase
          .from('sfd_clients')
          .select(`
            id, 
            status, 
            created_at,
            sfds:sfd_id (
              id, 
              name, 
              code, 
              region
            )
          `)
          .eq('user_id', user.id)
          .eq('status', 'pending');
          
        if (pendingError) throw pendingError;
        
        setUserSfds(validatedSfds || []);
        setPendingRequests(pendingSfds || []);
      } catch (error) {
        console.error('Error loading user SFDs:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadUserSfds();
  }, [user]);
  
  const handleSwitchSfd = async (sfdId: string) => {
    if (sfdId === activeSfdId) return;
    
    setIsChanging(true);
    setChangingSfdId(sfdId);
    
    try {
      const success = await onSwitchSfd(sfdId);
      if (!success) throw new Error("Échec du changement de SFD");
    } catch (error) {
      console.error('Error switching SFD:', error);
    } finally {
      setIsChanging(false);
      setChangingSfdId(null);
    }
  };
  
  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <Loader size="lg" />
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      {userSfds.length === 0 && pendingRequests.length === 0 ? (
        <div className="bg-gray-50 rounded-lg p-8 text-center">
          <Building2 className="mx-auto h-12 w-12 text-muted-foreground/50 mb-3" />
          <h3 className="text-lg font-medium mb-1">Aucun compte SFD</h3>
          <p className="text-muted-foreground">Vous n'avez pas encore de compte SFD associé à votre profil.</p>
        </div>
      ) : (
        <>
          {/* Validated SFDs */}
          {userSfds.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-lg font-medium">Mes SFDs</h3>
              
              <div className="space-y-3">
                {userSfds.map((item) => (
                  <div 
                    key={item.id}
                    className="border rounded-lg p-4 bg-white"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-medium text-gray-900">{item.sfds.name}</h4>
                        <div className="text-sm text-muted-foreground mt-1">
                          {item.sfds.code && <span>Code: {item.sfds.code}</span>}
                          {item.sfds.region && <span> • {item.sfds.region}</span>}
                        </div>
                      </div>
                      
                      {item.sfds.id === activeSfdId ? (
                        <div className="flex items-center px-3 py-1 bg-green-50 text-green-700 rounded-full text-sm font-medium">
                          <Check className="w-4 h-4 mr-1" />
                          Actif
                        </div>
                      ) : (
                        <Button 
                          size="sm"
                          variant="outline"
                          onClick={() => handleSwitchSfd(item.sfds.id)}
                          disabled={isChanging}
                          className="text-[#0D6A51] border-[#0D6A51]/30 hover:bg-[#0D6A51]/10"
                        >
                          {isChanging && changingSfdId === item.sfds.id ? (
                            <>
                              <Loader size="sm" className="mr-2" />
                              Passage...
                            </>
                          ) : (
                            "Utiliser cette SFD"
                          )}
                        </Button>
                      )}
                    </div>
                    
                    {item.validated_at && (
                      <p className="text-xs text-muted-foreground mt-2">
                        Validé le {format(new Date(item.validated_at), 'dd MMMM yyyy', { locale: fr })}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {/* Pending Requests */}
          {pendingRequests.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-lg font-medium">Demandes en attente</h3>
              
              <div className="space-y-3">
                {pendingRequests.map((item) => (
                  <div 
                    key={item.id}
                    className="border border-amber-200 rounded-lg p-4 bg-amber-50"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-medium text-amber-900">{item.sfds.name}</h4>
                        <div className="text-sm text-amber-700 mt-1">
                          {item.sfds.code && <span>Code: {item.sfds.code}</span>}
                          {item.sfds.region && <span> • {item.sfds.region}</span>}
                        </div>
                      </div>
                      
                      <div className="flex items-center px-3 py-1 bg-amber-100 text-amber-800 rounded-full text-sm font-medium">
                        <AlertCircle className="w-4 h-4 mr-1" />
                        En attente
                      </div>
                    </div>
                    
                    {item.created_at && (
                      <p className="text-xs text-amber-700 mt-2">
                        Demande soumise le {format(new Date(item.created_at), 'dd MMMM yyyy', { locale: fr })}
                      </p>
                    )}
                  </div>
                ))}
              </div>
              
              <div className="p-3 bg-amber-100 rounded-md border border-amber-200 text-sm text-amber-800">
                <div className="flex gap-2">
                  <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0" />
                  <p>
                    Vos demandes sont en cours de traitement par les administrateurs des SFDs. 
                    Vous recevrez une notification lorsqu'elles seront validées.
                  </p>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default SfdAccountsSection;
