import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Phone, Mail, FileText, Copy, Check, User as UserIcon, Calendar } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { Loader } from '@/components/ui/loader';
import PhoneNumberInput from './sfd-accounts/PhoneNumberInput';
import { useHapticFeedback } from '@/hooks/useHapticFeedback';
import { motion } from 'framer-motion';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';

interface PersonalInfoSectionProps {
  user: User | null;
}

const PersonalInfoSection = ({ user }: PersonalInfoSectionProps) => {
  const { toast } = useToast();
  const { trigger } = useHapticFeedback();
  const [profileData, setProfileData] = useState<any>(null);
  const [formData, setFormData] = useState({
    phone: user?.phone || user?.user_metadata?.phone || '',
    email: user?.email || '',
  });
  
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isPhoneValid, setIsPhoneValid] = useState(true);
  const [copied, setCopied] = useState(false);

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
        title: "Numéro de téléphone invalide",
        description: "Veuillez entrer un numéro de téléphone malien valide",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      if (user?.id) {
        const { error: profileError } = await supabase
          .from('profiles')
          .update({ 
            phone: formData.phone || null,
          })
          .eq('id', user.id);
          
        if (profileError) throw profileError;
        
        const { error: userMetaError } = await supabase.auth.updateUser({
          data: { phone: formData.phone || null }
        });
        
        if (userMetaError) throw userMetaError;

        toast({
          title: "✓ Mis à jour",
          description: "Vos informations ont été enregistrées",
        });
        
        window.location.reload();
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de la mise à jour",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
      setIsEditing(false);
    }
  };

  const handleCopyCode = async () => {
    if (profileData?.client_code) {
      await navigator.clipboard.writeText(profileData.client_code);
      setCopied(true);
      trigger('light');
      
      toast({
        title: "✓ Copié",
        description: "Code client copié dans le presse-papiers",
        duration: 2000,
      });
      
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const createdAt = user?.created_at ? formatDistanceToNow(new Date(user.created_at), { 
    addSuffix: true, 
    locale: fr 
  }) : null;

  return (
    <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <UserIcon className="h-5 w-5 text-primary" />
            Informations Personnelles
          </CardTitle>
          {!isEditing && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsEditing(true)}
              className="text-primary"
            >
              Modifier
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="pt-0 space-y-3">
        {/* Email */}
        <motion.div
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-3 p-3 rounded-xl bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-950/30 dark:to-cyan-950/30 hover:shadow-md transition-all"
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center flex-shrink-0">
            <Mail className="h-5 w-5 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs text-muted-foreground mb-0.5">Email</p>
            <p className="font-medium text-sm truncate">{formData.email}</p>
          </div>
        </motion.div>
        
        {/* Téléphone */}
        <motion.div
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="flex items-center gap-3 p-3 rounded-xl bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/30 dark:to-emerald-950/30 hover:shadow-md transition-all"
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center flex-shrink-0">
            <Phone className="h-5 w-5 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs text-muted-foreground mb-0.5">Téléphone</p>
            {isEditing ? (
              <PhoneNumberInput
                value={formData.phone}
                onChange={handlePhoneChange}
                onValidationChange={handlePhoneValidation}
                disabled={isLoading}
                required={false}
              />
            ) : (
              <p className="font-medium text-sm">{formData.phone || 'Non renseigné'}</p>
            )}
          </div>
        </motion.div>
        
        {/* Code Client */}
        {profileData?.client_code && (
          <motion.div
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="flex items-center gap-3 p-3 rounded-xl bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/30 dark:to-pink-950/30 hover:shadow-md transition-all"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center flex-shrink-0">
              <FileText className="h-5 w-5 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs text-muted-foreground mb-0.5">Code Client</p>
              <code className="font-mono font-medium text-sm">{profileData.client_code}</code>
            </div>
            <Button 
              size="icon" 
              variant="ghost"
              className="h-8 w-8 flex-shrink-0"
              onClick={handleCopyCode}
            >
              {copied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
            </Button>
          </motion.div>
        )}

        {/* Date de création */}
        {createdAt && (
          <motion.div
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="flex items-center gap-3 p-3 rounded-xl bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/30 hover:shadow-md transition-all"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center flex-shrink-0">
              <Calendar className="h-5 w-5 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs text-muted-foreground mb-0.5">Membre depuis</p>
              <p className="font-medium text-sm">{createdAt}</p>
            </div>
          </motion.div>
        )}
        
        {/* Boutons d'action */}
        {isEditing && (
          <motion.div
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex gap-2 pt-2"
          >
            <Button
              onClick={handleSaveInfo}
              disabled={isLoading}
              className="flex-1 bg-primary hover:bg-primary/90"
            >
              {isLoading ? <Loader className="h-4 w-4" /> : 'Enregistrer'}
            </Button>
            <Button
              onClick={() => setIsEditing(false)}
              disabled={isLoading}
              variant="outline"
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
