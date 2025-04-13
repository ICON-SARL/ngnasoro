
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { 
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { SfdFormValues, sfdFormSchema } from './schemas/sfdFormSchema';
import { Loader2 } from 'lucide-react';
import { SfdLogoUploader } from './components/SfdLogoUploader';
import { storageApi } from '@/utils/api/modules/storageApi';
import { useToast } from '@/hooks/use-toast';

interface AddSfdFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
  onSubmit: (formData: SfdFormValues, createAdmin: boolean, adminData: any) => void;
}

export function AddSfdForm({ onSuccess, onCancel, onSubmit }: AddSfdFormProps) {
  const [activeTab, setActiveTab] = useState('info');
  const [createAdmin, setCreateAdmin] = useState(false);
  const [adminData, setAdminData] = useState({
    email: '',
    password: '',
    full_name: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const { toast } = useToast();

  const form = useForm<SfdFormValues>({
    resolver: zodResolver(sfdFormSchema),
    defaultValues: {
      name: '',
      code: '',
      region: '',
      description: '',
      contact_email: '',
      phone: '',
      status: 'active',
      subsidy_balance: 0,
      logo_url: null
    }
  });

  const handleSubmit = async (data: SfdFormValues) => {
    setIsSubmitting(true);
    setIsUploading(false);
    
    try {
      let updatedData = { ...data };
      
      // Upload logo if provided
      if (logoFile) {
        setIsUploading(true);
        try {
          const fileName = `sfd-logos/${Date.now()}-${logoFile.name.replace(/\s+/g, '-')}`;
          const uploadResult = await storageApi.uploadFile('sfd-assets', fileName, logoFile);
          
          if (uploadResult) {
            const logoUrl = storageApi.getFileUrl('sfd-assets', fileName);
            updatedData.logo_url = logoUrl;
          }
        } catch (error) {
          console.error('Erreur lors du téléchargement du logo:', error);
          toast({
            title: 'Erreur',
            description: 'Le téléchargement du logo a échoué. La SFD sera créée sans logo.',
            variant: 'destructive',
          });
        } finally {
          setIsUploading(false);
        }
      }
      
      await onSubmit(updatedData, createAdmin, createAdmin ? adminData : undefined);
      if (onSuccess) onSuccess();
    } catch (error) {
      console.error('Erreur lors de la création de la SFD:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAdminDataChange = (field: string, value: string) => {
    setAdminData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleLogoChange = (file: File | null) => {
    setLogoFile(file);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="w-full">
            <TabsTrigger value="info" className="flex-1">Informations SFD</TabsTrigger>
            <TabsTrigger value="admin" className="flex-1">Administrateur</TabsTrigger>
            <TabsTrigger value="subsidy" className="flex-1">Subvention</TabsTrigger>
          </TabsList>
          
          <TabsContent value="info" className="space-y-4 pt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nom de la SFD</FormLabel>
                    <FormControl>
                      <Input placeholder="Nom de la SFD" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="code"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Code SFD</FormLabel>
                    <FormControl>
                      <Input placeholder="Code unique" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="region"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Région</FormLabel>
                    <FormControl>
                      <Input placeholder="Région d'activité" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="contact_email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email de contact</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="Email de contact" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Téléphone</FormLabel>
                    <FormControl>
                      <Input placeholder="Numéro de téléphone" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="col-span-1 md:col-span-2">
                <SfdLogoUploader 
                  logoFile={logoFile}
                  logoUrl={null}
                  onLogoChange={handleLogoChange}
                />
              </div>
              
              <div className="col-span-1 md:col-span-2">
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Description de la SFD" 
                          rows={3} 
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="admin" className="space-y-4 pt-4">
            <div className="bg-muted p-4 rounded-lg mb-4">
              <div className="flex items-start space-x-3 mb-4">
                <Checkbox 
                  id="create-admin" 
                  checked={createAdmin}
                  onCheckedChange={(checked) => setCreateAdmin(checked === true)} 
                />
                <div>
                  <label 
                    htmlFor="create-admin" 
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                  >
                    Créer un administrateur pour cette SFD
                  </label>
                  <p className="text-sm text-muted-foreground mt-1">
                    L'administrateur aura accès au tableau de bord de la SFD
                  </p>
                </div>
              </div>
              
              {createAdmin && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Nom complet</label>
                      <Input 
                        value={adminData.full_name}
                        onChange={(e) => handleAdminDataChange('full_name', e.target.value)}
                        placeholder="Nom complet de l'administrateur"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Email</label>
                      <Input 
                        type="email"
                        value={adminData.email}
                        onChange={(e) => handleAdminDataChange('email', e.target.value)}
                        placeholder="Email de l'administrateur"
                      />
                    </div>
                    
                    <div className="col-span-1 md:col-span-2 space-y-2">
                      <label className="text-sm font-medium">Mot de passe</label>
                      <Input 
                        type="password"
                        value={adminData.password}
                        onChange={(e) => handleAdminDataChange('password', e.target.value)}
                        placeholder="Mot de passe pour l'administrateur"
                      />
                      <p className="text-xs text-muted-foreground">
                        L'administrateur pourra modifier son mot de passe après la première connexion.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </TabsContent>
          
          <TabsContent value="subsidy" className="space-y-4 pt-4">
            <FormField
              control={form.control}
              name="subsidy_balance"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Montant de la subvention initiale (FCFA)</FormLabel>
                  <FormControl>
                    <Input 
                      type="number" 
                      placeholder="0" 
                      {...field}
                      onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                    />
                  </FormControl>
                  <FormDescription>
                    Montant initial de la subvention allouée à cette SFD. 
                    Laissez 0 si aucune subvention n'est allouée.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </TabsContent>
        </Tabs>
        
        <div className="flex justify-end space-x-2">
          <Button 
            type="button" 
            variant="outline" 
            onClick={onCancel}
            disabled={isSubmitting || isUploading}
          >
            Annuler
          </Button>
          <Button 
            type="submit"
            disabled={isSubmitting || isUploading}
          >
            {isSubmitting || isUploading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {isUploading ? 'Téléchargement du logo...' : 'Création en cours...'}
              </>
            ) : (
              'Créer la SFD'
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
}
