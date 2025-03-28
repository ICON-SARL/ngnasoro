
import React, { useState, useRef } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { AlertCircle, FileText, Upload, CheckCircle2, Clock, BanknoteIcon } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { useClientLoans, LoanApplication } from '@/hooks/useClientLoans';
import { useAuth } from '@/hooks/useAuth';
import { useSfdDataAccess } from '@/hooks/useSfdDataAccess';

const ClientLoanApplication = () => {
  const { user } = useAuth();
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
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  
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
    
    // Clear the input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };
  
  const handleSubmit = () => {
    const application: LoanApplication = {
      sfd_id: sfdId,
      amount: amount,
      duration_months: duration,
      purpose: purpose,
      supporting_documents: uploadedFiles
    };
    
    applyForLoan.mutate(application, {
      onSuccess: () => {
        setStep(3);
      }
    });
  };
  
  const calculateMonthlyPayment = () => {
    const interestRate = 0.055; // 5.5% annual
    const monthlyRate = interestRate / 12;
    const monthlyPayment = (amount * monthlyRate * Math.pow(1 + monthlyRate, duration)) / 
                          (Math.pow(1 + monthlyRate, duration) - 1);
    return Math.round(monthlyPayment);
  };
  
  const totalRepayment = calculateMonthlyPayment() * duration;
  const interestAmount = totalRepayment - amount;
  
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
                <Select value={sfdId} onValueChange={setSfdId}>
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
              
              <div className="space-y-2">
                <Label htmlFor="amount">Montant du prêt (FCFA)</Label>
                <div className="flex items-center gap-2">
                  <Input
                    id="amount"
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(Number(e.target.value))}
                    min={10000}
                    max={1000000}
                    step={5000}
                  />
                </div>
                <Slider
                  value={[amount]}
                  min={10000}
                  max={1000000}
                  step={5000}
                  onValueChange={(value) => setAmount(value[0])}
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>10,000 FCFA</span>
                  <span>1,000,000 FCFA</span>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="duration">Durée du prêt (mois)</Label>
                <div className="flex gap-2">
                  {[3, 6, 12, 18, 24, 36].map((months) => (
                    <Button
                      key={months}
                      type="button"
                      variant={duration === months ? "default" : "outline"}
                      className="flex-1"
                      onClick={() => setDuration(months)}
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
            </CardContent>
            
            <CardFooter className="flex justify-between">
              <Button variant="outline" onClick={() => window.history.back()}>
                Annuler
              </Button>
              <Button 
                onClick={() => setStep(2)} 
                disabled={!sfdId || amount < 10000 || !purpose}
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
                  <p className="text-lg font-semibold">{amount.toLocaleString('fr-FR')} FCFA</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Durée</p>
                  <p className="text-lg font-semibold">{duration} mois</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Mensualité estimée</p>
                  <p className="text-lg font-semibold">{calculateMonthlyPayment().toLocaleString('fr-FR')} FCFA</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total à rembourser</p>
                  <p className="text-lg font-semibold">{totalRepayment.toLocaleString('fr-FR')} FCFA</p>
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
              
              <Alert className="bg-amber-50 border-amber-200">
                <AlertCircle className="h-4 w-4 text-amber-600" />
                <AlertTitle className="text-amber-800">Important</AlertTitle>
                <AlertDescription className="text-amber-700">
                  En soumettant cette demande, vous acceptez que la SFD effectue une vérification de votre dossier. 
                  Le taux d'intérêt annuel est de 5.5%.
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
                Votre demande de prêt de {amount.toLocaleString('fr-FR')} FCFA a été soumise.
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
                    <p className="text-sm">{amount.toLocaleString('fr-FR')} FCFA sur {duration} mois</p>
                  </div>
                </div>
              </div>
              
              <Button 
                className="mt-8" 
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
