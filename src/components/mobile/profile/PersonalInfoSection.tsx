import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Phone, Mail, User as UserIcon, Calendar } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { Loader } from '@/components/ui/loader';
import PhoneNumberInput from './sfd-accounts/PhoneNumberInput';
import { motion } from 'framer-motion';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';

interface PersonalInfoSectionProps {
  user: User | null;
}

const PersonalInfoSection = ({ user }: PersonalInfoSectionProps) => {
  const { toast } = useToast();
  const [profileData, setProfileData] = useState<any>(null);
  const [formData, setFormData] = useState({
    phone: user?.phone || user?.user_metadata?.phone || '',
    email: user?.email || '',
  });
  
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isPhoneValid, setIsPhoneValid] = useState(true);

  useEffect(() => {
    const fetchProfileData = async () => {
      if (user?.id) {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();
          
        if (!error && data) {
          setProfileData(data);
        }
      }
    };
    
    fetchProfileData();
  }, [user?.id]);
  
  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;
    setFormData(prev => ({ ...prev, phone: value }));
  };

  const handlePhoneValidation = (isValid: boolean) => {
    setIsPhoneValid(isValid);
  };
  
  const handleSaveInfo = async () => {
    if (!isPhoneValid && formData.phone) {
      toast({
        title: "Numéro invalide",
        description: "Veuillez entrer un numéro valide",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      if (user?.id) {
        const { error: profileError } = await supabase
          .from('profiles')
          .update({ phone: formData.phone || null })
          .eq('id', user.id);
          
        if (profileError) throw profileError;
        
        const { error: userMetaError } = await supabase.auth.updateUser({
          data: { phone: formData.phone || null }
        });
        
        if (userMetaError) throw userMetaError;

        toast({
          title: "✓ Enregistré",
          description: "Informations mises à jour",
        });
        
        window.location.reload();
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      toast({
        title: "Erreur",
        description: "Une erreur est survenue",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
      setIsEditing(false);
    }
  };

  const createdAt = user?.created_at ? formatDistanceToNow(new Date(user.created_at), { 
    addSuffix: true, 
    locale: fr 
  }) : null;

  const infoItems = [
    {
      icon: Mail,
      label: 'Email',
      value: formData.email,
      editable: false,
    },
    {
      icon: Phone,
      label: 'Téléphone',
      value: formData.phone || 'Non renseigné',
      editable: true,
    },
  ];

  return (
    <Card className="border-0 shadow-sm bg-card/80 backdrop-blur-sm">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-medium flex items-center gap-2">
            <UserIcon className="h-4 w-4 text-primary" />
            Informations
          </CardTitle>
          {!isEditing && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsEditing(true)}
              className="text-primary text-xs h-8"
            >
              Modifier
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="pt-0 space-y-2">
        {infoItems.map((item, index) => (
          <motion.div
            key={item.label}
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className="flex items-center gap-3 p-3 rounded-xl bg-muted/40"
          >
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
              <item.icon className="h-4 w-4 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[10px] text-muted-foreground uppercase tracking-wide">{item.label}</p>
              {isEditing && item.editable ? (
                <PhoneNumberInput
                  value={formData.phone}
                  onChange={handlePhoneChange}
                  onValidationChange={handlePhoneValidation}
                  disabled={isLoading}
                  required={false}
                />
              ) : (
                <p className="font-medium text-sm truncate">{item.value}</p>
              )}
            </div>
          </motion.div>
        ))}

        {/* Date de création */}
        {createdAt && (
          <motion.div
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="flex items-center gap-3 p-3 rounded-xl bg-muted/40"
          >
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
              <Calendar className="h-4 w-4 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[10px] text-muted-foreground uppercase tracking-wide">Membre depuis</p>
              <p className="font-medium text-sm">{createdAt}</p>
            </div>
          </motion.div>
        )}
        
        {/* Boutons d'action */}
        {isEditing && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex gap-2 pt-2"
          >
            <Button
              onClick={handleSaveInfo}
              disabled={isLoading}
              size="sm"
              className="flex-1"
            >
              {isLoading ? <Loader className="h-4 w-4" /> : 'Enregistrer'}
            </Button>
            <Button
              onClick={() => setIsEditing(false)}
              disabled={isLoading}
              variant="outline"
              size="sm"
              className="flex-1"
            >
              Annuler
            </Button>
          </motion.div>
        )}
      </CardContent>
    </Card>
  );
};

export default PersonalInfoSection;
