
import React from 'react';
import { Mail, Phone, Lock, User } from 'lucide-react';
import { Input } from '@/components/ui/input';
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from '@/components/ui/form';
import { UseFormReturn } from 'react-hook-form';
import { RegisterFormValues } from './schema';

interface RegisterFormFieldsProps {
  form: UseFormReturn<RegisterFormValues>;
}

const RegisterFormFields: React.FC<RegisterFormFieldsProps> = ({ form }) => {
  return (
    <>
      <FormField
        control={form.control}
        name="fullName"
        render={({ field }) => (
          <FormItem>
            <FormLabel htmlFor="name" className="block text-sm font-medium mb-1">
              Nom complet
            </FormLabel>
            <div className="relative">
              <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <FormControl>
                <Input
                  id="name"
                  type="text"
                  placeholder="Nom et prénom"
                  className="pl-10"
                  {...field}
                />
              </FormControl>
            </div>
            <FormMessage />
          </FormItem>
        )}
      />
      
      <FormField
        control={form.control}
        name="email"
        render={({ field }) => (
          <FormItem>
            <FormLabel htmlFor="reg-email" className="block text-sm font-medium mb-1">
              Email
            </FormLabel>
            <div className="relative">
              <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <FormControl>
                <Input
                  id="reg-email"
                  type="email"
                  placeholder="email@example.com"
                  className="pl-10"
                  {...field}
                />
              </FormControl>
            </div>
            <FormMessage />
          </FormItem>
        )}
      />
      
      <FormField
        control={form.control}
        name="phoneNumber"
        render={({ field }) => (
          <FormItem>
            <FormLabel htmlFor="phone-reg" className="block text-sm font-medium mb-1">
              Numéro de téléphone
            </FormLabel>
            <div className="relative">
              <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <FormControl>
                <Input
                  id="phone-reg"
                  type="tel"
                  placeholder="+223 70 00 00 00"
                  className="pl-10"
                  {...field}
                />
              </FormControl>
            </div>
            <FormMessage />
          </FormItem>
        )}
      />
      
      <FormField
        control={form.control}
        name="password"
        render={({ field }) => (
          <FormItem>
            <FormLabel htmlFor="reg-password" className="block text-sm font-medium mb-1">
              Mot de passe
            </FormLabel>
            <div className="relative">
              <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <FormControl>
                <Input
                  id="reg-password"
                  type="password"
                  placeholder="••••••••"
                  className="pl-10"
                  {...field}
                />
              </FormControl>
            </div>
            <FormMessage />
          </FormItem>
        )}
      />
    </>
  );
};

export default RegisterFormFields;
