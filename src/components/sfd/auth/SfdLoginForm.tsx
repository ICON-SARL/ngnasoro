
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { supabase } from '@/integrations/supabase/client';
import { AlertCircle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { cleanupAuthState } from '@/utils/auth/authCleanup';

const formSchema = z.object({
  email: z.string().email({
    message: "Veuillez entrer une adresse e-mail valide",
  }),
  password: z.string().min(6, {
    message: "Le mot de passe doit contenir au moins 6 caractères",
  }),
});

type FormValues = z.infer<typeof formSchema>;

export function SfdLoginForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (values: FormValues) => {
    setIsLoading(true);
    setError(null);

    try {
      // Clean up any previous auth state before login
      cleanupAuthState();
      
      // Try to sign out globally first to ensure clean state
      try {
        await supabase.auth.signOut({ scope: 'global' });
      } catch (e) {
        // Ignore errors here, just trying to clean up
        console.log('Pre-signout error (can be ignored):', e);
      }

      // Now attempt to sign in
      const { data, error } = await supabase.auth.signInWithPassword({
        email: values.email,
        password: values.password,
      });

      if (error) throw error;

      if (data?.user) {
        console.log("User authenticated:", data.user);
        
        // Check if user has SFD admin role
        const { data: roleData, error: roleError } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', data.user.id)
          .eq('role', 'sfd_admin')
          .maybeSingle();

        if (roleError) {
          console.error("Error checking user role:", roleError);
          throw new Error("Erreur lors de la vérification des autorisations");
        }

        // Check if the user has the SFD admin role either in metadata or database
        const isSfdAdmin = data.user.app_metadata?.role === 'sfd_admin' || !!roleData;
        
        if (!isSfdAdmin) {
          throw new Error("Vous n'avez pas les droits d'administrateur SFD nécessaires");
        }

        // Get the user's associated SFD
        const { data: sfdData, error: sfdError } = await supabase
          .from('user_sfds')
          .select('sfd_id, sfds:sfd_id(name)')
          .eq('user_id', data.user.id)
          .maybeSingle();

        if (sfdError) {
          console.error("Error fetching SFD data:", sfdError);
          throw new Error("Erreur lors de la récupération des informations SFD");
        }

        if (!sfdData?.sfd_id) {
          throw new Error("Aucune SFD associée à votre compte");
        }
        
        // Store the user role for persistence
        sessionStorage.setItem('user_role', 'sfd_admin');
        sessionStorage.setItem('active_sfd_id', sfdData.sfd_id);
        
        toast({
          title: "Connexion réussie",
          description: "Bienvenue dans votre espace administrateur SFD",
        });

        console.log("Login successful, redirecting to dashboard");
        navigate('/agency-dashboard');
      }
    } catch (err: any) {
      console.error("Login error:", err);
      setError(err.message || "Erreur lors de la connexion. Veuillez vérifier vos identifiants.");
      toast({
        title: "Erreur de connexion",
        description: err.message || "Veuillez vérifier vos identifiants",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-4 py-4">
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Erreur</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input
                    placeholder="nom@sfd.com"
                    type="email"
                    disabled={isLoading}
                    {...field}
                  />
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
                  <Input
                    placeholder="••••••••"
                    type="password"
                    disabled={isLoading}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button
            type="submit"
            className="w-full"
            disabled={isLoading}
          >
            {isLoading ? "Connexion en cours..." : "Se connecter"}
          </Button>
        </form>
      </Form>
      
      <div className="text-center text-sm">
        <p className="text-muted-foreground">
          Problèmes de connexion? Contactez l'administrateur de votre SFD ou le support MEREF.
        </p>
      </div>
    </div>
  );
}
