
import React from 'react';
import { Shield } from 'lucide-react';
import { Sfd } from '../types/sfd-types';

interface SfdLogoProps {
  sfd: Sfd;
}

export function SfdLogo({ sfd }: SfdLogoProps) {
  if (sfd.logo_url) {
    return (
      <div className="h-10 w-10 rounded-full bg-gray-100 overflow-hidden flex items-center justify-center">
        <img src={sfd.logo_url} alt={sfd.name} className="h-10 w-10 object-cover" />
      </div>
    );
  } else {
    return (
      <div className="h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center">
        <Shield className="h-5 w-5 text-gray-400" />
      </div>
    );
  }
}
