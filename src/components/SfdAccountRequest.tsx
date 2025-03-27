
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { CheckCircle, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const SfdAccountRequest = () => {
  const [formData, setFormData] = useState({
    institutionName: '',
    region: '',
    contactPerson: '',
    contactEmail: '',
    contactPhone: '',
    description: '',
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const { toast } = useToast();
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate API request
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSubmitted(true);
      
      toast({
        title: "Demande envoyée",
        description: "Votre demande a été transmise à MEREF et sera examinée sous peu.",
      });
    }, 1500);
  };
  
  if (isSubmitted) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardHeader>
          <CardTitle className="text-center text-[#0D6A51]">Demande envoyée !</CardTitle>
        </CardHeader>
        <CardContent className="text-center">
          <CheckCircle className="h-16 w-16 mx-auto text-green-500 mb-4" />
          <p className="mb-2">
            Votre demande de compte SFD a été transmise à MEREF.
          </p>
          <p className="text-sm text-gray-500">
            L'équipe MEREF examinera votre demande et vous contactera à l'adresse email fournie. 
            Veuillez prévoir un délai de 24 à 48 heures ouvrables pour le traitement.
          </p>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="text-center text-[#0D6A51]">Demande de Compte SFD</CardTitle>
        <CardDescription className="text-center">
          Remplissez ce formulaire pour demander un compte administrateur SFD auprès de MEREF
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="institutionName">Nom de l'institution SFD</Label>
            <Input
              id="institutionName"
              name="institutionName"
              placeholder="Nyèsigiso"
              value={formData.institutionName}
              onChange={handleChange}
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="region">Région</Label>
            <Input
              id="region"
              name="region"
              placeholder="Bamako"
              value={formData.region}
              onChange={handleChange}
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="contactPerson">Personne de contact</Label>
            <Input
              id="contactPerson"
              name="contactPerson"
              placeholder="Amadou Diallo"
              value={formData.contactPerson}
              onChange={handleChange}
              required
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="contactEmail">Email</Label>
              <Input
                id="contactEmail"
                name="contactEmail"
                type="email"
                placeholder="contact@institution.ml"
                value={formData.contactEmail}
                onChange={handleChange}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="contactPhone">Téléphone</Label>
              <Input
                id="contactPhone"
                name="contactPhone"
                placeholder="+223 70 00 00 00"
                value={formData.contactPhone}
                onChange={handleChange}
                required
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="description">Description de l'institution</Label>
            <Textarea
              id="description"
              name="description"
              placeholder="Décrivez brièvement votre institution SFD, les services que vous proposez et la population que vous servez."
              rows={4}
              value={formData.description}
              onChange={handleChange}
              required
            />
          </div>
        </CardContent>
        <CardFooter>
          <Button 
            type="submit" 
            className="w-full bg-[#0D6A51] hover:bg-[#0D6A51]/90"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Envoi en cours...
              </>
            ) : (
              "Soumettre ma demande"
            )}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
};

export default SfdAccountRequest;
