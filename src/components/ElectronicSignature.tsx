import React, { useState } from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { FileText, Check, Signature, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export const ElectronicSignature = () => {
  const { toast } = useToast();
  const [step, setStep] = useState(1);
  const [name, setName] = useState('');
  const [isChecked, setIsChecked] = useState(false);
  const [signing, setSigning] = useState(false);
  
  const handleContinue = () => {
    if (step === 1) {
      if (!name) {
        toast({
          variant: "destructive",
          title: "Erreur de validation",
          description: "Veuillez entrer votre nom complet.",
        });
        return;
      }
      if (!isChecked) {
        toast({
          variant: "destructive",
          title: "Confirmation requise",
          description: "Veuillez confirmer que vous avez lu et accepté les conditions.",
        });
        return;
      }
      setStep(2);
    } else if (step === 2) {
      setSigning(true);
      setTimeout(() => {
        setSigning(false);
        setStep(3);
        toast({
          title: "Signature électronique réussie",
          description: "Votre document a été signé avec un horodatage certifié.",
        });
      }, 2000);
    }
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Signature className="mr-2 h-5 w-5 text-[#0D6A51]" />
          Signature Électronique
        </CardTitle>
      </CardHeader>
      <CardContent>
        {step === 1 && (
          <div className="space-y-4">
            <div>
              <div className="p-4 border rounded-md mb-4 bg-muted/50">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center">
                    <FileText className="h-5 w-5 mr-2 text-[#0D6A51]" />
                    <span className="font-medium">Contrat de prêt</span>
                  </div>
                  <span className="text-xs bg-amber-100 text-amber-800 py-1 px-2 rounded-full">En attente de signature</span>
                </div>
                <p className="text-sm mb-3">Référence: LN-2023-04587</p>
                <div className="space-y-2 text-sm">
                  <p><span className="font-medium">Montant:</span> 850,000 FCFA</p>
                  <p><span className="font-medium">Durée:</span> 24 mois</p>
                  <p><span className="font-medium">Taux:</span> 8.5%</p>
                  <p><span className="font-medium">Mensualité:</span> 38,736 FCFA</p>
                </div>
              </div>
              
              <Label htmlFor="name">Nom complet (tel qu'il apparaît sur votre pièce d'identité)</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ex: Koné Ibrahim"
                className="mt-1"
              />
            </div>
            
            <div className="border rounded-md p-4 bg-muted/30">
              <div className="space-y-2 mb-4">
                <h3 className="font-medium">Conditions générales du contrat</h3>
                <Textarea
                  readOnly
                  className="h-32 text-xs"
                  value="Le présent contrat de prêt est conclu entre l'institution de microfinance et l'emprunteur identifié ci-dessus. L'emprunteur s'engage à rembourser le montant du prêt selon les conditions définies, incluant les intérêts et les frais applicables. Les paiements devront être effectués selon le calendrier de remboursement établi..."
                />
              </div>
              
              <div className="flex items-start space-x-2">
                <Checkbox
                  id="terms"
                  checked={isChecked}
                  onCheckedChange={() => setIsChecked(!isChecked)}
                />
                <Label
                  htmlFor="terms"
                  className="text-sm leading-tight font-normal"
                >
                  J'ai lu et j'accepte les conditions générales du contrat, et je consens à l'utilisation de la signature électronique qui a valeur légale.
                </Label>
              </div>
            </div>
          </div>
        )}
        
        {step === 2 && (
          <div className="space-y-6 text-center">
            <div className="p-6 border-2 border-dashed rounded-md">
              <Signature className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">Dessinez votre signature ci-dessus ou</p>
              <Button variant="outline" className="mt-2">
                Télécharger signature
              </Button>
            </div>
            
            <div className="bg-amber-50 border border-amber-200 rounded-md p-3 text-left">
              <div className="flex items-start space-x-2">
                <AlertCircle className="h-5 w-5 text-amber-500 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-amber-800">Vérification d'identité</p>
                  <p className="text-xs text-amber-700">
                    Votre signature sera horodatée et certifiée via DocuSign. Cette signature est légalement contraignante.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {step === 3 && (
          <div className="space-y-4 text-center">
            <div className="flex flex-col items-center justify-center py-6">
              <div className="h-16 w-16 rounded-full bg-green-100 flex items-center justify-center mb-4">
                <Check className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-xl font-medium mb-2">Signature réussie!</h3>
              <p className="text-muted-foreground mb-4">Votre contrat a été signé avec succès et horodaté.</p>
              <div className="bg-muted p-4 rounded-md text-left w-full">
                <div className="space-y-2 text-sm">
                  <p><span className="font-medium">Référence:</span> LN-2023-04587</p>
                  <p><span className="font-medium">Date de signature:</span> {new Date().toLocaleString()}</p>
                  <p><span className="font-medium">Empreinte numérique:</span> 7b4e8f2a9c1d...</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </CardContent>
      <CardFooter>
        {step < 3 ? (
          <Button
            onClick={handleContinue}
            className="w-full bg-[#0D6A51] hover:bg-[#0D6A51]/90"
            disabled={signing}
          >
            {signing ? (
              <>Traitement en cours...</>
            ) : (
              <>{step === 1 ? "Continuer" : "Signer maintenant"}</>
            )}
          </Button>
        ) : (
          <div className="w-full flex gap-2">
            <Button variant="outline" className="w-1/2">
              <FileText className="h-4 w-4 mr-2" />
              Télécharger contrat
            </Button>
            <Button className="w-1/2 bg-[#0D6A51] hover:bg-[#0D6A51]/90">
              Continuer
            </Button>
          </div>
        )}
      </CardFooter>
    </Card>
  );
};
