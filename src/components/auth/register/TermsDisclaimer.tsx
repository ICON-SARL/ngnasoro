
import React from 'react';

const TermsDisclaimer: React.FC = () => {
  return (
    <p className="text-xs text-muted-foreground text-center mt-4">
      En créant un compte, vous acceptez les{' '}
      <a href="#" className="text-[#0D6A51] hover:underline">
        Conditions d'utilisation
      </a>{' '}
      et la{' '}
      <a href="#" className="text-[#0D6A51] hover:underline">
        Politique de confidentialité
      </a>{' '}
      de N'gna sôrô.
    </p>
  );
};

export default TermsDisclaimer;
