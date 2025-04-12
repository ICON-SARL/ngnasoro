
import React from 'react';
import { TestFormSection } from './TestFormSection';
import { TestResultsSection } from './TestResultsSection';
import { TestHistorySection } from './TestHistorySection';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useIntegrationTester } from '../hooks/useIntegrationTester';

export function IntegrationTester() {
  const {
    endpointUrl,
    method,
    testName,
    payload,
    testResults,
    testHistory,
    isLoading,
    handleEndpointChange,
    handleMethodChange,
    handleTestNameChange,
    handlePayloadChange,
    handleRunTest,
    clearResults
  } = useIntegrationTester();

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Testeur d'Intégration API</CardTitle>
        <CardDescription>
          Testez les points d'accès API pour vérifier leur bon fonctionnement avec les SFDs
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="test" className="w-full">
          <TabsList className="mb-4">
            <TabsTrigger value="test">Test d'API</TabsTrigger>
            <TabsTrigger value="history">Historique</TabsTrigger>
          </TabsList>
          
          <TabsContent value="test" className="space-y-6">
            <TestFormSection 
              endpointUrl={endpointUrl}
              method={method}
              testName={testName}
              payload={payload}
              isLoading={isLoading}
              onEndpointChange={handleEndpointChange}
              onMethodChange={handleMethodChange}
              onTestNameChange={handleTestNameChange}
              onPayloadChange={handlePayloadChange}
              onRunTest={handleRunTest}
              onClearResults={clearResults}
            />
            
            {testResults && (
              <TestResultsSection 
                results={testResults}
              />
            )}
          </TabsContent>
          
          <TabsContent value="history">
            <TestHistorySection 
              history={testHistory}
            />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
