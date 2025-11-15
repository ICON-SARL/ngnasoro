import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Phone, Mail, Home, Save, User as UserIcon } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { Loader } from '@/components/ui/loader';
import PhoneNumberInput from './sfd-accounts/PhoneNumberInput';
import { validateMaliPhoneNumber } from '@/lib/constants';

interface PersonalInfoSectionProps {
  user: User | null;
}

const PersonalInfoSection = ({ user }: PersonalInfoSectionProps) => {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    phone: user?.phone || user?.user_metadata?.phone || '',
    email: user?.email || '',
    address: 'Bamako, Commune V'
  });
  
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isPhoneValid, setIsPhoneValid] = useState(true);
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;
    setFormData(prev => ({ ...prev, phone: value }));
  };

  const handlePhoneValidation = (isValid: boolean) => {
    setIsPhoneValid(isValid);
  };
  
  const handleSaveInfo = async () => {
    // Validate phone number before saving
    if (!isPhoneValid && formData.phone) {
      toast({
        title: "Numéro de téléphone invalide",
        description: "Veuillez entrer un numéro de téléphone malien valide",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      // Update profile in the database
      if (user?.id) {
        // Update in profiles table
        const { error: profileError } = await supabase
          .from('profiles')
          .update({ 
            phone: formData.phone || null,
            // Don't update email here as it's managed by auth
          })
          .eq('id', user.id);
          
        if (profileError) throw profileError;
        
        // Also update in auth.users via metadata
        const { error: userMetaError } = await supabase.auth.updateUser({
          data: { phone: formData.phone || null }
        });
        
        if (userMetaError) throw userMetaError;

        toast({
          title: "Informations mises à jour",
          description: "Vos informations personnelles ont été enregistrées",
        });
        
        // Reload page to show updated information
        window.location.reload();
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de la mise à jour de vos informations",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
      setIsEditing(false);
    }
  };

  return (
    <Card className="mb-4 border-border/50">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center gap-2">
          <UserIcon className="h-5 w-5 text-primary" />
          Informations Personnelles
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-4">
          <div>
            {isEditing ? (
              <PhoneNumberInput
                value={formData.phone}
                onChange={handlePhoneChange}
                onValidationChange={handlePhoneValidation}
                disabled={isLoading}
                required={false}
              />
            ) : (
              <>
                <Label htmlFor="phone" className="flex items-center gap-2">
                  <Phone className="h-4 w-4" /> Numéro de téléphone
                </Label>
                <Input 
                  id="phone" 
                  name="phone"
                  value={formData.phone || "Non renseigné"} 
                  className="mt-1"
                  disabled={true}
                />
              </>
            )}
          </div>
          
          <div>
            <Label htmlFor="email" className="flex items-center gap-2">
              <Mail className="h-4 w-4" /> Adresse e-mail
            </Label>
            <Input 
              id="email" 
              name="email"
              type="email" 
              value={formData.email} 
              onChange={handleInputChange}
              className="mt-1"
              disabled={true} // Email should not be editable here
            />
          </div>
          
          <div>
            <Label htmlFor="address" className="flex items-center gap-2">
              <Home className="h-4 w-4" /> Adresse
            </Label>
            <Input 
              id="address" 
              name="address"
              value={formData.address} 
              onChange={handleInputChange}
              className="mt-1"
              disabled={!isEditing || isLoading}
            />
          </div>
          
          {!isEditing ? (
            <Button 
              variant="outline" 
              className="w-full mt-2"
              onClick={() => setIsEditing(true)}
            >
              Modifier mes informations
            </Button>
          ) : (
            <div className="flex gap-2 mt-2">
              <Button 
                variant="outline" 
                className="w-full"
                onClick={() => setIsEditing(false)}
                disabled={isLoading}
              >
                Annuler
              </Button>
              <Button 
                className="w-full"
                onClick={handleSaveInfo}
                disabled={isLoading || (!isPhoneValid && !!formData.phone)}
              >
                {isLoading ? (
                  <>Enregistrement...</>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Enregistrer
                  </>
                )}
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default PersonalInfoSection;
