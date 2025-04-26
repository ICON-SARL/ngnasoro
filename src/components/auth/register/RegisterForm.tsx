
import React from 'react';
import { useRegisterForm } from './useRegisterForm';
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle, AlertTriangle, Copy } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface RegisterFormProps {
  onError?: (errorMessage: string) => void;
}

const RegisterForm: React.FC<RegisterFormProps> = ({ onError }) => {
  const { form, onSubmit, isSubmitting, errorMessage, successMessage, clientCode } = useRegisterForm(onError);
  const { toast } = useToast();

  const handleCopyClientCode = () => {
    if (clientCode) {
      navigator.clipboard.writeText(clientCode);
      toast({
        title: "Code copié",
        description: "Le code client a été copié dans le presse-papier"
      });
    }
  };

  return (
    <div className="space-y-4 p-6">
      {errorMessage && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4 mr-2" />
          <AlertDescription>{errorMessage}</AlertDescription>
        </Alert>
      )}
      
      {successMessage && (
        <Alert className="bg-green-50 border-green-200">
          <CheckCircle className="h-4 w-4 mr-2 text-green-600" />
          <AlertDescription className="text-green-700">{successMessage}</AlertDescription>
        </Alert>
      )}
      
      {clientCode && (
        <Alert className="bg-blue-50 border-blue-200">
          <div className="flex justify-between items-center w-full">
            <div>
              <p className="text-blue-700 font-medium">Votre code client:</p>
              <p className="text-blue-800 font-bold">{clientCode}</p>
              <p className="text-xs text-blue-600 mt-1">Conservez ce code précieusement. Il sera nécessaire pour les opérations SFD.</p>
            </div>
            <Button 
              variant="outline" 
              size="sm" 
              className="border-blue-300 hover:bg-blue-100"
              onClick={handleCopyClientCode}
            >
              <Copy className="h-4 w-4 mr-1" /> 
              Copier
            </Button>
          </div>
        </Alert>
      )}
      
      <Form {...form}>
        <form onSubmit={onSubmit} className="space-y-4">
          <FormField
            control={form.control}
            name="fullName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nom complet</FormLabel>
                <FormControl>
                  <Input placeholder="Jean Dupont" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input type="email" placeholder="exemple@email.com" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="phoneNumber"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Numéro de téléphone (optionnel)</FormLabel>
                <FormControl>
                  <Input placeholder="+223 XX XX XX XX" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Mot de passe</FormLabel>
                <FormControl>
                  <Input type="password" placeholder="••••••••••••" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? (
              <span className="flex items-center gap-2">
                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Inscription en cours...
              </span>
            ) : "S'inscrire"}
          </Button>
        </form>
      </Form>
    </div>
  );
};

export default RegisterForm;
