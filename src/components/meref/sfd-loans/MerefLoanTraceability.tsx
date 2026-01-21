
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Search, Building, Users, ArrowRight, GitBranch } from 'lucide-react';
import { useMerefSfdLoans } from '@/hooks/useMerefSfdLoans';
import { formatDateToLocale } from '@/utils/dateUtils';
import { Skeleton } from '@/components/ui/skeleton';

export function MerefLoanTraceability() {
  const { traceability, traceabilityLoading } = useMerefSfdLoans();
  const [searchTerm, setSearchTerm] = useState('');

  const filteredData = traceability?.filter(item =>
    item.meref_reference?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.sfd_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.client_name?.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  // Group by MEREF loan
  const groupedByMerefLoan = filteredData.reduce((acc, item) => {
    if (!acc[item.meref_loan_id]) {
      acc[item.meref_loan_id] = {
        merefLoan: {
          id: item.meref_loan_id,
          reference: item.meref_reference,
          amount: item.meref_amount,
          remaining: item.meref_remaining,
          status: item.meref_status,
          createdAt: item.meref_created_at,
          sfdName: item.sfd_name,
          sfdCode: item.sfd_code
        },
        clientLoans: []
      };
    }
    if (item.client_loan_id) {
      acc[item.meref_loan_id].clientLoans.push({
        id: item.client_loan_id,
        clientName: item.client_name,
        clientPhone: item.client_phone,
        amount: item.client_loan_amount,
        remaining: item.client_remaining,
        status: item.client_loan_status
      });
    }
    return acc;
  }, {} as Record<string, any>);

  if (traceabilityLoading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <Skeleton key={i} className="h-24 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <GitBranch className="h-5 w-5" />
          Traçabilité MEREF → SFD → Clients
        </CardTitle>
        <div className="relative w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Rechercher..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
          />
        </div>
      </CardHeader>
      <CardContent>
        {Object.keys(groupedByMerefLoan).length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            Aucune donnée de traçabilité disponible
          </div>
        ) : (
          <div className="space-y-6">
            {Object.values(groupedByMerefLoan).map((group: any) => (
              <div key={group.merefLoan.id} className="border rounded-lg overflow-hidden">
                {/* MEREF Loan Header */}
                <div className="bg-primary/10 p-4 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="p-2 bg-primary/20 rounded-full">
                      <Building className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-semibold">{group.merefLoan.reference}</p>
                      <p className="text-sm text-muted-foreground">
                        {group.merefLoan.sfdName} ({group.merefLoan.sfdCode})
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-lg">
                      {group.merefLoan.amount?.toLocaleString('fr-FR')} FCFA
                    </p>
                    <Badge variant="outline" className={
                      group.merefLoan.status === 'active' ? 'bg-green-100 text-green-800' :
                      group.merefLoan.status === 'completed' ? 'bg-gray-100 text-gray-800' :
                      'bg-yellow-100 text-yellow-800'
                    }>
                      {group.merefLoan.status}
                    </Badge>
                  </div>
                </div>

                {/* Arrow and flow indicator */}
                {group.clientLoans.length > 0 && (
                  <div className="flex items-center justify-center py-2 bg-muted/30">
                    <ArrowRight className="h-4 w-4 text-muted-foreground mx-2" />
                    <span className="text-sm text-muted-foreground">
                      Distribué à {group.clientLoans.length} client(s)
                    </span>
                    <ArrowRight className="h-4 w-4 text-muted-foreground mx-2" />
                  </div>
                )}

                {/* Client Loans Table */}
                {group.clientLoans.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-muted/50">
                        <TableHead>Client</TableHead>
                        <TableHead>Téléphone</TableHead>
                        <TableHead className="text-right">Montant</TableHead>
                        <TableHead className="text-right">Restant</TableHead>
                        <TableHead>Statut</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {group.clientLoans.map((clientLoan: any) => (
                        <TableRow key={clientLoan.id}>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Users className="h-4 w-4 text-muted-foreground" />
                              {clientLoan.clientName}
                            </div>
                          </TableCell>
                          <TableCell>{clientLoan.clientPhone || '-'}</TableCell>
                          <TableCell className="text-right font-medium">
                            {clientLoan.amount?.toLocaleString('fr-FR')} FCFA
                          </TableCell>
                          <TableCell className="text-right">
                            {clientLoan.remaining?.toLocaleString('fr-FR')} FCFA
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className={
                              clientLoan.status === 'active' ? 'bg-green-100 text-green-800' :
                              clientLoan.status === 'completed' ? 'bg-gray-100 text-gray-800' :
                              clientLoan.status === 'defaulted' ? 'bg-red-100 text-red-800' :
                              'bg-yellow-100 text-yellow-800'
                            }>
                              {clientLoan.status}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <div className="p-4 text-center text-muted-foreground text-sm">
                    Aucun prêt client encore attribué depuis ce financement
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
