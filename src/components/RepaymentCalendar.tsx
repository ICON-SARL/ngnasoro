
import React, { useState } from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { format, addMonths } from 'date-fns';
import { Calendar, CheckCircle, AlertTriangle, CalendarRange, Download, Smartphone, Building, CreditCard } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

export const RepaymentCalendar = () => {
  const { toast } = useToast();
  const [startDate] = useState(new Date());
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<any>(null);
  
  // Générer un calendrier de remboursement de 12 mois
  const generateRepaymentSchedule = () => {
    const schedule = [];
    const monthlyPayment = 38736; // Montant fixe pour la démonstration
    
    for (let i = 1; i <= 12; i++) {
      const dueDate = addMonths(startDate, i);
      const isPaid = i <= 2; // Les 2 premiers mois sont déjà payés
      const isLate = i === 3 && !isPaid; // Le 3ème mois est en retard
      
      schedule.push({
        payment_number: i,
        due_date: dueDate,
        amount: monthlyPayment,
        principal: Math.round(monthlyPayment * 0.7),
        interest: Math.round(monthlyPayment * 0.3),
        status: isPaid ? 'paid' : isLate ? 'late' : 'upcoming',
        payment_date: isPaid ? addMonths(dueDate, -0.1) : null
      });
    }
    
    return schedule;
  };
  
  const schedule = generateRepaymentSchedule();
  
  const handleExportCalendar = () => {
    toast({
      title: "Calendrier exporté",
      description: "Le calendrier de remboursement a été exporté au format iCalendar (.ics).",
    });
  };
  
  const getStatusBadge = (status) => {
    switch (status) {
      case 'paid':
        return <Badge className="bg-green-100 text-green-800"><CheckCircle className="h-3 w-3 mr-1" /> Payé</Badge>;
      case 'late':
        return <Badge className="bg-red-100 text-red-800"><AlertTriangle className="h-3 w-3 mr-1" /> En retard</Badge>;
      case 'upcoming':
        return <Badge variant="outline">À venir</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };
  
  const handlePayment = (payment) => {
    setSelectedPayment(payment);
    setShowPaymentDialog(true);
  };
  
  const processPayment = (method) => {
    toast({
      title: `Paiement par ${method} initié`,
      description: method === 'mobile' 
        ? "Veuillez confirmer le paiement sur votre téléphone." 
        : "Un QR code de paiement a été généré pour l'agence SFD.",
    });
    setShowPaymentDialog(false);
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Calendar className="mr-2 h-5 w-5 text-[#0D6A51]" />
          Calendrier de Remboursement
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="rounded-md bg-muted p-4 mb-4">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-sm font-medium">Prêt #LN-2023-04587</h3>
              <p className="text-xs text-muted-foreground">
                850,000 FCFA sur 12 mois @ 8.5%
              </p>
            </div>
            <Button variant="outline" size="sm" className="gap-1" onClick={handleExportCalendar}>
              <CalendarRange className="h-4 w-4" />
              <span className="hidden sm:inline">Exporter</span>
            </Button>
          </div>
        </div>
        
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>N°</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Montant</TableHead>
              <TableHead>Principal</TableHead>
              <TableHead>Intérêts</TableHead>
              <TableHead>Statut</TableHead>
              <TableHead className="text-right">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {schedule.map((payment) => (
              <TableRow key={payment.payment_number}>
                <TableCell>{payment.payment_number}</TableCell>
                <TableCell>{format(payment.due_date, 'dd/MM/yyyy')}</TableCell>
                <TableCell>{payment.amount.toLocaleString()} FCFA</TableCell>
                <TableCell>{payment.principal.toLocaleString()} FCFA</TableCell>
                <TableCell>{payment.interest.toLocaleString()} FCFA</TableCell>
                <TableCell>
                  {getStatusBadge(payment.status)}
                  {payment.status === 'paid' && (
                    <div className="text-xs text-muted-foreground mt-1">
                      Payé le {format(payment.payment_date, 'dd/MM/yyyy')}
                    </div>
                  )}
                </TableCell>
                <TableCell className="text-right">
                  {payment.status !== 'paid' && (
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => handlePayment(payment)}
                      className={payment.status === 'late' ? "border-red-200 text-red-600 hover:bg-red-50" : ""}
                    >
                      <CreditCard className="h-3 w-3 mr-1" />
                      Payer
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
          <div className="bg-muted p-3 rounded-lg">
            <p className="text-xs text-muted-foreground">Total du prêt</p>
            <p className="text-lg font-bold">850,000 FCFA</p>
          </div>
          <div className="bg-muted p-3 rounded-lg">
            <p className="text-xs text-muted-foreground">Intérêts totaux</p>
            <p className="text-lg font-bold">{(38736 * 12 - 850000).toLocaleString()} FCFA</p>
          </div>
          <div className="bg-muted p-3 rounded-lg">
            <p className="text-xs text-muted-foreground">Date de fin</p>
            <p className="text-lg font-bold">{format(addMonths(startDate, 12), 'MM/yyyy')}</p>
          </div>
        </div>
        
        <Dialog open={showPaymentDialog} onOpenChange={setShowPaymentDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Options de paiement</DialogTitle>
            </DialogHeader>
            {selectedPayment && (
              <div className="space-y-4">
                <div className="bg-muted p-4 rounded-md mb-2">
                  <p className="text-sm">Échéance #{selectedPayment.payment_number} - {format(selectedPayment.due_date, 'dd/MM/yyyy')}</p>
                  <p className="text-xl font-bold">{selectedPayment.amount.toLocaleString()} FCFA</p>
                </div>
                
                <div className="space-y-2">
                  <Button 
                    variant="outline" 
                    className="w-full justify-start h-auto py-3" 
                    onClick={() => processPayment('mobile')}
                  >
                    <div className="flex items-center">
                      <div className="h-10 w-10 rounded-full bg-yellow-100 flex items-center justify-center mr-3">
                        <Smartphone className="h-5 w-5 text-yellow-600" />
                      </div>
                      <div className="text-left">
                        <p className="font-medium">Mobile Money</p>
                        <p className="text-xs text-gray-500">Orange Money, MTN Mobile Money, Moov Money...</p>
                      </div>
                    </div>
                  </Button>
                  
                  <Button 
                    variant="outline" 
                    className="w-full justify-start h-auto py-3" 
                    onClick={() => processPayment('agence')}
                  >
                    <div className="flex items-center">
                      <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center mr-3">
                        <Building className="h-5 w-5 text-blue-600" />
                      </div>
                      <div className="text-left">
                        <p className="font-medium">Paiement en agence SFD</p>
                        <p className="text-xs text-gray-500">Générer un QR code à présenter en agence</p>
                      </div>
                    </div>
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </CardContent>
      <CardFooter>
        <div className="w-full">
          <Button variant="outline" className="w-full" onClick={handleExportCalendar}>
            <Download className="h-4 w-4 mr-2" />
            Télécharger le calendrier (iCalendar)
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
};
