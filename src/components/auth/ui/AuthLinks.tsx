
import React from 'react';

interface AuthLinksProps {
  mode: 'default' | 'admin' | 'sfd_admin';
}

const AuthLinks: React.FC<AuthLinksProps> = ({ mode }) => {
  return (
    <div className="mt-4 text-center pb-6 flex flex-col gap-2">
      {mode !== 'default' && (
        <a 
          href="/auth"
          className="text-[#0D6A51] hover:underline font-medium"
        >
          Connexion Utilisateur Standard
        </a>
      )}
      
      {mode !== 'admin' && (
        <a 
          href="/admin/auth"
          className="text-amber-600 hover:underline font-medium"
        >
          Accès Administrateur MEREF
        </a>
      )}
      
      {mode !== 'sfd_admin' && (
        <a 
          href="/sfd/auth"
          className="text-blue-600 hover:underline font-medium"
        >
          Accès Administrateur SFD
        </a>
      )}
    </div>
  );
};

export default AuthLinks;
