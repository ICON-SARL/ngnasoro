
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { SfdClient } from '@/types/sfdClients';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FileUpload } from './FileUpload';
import { User, Edit2, Upload, FilePlus, Shield, Check, X } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface ClientProfileEditProps {
  client: SfdClient;
  onSuccess: () => void;
}

export const ClientProfileEdit: React.FC<ClientProfileEditProps> = ({ client, onSuccess }) => {
  const { toast } = useToast();
  const { user } = useAuth();

  // Form state
  const [formData, setFormData] = useState({
    full_name: client.full_name,
    email: client.email || '',
    phone: client.phone || '',
    address: client.address || '',
    id_type: client.id_type || '',
    id_number: client.id_number || '',
    kyc_level: client.kyc_level,
    notes: client.notes || '',
  });
  
  // File upload state
  const [idDocumentUrl, setIdDocumentUrl] = useState<string | null>(null);
  const [addressDocumentUrl, setAddressDocumentUrl] = useState<string | null>(null);
  const [selfieUrl, setSelfieUrl] = useState<string | null>(null);
  
  // Loading state
  const [isLoading, setIsLoading] = useState(false);
  
  // Handle field changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  // Handle select changes
  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  // Handle KYC level change
  const handleKycLevelChange = (level: number) => {
    setFormData(prev => ({ ...prev, kyc_level: level }));
  };
  
  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      // Update client in database
      const { data, error } = await supabase
        .from('sfd_clients')
        .update({
          full_name: formData.full_name,
          email: formData.email || null,
          phone: formData.phone || null,
          address: formData.address || null,
          id_type: formData.id_type || null,
          id_number: formData.id_number || null,
          kyc_level: formData.kyc_level,
          notes: formData.notes || null,
        })
        .eq('id', client.id)
        .select();
      
      if (error) throw error;
      
      toast({
        title: "Profil mis à jour",
        description: "Les informations du client ont été mises à jour",
      });
      
      onSuccess();
    } catch (error) {
      console.error('Error updating client:', error);
      toast({
        title: "Erreur",
        description: "Impossible de mettre à jour le profil",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  // Upload a document
  const handleDocumentUpload = async (file: File, type: string) => {
    if (!file || !user?.id) return;
    
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${client.id}/${type}_${Math.random().toString(36).substring(2)}.${fileExt}`;
      
      // Upload file to storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('client_documents')
        .upload(fileName, file);
        
      if (uploadError) throw uploadError;
      
      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('client_documents')
        .getPublicUrl(fileName);
        
      // Add document record
      const { data: docData, error: docError } = await supabase
        .from('client_documents')
        .insert({
          client_id: client.id,
          document_type: type,
          document_url: publicUrl,
          verified: false,
        })
        .select();
      
      if (docError) throw docError;
      
      toast({
        title: "Document téléversé",
        description: "Le document a été téléversé avec succès",
      });
      
      // Update local state
      if (type === 'id_card') setIdDocumentUrl(publicUrl);
      else if (type === 'proof_of_address') setAddressDocumentUrl(publicUrl);
      else if (type === 'selfie') setSelfieUrl(publicUrl);
      
      // Update KYC level automatically based on uploaded documents
      updateKycLevel();
      
    } catch (error) {
      console.error('Error uploading document:', error);
      toast({
        title: "Erreur",
        description: "Impossible de téléverser le document",
        variant: "destructive",
      });
    }
  };
  
  // Update KYC level based on documents
  const updateKycLevel = async () => {
    try {
      // Fetch current documents
      const { data: documents, error } = await supabase
        .from('client_documents')
        .select('*')
        .eq('client_id', client.id);
      
      if (error) throw error;
      
      // Calculate KYC level based on documents
      let newLevel = 0;
      
      // Level 1: Has ID
      const hasId = documents?.some(doc => doc.document_type === 'id_card');
      if (hasId) newLevel = 1;
      
      // Level 2: Has ID and address proof
      const hasAddress = documents?.some(doc => doc.document_type === 'proof_of_address');
      if (hasId && hasAddress) newLevel = 2;
      
      // Level 3: Has ID, address proof, and selfie, and has been manually verified
      const hasSelfie = documents?.some(doc => doc.document_type === 'selfie');
      const allVerified = documents?.every(doc => doc.verified);
      if (hasId && hasAddress && hasSelfie && allVerified) newLevel = 3;
      
      // Update form state
      setFormData(prev => ({ ...prev, kyc_level: newLevel }));
      
    } catch (error) {
      console.error('Error updating KYC level:', error);
    }
  };
  
  // Load existing documents
  useEffect(() => {
    const fetchDocuments = async () => {
      try {
        const { data, error } = await supabase
          .from('client_documents')
          .select('*')
          .eq('client_id', client.id);
        
        if (error) throw error;
        
        if (data) {
          const idDoc = data.find(doc => doc.document_type === 'id_card');
          const addressDoc = data.find(doc => doc.document_type === 'proof_of_address');
          const selfieDoc = data.find(doc => doc.document_type === 'selfie');
          
          if (idDoc) setIdDocumentUrl(idDoc.document_url);
          if (addressDoc) setAddressDocumentUrl(addressDoc.document_url);
          if (selfieDoc) setSelfieUrl(selfieDoc.document_url);
        }
      } catch (error) {
        console.error('Error fetching documents:', error);
      }
    };
    
    fetchDocuments();
  }, [client.id]);
  
  return (
    <div>
      <Tabs defaultValue="profile">
        <TabsList className="grid grid-cols-2">
          <TabsTrigger value="profile" className="flex items-center">
            <User className="h-4 w-4 mr-2" /> Profil
          </TabsTrigger>
          <TabsTrigger value="documents" className="flex items-center">
            <FilePlus className="h-4 w-4 mr-2" /> Documents KYC
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="profile">
          <form onSubmit={handleSubmit} className="space-y-4 pt-4">
            <div className="grid grid-cols-1 gap-4">
              <div className="space-y-2">
                <Label htmlFor="full_name">Nom complet *</Label>
                <Input
                  id="full_name"
                  name="full_name"
                  value={formData.full_name}
                  onChange={handleChange}
                  required
                />
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Téléphone</Label>
                  <Input
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="address">Adresse</Label>
                <Textarea
                  id="address"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                />
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="id_type">Type de pièce d'identité</Label>
                  <Select 
                    value={formData.id_type} 
                    onValueChange={(value) => handleSelectChange('id_type', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="cni">Carte Nationale d'Identité</SelectItem>
                      <SelectItem value="passport">Passeport</SelectItem>
                      <SelectItem value="driver">Permis de conduire</SelectItem>
                      <SelectItem value="other">Autre</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="id_number">Numéro de pièce d'identité</Label>
                  <Input
                    id="id_number"
                    name="id_number"
                    value={formData.id_number}
                    onChange={handleChange}
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label>Niveau KYC</Label>
                <div className="flex items-center space-x-2 pt-2">
                  <Progress value={(formData.kyc_level / 3) * 100} className="h-2 flex-grow" />
                  <span className="text-sm text-muted-foreground font-medium">{formData.kyc_level}/3</span>
                </div>
                
                <div className="flex justify-between mt-2">
                  {[0, 1, 2, 3].map((level) => (
                    <Button
                      key={level}
                      type="button"
                      size="sm"
                      variant={formData.kyc_level === level ? "default" : "outline"}
                      onClick={() => handleKycLevelChange(level)}
                    >
                      {level}
                    </Button>
                  ))}
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  name="notes"
                  value={formData.notes}
                  onChange={handleChange}
                  rows={3}
                />
              </div>
            </div>
            
            <div className="flex justify-end space-x-2 pt-4">
              <Button type="button" variant="outline" onClick={onSuccess}>
                Annuler
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Mise à jour..." : "Mettre à jour"}
              </Button>
            </div>
          </form>
        </TabsContent>
        
        <TabsContent value="documents">
          <div className="space-y-6 pt-4">
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <h3 className="text-sm font-medium">Pièce d'identité</h3>
                <Badge className={idDocumentUrl ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}>
                  {idDocumentUrl ? "Téléversé" : "Requis pour KYC niveau 1"}
                </Badge>
              </div>
              
              {idDocumentUrl ? (
                <div className="flex items-center justify-between border p-3 rounded-md">
                  <a 
                    href={idDocumentUrl} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="text-blue-600 hover:underline flex items-center"
                  >
                    <FilePlus className="h-4 w-4 mr-2" />
                    Voir le document
                  </a>
                  <Badge variant="outline">
                    {client.id_type || "Document"}
                  </Badge>
                </div>
              ) : (
                <FileUpload
                  onUpload={(file) => handleDocumentUpload(file, 'id_card')}
                  accept=".jpg,.jpeg,.png,.pdf"
                  label="Téléverser une pièce d'identité"
                />
              )}
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <h3 className="text-sm font-medium">Justificatif de domicile</h3>
                <Badge className={addressDocumentUrl ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}>
                  {addressDocumentUrl ? "Téléversé" : "Requis pour KYC niveau 2"}
                </Badge>
              </div>
              
              {addressDocumentUrl ? (
                <div className="flex items-center justify-between border p-3 rounded-md">
                  <a 
                    href={addressDocumentUrl} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="text-blue-600 hover:underline flex items-center"
                  >
                    <FilePlus className="h-4 w-4 mr-2" />
                    Voir le document
                  </a>
                  <Badge variant="outline">Justificatif</Badge>
                </div>
              ) : (
                <FileUpload
                  onUpload={(file) => handleDocumentUpload(file, 'proof_of_address')}
                  accept=".jpg,.jpeg,.png,.pdf"
                  label="Téléverser un justificatif de domicile"
                />
              )}
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <h3 className="text-sm font-medium">Photo d'identité</h3>
                <Badge className={selfieUrl ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}>
                  {selfieUrl ? "Téléversé" : "Requis pour KYC niveau 3"}
                </Badge>
              </div>
              
              {selfieUrl ? (
                <div className="flex items-center justify-between border p-3 rounded-md">
                  <a 
                    href={selfieUrl} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="text-blue-600 hover:underline flex items-center"
                  >
                    <FilePlus className="h-4 w-4 mr-2" />
                    Voir la photo
                  </a>
                  <Badge variant="outline">Photo</Badge>
                </div>
              ) : (
                <FileUpload
                  onUpload={(file) => handleDocumentUpload(file, 'selfie')}
                  accept=".jpg,.jpeg,.png"
                  label="Téléverser une photo d'identité"
                />
              )}
            </div>
            
            <div className="bg-blue-50 p-4 rounded-md border border-blue-100 mt-6">
              <div className="flex items-start">
                <Shield className="h-5 w-5 text-blue-600 mr-2 mt-0.5" />
                <div>
                  <h4 className="font-medium text-blue-800">Niveaux de vérification KYC</h4>
                  <ul className="mt-2 space-y-2 text-sm text-blue-700">
                    <li className="flex items-center">
                      <Badge className="bg-gray-100 text-gray-800 mr-2">Niveau 1</Badge>
                      Pièce d'identité téléversée
                    </li>
                    <li className="flex items-center">
                      <Badge className="bg-gray-100 text-gray-800 mr-2">Niveau 2</Badge>
                      Pièce d'identité + Justificatif de domicile
                    </li>
                    <li className="flex items-center">
                      <Badge className="bg-gray-100 text-gray-800 mr-2">Niveau 3</Badge>
                      Tous les documents + Vérification manuelle complétée
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};
