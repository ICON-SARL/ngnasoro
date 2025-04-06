
import React from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';
import { Transaction } from '@/types/transactions';

interface TransactionsTableProps {
  transactions: Transaction[];
  isLoading: boolean;
}

export const TransactionsTable: React.FC<TransactionsTableProps> = ({ 
  transactions, 
  isLoading 
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Liste des Transactions</CardTitle>
        <CardDescription>
          Détail des transactions pour la période sélectionnée
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Nom</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Montant</TableHead>
              <TableHead>Statut</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-4">Chargement des transactions...</TableCell>
              </TableRow>
            ) : transactions.length > 0 ? (
              transactions.slice(0, 10).map((tx) => (
                <TableRow key={tx.id}>
                  <TableCell>{new Date(tx.created_at).toLocaleDateString()}</TableCell>
                  <TableCell>{tx.name || 'N/A'}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{tx.type}</Badge>
                  </TableCell>
                  <TableCell className="font-medium">{tx.amount.toLocaleString()} FCFA</TableCell>
                  <TableCell>
                    <Badge variant={tx.status === 'success' ? 'default' : tx.status === 'pending' ? 'secondary' : 'destructive'}>
                      {tx.status || 'success'}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-4">Aucune transaction disponible pour la période sélectionnée</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
      <CardFooter className="flex justify-between">
        <div className="text-sm text-muted-foreground">
          Affichage de {Math.min(10, transactions.length)} sur {transactions.length} transactions
        </div>
        <Button variant="outline" size="sm">
          <Download className="h-4 w-4 mr-1" />
          Télécharger tout
        </Button>
      </CardFooter>
    </Card>
  );
};
