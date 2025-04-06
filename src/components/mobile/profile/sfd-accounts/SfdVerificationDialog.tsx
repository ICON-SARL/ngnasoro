
import React from 'react';
import SfdSwitchVerification from '@/components/SfdSwitchVerification';

interface SfdVerificationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onVerify: (code: string) => Promise<boolean>;
  sfdName: string;
  isLoading: boolean;
}

const SfdVerificationDialog: React.FC<SfdVerificationDialogProps> = ({
  isOpen,
  onClose,
  onVerify,
  sfdName,
  isLoading
}) => {
  return (
    <SfdSwitchVerification 
      isOpen={isOpen}
      onClose={onClose}
      onVerify={onVerify}
      sfdName={sfdName}
      isLoading={isLoading}
    />
  );
};

export default SfdVerificationDialog;
