
import React, { useState, useEffect } from 'react';
import ContextualHeader from './ContextualHeader';
import { 
  Select, 
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { Shield } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { useSfdDataAccess } from '@/hooks/useSfdDataAccess';
import { useAuth } from '@/hooks/useAuth';

const MobileHeader = () => {
  const { toast } = useToast();
  const { activeSfdId } = useSfdDataAccess();
  const { setActiveSfdId } = useAuth();
  const [sfdOptions, setSfdOptions] = useState<Array<{id: string, name: string}>>([]);
  
  // Fetch available SFDs
  useEffect(() => {
    const fetchSfdOptions = async () => {
      // This is a placeholder. In a real app, you would fetch from your API
      setSfdOptions([
        { id: 'primary-sfd', name: 'SFD Primaire' },
        { id: 'secondary-sfd', name: 'SFD Secondaire' }
      ]);
    };
    
    fetchSfdOptions();
  }, []);
  
  const handleSfdChange = (value: string) => {
    setActiveSfdId(value);
    
    const selectedSfd = sfdOptions.find(sfd => sfd.id === value);
    const sfdName = selectedSfd?.name || 'SFD Inconnue';
    
    toast({
      title: "SFD changée",
      description: `Vous êtes maintenant connecté à ${sfdName}`,
    });
  };
  
  return (
    <div className="p-2">
      <ContextualHeader />
      
      <div className="mt-3 flex justify-end">
        <div className="w-[180px]">
          <Select value={activeSfdId || ''} onValueChange={handleSfdChange}>
            <SelectTrigger className="bg-blue-700/80 text-white border-blue-500 text-sm py-1 h-8">
              <SelectValue placeholder="Choisir une SFD" />
            </SelectTrigger>
            <SelectContent>
              {sfdOptions.map(sfd => (
                <SelectItem key={sfd.id} value={sfd.id} className="text-sm">
                  <div className="flex items-center">
                    <Shield className={`h-3 w-3 mr-1 ${
                      sfd.id === 'primary-sfd' ? 'text-green-600' : 
                      sfd.id === 'secondary-sfd' ? 'text-amber-600' : 'text-blue-600'
                    }`} />
                    {sfd.name}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
};

export default MobileHeader;
