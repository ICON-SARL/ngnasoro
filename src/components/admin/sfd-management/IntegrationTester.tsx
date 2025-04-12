
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2, Send, Check, X, PlayCircle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { logAuditEvent } from '@/utils/audit';

const testEndpoints = [
  { 
    id: 'create-sfd', 
    name: 'Créer une SFD', 
    method: 'POST',
    endpoint: '/api/super-admin/create-sfd',
    payload: {
      sfd_name: "SFD_TEST",
      admin_email: "admin@sfdtest.com",
      region: "Centre"
    }
  },
  { 
    id: 'create-admin', 
    name: 'Créer un Admin SFD', 
    method: 'POST',
    endpoint: '/api/super-admin/create-sfd-admin',
    payload: {
      sfd_id: "00000000-0000-0000-0000-000000000000",
      email: "new-admin@sfd.com",
      full_name: "Admin Test"
    }
  },
  { 
    id: 'check-balance', 
    name: 'Vérifier Balance SFD', 
    method: 'GET',
    endpoint: '/api/sfd/balance',
    payload: {
      sfd_id: "00000000-0000-0000-0000-000000000000"
    }
  }
];

export function IntegrationTester() {
  const [activeTab, setActiveTab] = useState('endpoint');
  const [selectedTest, setSelectedTest] = useState(testEndpoints[0]);
  const [requestPayload, setRequestPayload] = useState(JSON.stringify(testEndpoints[0].payload, null, 2));
  const [isLoading, setIsLoading] = useState(false);
  const [testResult, setTestResult] = useState<null | { success: boolean; response: any; time: number }>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleRunTest = async () => {
    try {
      setIsLoading(true);
      setErrorMessage(null);
      
      // Log the test for audit purposes
      await logAuditEvent('integration', 'run_integration_test', {
        endpoint: selectedTest.endpoint,
        method: selectedTest.method,
        test_name: selectedTest.name
      });

      // Simulate API call
      const startTime = performance.now();
      
      // Here we would normally make an actual API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const endTime = performance.now();
      
      // For demo purposes, we'll randomly succeed or fail
      const success = Math.random() > 0.3;
      
      if (success) {
        setTestResult({
          success: true,
          response: {
            status: "success",
            data: {
              id: "sim-" + Math.random().toString(36).substring(2, 10),
              timestamp: new Date().toISOString()
            }
          },
          time: endTime - startTime
        });
      } else {
        setTestResult({
          success: false,
          response: {
            status: "error",
            message: "Une erreur s'est produite lors du traitement de la requête.",
            code: "ERROR_PROCESSING_REQUEST"
          },
          time: endTime - startTime
        });
      }
    } catch (error) {
      console.error("Test execution error:", error);
      setErrorMessage("Une erreur s'est produite lors de l'exécution du test.");
      setTestResult(null);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="pb-3">
          <CardTitle>Tests d'Intégration</CardTitle>
          <CardDescription>
            Testez les intégrations API et services externes
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="mb-4">
              <TabsTrigger value="endpoint">Tests d'Endpoints</TabsTrigger>
              <TabsTrigger value="custom">Test Personnalisé</TabsTrigger>
            </TabsList>
            
            <TabsContent value="endpoint">
              <div className="space-y-4">
                <div>
                  <Label>Sélectionnez un test d'API</Label>
                  <Select 
                    value={selectedTest.id} 
                    onValueChange={(value) => {
                      const test = testEndpoints.find(t => t.id === value);
                      if (test) {
                        setSelectedTest(test);
                        setRequestPayload(JSON.stringify(test.payload, null, 2));
                      }
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionnez un test" />
                    </SelectTrigger>
                    <SelectContent>
                      {testEndpoints.map((test) => (
                        <SelectItem key={test.id} value={test.id}>
                          {test.name} ({test.method})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <div className="flex justify-between items-center">
                    <Label>Corps de la requête</Label>
                    <span className="text-xs text-muted-foreground">
                      {selectedTest.method} {selectedTest.endpoint}
                    </span>
                  </div>
                  <Textarea
                    className="font-mono text-sm h-32"
                    value={requestPayload}
                    onChange={(e) => setRequestPayload(e.target.value)}
                  />
                </div>
                
                <Button 
                  className="w-full" 
                  disabled={isLoading}
                  onClick={handleRunTest}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Exécution en cours...
                    </>
                  ) : (
                    <>
                      <PlayCircle className="mr-2 h-4 w-4" />
                      Exécuter le Test
                    </>
                  )}
                </Button>
              </div>
            </TabsContent>
            
            <TabsContent value="custom">
              <div className="space-y-4">
                <div className="grid grid-cols-3 gap-4">
                  <div className="col-span-2">
                    <Label htmlFor="custom-endpoint">URL de l'API</Label>
                    <Input id="custom-endpoint" placeholder="https://api.example.com/endpoint" />
                  </div>
                  <div>
                    <Label htmlFor="method">Méthode</Label>
                    <Select defaultValue="GET">
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
                
                <div>
                  <Label htmlFor="custom-payload">Corps de la requête</Label>
                  <Textarea
                    id="custom-payload"
                    placeholder="{}"
                    className="font-mono text-sm h-32"
                  />
                </div>
                
                <Button className="w-full">
                  <Send className="mr-2 h-4 w-4" />
                  Envoyer la Requête
                </Button>
              </div>
            </TabsContent>
          </Tabs>
          
          {errorMessage && (
            <Alert variant="destructive" className="mt-4">
              <AlertTitle>Erreur</AlertTitle>
              <AlertDescription>{errorMessage}</AlertDescription>
            </Alert>
          )}
          
          {testResult && (
            <div className="mt-6 space-y-4">
              <div className="flex items-center gap-2">
                <div className={`rounded-full p-1 ${testResult.success ? 'bg-green-100' : 'bg-red-100'}`}>
                  {testResult.success ? (
                    <Check className="h-5 w-5 text-green-600" />
                  ) : (
                    <X className="h-5 w-5 text-red-600" />
                  )}
                </div>
                <div>
                  <h3 className="font-medium">
                    {testResult.success ? 'Test réussi' : 'Test échoué'}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Temps d'exécution: {testResult.time.toFixed(2)}ms
                  </p>
                </div>
              </div>
              
              <div>
                <Label>Réponse</Label>
                <pre className="mt-1 bg-muted p-4 rounded-md overflow-auto text-xs">
                  {JSON.stringify(testResult.response, null, 2)}
                </pre>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
