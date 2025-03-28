
import React from 'react';
import { Badge } from '@/components/ui/badge';

interface AuthHeaderProps {
  authMode: 'default' | 'admin' | 'sfd';
}

const AuthHeader: React.FC<AuthHeaderProps> = ({ authMode }) => {
  if (authMode === 'default') return null;

  return (
    <div className={`p-4 ${authMode === 'admin' ? 'bg-amber-50 border-b border-amber-100' : 'bg-blue-50 border-b border-blue-100'}`}>
      <div className="flex items-center justify-between">
        <h2 className={`${authMode === 'admin' ? 'text-amber-800' : 'text-blue-800'} font-medium`}>
          {authMode === 'admin' ? 'Connexion Super Admin MEREF' : 'Connexion Administration SFD'}
        </h2>
        <Badge variant="outline" className={authMode === 'admin' ? 'bg-amber-100 text-amber-800' : 'bg-blue-100 text-blue-800'}>
          {authMode === 'admin' ? 'MEREF' : 'SFD'}
        </Badge>
      </div>
    </div>
  );
};

export default AuthHeader;
