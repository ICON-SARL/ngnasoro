
import React from 'react';
import { Button } from '@/components/ui/button';
import { Form } from '@/components/ui/form';
import { useRegisterForm } from './useRegisterForm';
import AlertMessages from './AlertMessages';
import RegisterFormFields from './RegisterFormFields';
import TermsDisclaimer from './TermsDisclaimer';

const RegisterForm: React.FC = () => {
  const { form, onSubmit, isSubmitting, errorMessage, successMessage } = useRegisterForm();

  return (
    <div className="p-6">
      <AlertMessages 
        errorMessage={errorMessage} 
        successMessage={successMessage} 
      />
      
      <Form {...form}>
        <form onSubmit={onSubmit} className="space-y-4">
          <RegisterFormFields form={form} />
          
          <Button 
            type="submit" 
            className="w-full bg-[#0D6A51] hover:bg-[#0D6A51]/90" 
            disabled={isSubmitting}
          >
            {isSubmitting ? "Inscription en cours..." : "Créer un compte"}
          </Button>
          
          <TermsDisclaimer />
        </form>
      </Form>
    </div>
  );
};

export default RegisterForm;
