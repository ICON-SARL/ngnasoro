
import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Check, Send, Loader2, FileCode } from 'lucide-react';

export function IntegrationTester() {
  const [endpoint, setEndpoint] = useState("/api/super-admin/create-sfd");
  const [method, setMethod] = useState("POST");
  const [requestBody, setRequestBody] = useState(JSON.stringify({
    "sfd_name": "SFD_TEST",
    "admin_email": "admin@sfdtest.com"
  }, null, 2));
  const [response, setResponse] = useState("");
  const [loading, setLoading] = useState(false);
  const [responseStatus, setResponseStatus] = useState<number | null>(null);
  const { toast } = useToast();

  const handleSendRequest = async () => {
    setLoading(true);
    setResponse("");
    setResponseStatus(null);
    
    try {
      // This would typically call your actual API or edge function
      // For demo purposes, we're using a mock response via a simulated edge function call
      const { data, error } = await supabase.functions.invoke('test-integration', {
        body: {
          endpoint,
          method,
          requestBody: JSON.parse(requestBody)
        }
      });
      
      if (error) throw error;
      
      setResponseStatus(data?.status || 200);
      setResponse(JSON.stringify(data?.result || { success: true }, null, 2));
      
      toast({
        title: "Requête envoyée",
        description: `Statut: ${data?.status || 200}`,
        variant: data?.status >= 400 ? "destructive" : "default"
      });
    } catch (err: any) {
      console.error('Error sending test request:', err);
      setResponseStatus(500);
      setResponse(JSON.stringify({ error: err.message }, null, 2));
      
      toast({
        title: "Erreur",
        description: "La requête a échoué",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const presetEndpoints = [
    {
      name: "Créer SFD",
      method: "POST",
      endpoint: "/api/super-admin/create-sfd",
      body: {
        "sfd_name": "SFD_TEST",
        "admin_email": "admin@sfdtest.com"
      }
    },
    {
      name: "Créer Admin SFD",
      method: "POST",
      endpoint: "/api/sfd-admin/create",
      body: {
        "sfd_id": "123e4567-e89b-12d3-a456-426614174000",
        "admin_email": "sfdadmin@example.com",
        "full_name": "SFD Admin Test"
      }
    }
  ];

  const selectPreset = (preset: any) => {
    setMethod(preset.method);
    setEndpoint(preset.endpoint);
    setRequestBody(JSON.stringify(preset.body, null, 2));
  };

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="flex items-center">
          <Send className="mr-2 h-5 w-5" />
          Test d'Intégration
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="request">
          <TabsList>
            <TabsTrigger value="request">Requête</TabsTrigger>
            <TabsTrigger value="response">Réponse</TabsTrigger>
          </TabsList>
          
          <TabsContent value="request" className="space-y-4">
            <div className="flex flex-wrap gap-2 mb-4">
              {presetEndpoints.map((preset, index) => (
                <Button 
                  key={index} 
                  variant="outline" 
                  size="sm"
                  onClick={() => selectPreset(preset)}
                >
                  {preset.name}
                </Button>
              ))}
            </div>
            
            <div className="grid grid-cols-4 gap-4">
              <div className="col-span-1">
                <Label htmlFor="method">Méthode</Label>
                <select 
                  id="method"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  value={method}
                  onChange={(e) => setMethod(e.target.value)}
                >
                  <option value="GET">GET</option>
                  <option value="POST">POST</option>
                  <option value="PUT">PUT</option>
                  <option value="DELETE">DELETE</option>
                </select>
              </div>
              <div className="col-span-3">
                <Label htmlFor="endpoint">Endpoint</Label>
                <Input 
                  id="endpoint" 
                  value={endpoint} 
                  onChange={(e) => setEndpoint(e.target.value)} 
                />
              </div>
            </div>
            
            <div>
              <Label htmlFor="body">Corps de la requête</Label>
              <Textarea 
                id="body" 
                value={requestBody} 
                onChange={(e) => setRequestBody(e.target.value)}
                rows={10}
                className="font-mono text-sm"
              />
            </div>
          </TabsContent>
          
          <TabsContent value="response">
            <div className="mb-2 flex items-center justify-between">
              <Label>Réponse</Label>
              {responseStatus && (
                <Badge 
                  variant={responseStatus < 400 ? "default" : "destructive"}
                  className={responseStatus < 400 ? "bg-green-100 text-green-800" : ""}
                >
                  Status: {responseStatus}
                </Badge>
              )}
            </div>
            <Textarea 
              value={response} 
              readOnly 
              rows={10}
              className="font-mono text-sm bg-gray-50"
              placeholder="La réponse apparaîtra ici après l'envoi de la requête"
            />
          </TabsContent>
        </Tabs>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button variant="outline" onClick={() => setRequestBody(JSON.stringify(JSON.parse(requestBody), null, 2))}>
          <FileCode className="h-4 w-4 mr-2" />
          Formater JSON
        </Button>
        <Button onClick={handleSendRequest} disabled={loading}>
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Envoi en cours...
            </>
          ) : (
            <>
              <Send className="h-4 w-4 mr-2" />
              Envoyer la requête
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  );
}

// Adding Badge component since it's used in the IntegrationTester
const Badge = ({ children, variant = "default", className = "" }: any) => {
  const baseClasses = "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold";
  
  const variantClasses = {
    default: "bg-primary text-primary-foreground",
    secondary: "bg-secondary text-secondary-foreground",
    destructive: "bg-destructive text-destructive-foreground",
    outline: "border border-input"
  };
  
  return (
    <span className={`${baseClasses} ${variantClasses[variant as keyof typeof variantClasses]} ${className}`}>
      {children}
    </span>
  );
};
