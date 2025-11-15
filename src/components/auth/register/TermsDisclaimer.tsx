
import React from 'react';

const TermsDisclaimer: React.FC = () => {
  return (
    <p className="text-center text-xs text-muted-foreground">
      En créant un compte, vous acceptez nos{" "}
      <a href="/legal/terms" className="underline text-[#0D6A51] hover:text-[#0F7C5F]" target="_blank" rel="noopener noreferrer">
        Conditions d'utilisation
      </a>{" "}
      et notre{" "}
      <a href="/legal/privacy" className="underline text-[#0D6A51] hover:text-[#0F7C5F]" target="_blank" rel="noopener noreferrer">
        Politique de confidentialité
      </a>
      .
    </p>
  );
};

export default TermsDisclaimer;
