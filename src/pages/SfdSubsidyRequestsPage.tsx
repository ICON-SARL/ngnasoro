
import React from 'react';
import { SfdHeader } from '@/components/sfd/SfdHeader';
import { Card, CardContent } from '@/components/ui/card';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';

const SfdSubsidyRequestsPage: React.FC = () => {
  const navigate = useNavigate();
  
  return (
    <div className="min-h-screen bg-gray-50">
      <SfdHeader />
      
      <main className="container mx-auto p-4 md:p-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-2xl font-bold">Demandes de Subvention</h2>
            <p className="text-muted-foreground">
              Gérez les demandes de subvention et leur statut
            </p>
          </div>
          
          <Button 
            onClick={() => navigate('/sfd-meref-request')}
            className="flex items-center gap-2"
          >
            <PlusCircle className="h-4 w-4" />
            Nouvelle demande MEREF
          </Button>
        </div>
        
        <Card>
          <CardContent className="p-6">
            <p className="text-center text-muted-foreground py-8">
              La liste des demandes de subvention sera implémentée prochainement.
            </p>
            
            <div className="flex justify-center mt-4">
              <Button 
                variant="outline"
                onClick={() => navigate('/sfd-meref-request')}
              >
                Accéder aux demandes MEREF
              </Button>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default SfdSubsidyRequestsPage;
