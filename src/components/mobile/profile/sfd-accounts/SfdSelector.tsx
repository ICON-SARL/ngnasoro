
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Loader } from '@/components/ui/loader';
import { Check, Search, Building2 } from 'lucide-react';

interface SfdSelectorProps {
  userId: string;
  onRequestSent: () => void;
}

const SfdSelector: React.FC<SfdSelectorProps> = ({ userId, onRequestSent }) => {
  const { toast } = useToast();
  const [sfdList, setSfdList] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSfd, setSelectedSfd] = useState<string | null>(null);
  const [isSending, setIsSending] = useState(false);
  
  useEffect(() => {
    const loadSfds = async () => {
      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from('sfds')
          .select('id, name, code, region')
          .eq('status', 'active')
          .order('name');
          
        if (error) throw error;
        setSfdList(data || []);
      } catch (error) {
        console.error('Error loading SFDs:', error);
        toast({
          title: "Erreur",
          description: "Impossible de charger la liste des SFDs",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    loadSfds();
  }, [toast]);
  
  const handleSubmitRequest = async () => {
    if (!selectedSfd) {
      toast({
        title: "Sélection requise",
        description: "Veuillez sélectionner une SFD",
        variant: "destructive",
      });
      return;
    }
    
    setIsSending(true);
    try {
      // Get selected SFD details
      const selectedSfdDetails = sfdList.find(sfd => sfd.id === selectedSfd);
      
      if (!selectedSfdDetails) {
        throw new Error("SFD introuvable");
      }
      
      // Create SFD client request
      const { data: userData } = await supabase.auth.getUser();
      
      if (!userData?.user) {
        throw new Error("Utilisateur non authentifié");
      }
      
      // Get user profile data
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('full_name, email')
        .eq('id', userId)
        .single();
        
      if (profileError) {
        console.error('Error fetching profile data:', profileError);
      }
      
      // Create client request in the sfd_clients table
      const { error } = await supabase
        .from('sfd_clients')
        .insert({
          sfd_id: selectedSfd,
          user_id: userId,
          full_name: profileData?.full_name || userData.user.user_metadata?.full_name || '',
          email: profileData?.email || userData.user.email || '',
          phone: userData.user.user_metadata?.phone || null,
          status: 'pending',
        });
        
      if (error) {
        // Check if it's a duplicate error
        if (error.code === '23505') {
          toast({
            title: "Demande déjà existante",
            description: "Vous avez déjà une demande en cours pour cette SFD",
            variant: "default",
          });
          onRequestSent(); // Still consider it successful for the UI flow
          return;
        }
        throw error;
      }
      
      toast({
        title: "Demande envoyée",
        description: `Votre demande pour ${selectedSfdDetails.name} a été envoyée avec succès`,
      });
      
      onRequestSent();
    } catch (error: any) {
      console.error('Error submitting SFD request:', error);
      toast({
        title: "Erreur",
        description: error.message || "Erreur lors de l'envoi de la demande",
        variant: "destructive",
      });
    } finally {
      setIsSending(false);
    }
  };
  
  const filteredSfds = sfdList.filter(sfd => 
    sfd.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    sfd.code?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    sfd.region?.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl text-[#0D6A51]">Sélectionnez votre SFD</CardTitle>
        <CardDescription>
          Choisissez la SFD dont vous êtes client. L'administrateur de la SFD validera votre demande.
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {isLoading ? (
          <div className="flex justify-center py-8">
            <Loader size="lg" />
          </div>
        ) : (
          <>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
              <Input
                type="text"
                placeholder="Rechercher une SFD..."
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            {filteredSfds.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Building2 className="mx-auto h-12 w-12 text-muted-foreground/50 mb-3" />
                <p>Aucune SFD trouvée</p>
              </div>
            ) : (
              <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
                {filteredSfds.map((sfd) => (
                  <div
                    key={sfd.id}
                    className={`flex items-center justify-between p-3 border rounded-lg cursor-pointer transition-colors ${
                      selectedSfd === sfd.id 
                        ? 'bg-[#0D6A51]/10 border-[#0D6A51]/30' 
                        : 'hover:bg-gray-50 border-gray-200'
                    }`}
                    onClick={() => setSelectedSfd(sfd.id)}
                  >
                    <div>
                      <p className="font-medium">{sfd.name}</p>
                      <div className="flex text-sm text-muted-foreground gap-2">
                        {sfd.code && <span>Code: {sfd.code}</span>}
                        {sfd.region && <span>• {sfd.region}</span>}
                      </div>
                    </div>
                    
                    {selectedSfd === sfd.id && (
                      <Check className="h-5 w-5 text-[#0D6A51]" />
                    )}
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </CardContent>
      
      <CardFooter>
        <Button 
          className="w-full bg-[#0D6A51] hover:bg-[#0D6A51]/90"
          onClick={handleSubmitRequest}
          disabled={!selectedSfd || isSending || isLoading}
        >
          {isSending ? (
            <>
              <Loader size="sm" className="mr-2 text-white" />
              Envoi en cours...
            </>
          ) : (
            "Envoyer la demande"
          )}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default SfdSelector;
