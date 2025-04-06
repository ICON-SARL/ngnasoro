
import React, { useState } from 'react';
import { useSubsidyRequests } from '@/hooks/useSubsidyRequests';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { PaperclipIcon } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface SubsidyRequestCreateProps {
  onSuccess?: () => void;
}

// Define the priority type explicitly to match the expected type
type PriorityType = 'low' | 'normal' | 'high' | 'urgent';

export function SubsidyRequestCreate({ onSuccess }: SubsidyRequestCreateProps) {
  const { user } = useAuth();
  const { createSubsidyRequest } = useSubsidyRequests();
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    sfd_id: '',
    amount: '',
    purpose: '',
    justification: '',
    priority: 'normal' as PriorityType, // Explicitly type as PriorityType
    region: '',
    expected_impact: '',
  });
  
  const [availableSfds, setAvailableSfds] = useState<any[]>([]);
  
  // Fetch available SFDs on component mount
  React.useEffect(() => {
    const fetchSfds = async () => {
      const { data } = await supabase
        .from('sfds')
        .select('id, name, region')
        .eq('status', 'active')
        .order('name');
      
      if (data) {
        setAvailableSfds(data);
        
        // If there's only one SFD, select it by default
        if (data.length === 1) {
          setFormData(prev => ({ ...prev, sfd_id: data[0].id }));
        }
      }
    };
    
    fetchSfds();
  }, []);
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleSelectChange = (name: string, value: string) => {
    if (name === 'priority') {
      // Ensure we cast the priority value to the specific type when setting state
      setFormData(prev => ({ ...prev, [name]: value as PriorityType }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      // Convert amount to number and ensure priority has the correct type
      const requestData = {
        ...formData,
        amount: parseFloat(formData.amount),
        // The priority field is already correctly typed as PriorityType
      };
      
      await createSubsidyRequest.mutateAsync(requestData);
      
      // Reset form
      setFormData({
        sfd_id: '',
        amount: '',
        purpose: '',
        justification: '',
        priority: 'normal' as PriorityType,
        region: '',
        expected_impact: '',
      });
      
      // Call onSuccess callback
      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      console.error('Error creating subsidy request:', error);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const regions = [
    'Dakar',
    'Diourbel',
    'Fatick',
    'Kaffrine',
    'Kaolack',
    'Kédougou',
    'Kolda',
    'Louga',
    'Matam',
    'Saint-Louis',
    'Sédhiou',
    'Tambacounda',
    'Thiès',
    'Ziguinchor',
  ].sort();
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Nouvelle demande de subvention</CardTitle>
        <CardDescription>
          Créez une demande de subvention pour un SFD partenaire
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="sfd_id">SFD Bénéficiaire</Label>
                <Select
                  value={formData.sfd_id}
                  onValueChange={(value) => handleSelectChange('sfd_id', value)}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner un SFD" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableSfds.map((sfd) => (
                      <SelectItem key={sfd.id} value={sfd.id}>
                        {sfd.name} {sfd.region ? `(${sfd.region})` : ''}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="amount">Montant (FCFA)</Label>
                <Input
                  id="amount"
                  name="amount"
                  type="number"
                  value={formData.amount}
                  onChange={handleInputChange}
                  placeholder="ex: 5000000"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="priority">Priorité</Label>
                <Select 
                  value={formData.priority}
                  onValueChange={(value) => handleSelectChange('priority', value)}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner une priorité" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Basse</SelectItem>
                    <SelectItem value="normal">Normale</SelectItem>
                    <SelectItem value="high">Haute</SelectItem>
                    <SelectItem value="urgent">Urgente</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="region">Région ciblée</Label>
                <Select 
                  value={formData.region}
                  onValueChange={(value) => handleSelectChange('region', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner une région (optionnel)" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Toutes les régions</SelectItem>
                    {regions.map((region) => (
                      <SelectItem key={region} value={region}>{region}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="purpose">Objet de la subvention</Label>
                <Input
                  id="purpose"
                  name="purpose"
                  value={formData.purpose}
                  onChange={handleInputChange}
                  placeholder="ex: Financement de microcrédits agricoles"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="justification">Justification</Label>
                <Textarea
                  id="justification"
                  name="justification"
                  value={formData.justification}
                  onChange={handleInputChange}
                  placeholder="Décrivez pourquoi cette subvention est nécessaire..."
                  rows={3}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="expected_impact">Impact attendu</Label>
                <Textarea
                  id="expected_impact"
                  name="expected_impact"
                  value={formData.expected_impact}
                  onChange={handleInputChange}
                  placeholder="Décrivez l'impact socio-économique attendu de cette subvention..."
                  rows={3}
                  required
                />
              </div>
            </div>
          </div>
          
          <Separator />
          
          <div>
            <Label>Documents justificatifs (optionnel)</Label>
            <div className="mt-2 border-2 border-dashed border-gray-200 rounded-md p-8 text-center">
              <PaperclipIcon className="h-8 w-8 mx-auto text-gray-400" />
              <p className="mt-2 text-sm text-muted-foreground">
                Fonctionnalité de téléchargement de documents en cours d'implémentation
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                Format supportés : PDF, DOCX, XLSX, JPG, PNG (max. 10MB)
              </p>
            </div>
          </div>
          
          <div className="flex justify-end gap-2">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => onSuccess && onSuccess()}
            >
              Annuler
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Soumission en cours...' : 'Soumettre la demande'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
