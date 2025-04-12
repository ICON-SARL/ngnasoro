
import React, { useState } from 'react';
import { Activity, Play, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export function IntegrationTester() {
  const [endpoint, setEndpoint] = useState('/api/create-sfd');
  const [method, setMethod] = useState('POST');
  const [requestBody, setRequestBody] = useState('{\n  "sfd_name": "Nouvelle SFD",\n  "sfd_code": "NSFD",\n  "admin_email": "admin@nouvelle-sfd.com"\n}');
  const [response, setResponse] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleTest = async () => {
    setIsLoading(true);
    try {
      let parsedBody;
      try {
        parsedBody = JSON.parse(requestBody);
      } catch (e) {
        throw new Error('Corps de la requête JSON invalide');
      }

      // Call the edge function
      const { data, error } = await supabase.functions.invoke('test-integration', {
        body: {
          endpoint,
          method,
          requestBody: parsedBody
        },
      });

      if (error) throw error;
      setResponse(data);
      
      toast({
        title: 'Test réussi',
        description: 'La requête a été traitée avec succès',
      });
    } catch (error: any) {
      console.error('Error testing integration:', error);
      setResponse({ error: error.message });
      
      toast({
        title: 'Erreur',
        description: `Erreur lors du test: ${error.message}`,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Activity className="h-5 w-5 text-primary" />
        <h2 className="text-xl font-semibold">Tests d'Intégration</h2>
      </div>

      <Tabs defaultValue="api-test" className="space-y-4">
        <TabsList>
          <TabsTrigger value="api-test">Test d'API</TabsTrigger>
          <TabsTrigger value="webhook-test">Test de Webhook</TabsTrigger>
        </TabsList>
        
        <TabsContent value="api-test" className="space-y-4">
          <Card>
            <CardContent className="pt-6">
              <form className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="endpoint">Endpoint</Label>
                    <div className="flex items-center border rounded-md">
                      <Input 
                        id="endpoint" 
                        value={endpoint} 
                        onChange={(e) => setEndpoint(e.target.value)} 
                        className="border-0 focus-visible:ring-0 rounded-r-none"
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="method">Méthode HTTP</Label>
                    <Select defaultValue={method} onValueChange={setMethod}>
                      <SelectTrigger id="method">
                        <SelectValue placeholder="Méthode" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="GET">GET</SelectItem>
                        <SelectItem value="POST">POST</SelectItem>
                        <SelectItem value="PUT">PUT</SelectItem>
                        <SelectItem value="DELETE">DELETE</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="requestBody">Corps de la requête (JSON)</Label>
                  <Textarea 
                    id="requestBody"
                    value={requestBody}
                    onChange={(e) => setRequestBody(e.target.value)}
                    rows={8}
                    className="font-mono text-sm"
                  />
                </div>
                
                <Button 
                  type="button" 
                  onClick={handleTest} 
                  className="w-full"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>Chargement...</>
                  ) : (
                    <>
                      <Play className="h-4 w-4 mr-2" />
                      Tester l'intégration
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
          
          {response && (
            <Card>
              <CardContent className="pt-6">
                <h3 className="font-semibold mb-2 flex items-center">
                  <ArrowRight className="h-4 w-4 mr-2" />
                  Réponse
                </h3>
                <div className="bg-muted p-4 rounded-md overflow-auto max-h-80">
                  <pre className="text-sm font-mono">
                    {JSON.stringify(response, null, 2)}
                  </pre>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
        
        <TabsContent value="webhook-test">
          <Card className="p-8 text-center">
            <Activity className="h-12 w-12 mx-auto text-muted-foreground" />
            <h3 className="mt-4 text-lg font-medium">Test de Webhook</h3>
            <p className="mt-2 text-muted-foreground">
              Cette fonctionnalité vous permet de simuler des webhooks entrants pour tester l'intégration avec des services externes.
            </p>
            <p className="mt-4 text-sm text-muted-foreground">
              Fonctionnalité en cours de développement
            </p>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
