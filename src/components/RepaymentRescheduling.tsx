import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Calendar as CalendarIcon, CheckCircle2, Clock, AlertCircle } from 'lucide-react';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';

export const RepaymentRescheduling = () => {
  const { toast } = useToast();
  const [loanRef, setLoanRef] = useState('');
  const [rescheduleReason, setRescheduleReason] = useState('');
  const [newDueDate, setNewDueDate] = useState<Date | undefined>();
  const [paymentPlan, setPaymentPlan] = useState('lump-sum');
  const [approvalStatus, setApprovalStatus] = useState('pending');
  
  const handleRescheduleRequest = () => {
    if (!loanRef || !rescheduleReason || !newDueDate) {
      toast({
        title: "Erreur",
        description: "Veuillez remplir tous les champs obligatoires.",
        variant: "destructive",
      });
      return;
    }
    
    setApprovalStatus('pending');
    
    toast({
      title: "Demande envoyée",
      description: "Votre demande de report d'échéance a été soumise avec succès. Veuillez attendre la confirmation.",
    });
  };
  
  const handleApproveRequest = () => {
    setApprovalStatus('approved');
    toast({
      title: "Demande approuvée",
      description: "La demande de report d'échéance a été approuvée.",
    });
  };
  
  const handleRejectRequest = () => {
    setApprovalStatus('rejected');
    toast({
      title: "Demande rejetée",
      description: "La demande de report d'échéance a été rejetée.",
      variant: "destructive",
    });
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Clock className="mr-2 h-5 w-5 text-[#0D6A51]" />
          Report d'échéance
        </CardTitle>
        <CardDescription>
          Gérez les demandes de report d'échéance de vos clients
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="loan-ref">Référence du prêt</Label>
          <Input
            id="loan-ref"
            placeholder="LN-2023-0001"
            value={loanRef}
            onChange={(e) => setLoanRef(e.target.value)}
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="reschedule-reason">Motif du report</Label>
          <Select onValueChange={setRescheduleReason}>
            <SelectTrigger>
              <SelectValue placeholder="Sélectionnez un motif" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="difficultes-financieres">Difficultés financières</SelectItem>
              <SelectItem value="perte-emploi">Perte d'emploi</SelectItem>
              <SelectItem value="maladie">Maladie</SelectItem>
              <SelectItem value="autre">Autre</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="space-y-2">
          <Label>Nouvelle date d'échéance</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant={"outline"}
                className="w-[240px] justify-start text-left font-normal"
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {newDueDate ? (
                  format(newDueDate, "PPP")
                ) : (
                  <span>Choisir une date</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="center" side="bottom">
              <Calendar
                mode="single"
                selected={newDueDate}
                onSelect={setNewDueDate}
                disabled={(date) =>
                  date < new Date()
                }
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>
        
        <div className="space-y-2">
          <Label>Plan de remboursement</Label>
          <RadioGroup defaultValue={paymentPlan} onValueChange={setPaymentPlan}>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="lump-sum" id="r1" />
              <Label htmlFor="r1">Versement unique</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="installments" id="r2" />
              <Label htmlFor="r2">Plusieurs versements</Label>
            </div>
          </RadioGroup>
        </div>
      </CardContent>
      <Separator />
      <CardFooter className="flex justify-between">
        <div>
          {approvalStatus === 'pending' && (
            <Badge variant="secondary">
              <Clock className="mr-2 h-4 w-4" />
              En attente
            </Badge>
          )}
          {approvalStatus === 'approved' && (
            <Badge className="bg-green-100 text-green-800">
              <CheckCircle2 className="mr-2 h-4 w-4" />
              Approuvée
            </Badge>
          )}
          {approvalStatus === 'rejected' && (
            <Badge className="bg-red-100 text-red-800">
              <AlertCircle className="mr-2 h-4 w-4" />
              Rejetée
            </Badge>
          )}
        </div>
        <div className="space-x-2">
          {approvalStatus === 'pending' && (
            <>
              <Button variant="outline" onClick={handleRejectRequest}>
                Rejeter
              </Button>
              <Button onClick={handleApproveRequest}>Approuver</Button>
            </>
          )}
          {approvalStatus !== 'pending' && (
            <Button onClick={handleRescheduleRequest}>
              Envoyer la demande
            </Button>
          )}
        </div>
      </CardFooter>
    </Card>
  );
};
