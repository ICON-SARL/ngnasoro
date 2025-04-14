
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '@/hooks/useAuth';
import { useSfdClients } from '@/hooks/useSfdClients';
import { useSfdDataAccess } from '@/hooks/useSfdDataAccess';
import { useToast } from '@/hooks/use-toast';
import { Loader2, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

const NewClientPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { activeSfdId } = useSfdDataAccess();
  const { createClient } = useSfdClients(); // Changed from createClientMutation to createClient
  const { toast } = useToast();
  
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    phone: '',
    address: '',
    id_type: '',
    id_number: '',
    notes: ''
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!activeSfdId) {
      toast({
        title: "Attention",
        description: "Aucune SFD active n'est sélectionnée. Veuillez configurer votre SFD.",
        variant: "destructive",
      });
    }
  }, [activeSfdId, navigate, toast]);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (!activeSfdId) {
        toast({
          title: "Erreur",
          description: "SFD ID non défini. Veuillez sélectionner une SFD active.",
          variant: "destructive",
        });
        return;
      }
      
      await createClient.mutateAsync({
        full_name: formData.full_name,
        email: formData.email || undefined,
        phone: formData.phone || undefined,
        address: formData.address || undefined,
        id_type: formData.id_type || undefined,
        id_number: formData.id_number || undefined,
        notes: formData.notes || undefined,
        user_id: '',
        updated_at: new Date().toISOString()
      });
      
      navigate('/mobile-flow/clients');
    } catch (error) {
      console.error('Error creating client:', error);
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de la création du client",
        variant: "destructive",
      });
    }
  };
  
  if (!activeSfdId) {
    return (
      <div className="container mx-auto py-4 px-4 max-w-md">
        <Button 
          variant="ghost" 
          className="mb-4" 
          onClick={() => navigate('/mobile-flow/clients')}
        >
          ← Retour à la liste
        </Button>
        
        <Alert variant="destructive" className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Aucune SFD active n'est sélectionnée. Veuillez configurer votre SFD avant de créer un client.
          </AlertDescription>
        </Alert>
        
        <Button 
          className="w-full bg-[#0D6A51] hover:bg-[#0D6A51]/90 mt-4"
          onClick={() => navigate('/sfd-setup')}
        >
          Configurer ma SFD
        </Button>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto py-4 px-4 max-w-md">
      <Button 
        variant="ghost" 
        className="mb-4" 
        onClick={() => navigate('/mobile-flow/clients')}
      >
        ← Retour à la liste
      </Button>
      
      <Card>
        <CardHeader>
          <CardTitle className="text-xl text-center text-[#0D6A51]">
            Nouveau Client SFD
          </CardTitle>
        </CardHeader>
        
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="full_name">Nom Complet *</Label>
              <Input
                id="full_name"
                name="full_name"
                value={formData.full_name}
                onChange={handleChange}
                required
                placeholder="Amadou Diallo"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="phone">Téléphone</Label>
                <Input
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="+223 70 00 00 00"
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
                  placeholder="client@example.com"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="address">Adresse</Label>
              <Input
                id="address"
                name="address"
                value={formData.address}
                onChange={handleChange}
                placeholder="Quartier, Ville"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="id_type">Type de Pièce d'Identité</Label>
                <Select 
                  onValueChange={(value) => handleSelectChange('id_type', value)}
                  value={formData.id_type}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="national_id">Carte Nationale</SelectItem>
                    <SelectItem value="passport">Passeport</SelectItem>
                    <SelectItem value="driver_license">Permis de Conduire</SelectItem>
                    <SelectItem value="voter_card">Carte d'Électeur</SelectItem>
                    <SelectItem value="other">Autre</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="id_number">Numéro de Pièce</Label>
                <Input
                  id="id_number"
                  name="id_number"
                  value={formData.id_number}
                  onChange={handleChange}
                  placeholder="MLAIN0000000"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                placeholder="Informations supplémentaires"
                rows={3}
              />
            </div>
            
            <Button 
              type="submit"
              className="w-full bg-[#0D6A51] hover:bg-[#0D6A51]/90"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Création en cours...
                </>
              ) : (
                "Créer le client"
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default NewClientPage;
