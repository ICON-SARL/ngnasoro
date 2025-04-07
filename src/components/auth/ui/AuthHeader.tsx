
import React from 'react';

interface AuthHeaderProps {
  mode: 'default' | 'admin' | 'sfd_admin';
}

const AuthHeader: React.FC<AuthHeaderProps> = ({ mode }) => {
  let title = "Connexion Utilisateur";
  let bgColor = "bg-green-50";
  let borderColor = "border-green-100";
  let textColor = "text-green-800";
  
  if (mode === 'admin') {
    title = "Connexion Administration MEREF";
    bgColor = "bg-amber-50";
    borderColor = "border-amber-100";
    textColor = "text-amber-800";
  } else if (mode === 'sfd_admin') {
    title = "Connexion Administration SFD";
    bgColor = "bg-blue-50";
    borderColor = "border-blue-100";
    textColor = "text-blue-800";
  }
  
  return (
    <div className={`p-4 ${bgColor} border-b ${borderColor}`}>
      <h2 className={`${textColor} font-medium text-center`}>
        {title}
      </h2>
    </div>
  );
};

export default AuthHeader;
