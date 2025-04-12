
import { useState, useCallback } from 'react';
import { logAuditEvent } from '@/utils/audit';

export interface TestEndpoint {
  id: string;
  name: string;
  method: string;
  endpoint: string;
  payload: any;
}

export interface TestResult {
  success: boolean;
  response: any;
  time: number;
}

export function useIntegrationTester() {
  const [isLoading, setIsLoading] = useState(false);
  const [testResult, setTestResult] = useState<TestResult | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const runTest = useCallback(async (selectedTest: TestEndpoint, payload: string) => {
    try {
      setIsLoading(true);
      setErrorMessage(null);
      
      // Log the test for audit purposes
      await logAuditEvent({
        category: 'integration',
        action: 'run_integration_test',
        metadata: {
          endpoint: selectedTest.endpoint,
          method: selectedTest.method,
          test_name: selectedTest.name
        }
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
  }, []);

  return {
    isLoading,
    testResult,
    errorMessage,
    runTest
  };
}
