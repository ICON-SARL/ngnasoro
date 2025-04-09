
import React from 'react';
import { Check, X } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

interface PermissionItem {
  functionality: string;
  superAdmin: boolean;
  sfdAdmin: boolean;
  cashier: boolean;
  client: boolean;
  description?: string;
}

interface PermissionsTableProps {
  showDescription?: boolean;
  className?: string;
}

export function PermissionsTable({ showDescription = false, className }: PermissionsTableProps) {
  const permissions: PermissionItem[] = [
    {
      functionality: "Créer une SFD",
      superAdmin: true,
      sfdAdmin: false,
      cashier: false,
      client: false,
      description: "Création et enregistrement de nouvelles SFDs dans le système"
    },
    {
      functionality: "Approuver un prêt",
      superAdmin: true,
      sfdAdmin: true,
      cashier: false,
      client: false,
      description: "Validation des demandes de crédit avec limitations différentes selon le rôle"
    },
    {
      functionality: "Voir les soldes clients",
      superAdmin: true,
      sfdAdmin: true,
      cashier: true,
      client: true,
      description: "Consultation des soldes avec restrictions basées sur le niveau d'accès"
    },
    {
      functionality: "Exporter des rapports",
      superAdmin: true,
      sfdAdmin: true,
      cashier: false,
      client: false,
      description: "Génération et téléchargement de rapports analytiques"
    },
    {
      functionality: "Gérer les utilisateurs",
      superAdmin: true,
      sfdAdmin: true,
      cashier: false,
      client: false,
      description: "Création et gestion des comptes utilisateurs"
    },
    {
      functionality: "Effectuer des transactions",
      superAdmin: false,
      sfdAdmin: true,
      cashier: true,
      client: false,
      description: "Réalisation de dépôts et retraits"
    },
    {
      functionality: "Consulter son compte",
      superAdmin: true,
      sfdAdmin: true,
      cashier: true,
      client: true,
      description: "Accès aux informations personnelles du compte"
    },
    {
      functionality: "Demander un prêt",
      superAdmin: false,
      sfdAdmin: false,
      cashier: false,
      client: true,
      description: "Soumission de demandes de crédit"
    }
  ];

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>Tableau Synoptique des Permissions</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[250px]">Fonctionnalité</TableHead>
              <TableHead className="text-center">Super Admin</TableHead>
              <TableHead className="text-center">Admin SFD</TableHead>
              <TableHead className="text-center">Caissier</TableHead>
              <TableHead className="text-center">Client</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {permissions.map((perm) => (
              <TableRow key={perm.functionality}>
                <TableCell className="font-medium">
                  {perm.functionality}
                  {showDescription && perm.description && (
                    <div className="text-xs text-gray-500 mt-1">{perm.description}</div>
                  )}
                </TableCell>
                <TableCell className="text-center">
                  {perm.superAdmin ? (
                    <Check className="h-5 w-5 text-green-500 mx-auto" />
                  ) : (
                    <X className="h-5 w-5 text-red-500 mx-auto" />
                  )}
                </TableCell>
                <TableCell className="text-center">
                  {perm.sfdAdmin ? (
                    <div className="flex items-center justify-center">
                      <Check className="h-5 w-5 text-green-500" />
                      {perm.functionality === "Approuver un prêt" && (
                        <span className="text-xs ml-1">(Sa SFD)</span>
                      )}
                    </div>
                  ) : (
                    <X className="h-5 w-5 text-red-500 mx-auto" />
                  )}
                </TableCell>
                <TableCell className="text-center">
                  {perm.cashier ? (
                    <div className="flex items-center justify-center">
                      <Check className="h-5 w-5 text-green-500" />
                      {perm.functionality === "Voir les soldes clients" && (
                        <span className="text-xs ml-1">(Agence)</span>
                      )}
                    </div>
                  ) : (
                    <X className="h-5 w-5 text-red-500 mx-auto" />
                  )}
                </TableCell>
                <TableCell className="text-center">
                  {perm.client ? (
                    <div className="flex items-center justify-center">
                      <Check className="h-5 w-5 text-green-500" />
                      {perm.functionality === "Voir les soldes clients" && (
                        <span className="text-xs ml-1">(Soi)</span>
                      )}
                    </div>
                  ) : (
                    <X className="h-5 w-5 text-red-500 mx-auto" />
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
