
import React, { useState } from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar } from '@/components/ui/calendar';
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar as CalendarIcon, Download, Clock, CheckCircle, AlertTriangle } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

export const RepaymentCalendar = () => {
  const { toast } = useToast();
  const [date, setDate] = useState<Date | undefined>(new Date());
  
  // Génération d'un calendrier de remboursement factice
  const startDate = new Date();
  const repaymentSchedule = Array.from({ length: 12 }, (_, i) => {
    const dueDate = new Date(startDate);
    dueDate.setMonth(startDate.getMonth() + i + 1);
    
    const amount = 38736;
    const principal = amount * 0.75;
    const interest = amount * 0.25;
    
    let status = 'pending';
    if (i === 0) status = 'paid';
    if (i === 1) status = 'upcoming';
    if (i === 2) status = 'due-soon';
    
    return {
      id: i + 1,
      dueDate,
      amount,
      principal,
      interest,
      status
    };
  });
  
  const exportToICalendar = () => {
    // Simulation de l'exportation iCalendar
    toast({
      title: "Exportation réussie",
      description: "Le calendrier a été exporté au format iCalendar.",
    });
  };
  
  const getStatusBadge = (status) => {
    switch (status) {
      case 'paid':
        return <Badge className="bg-green-100 text-green-800"><CheckCircle className="h-3 w-3 mr-1" /> Payé</Badge>;
      case 'upcoming':
        return <Badge className="bg-blue-100 text-blue-800"><Clock className="h-3 w-3 mr-1" /> À venir</Badge>;
      case 'due-soon':
        return <Badge className="bg-amber-100 text-amber-800"><AlertTriangle className="h-3 w-3 mr-1" /> Échéance proche</Badge>;
      case 'pending':
      default:
        return <Badge className="bg-gray-100 text-gray-800">En attente</Badge>;
    }
  };
  
  // Dates d'échéance pour le calendrier
  const dueDates = repaymentSchedule.map(item => item.dueDate);
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <CalendarIcon className="mr-2 h-5 w-5 text-[#0D6A51]" />
          Calendrier de Remboursement
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="col-span-1">
            <div className="space-y-2 mb-4">
              <h3 className="text-sm font-medium">Visualisation du calendrier</h3>
              <p className="text-xs text-muted-foreground">
                Les dates d'échéance sont en surbrillance
              </p>
            </div>
            <Calendar
              mode="single"
              selected={date}
              onSelect={setDate}
              className="border rounded-md p-2"
              modifiers={{
                dueSoon: [dueDates[2]],
                upcoming: [dueDates[1]],
                paid: [dueDates[0]],
              }}
              modifiersStyles={{
                dueSoon: { backgroundColor: '#fef3c7', color: '#92400e', fontWeight: 'bold' },
                upcoming: { backgroundColor: '#dbeafe', color: '#1e40af', fontWeight: 'bold' },
                paid: { backgroundColor: '#dcfce7', color: '#166534', fontWeight: 'bold' },
              }}
            />
            <div className="mt-4 space-y-2">
              <div className="flex items-center text-xs">
                <div className="h-3 w-3 rounded-full bg-green-100 mr-2"></div>
                <span>Échéance payée</span>
              </div>
              <div className="flex items-center text-xs">
                <div className="h-3 w-3 rounded-full bg-blue-100 mr-2"></div>
                <span>Prochaine échéance</span>
              </div>
              <div className="flex items-center text-xs">
                <div className="h-3 w-3 rounded-full bg-amber-100 mr-2"></div>
                <span>Échéance imminente (7 jours)</span>
              </div>
            </div>
          </div>
          
          <div className="col-span-2">
            <div className="space-y-2 mb-4">
              <h3 className="text-sm font-medium">Tableau d'amortissement</h3>
              <p className="text-xs text-muted-foreground">
                Le tableau ci-dessous affiche vos échéances de remboursement
              </p>
            </div>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>N°</TableHead>
                  <TableHead>Date d'échéance</TableHead>
                  <TableHead>Montant</TableHead>
                  <TableHead>Principal</TableHead>
                  <TableHead>Intérêts</TableHead>
                  <TableHead>Statut</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {repaymentSchedule.slice(0, 6).map((payment) => (
                  <TableRow key={payment.id}>
                    <TableCell>{payment.id}</TableCell>
                    <TableCell>{payment.dueDate.toLocaleDateString()}</TableCell>
                    <TableCell>{payment.amount.toLocaleString()} FCFA</TableCell>
                    <TableCell>{payment.principal.toLocaleString()} FCFA</TableCell>
                    <TableCell>{payment.interest.toLocaleString()} FCFA</TableCell>
                    <TableCell>{getStatusBadge(payment.status)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
              <TableCaption>
                Affichage des 6 premières échéances sur 12
              </TableCaption>
            </Table>
          </div>
        </div>
      </CardContent>
      <CardFooter className="justify-end">
        <Button variant="outline" onClick={exportToICalendar}>
          <Download className="h-4 w-4 mr-2" />
          Exporter en iCalendar
        </Button>
      </CardFooter>
    </Card>
  );
};
