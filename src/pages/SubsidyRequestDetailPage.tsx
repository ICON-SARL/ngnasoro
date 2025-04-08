
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { SfdHeader } from '@/components/sfd/SfdHeader';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, FileText } from 'lucide-react';
import { useSubsidyRequests } from '@/hooks/useSubsidyRequests';
import { SubsidyRequestDetailView } from '@/components/sfd/subsidy/SubsidyRequestDetailView';
import { Skeleton } from '@/components/ui/skeleton';

const SubsidyRequestDetailPage: React.FC = () => {
  const { requestId } = useParams<{ requestId: string }>();
  const navigate = useNavigate();
  const { getSubsidyRequestById } = useSubsidyRequests();
  const [request, setRequest] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const fetchRequestDetails = async () => {
      if (!requestId) return;
      
      setLoading(true);
      try {
        const data = await getSubsidyRequestById(requestId);
        setRequest(data);
      } catch (error) {
        console.error('Error fetching subsidy request details:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchRequestDetails();
  }, [requestId, getSubsidyRequestById]);
  
  const handleExportPDF = () => {
    // Implementation for PDF export would go here
    alert("Fonctionnalité d'exportation PDF à implémenter");
  };
  
  return (
    <div className="min-h-screen bg-gray-50">
      <SfdHeader />
      
      <main className="container mx-auto p-4 md:p-6">
        <Button 
          variant="ghost" 
          onClick={() => navigate('/sfd-subsidy-requests')} 
          className="mb-4 flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Retour aux demandes
        </Button>
        
        <Card className="overflow-hidden">
          <CardContent className="p-6">
            {loading ? (
              <div className="space-y-4">
                <Skeleton className="h-8 w-3/4 mb-2" />
                <Skeleton className="h-6 w-1/2 mb-4" />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                  <div>
                    <Skeleton className="h-4 w-24 mb-2" />
                    <Skeleton className="h-32 w-full" />
                  </div>
                  <div>
                    <Skeleton className="h-4 w-24 mb-2" />
                    <Skeleton className="h-32 w-full" />
                  </div>
                </div>
              </div>
            ) : request ? (
              <>
                <SubsidyRequestDetailView request={request} />
                <div className="flex justify-end mt-6 pt-4 border-t">
                  <Button 
                    variant="outline" 
                    className="flex items-center gap-1"
                    onClick={handleExportPDF}
                  >
                    <FileText className="h-4 w-4" />
                    Exporter en PDF
                  </Button>
                </div>
              </>
            ) : (
              <div className="text-center py-10">
                <p className="text-muted-foreground">Demande non trouvée</p>
                <Button 
                  variant="outline" 
                  onClick={() => navigate('/sfd-subsidy-requests')}
                  className="mt-4"
                >
                  Voir toutes les demandes
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default SubsidyRequestDetailPage;
