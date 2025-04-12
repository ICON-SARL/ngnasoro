
import React from 'react';
import { SfdAccountsCreationForm } from './SfdAccountsCreationForm';

export function SfdAccountsCreation() {
  return (
    <div className="container py-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Création de SFD avec comptes</h1>
        <p className="text-muted-foreground">
          Créez une nouvelle SFD avec un administrateur et des comptes associés en utilisant une transaction sécurisée
        </p>
      </div>
      
      <SfdAccountsCreationForm />
    </div>
  );
}
