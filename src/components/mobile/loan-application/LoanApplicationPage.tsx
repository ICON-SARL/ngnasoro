
import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, Check, Building, AlertCircle } from 'lucide-react';

interface LocationState {
  sfdId?: string;
}

const LoanApplicationPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const locationState = location.state as LocationState;
  
  const [amount, setAmount] = useState(100000);
  const [duration, setDuration] = useState(12);
  const [purpose, setPurpose] = useState('');
  const [sfd, setSfd] = useState(locationState?.sfdId || '');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const handleBack = () => {
    navigate(-1);
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!sfd || !purpose) {
      toast({
        title: "Informations manquantes",
        description: "Veuillez remplir tous les champs obligatoires",
        variant: "destructive",
      });
      return;
    }
    
    setIsSubmitting(true);
    
    // Simuler un délai de traitement
    setTimeout(() => {
      setIsSubmitting(false);
      
      toast({
        title: "Demande envoyée",
        description: "Votre demande de prêt a été soumise avec succès",
      });
      
      navigate('/mobile-flow/main');
    }, 1500);
  };
  
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'XOF',
      minimumFractionDigits: 0,
    }).format(value);
  };
  
  const calculateMonthlyPayment = () => {
    const monthlyInterestRate = 0.008; // Taux mensuel d'environ 10% annuel
    const monthlyPayment = (amount * monthlyInterestRate) / (1 - Math.pow(1 + monthlyInterestRate, -duration));
    return formatCurrency(monthlyPayment);
  };
  
  return (
    <div className="bg-gray-50 min-h-screen pb-20">
      <div className="bg-white p-4 shadow-sm flex items-center">
        <Button 
          variant="ghost" 
          className="p-1 mr-2" 
          onClick={handleBack}
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="font-semibold text-lg">Demander un prêt</h1>
      </div>
      
      <form onSubmit={handleSubmit} className="p-4 space-y-6">
        <div className="bg-white rounded-lg shadow-sm p-4 space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Institution financière</label>
            <Select value={sfd} onValueChange={setSfd}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Choisir une SFD" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="sfd1">Microfinance Bamako</SelectItem>
                <SelectItem value="sfd2">ACEP Mali</SelectItem>
                <SelectItem value="sfd3">Crédit Solidaire Mali</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Montant du prêt</label>
            <div className="mb-2 font-bold text-2xl text-center">{formatCurrency(amount)}</div>
            <Slider
              value={[amount]}
              min={50000}
              max={1000000}
              step={50000}
              onValueChange={(values) => setAmount(values[0])}
              className="mt-2"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>50,000 FCFA</span>
              <span>1,000,000 FCFA</span>
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Durée (mois)</label>
            <div className="mb-2 font-bold text-xl text-center">{duration} mois</div>
            <Slider
              value={[duration]}
              min={3}
              max={36}
              step={3}
              onValueChange={(values) => setDuration(values[0])}
              className="mt-2"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>3 mois</span>
              <span>36 mois</span>
            </div>
          </div>
          
          <div className="bg-blue-50 p-3 rounded-lg">
            <div className="flex justify-between text-sm mb-1">
              <span className="text-gray-600">Mensualité estimée:</span>
              <span className="font-bold">{calculateMonthlyPayment()}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Taux d'intérêt:</span>
              <span className="font-medium">10%</span>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm p-4 space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Objet du prêt</label>
            <Select value={purpose} onValueChange={setPurpose}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Choisir un objet" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="business">Activité commerciale</SelectItem>
                <SelectItem value="agriculture">Agriculture</SelectItem>
                <SelectItem value="education">Éducation</SelectItem>
                <SelectItem value="housing">Logement</SelectItem>
                <SelectItem value="other">Autre</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Description du projet</label>
            <Textarea 
              placeholder="Décrivez votre projet en détail..." 
              className="min-h-[100px]"
            />
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm p-4">
          <div className="flex items-start">
            <AlertCircle className="text-amber-500 h-5 w-5 mt-0.5 flex-shrink-0" />
            <div className="ml-2">
              <p className="text-sm text-gray-700">
                En soumettant cette demande, vous autorisez la SFD à consulter votre dossier de crédit et à vous contacter pour des informations complémentaires.
              </p>
            </div>
          </div>
        </div>
        
        <Button 
          type="submit" 
          className="w-full py-6 bg-[#0D6A51] hover:bg-[#0D6A51]/90"
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <span className="flex items-center">
              <Building className="animate-pulse mr-2 h-5 w-5" />
              Traitement...
            </span>
          ) : (
            <span className="flex items-center">
              <Check className="mr-2 h-5 w-5" />
              Soumettre ma demande
            </span>
          )}
        </Button>
      </form>
    </div>
  );
};

export default LoanApplicationPage;
