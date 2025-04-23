
import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import MobileHeader from '@/components/mobile/MobileHeader';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { ArrowLeft, Building, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface SfdAdhesionPageProps {}

const SfdAdhesionPage: React.FC<SfdAdhesionPageProps> = () => {
  const { sfdId } = useParams<{ sfdId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  
  const [sfd, setSfd] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    address: '',
    idNumber: '',
    idType: 'cni'
  });
  
  useEffect(() => {
    // Vérifier si l'utilisateur est connecté
    if (!user) {
      toast({
        title: 'Authentification requise',
        description: 'Vous devez être connecté pour accéder à cette page',
        variant: 'destructive',
      });
      
      // Enregistrer la redirection souhaitée
      if (sfdId) {
        localStorage.setItem('redirectAfterAuth', `/mobile-flow/sfd-adhesion/${sfdId}`);
      }
      
      navigate('/auth');
      return;
    }
    
    // Charger les informations de la SFD
    const fetchSfdDetails = async () => {
      if (!sfdId) return;
      
      try {
        setIsLoading(true);
        
        // Récupérer les détails de la SFD
        const { data, error } = await supabase
          .from('sfds')
          .select('*')
          .eq('id', sfdId)
          .single();
          
        if (error) throw error;
        
        if (!data) {
          toast({
            title: 'SFD non trouvée',
            description: 'Impossible de trouver la SFD demandée',
            variant: 'destructive',
          });
          navigate('/mobile-flow/sfd-connection');
          return;
        }
        
        setSfd(data);
        
        // Vérifier si l'utilisateur a déjà une demande en cours
        const { data: existingRequest, error: requestError } = await supabase
          .from('client_adhesion_requests')
          .select('*')
          .eq('user_id', user.id)
          .eq('sfd_id', sfdId)
          .not('status', 'eq', 'rejected')
          .maybeSingle();
          
        if (requestError) throw requestError;
        
        if (existingRequest) {
          toast({
            title: 'Demande existante',
            description: 'Vous avez déjà une demande en cours pour cette SFD',
          });
          navigate('/mobile-flow/main');
          return;
        }
        
        // Pré-remplir le formulaire avec les données du profil
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('full_name, email, phone')
          .eq('id', user.id)
          .single();
          
        if (!profileError && profile) {
          setFormData({
            ...formData,
            fullName: profile.full_name || '',
            email: profile.email || user.email || '',
            phone: profile.phone || '',
          });
        }
        
      } catch (error) {
        console.error('Erreur lors du chargement des données:', error);
        toast({
          title: 'Erreur',
          description: 'Impossible de charger les informations de la SFD',
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchSfdDetails();
  }, [sfdId, user, navigate, toast]);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user || !sfdId) {
      toast({
        title: 'Erreur',
        description: 'Vous devez être connecté et sélectionner une SFD',
        variant: 'destructive',
      });
      return;
    }
    
    try {
      setIsSubmitting(true);
      
      // Créer une demande d'adhésion
      const { error } = await supabase
        .from('client_adhesion_requests')
        .insert({
          user_id: user.id,
          sfd_id: sfdId,
          full_name: formData.fullName,
          email: formData.email || user.email,
          phone: formData.phone,
          address: formData.address,
          id_number: formData.idNumber,
          id_type: formData.idType,
          status: 'pending',
          reference_number: `ADH-${Date.now().toString().substring(6)}`
        });
        
      if (error) throw error;
      
      toast({
        title: 'Demande envoyée',
        description: 'Votre demande d\'adhésion a été envoyée avec succès',
      });
      
      navigate('/mobile-flow/main');
      
    } catch (error: any) {
      console.error('Erreur lors de l\'envoi de la demande:', error);
      toast({
        title: 'Erreur',
        description: error.message || 'Impossible d\'envoyer la demande d\'adhésion',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <MobileHeader />
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }
  
  if (!sfd) {
    return (
      <div className="min-h-screen bg-gray-50">
        <MobileHeader />
        <div className="container mx-auto px-4 py-8">
          <Card className="text-center">
            <CardContent className="pt-6">
              <p className="mb-4">SFD non trouvée ou inaccessible</p>
              <Button onClick={() => navigate('/mobile-flow/sfd-connection')}>
                Retour à la liste des SFDs
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <MobileHeader />
      
      <main className="container mx-auto px-4 py-6">
        <Button 
          variant="ghost" 
          size="sm" 
          className="mb-4 flex items-center"
          onClick={() => navigate('/mobile-flow/sfd-connection')}
        >
          <ArrowLeft className="h-4 w-4 mr-2" /> Retour
        </Button>
        
        <Card className="mb-6">
          <CardHeader className="pb-2">
            <div className="flex items-center">
              <div className="h-12 w-12 bg-gray-100 rounded-full flex items-center justify-center mr-4">
                {sfd.logo_url ? (
                  <img src={sfd.logo_url} alt={sfd.name} className="h-10 w-10 rounded-full object-cover" />
                ) : (
                  <Building className="h-6 w-6 text-gray-500" />
                )}
              </div>
              <CardTitle>{sfd.name}</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600 mb-4">
              {sfd.description || `Complétez ce formulaire pour rejoindre ${sfd.name}.`}
            </p>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="fullName">Nom complet *</Label>
                <Input
                  id="fullName"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                  placeholder="Votre nom complet"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Votre adresse email"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="phone">Téléphone *</Label>
                <Input
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="Votre numéro de téléphone"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="address">Adresse</Label>
                <Input
                  id="address"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  placeholder="Votre adresse"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="idNumber">Numéro de pièce d'identité</Label>
                <Input
                  id="idNumber"
                  name="idNumber"
                  value={formData.idNumber}
                  onChange={handleChange}
                  placeholder="Numéro CNI ou passeport"
                />
              </div>
              
              <div className="pt-4">
                <Button 
                  type="submit"
                  className="w-full bg-[#0D6A51] hover:bg-[#0D6A51]/90"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Traitement en cours...
                    </>
                  ) : (
                    'Envoyer la demande d\'adhésion'
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default SfdAdhesionPage;
