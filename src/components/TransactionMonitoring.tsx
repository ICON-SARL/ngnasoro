
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Search, Filter, RefreshCw, AlertTriangle, ArrowDown, ArrowUp } from 'lucide-react';

export const TransactionMonitoring = () => {
  const transactions = [
    { 
      id: 'TX12345678',
      date: '2023-04-22 14:32',
      type: 'Versement',
      amount: '250,000 FCFA',
      client: 'Amadou Diallo',
      agency: 'SFD Bamako Central',
      status: 'success'
    },
    { 
      id: 'TX12345679',
      date: '2023-04-22 13:15',
      type: 'Retrait',
      amount: '75,000 FCFA',
      client: 'Fatoumata Camara',
      agency: 'SFD Bamako Central',
      status: 'success'
    },
    { 
      id: 'TX12345680',
      date: '2023-04-22 11:47',
      type: 'Transfert',
      amount: '425,000 FCFA',
      client: 'Ibrahim Touré',
      agency: 'SFD Ségou Nord',
      status: 'pending'
    },
    { 
      id: 'TX12345681',
      date: '2023-04-22 10:23',
      type: 'Remboursement',
      amount: '50,000 FCFA',
      client: 'Mariam Sidibé',
      agency: 'SFD Kayes Rural',
      status: 'success'
    },
    { 
      id: 'TX12345682',
      date: '2023-04-22 09:15',
      type: 'Versement',
      amount: '500,000 FCFA',
      client: 'Oumar Konaré',
      agency: 'SFD Sikasso Est',
      status: 'flagged'
    },
  ];

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-xl font-semibold">Monitoring des Transactions</h2>
          <p className="text-sm text-muted-foreground">
            Suivi en temps réel avec l'infrastructure ElasticSearch
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-1" />
            Actualiser
          </Button>
          <Button variant="outline" size="sm">
            <Filter className="h-4 w-4 mr-1" />
            Filtres
          </Button>
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Rechercher..."
              className="pl-8 w-64"
            />
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <div className="flex justify-between items-center">
            <h3 className="text-sm font-medium text-muted-foreground">Transactions (24h)</h3>
            <span className="text-green-500">
              <ArrowUp className="h-4 w-4" />
            </span>
          </div>
          <p className="text-2xl font-bold mt-1">1,284</p>
          <p className="text-xs text-muted-foreground mt-1">+12% vs hier</p>
        </div>
        
        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <div className="flex justify-between items-center">
            <h3 className="text-sm font-medium text-muted-foreground">Volume (24h)</h3>
            <span className="text-green-500">
              <ArrowUp className="h-4 w-4" />
            </span>
          </div>
          <p className="text-2xl font-bold mt-1">32.5M FCFA</p>
          <p className="text-xs text-muted-foreground mt-1">+5% vs hier</p>
        </div>
        
        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <div className="flex justify-between items-center">
            <h3 className="text-sm font-medium text-muted-foreground">Moyenne</h3>
            <span className="text-red-500">
              <ArrowDown className="h-4 w-4" />
            </span>
          </div>
          <p className="text-2xl font-bold mt-1">25,234 FCFA</p>
          <p className="text-xs text-muted-foreground mt-1">-2% vs hier</p>
        </div>
        
        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <div className="flex justify-between items-center">
            <h3 className="text-sm font-medium text-muted-foreground">Alertes</h3>
            <span className="text-amber-500">
              <AlertTriangle className="h-4 w-4" />
            </span>
          </div>
          <p className="text-2xl font-bold mt-1">7</p>
          <p className="text-xs text-muted-foreground mt-1">Nécessitent une vérification</p>
        </div>
      </div>
      
      <div className="border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID Transaction</TableHead>
              <TableHead>Date & Heure</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Montant</TableHead>
              <TableHead>Client</TableHead>
              <TableHead>Agence</TableHead>
              <TableHead>Statut</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {transactions.map((tx) => (
              <TableRow key={tx.id} className={tx.status === 'flagged' ? 'bg-red-50' : ''}>
                <TableCell className="font-medium">{tx.id}</TableCell>
                <TableCell>{tx.date}</TableCell>
                <TableCell>{tx.type}</TableCell>
                <TableCell>{tx.amount}</TableCell>
                <TableCell>{tx.client}</TableCell>
                <TableCell>{tx.agency}</TableCell>
                <TableCell>
                  {tx.status === 'success' && (
                    <Badge className="bg-green-100 text-green-700">Succès</Badge>
                  )}
                  {tx.status === 'pending' && (
                    <Badge className="bg-amber-100 text-amber-700">En attente</Badge>
                  )}
                  {tx.status === 'flagged' && (
                    <Badge className="bg-red-100 text-red-700">
                      <AlertTriangle className="h-3 w-3 mr-1" />
                      Suspect
                    </Badge>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      
      <div className="text-center mt-4">
        <Button variant="outline" size="sm">
          Charger plus de transactions
        </Button>
      </div>
    </div>
  );
};
