
import React, { useEffect } from 'react';
import { useSfdSelector } from '@/hooks/useSfdSelector';
import SfdSelectorLoading from './sfd-selector/SfdSelectorLoading';
import SfdSelectorEmpty from './sfd-selector/SfdSelectorEmpty';
import SfdSelectorContent from './sfd-selector/SfdSelectorContent';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Building, AlertCircle } from 'lucide-react';

interface SfdSelectorProps {
  className?: string;
  onEmptySfds?: () => void;
}

const SfdSelector: React.FC<SfdSelectorProps> = ({ className, onEmptySfds }) => {
  const { activeSfdId, sfdData, isLoading, handleSfdChange } = useSfdSelector(onEmptySfds);
  const navigate = useNavigate();
  
  useEffect(() => {
    // Log SFD data for debugging
    console.log(`Nombre de SFDs actives détecté: ${sfdData.length}`);
    if (sfdData.length > 0) {
      sfdData.forEach(sfd => {
        console.log(`SFD disponible: ${sfd.name} (${sfd.id}) - status: ${sfd.status || 'unknown'}`);
      });
    }
  }, [sfdData]);
  
  if (isLoading) {
    return <SfdSelectorLoading className={className} />;
  }
  
  if (!sfdData || sfdData.length === 0) {
    return (
      <div className={`${className} p-4`}>
        <div className="flex flex-col items-center justify-center space-y-3 p-6 text-center bg-amber-50 rounded-lg border border-amber-200">
          <AlertCircle className="h-10 w-10 text-amber-500" />
          <h3 className="font-medium text-amber-800">Aucune SFD disponible</h3>
          <p className="text-amber-700 text-sm">Impossible de récupérer les SFDs actives</p>
          <Button 
            variant="outline"
            onClick={() => navigate('/sfd-selector')}
            className="mt-2 bg-white border-amber-300 text-amber-700 hover:bg-amber-100"
          >
            <Building className="h-4 w-4 mr-2" />
            Voir toutes les SFDs
          </Button>
        </div>
      </div>
    );
  }
  
  return (
    <SfdSelectorContent 
      className={className}
      activeSfdId={activeSfdId}
      sfdData={sfdData}
      onSfdChange={handleSfdChange}
    />
  );
};

export default SfdSelector;
