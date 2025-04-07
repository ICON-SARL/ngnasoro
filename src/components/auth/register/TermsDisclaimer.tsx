
import React from 'react';

const TermsDisclaimer: React.FC = () => {
  return (
    <p className="text-center text-xs text-muted-foreground">
      En créant un compte, vous acceptez nos{" "}
      <a href="#" className="underline text-[#0D6A51]">
        Conditions d'utilisation
      </a>{" "}
      et notre{" "}
      <a href="#" className="underline text-[#0D6A51]">
        Politique de confidentialité
      </a>
      .
    </p>
  );
};

export default TermsDisclaimer;
