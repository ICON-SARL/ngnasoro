
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calculator, Download, Calendar, Percent } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

// Simulation des taux SFD
const sfdRates = {
  'UNACOOPEC-CI': { min: 5.5, max: 12.0 },
  'RCPB': { min: 6.0, max: 11.5 },
  'FUCEC-TOGO': { min: 5.8, max: 12.5 },
  'Microcred': { min: 6.5, max: 13.0 },
  'Baobab': { min: 6.2, max: 11.8 }
};

export const LoanSimulator = () => {
  const { toast } = useToast();
  const [amount, setAmount] = useState(500000);
  const [duration, setDuration] = useState(12);
  const [rate, setRate] = useState(8.5);
  const [selectedSFD, setSelectedSFD] = useState('UNACOOPEC-CI');
  const [monthlyPayment, setMonthlyPayment] = useState(0);
  const [totalPayment, setTotalPayment] = useState(0);
  const [totalInterest, setTotalInterest] = useState(0);
  const [amortizationSchedule, setAmortizationSchedule] = useState<any[]>([]);
  
  // Calculer le paiement mensuel
  useEffect(() => {
    const monthlyRate = rate / 100 / 12;
    const monthlyPaymentValue = amount * monthlyRate * Math.pow(1 + monthlyRate, duration) / (Math.pow(1 + monthlyRate, duration) - 1);
    
    setMonthlyPayment(Math.round(monthlyPaymentValue));
    setTotalPayment(Math.round(monthlyPaymentValue * duration));
    setTotalInterest(Math.round((monthlyPaymentValue * duration) - amount));
    
    // Générer le tableau d'amortissement
    generateAmortizationSchedule(amount, monthlyPaymentValue, monthlyRate, duration);
  }, [amount, duration, rate]);
  
  // Mise à jour du taux en fonction de la SFD sélectionnée
  useEffect(() => {
    if (selectedSFD && sfdRates[selectedSFD]) {
      setRate(sfdRates[selectedSFD].min);
    }
  }, [selectedSFD]);
  
  const handleSFDChange = (value) => {
    setSelectedSFD(value);
  };
  
  const generateAmortizationSchedule = (principal, monthlyPayment, monthlyRate, months) => {
    let balance = principal;
    let schedule = [];
    
    for (let i = 1; i <= months; i++) {
      const interest = balance * monthlyRate;
      const principalPayment = monthlyPayment - interest;
      balance -= principalPayment;
      
      schedule.push({
        month: i,
        payment: Math.round(monthlyPayment),
        principal: Math.round(principalPayment),
        interest: Math.round(interest),
        balance: Math.round(balance > 0 ? balance : 0)
      });
    }
    
    setAmortizationSchedule(schedule);
  };
  
  const handleSimulate = () => {
    toast({
      title: "Simulation terminée",
      description: `Votre paiement mensuel estimé est de ${monthlyPayment.toLocaleString()} FCFA sur ${duration} mois.`,
    });
  };
  
  const exportPDF = () => {
    const doc = new jsPDF();
    
    // Titre
    doc.setFontSize(18);
    doc.text('Simulation de Prêt', 105, 15, { align: 'center' });
    
    // Information de base
    doc.setFontSize(12);
    doc.text(`SFD: ${selectedSFD}`, 20, 30);
    doc.text(`Montant du prêt: ${amount.toLocaleString()} FCFA`, 20, 40);
    doc.text(`Durée: ${duration} mois`, 20, 50);
    doc.text(`Taux d'intérêt: ${rate}%`, 20, 60);
    
    // Résultats
    doc.setFontSize(14);
    doc.text('Résumé', 105, 80, { align: 'center' });
    doc.setFontSize(12);
    doc.text(`Mensualité: ${monthlyPayment.toLocaleString()} FCFA`, 20, 90);
    doc.text(`Total à rembourser: ${totalPayment.toLocaleString()} FCFA`, 20, 100);
    doc.text(`Intérêts totaux: ${totalInterest.toLocaleString()} FCFA`, 20, 110);
    
    // Tableau d'amortissement
    doc.setFontSize(14);
    doc.text('Tableau d\'Amortissement', 105, 130, { align: 'center' });
    
    // @ts-ignore - jsPDF-autotable n'est pas correctement typé
    doc.autoTable({
      startY: 140,
      head: [['Mois', 'Mensualité', 'Principal', 'Intérêts', 'Solde restant']],
      body: amortizationSchedule.map(row => [
        row.month,
        `${row.payment.toLocaleString()} FCFA`,
        `${row.principal.toLocaleString()} FCFA`,
        `${row.interest.toLocaleString()} FCFA`,
        `${row.balance.toLocaleString()} FCFA`
      ]),
    });
    
    doc.save('simulation-pret.pdf');
    
    toast({
      title: "Export réussi",
      description: "Votre simulation a été exportée en PDF avec succès.",
    });
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Calculator className="mr-2 h-5 w-5 text-[#0D6A51]" />
          Simulateur de Prêt
        </CardTitle>
        <CardDescription>
          Estimez vos mensualités de remboursement en temps réel
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="sfd">Institution SFD</Label>
          <Select value={selectedSFD} onValueChange={handleSFDChange}>
            <SelectTrigger>
              <SelectValue placeholder="Sélectionnez une SFD" />
            </SelectTrigger>
            <SelectContent>
              {Object.keys(sfdRates).map((sfd) => (
                <SelectItem key={sfd} value={sfd}>
                  {sfd}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <p className="text-xs text-muted-foreground">
            Taux applicables: {sfdRates[selectedSFD]?.min}% - {sfdRates[selectedSFD]?.max}%
          </p>
        </div>
        
        <div className="space-y-2">
          <div className="flex justify-between">
            <Label htmlFor="amount">Montant du prêt</Label>
            <span className="text-sm font-medium">{amount.toLocaleString()} FCFA</span>
          </div>
          <Slider
            id="amount"
            min={100000}
            max={5000000}
            step={50000}
            value={[amount]}
            onValueChange={(values) => setAmount(values[0])}
            className="py-4"
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>100,000 FCFA</span>
            <span>5,000,000 FCFA</span>
          </div>
        </div>
        
        <div className="space-y-2">
          <div className="flex justify-between">
            <Label htmlFor="duration">Durée (mois)</Label>
            <span className="text-sm font-medium">{duration} mois</span>
          </div>
          <Slider
            id="duration"
            min={3}
            max={60}
            step={1}
            value={[duration]}
            onValueChange={(values) => setDuration(values[0])}
            className="py-4"
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>3 mois</span>
            <span>60 mois</span>
          </div>
        </div>
        
        <div className="space-y-2">
          <div className="flex justify-between">
            <Label htmlFor="rate" className="flex items-center">
              <Percent className="h-3 w-3 mr-1" />
              Taux d'intérêt
            </Label>
            <span className="text-sm font-medium">{rate}%</span>
          </div>
          <Slider
            id="rate"
            min={sfdRates[selectedSFD]?.min || 5}
            max={sfdRates[selectedSFD]?.max || 15}
            step={0.1}
            value={[rate]}
            onValueChange={(values) => setRate(values[0])}
            className="py-4"
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>{sfdRates[selectedSFD]?.min || 5}%</span>
            <span>{sfdRates[selectedSFD]?.max || 15}%</span>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4">
          <div className="bg-[#0D6A51]/5 p-4 rounded-lg">
            <p className="text-xs text-muted-foreground">Mensualité</p>
            <p className="text-2xl font-bold">{monthlyPayment.toLocaleString()} FCFA</p>
          </div>
          <div className="bg-muted p-4 rounded-lg">
            <p className="text-xs text-muted-foreground">Total à rembourser</p>
            <p className="text-2xl font-bold">{totalPayment.toLocaleString()} FCFA</p>
          </div>
          <div className="bg-muted p-4 rounded-lg">
            <p className="text-xs text-muted-foreground">Intérêts totaux</p>
            <p className="text-2xl font-bold">{totalInterest.toLocaleString()} FCFA</p>
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button variant="outline" className="w-1/2 mr-2" onClick={exportPDF}>
          <Download className="h-4 w-4 mr-2" />
          Exporter en PDF
        </Button>
        <Button className="w-1/2 bg-[#0D6A51] hover:bg-[#0D6A51]/90" onClick={handleSimulate}>
          Simuler
        </Button>
      </CardFooter>
    </Card>
  );
};

export default LoanSimulator;
