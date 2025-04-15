
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { ArrowUpDown, Download, Upload, RefreshCw } from 'lucide-react';
import { useSfdAccounts } from '@/hooks/useSfdAccounts';
import { formatCurrency } from '@/utils/format';

export function SfdAccountsOverview() {
  const {
    accounts,
    isLoading,
    transferFunds,
    synchronizeBalances,
    operationAccount,
    repaymentAccount,
    savingsAccount
  } = useSfdAccounts();

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Comptes SFD</h2>
        <div className="space-x-2">
          <Button 
            variant="outline" 
            onClick={() => synchronizeBalances.mutate()}
            disabled={synchronizeBalances.isPending}
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Synchroniser
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Compte d'opération */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Compte d'opération</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(operationAccount?.balance || 0)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Compte principal pour les opérations
            </p>
          </CardContent>
        </Card>

        {/* Compte de remboursement */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Compte de remboursement</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(repaymentAccount?.balance || 0)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Dédié aux remboursements de prêts
            </p>
          </CardContent>
        </Card>

        {/* Compte d'épargne */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Compte d'épargne</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(savingsAccount?.balance || 0)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Réserves et épargnes
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Historique des mouvements</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Montant</TableHead>
                <TableHead>Solde</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {accounts.map((account) => (
                <TableRow key={account.id}>
                  <TableCell>{new Date().toLocaleDateString()}</TableCell>
                  <TableCell>
                    <Badge variant={account.account_type === 'operation' ? 'default' : 'outline'}>
                      {account.account_type}
                    </Badge>
                  </TableCell>
                  <TableCell>{account.description || `Compte ${account.account_type}`}</TableCell>
                  <TableCell>{formatCurrency(account.balance)}</TableCell>
                  <TableCell>{formatCurrency(account.balance)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
