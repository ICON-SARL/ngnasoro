
import React from 'react';
import { useAuth } from '@/hooks/auth';
import { useSfdDataAccess } from '@/hooks/useSfdDataAccess';
import { Badge } from '@/components/ui/badge';

const ContextualHeader = () => {
  const { user } = useAuth();
  const { activeSfdId, getActiveSfdData } = useSfdDataAccess();
  const [activeSFDName, setActiveSFDName] = React.useState('SFD Primaire');
  
  React.useEffect(() => {
    const fetchSfdName = async () => {
      if (activeSfdId) {
        const sfdData = await getActiveSfdData();
        if (sfdData) {
          setActiveSFDName(sfdData.name);
        }
      }
    };
    
    fetchSfdName();
  }, [activeSfdId, getActiveSfdData]);
  
  const userName = user?.user_metadata?.full_name || user?.email || 'Utilisateur';
  
  // Récupérer le premier caractère du nom pour l'avatar
  const userInitial = userName.charAt(0).toUpperCase();

  return (
    <div className="flex flex-col">
      <h1 className="text-3xl font-bold mb-2">
        <span className="text-white">Bonjour, </span>
        <span className="text-white/90">{userName.split(' ')[0]}</span>
      </h1>
      
      <div className="flex items-center mt-1">
        <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center mr-2 backdrop-blur-sm">
          <img 
            src="/lovable-uploads/2941965d-fd44-4815-bb4a-2c77549e1380.png" 
            alt="Logo SFD" 
            className="h-4 w-4 object-contain"
          />
        </div>
        <div className="flex items-center">
          <Badge className="bg-white/10 text-white border-0 rounded-full px-3">
            {activeSFDName}
          </Badge>
        </div>
      </div>
    </div>
  );
};

export default ContextualHeader;
