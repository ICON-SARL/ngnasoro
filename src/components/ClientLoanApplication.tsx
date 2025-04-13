import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { AlertCircle, FileText, Upload, CheckCircle2, Clock, BanknoteIcon, CreditCard, Calculator } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { useClientLoans, LoanApplication } from '@/hooks/useClientLoans';
import { useAuth } from '@/hooks/useAuth';
import { useSfdDataAccess } from '@/hooks/useSfdDataAccess';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface LoanPlan {
  id: string;
  name: string;
  description?: string;
  min_amount: number;
  max_amount: number;
  min_duration: number;
  max_duration: number;
  interest_rate: number;
  fees: number;
  requirements?: string[];
}

interface LoanCalculation {
  monthlyPayment: number;
  totalRepayment: number;
  totalInterest: number;
  totalFees: number;
  schedule: {
    month: number;
    date: string;
    principal: number;
    interest: number;
    fees: number;
    total: number;
    balance: number;
  }[];
}

const ClientLoanApplication = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const { sfdData, activeSfdId } = useSfdDataAccess();
  const { applyForLoan, uploadDocument, isUploading } = useClientLoans();
  
  const [amount, setAmount] = useState<number>(50000);
  const [duration, setDuration] = useState<number>(6);
  const [purpose, setPurpose] = useState<string>('');
  const [sfdId, setSfdId] = useState<string>(activeSfdId || '');
  const [uploadedFiles, setUploadedFiles] = useState<string[]>([]);
  const [fileNames, setFileNames] = useState<string[]>([]);
  const [uploading, setUploading] = useState<boolean>(false);
  const [step, setStep] = useState<number>(1);
  const [loanPlans, setLoanPlans] = useState<LoanPlan[]>([]);
  const [selectedPlan, setSelectedPlan] = useState<LoanPlan | null>(null);
  const [loanCalculation, setLoanCalculation] = useState<LoanCalculation | null>(null);
  const [showRepaymentSchedule, setShowRepaymentSchedule] = useState<boolean>(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (sfdId) {
      fetchLoanPlans(sfdId);
    }
  }, [sfdId]);

  useEffect(() => {
    if (selectedPlan) {
      if (amount < selectedPlan.min_amount) setAmount(selectedPlan.min_amount);
      if (amount > selectedPlan.max_amount) setAmount(selectedPlan.max_amount);
      if (duration < selectedPlan.min_duration) setDuration(selectedPlan.min_duration);
      if (duration > selectedPlan.max_duration) setDuration(selectedPlan.max_duration);
      
      calculateLoan();
    }
  }, [selectedPlan, amount, duration]);

  const fetchLoanPlans = async (sfdId: string) => {
    try {
      const { data, error } = await supabase
        .from('sfd_loan_plans')
        .select('*')
        .eq('sfd_id', sfdId)
        .eq('is_active', true);
      
      if (error) throw error;
      setLoanPlans(data || []);
      
      if (data && data.length > 0) {
        setSelectedPlan(data[0]);
      }
    } catch (error) {
      console.error('Error fetching loan plans:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de charger les plans de prêt',
        variant: 'destructive'
      });
    }
  };
  
  const calculateLoan = () => {
    if (!selectedPlan) return;
    
    const interestRate = selectedPlan.interest_rate / 100;
    const monthlyRate = interestRate / 12;
    const fees = (selectedPlan.fees / 100) * amount;
    
    const monthlyPayment = (amount * monthlyRate * Math.pow(1 + monthlyRate, duration)) / 
                          (Math.pow(1 + monthlyRate, duration) - 1);
    
    const totalRepayment = (monthlyPayment * duration) + fees;
    const totalInterest = (monthlyPayment * duration) - amount;
    
    const schedule = [];
    let remainingBalance = amount;
    
    for (let month = 1; month <= duration; month++) {
      const interestPayment = remainingBalance * monthlyRate;
      const principalPayment = monthlyPayment - interestPayment;
      const feePayment = month === 1 ? fees : 0;
      
      remainingBalance -= principalPayment;
      
      const paymentDate = new Date();
      paymentDate.setMonth(paymentDate.getMonth() + month);
      
      schedule.push({
        month,
        date: paymentDate.toLocaleDateString('fr-FR'),
        principal: Math.round(principalPayment),
        interest: Math.round(interestPayment),
        fees: Math.round(feePayment),
        total: Math.round(monthlyPayment + (month === 1 ? fees : 0)),
        balance: Math.max(0, Math.round(remainingBalance))
      });
    }
    
    setLoanCalculation({
      monthlyPayment: Math.round(monthlyPayment),
      totalRepayment: Math.round(totalRepayment),
      totalInterest: Math.round(totalInterest),
      totalFees: Math.round(fees),
      schedule
    });
  };
  
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    
    setUploading(true);
    const newUploadedFiles: string[] = [...uploadedFiles];
    const newFileNames: string[] = [...fileNames];
    
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const result = await uploadDocument(file);
      if (result) {
        newUploadedFiles.push(result);
        newFileNames.push(file.name);
      }
    }
    
    setUploadedFiles(newUploadedFiles);
    setFileNames(newFileNames);
    setUploading(false);
    
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };
  
  const handleSubmit = () => {
    if (!selectedPlan) {
      toast({
        title: 'Erreur',
        description: 'Veuillez sélectionner un plan de prêt',
        variant: 'destructive'
      });
      return;
    }

    const newLoanApplication: LoanApplication = {
      sfd_id: sfdId,
      amount: amount,
      duration_months: duration,
      purpose: purpose,
      supporting_documents: uploadedFiles,
    };
    
    applyForLoan.mutate(newLoanApplication, {
      onSuccess: () => {
        setStep(3);
      }
    });
  };
  
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('fr-FR').format(value) + ' FCFA';
  };
  
  const getStepContent = () => {
    switch (step) {
      case 1:
        return (
          <>
            <CardContent className="space-y-4">
              <Alert className="bg-blue-50 border-blue-200">
                <AlertCircle className="h-4 w-4 text-blue-600" />
                <AlertDescription className="text-blue-700">
                  Complétez ce formulaire pour soumettre une demande de prêt. Nous vous informerons dès qu'elle sera traitée.
                </AlertDescription>
              </Alert>
              
              <div className="space-y-2">
                <Label htmlFor="sfd">Institution de Microfinance (SFD)</Label>
                <Select value={sfdId} onValueChange={(value) => {
                  setSfdId(value);
                  setSelectedPlan(null);
                }}>
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionnez une SFD" />
                  </SelectTrigger>
                  <SelectContent>
                    {sfdData.map((sfd) => (
                      <SelectItem key={sfd.id} value={sfd.id}>{sfd.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              {sfdId && loanPlans.length > 0 ? (
                <div className="space-y-2">
                  <Label htmlFor="plan">Plan de Prêt</Label>
                  <Select 
                    value={selectedPlan?.id || ''} 
                    onValueChange={(value) => {
                      const plan = loanPlans.find(p => p.id === value);
                      if (plan) setSelectedPlan(plan);
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionnez un plan de prêt" />
                    </SelectTrigger>
                    <SelectContent>
                      {loanPlans.map((plan) => (
                        <SelectItem key={plan.id} value={plan.id}>
                          {plan.name} ({plan.interest_rate}%)
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  
                  {selectedPlan && (
                    <div className="mt-2 text-sm text-muted-foreground">
                      <p>{selectedPlan.description}</p>
                      <div className="mt-1 text-xs">
                        <span className="font-semibold">Taux: </span> 
                        {selectedPlan.interest_rate}% • 
                        <span className="font-semibold"> Montant: </span> 
                        {formatCurrency(selectedPlan.min_amount)} - {formatCurrency(selectedPlan.max_amount)} • 
                        <span className="font-semibold"> Durée: </span> 
                        {selectedPlan.min_duration} - {selectedPlan.max_duration} mois
                      </div>
                    </div>
                  )}
                </div>
              ) : sfdId ? (
                <Alert className="bg-amber-50 border-amber-200">
                  <AlertCircle className="h-4 w-4 text-amber-600" />
                  <AlertDescription className="text-amber-700">
                    Aucun plan de prêt disponible pour cette SFD. Veuillez en choisir une autre.
                  </AlertDescription>
                </Alert>
              ) : null}
              
              {selectedPlan && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="amount">Montant du prêt (FCFA)</Label>
                    <div className="flex items-center gap-2">
                      <Input
                        id="amount"
                        type="number"
                        value={amount}
                        onChange={(e) => setAmount(Number(e.target.value))}
                        min={selectedPlan.min_amount}
                        max={selectedPlan.max_amount}
                        step={5000}
                      />
                    </div>
                    <Slider
                      value={[amount]}
                      min={selectedPlan.min_amount}
                      max={selectedPlan.max_amount}
                      step={5000}
                      onValueChange={(value) => setAmount(value[0])}
                    />
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>{formatCurrency(selectedPlan.min_amount)}</span>
                      <span>{formatCurrency(selectedPlan.max_amount)}</span>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="duration">Durée du prêt (mois)</Label>
                    <div className="flex gap-2 flex-wrap">
                      {Array.from(
                        { length: (selectedPlan.max_duration - selectedPlan.min_duration) / 3 + 1 }, 
                        (_, i) => selectedPlan.min_duration + (i * 3)
                      ).map((months) => (
                        <Button
                          key={months}
                          type="button"
                          variant={duration === months ? "default" : "outline"}
                          className="flex-1"
                          onClick={() => setDuration(months)}
                          disabled={months > selectedPlan.max_duration}
                        >
                          {months}
                        </Button>
                      ))}
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="purpose">Objet du prêt</Label>
                    <Textarea
                      id="purpose"
                      placeholder="Décrivez l'objet de votre demande de prêt..."
                      value={purpose}
                      onChange={(e) => setPurpose(e.target.value)}
                    />
                  </div>
                  
                  {loanCalculation && (
                    <div className="bg-muted rounded-lg p-4 mt-4">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-semibold flex items-center">
                          <Calculator className="h-4 w-4 mr-1" />
                          Simulation de Prêt
                        </h3>
                        <Button 
                          variant="link" 
                          size="sm" 
                          className="h-auto p-0" 
                          onClick={() => setShowRepaymentSchedule(!showRepaymentSchedule)}
                        >
                          {showRepaymentSchedule ? "Masquer" : "Voir"} l'échéancier
                        </Button>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="text-muted-foreground">Mensualité</p>
                          <p className="font-semibold">{formatCurrency(loanCalculation.monthlyPayment)}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Total à rembourser</p>
                          <p className="font-semibold">{formatCurrency(loanCalculation.totalRepayment)}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Intérêts</p>
                          <p className="font-semibold">{formatCurrency(loanCalculation.totalInterest)}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Frais</p>
                          <p className="font-semibold">{formatCurrency(loanCalculation.totalFees)}</p>
                        </div>
                      </div>
                      
                      {showRepaymentSchedule && (
                        <div className="mt-4 border-t pt-2">
                          <h4 className="font-medium text-sm mb-2">Échéancier de remboursement</h4>
                          <div className="max-h-60 overflow-y-auto text-sm">
                            <table className="w-full">
                              <thead className="text-xs text-muted-foreground">
                                <tr>
                                  <th className="py-1 text-left">Mois</th>
                                  <th className="py-1 text-right">Date</th>
                                  <th className="py-1 text-right">Mensualité</th>
                                </tr>
                              </thead>
                              <tbody>
                                {loanCalculation.schedule.map((payment) => (
                                  <tr key={payment.month} className="border-t border-gray-100">
                                    <td className="py-1">{payment.month}</td>
                                    <td className="py-1 text-right">{payment.date}</td>
                                    <td className="py-1 text-right font-medium">
                                      {formatCurrency(payment.total)}
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </>
              )}
            </CardContent>
            
            <CardFooter className="flex justify-between">
              <Button variant="outline" onClick={() => window.history.back()}>
                Annuler
              </Button>
              <Button 
                onClick={() => setStep(2)} 
                disabled={!selectedPlan || !sfdId || amount < (selectedPlan?.min_amount || 0) || !purpose}
                className="bg-[#0D6A51] hover:bg-[#0D6A51]/90"
              >
                Continuer
              </Button>
            </CardFooter>
          </>
        );
        
      case 2:
        return (
          <>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4 p-4 bg-muted rounded-lg">
                <div>
                  <p className="text-sm text-muted-foreground">Montant du prêt</p>
                  <p className="text-lg font-semibold">{formatCurrency(amount)}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Durée</p>
                  <p className="text-lg font-semibold">{duration} mois</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Mensualité</p>
                  <p className="text-lg font-semibold">
                    {loanCalculation ? formatCurrency(loanCalculation.monthlyPayment) : 'Calcul...'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total à rembourser</p>
                  <p className="text-lg font-semibold">
                    {loanCalculation ? formatCurrency(loanCalculation.totalRepayment) : 'Calcul...'}
                  </p>
                </div>
              </div>
              
              <Separator />
              
              <div className="space-y-2">
                <Label>Documents justificatifs (facultatif)</Label>
                <div className="border border-dashed border-gray-300 rounded-lg p-4 text-center">
                  <Input
                    ref={fileInputRef}
                    type="file"
                    className="hidden"
                    onChange={handleFileChange}
                    multiple
                    accept=".pdf,.jpg,.jpeg,.png"
                  />
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploading}
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    Ajouter des documents
                  </Button>
                  <p className="text-xs text-muted-foreground mt-2">
                    Formats acceptés: PDF, JPG, PNG. Max 5MB par fichier.
                  </p>
                </div>
                
                {uploading && (
                  <div className="mt-2">
                    <p className="text-sm">Téléchargement en cours...</p>
                    <Progress value={45} className="h-1" />
                  </div>
                )}
                
                {fileNames.length > 0 && (
                  <div className="space-y-2 mt-4">
                    <Label>Documents téléchargés</Label>
                    <div className="space-y-2">
                      {fileNames.map((name, index) => (
                        <div key={index} className="flex items-center p-2 rounded bg-muted">
                          <FileText className="h-4 w-4 mr-2 text-blue-500" />
                          <span className="text-sm truncate">{name}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              
              {selectedPlan?.requirements && selectedPlan.requirements.length > 0 && (
                <Alert className="bg-blue-50 border-blue-200">
                  <AlertCircle className="h-4 w-4 text-blue-600" />
                  <AlertTitle className="text-blue-800">Conditions requises</AlertTitle>
                  <AlertDescription className="text-blue-700">
                    <ul className="list-disc list-inside space-y-1 mt-1">
                      {selectedPlan.requirements.map((req, idx) => (
                        <li key={idx}>{req}</li>
                      ))}
                    </ul>
                  </AlertDescription>
                </Alert>
              )}
              
              <Alert className="bg-amber-50 border-amber-200">
                <AlertCircle className="h-4 w-4 text-amber-600" />
                <AlertTitle className="text-amber-800">Important</AlertTitle>
                <AlertDescription className="text-amber-700">
                  En soumettant cette demande, vous acceptez que la SFD effectue une vérification de votre dossier. 
                  Le taux d'intérêt annuel est de {selectedPlan?.interest_rate || 5.5}%.
                </AlertDescription>
              </Alert>
            </CardContent>
            
            <CardFooter className="flex justify-between">
              <Button variant="outline" onClick={() => setStep(1)}>
                Retour
              </Button>
              <Button 
                onClick={handleSubmit} 
                disabled={applyForLoan.isPending || isUploading}
                className="bg-[#0D6A51] hover:bg-[#0D6A51]/90"
              >
                {applyForLoan.isPending ? "Envoi en cours..." : "Soumettre la demande"}
              </Button>
            </CardFooter>
          </>
        );
        
      case 3:
        return (
          <CardContent className="pt-6">
            <div className="flex flex-col items-center justify-center text-center py-10">
              <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mb-4">
                <CheckCircle2 className="h-8 w-8 text-green-600" />
              </div>
              <h2 className="text-2xl font-bold mb-2">Demande envoyée avec succès !</h2>
              <p className="text-muted-foreground mb-6">
                Votre demande de prêt de {formatCurrency(amount)} a été soumise.
                Vous recevrez une notification dès qu'elle sera traitée.
              </p>
              
              <div className="w-full max-w-md space-y-4">
                <div className="flex items-center p-4 rounded-lg border bg-muted">
                  <Clock className="h-5 w-5 text-amber-500 mr-3" />
                  <div>
                    <h3 className="font-medium">Traitement en cours</h3>
                    <p className="text-sm text-muted-foreground">Délai estimé: 24-48h</p>
                  </div>
                </div>
                
                <div className="flex items-center p-4 rounded-lg border bg-muted">
                  <BanknoteIcon className="h-5 w-5 text-green-500 mr-3" />
                  <div>
                    <h3 className="font-medium">Montant demandé</h3>
                    <p className="text-sm">{formatCurrency(amount)} sur {duration} mois</p>
                  </div>
                </div>
                
                <div className="flex items-center p-4 rounded-lg border bg-muted">
                  <CreditCard className="h-5 w-5 text-blue-500 mr-3" />
                  <div>
                    <h3 className="font-medium">Plan de prêt</h3>
                    <p className="text-sm">{selectedPlan?.name} ({selectedPlan?.interest_rate}%)</p>
                  </div>
                </div>
              </div>
              
              <Button 
                className="mt-8 bg-[#0D6A51] hover:bg-[#0D6A51]/90"
                onClick={() => window.location.href = '/loans'}
              >
                Voir mes demandes de prêt
              </Button>
            </div>
          </CardContent>
        );
        
      default:
        return null;
    }
  };
  
  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Demande de prêt</CardTitle>
        <CardDescription>
          Remplissez ce formulaire pour faire une demande de prêt auprès de votre SFD
        </CardDescription>
        
        {step < 3 && (
          <div className="mt-4">
            <div className="flex justify-between text-sm mb-2">
              <span>Information</span>
              <span>Documents</span>
              <span>Confirmation</span>
            </div>
            <Progress value={step === 1 ? 33.3 : (step === 2 ? 66.6 : 100)} className="h-2" />
          </div>
        )}
      </CardHeader>
      
      {getStepContent()}
    </Card>
  );
};

export default ClientLoanApplication;
