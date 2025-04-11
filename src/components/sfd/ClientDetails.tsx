
import React from 'react';
import { useParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { clientActivityService } from '@/services/clientActivity/clientActivityService';

const ClientDetails = () => {
  const { clientId } = useParams<{ clientId: string }>();
  const { toast } = useToast();
  const [clientData, setClientData] = React.useState(null);
  const [loading, setLoading] = React.useState(true);
  const [activities, setActivities] = React.useState([]);

  React.useEffect(() => {
    // Simuler le chargement des données client
    const fetchData = async () => {
      try {
        setLoading(true);
        // Ici vous feriez normalement une requête API pour obtenir les données client
        // Simulons des données pour l'exemple
        setTimeout(() => {
          setClientData({
            id: clientId,
            full_name: "Jean Dupont",
            email: "jean.dupont@example.com",
            phone: "+226 70 12 34 56",
            address: "Ouagadougou, Burkina Faso",
            created_at: new Date().toISOString(),
            status: "active"
          });
          setLoading(false);
        }, 1000);
      } catch (error) {
        console.error("Erreur lors du chargement des données client:", error);
        toast({
          title: "Erreur",
          description: "Impossible de charger les données du client",
          variant: "destructive"
        });
        setLoading(false);
      }
    };
    
    const fetchActivities = async () => {
      if (clientId) {
        try {
          const activitiesData = await clientActivityService.getClientActivities(clientId);
          setActivities(activitiesData);
        } catch (error) {
          console.error("Erreur lors du chargement des activités:", error);
        }
      }
    };
    
    fetchData();
    fetchActivities();
  }, [clientId, toast]);

  const handleSendCredentials = async () => {
    try {
      toast({
        title: "Envoi en cours",
        description: "Envoi des informations de connexion au client...",
      });
      
      // Simuler l'envoi des informations
      setTimeout(() => {
        toast({
          title: "Succès",
          description: "Les informations de connexion ont été envoyées avec succès",
        });
      }, 1500);
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de l'envoi des informations",
        variant: "destructive"
      });
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#0D6A51]"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold">{clientData?.full_name}</h1>
          <p className="text-gray-500">ID: {clientId}</p>
        </div>
        
        <div className="flex space-x-2">
          <Button onClick={handleSendCredentials} variant="outline">
            Envoyer les informations de connexion
          </Button>
          <Button>Modifier</Button>
        </div>
      </div>
      
      <Tabs defaultValue="profile">
        <TabsList>
          <TabsTrigger value="profile">Profil</TabsTrigger>
          <TabsTrigger value="accounts">Comptes</TabsTrigger>
          <TabsTrigger value="activities">Activités</TabsTrigger>
          <TabsTrigger value="documents">Documents</TabsTrigger>
        </TabsList>
        
        <TabsContent value="profile">
          <Card>
            <CardHeader>
              <CardTitle>Informations du client</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h3 className="font-medium">Nom complet</h3>
                  <p>{clientData?.full_name}</p>
                </div>
                <div>
                  <h3 className="font-medium">Email</h3>
                  <p>{clientData?.email}</p>
                </div>
                <div>
                  <h3 className="font-medium">Téléphone</h3>
                  <p>{clientData?.phone}</p>
                </div>
                <div>
                  <h3 className="font-medium">Adresse</h3>
                  <p>{clientData?.address}</p>
                </div>
                <div>
                  <h3 className="font-medium">Date d'inscription</h3>
                  <p>{new Date(clientData?.created_at).toLocaleDateString()}</p>
                </div>
                <div>
                  <h3 className="font-medium">Statut</h3>
                  <p className="capitalize">{clientData?.status}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="accounts">
          <Card>
            <CardHeader>
              <CardTitle>Comptes du client</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-500">Aucun compte disponible pour le moment.</p>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="activities">
          <Card>
            <CardHeader>
              <CardTitle>Historique des activités</CardTitle>
            </CardHeader>
            <CardContent>
              {activities.length === 0 ? (
                <p className="text-gray-500">Aucune activité enregistrée.</p>
              ) : (
                <div className="space-y-4">
                  {activities.map((activity) => (
                    <div key={activity.id} className="border-b pb-4 last:border-0">
                      <div className="flex justify-between">
                        <p className="font-medium">{activity.description}</p>
                        <p className="text-sm text-gray-500">
                          {new Date(activity.performed_at).toLocaleDateString()}
                        </p>
                      </div>
                      <p className="text-sm text-gray-500">Type: {activity.activity_type}</p>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="documents">
          <Card>
            <CardHeader>
              <CardTitle>Documents du client</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-500">Aucun document téléchargé.</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ClientDetails;
