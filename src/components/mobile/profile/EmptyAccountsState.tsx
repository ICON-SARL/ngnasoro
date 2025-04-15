
import React from 'react';
import { Building } from 'lucide-react';
import AddSfdButton from './sfd-accounts/AddSfdButton';

const EmptyAccountsState = () => {
  return (
    <div className="p-8 text-center">
      <div className="mx-auto w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
        <Building className="h-6 w-6 text-primary" />
      </div>
      <h3 className="text-lg font-medium mb-2">Aucun compte SFD</h3>
      <p className="text-sm text-muted-foreground mb-6">
        Commencez par ajouter votre premier compte SFD
      </p>
      <AddSfdButton />
    </div>
  );
};

export default EmptyAccountsState;
