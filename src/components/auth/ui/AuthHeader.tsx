
import React from 'react';

interface AuthHeaderProps {
  mode: 'default' | 'admin' | 'sfd_admin';
}

const AuthHeader: React.FC<AuthHeaderProps> = ({ mode }) => {
  if (mode === 'admin') {
    return (
      <div className="p-4 bg-amber-50 border-b border-amber-100">
        <h2 className="text-amber-800 font-medium text-center">
          Connexion Administration
        </h2>
      </div>
    );
  }
  
  if (mode === 'sfd_admin') {
    return (
      <div className="p-4 bg-blue-50 border-b border-blue-100">
        <h2 className="text-blue-800 font-medium text-center">
          Connexion Administration SFD
        </h2>
      </div>
    );
  }
  
  return (
    <div className="p-4 bg-[#0D6A51]/10 border-b border-[#0D6A51]/20">
      <h2 className="text-[#0D6A51] font-medium text-center">
        Espace Client
      </h2>
    </div>
  );
};

export default AuthHeader;
