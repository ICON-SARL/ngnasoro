
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Phone, Mail, Home, Save } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { User } from '@supabase/supabase-js';

interface PersonalInfoSectionProps {
  user: User | null;
}

const PersonalInfoSection = ({ user }: PersonalInfoSectionProps) => {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    phone: user?.phone || '+223 76 45 32 10',
    email: user?.email || '',
    address: 'Bamako, Commune V'
  });
  
  const [isEditing, setIsEditing] = useState(false);
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleSaveInfo = () => {
    // In a real app, this would update the user profile in the database
    toast({
      title: "Informations mises à jour",
      description: "Vos informations personnelles ont été enregistrées",
    });
    setIsEditing(false);
  };

  return (
    <Card className="mb-4">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">Informations Personnelles</CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-4">
          <div>
            <Label htmlFor="phone" className="flex items-center gap-2">
              <Phone className="h-4 w-4" /> Numéro de téléphone
            </Label>
            <Input 
              id="phone" 
              name="phone"
              value={formData.phone} 
              onChange={handleInputChange}
              className="mt-1"
              disabled={!isEditing}
            />
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
              disabled={!isEditing}
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
              disabled={!isEditing}
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
              >
                Annuler
              </Button>
              <Button 
                className="w-full"
                onClick={handleSaveInfo}
              >
                <Save className="h-4 w-4 mr-2" />
                Enregistrer
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default PersonalInfoSection;
