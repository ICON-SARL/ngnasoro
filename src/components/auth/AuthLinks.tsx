
import React from 'react';

interface AuthLinksProps {
  authMode: 'default' | 'admin' | 'sfd';
}

const AuthLinks: React.FC<AuthLinksProps> = ({ authMode }) => {
  return (
    <div className="mt-4 text-center pb-6 flex justify-center gap-4">
      {authMode === 'default' ? (
        <>
          <a 
            href="/auth?admin=true"
            className="text-amber-600 hover:underline font-medium"
          >
            Accès Super Admin
          </a>
          <a 
            href="/auth?sfd=true"
            className="text-blue-600 hover:underline font-medium"
          >
            Accès Admin SFD
          </a>
        </>
      ) : (
        <a 
          href="/auth"
          className="text-[#0D6A51] hover:underline font-medium"
        >
          Connexion Utilisateur Standard
        </a>
      )}
    </div>
  );
};

export default AuthLinks;
