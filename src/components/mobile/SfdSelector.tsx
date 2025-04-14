
import React from 'react';
import { useSfdSelector } from '@/hooks/useSfdSelector';
import SfdSelectorLoading from './sfd-selector/SfdSelectorLoading';
import SfdSelectorEmpty from './sfd-selector/SfdSelectorEmpty';
import SfdSelectorContent from './sfd-selector/SfdSelectorContent';

interface SfdSelectorProps {
  className?: string;
  onEmptySfds?: () => void;
}

const SfdSelector: React.FC<SfdSelectorProps> = ({ className, onEmptySfds }) => {
  const { activeSfdId, sfdData, isLoading, handleSfdChange } = useSfdSelector(onEmptySfds);
  
  if (isLoading) {
    return <SfdSelectorLoading className={className} />;
  }
  
  if (sfdData.length === 0) {
    return <SfdSelectorEmpty className={className} />;
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
