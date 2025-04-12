
import { useState, useCallback } from 'react';
import { AuditLogCategory, AuditLogSeverity } from '@/utils/audit/auditLoggerTypes';
import { logAuditEvent } from '@/utils/audit/auditLoggerCore';
import { useAuth } from '@/hooks/useAuth';

export interface TestResult {
  status: number | null;
  data: any;
  duration: number;
  timestamp: number;
}

export interface TestHistoryItem {
  testName: string;
  endpoint: string;
  method: string;
  status: number;
  duration: number;
  timestamp: number;
}

export function useIntegrationTester() {
  const [endpointUrl, setEndpointUrl] = useState<string>('');
  const [method, setMethod] = useState<string>('GET');
  const [testName, setTestName] = useState<string>('');
  const [payload, setPayload] = useState<string>('');
  const [testResults, setTestResults] = useState<TestResult | null>(null);
  const [testHistory, setTestHistory] = useState<TestHistoryItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const { user } = useAuth();

  const handleRunTest = useCallback(async () => {
    if (!endpointUrl) return;
    
    setIsLoading(true);
    const startTime = performance.now();

    try {
      await logAuditEvent({
        user_id: user?.id || 'anonymous',
        category: AuditLogCategory.INTEGRATION,
        action: 'run_api_test',
        status: 'success',
        severity: AuditLogSeverity.INFO,
        metadata: {
          endpoint: endpointUrl,
          method,
          test_name: testName
        }
      });

      const options: RequestInit = {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
      };

      if (method !== 'GET' && payload) {
        try {
          options.body = JSON.stringify(JSON.parse(payload));
        } catch (error) {
          options.body = payload;
        }
      }

      const response = await fetch(endpointUrl, options);
      const endTime = performance.now();
      const duration = Math.round(endTime - startTime);
      
      let data;
      try {
        data = await response.json();
      } catch (error) {
        data = { message: 'Non-JSON response or empty body' };
      }

      const result: TestResult = {
        status: response.status,
        data,
        duration,
        timestamp: Date.now()
      };

      setTestResults(result);
      
      // Add to history only if we have a status
      if (response.status) {
        const historyItem: TestHistoryItem = {
          testName: testName || endpointUrl,
          endpoint: endpointUrl,
          method,
          status: response.status,
          duration,
          timestamp: Date.now()
        };
        
        setTestHistory(prev => [historyItem, ...prev]);
      }
    } catch (error) {
      console.error('Error running test:', error);
      const endTime = performance.now();
      
      setTestResults({
        status: null,
        data: { error: error instanceof Error ? error.message : 'Unknown error' },
        duration: Math.round(endTime - startTime),
        timestamp: Date.now()
      });
    } finally {
      setIsLoading(false);
    }
  }, [endpointUrl, method, payload, testName, user?.id]);

  const clearResults = useCallback(() => {
    setTestResults(null);
  }, []);

  return {
    endpointUrl,
    method,
    testName,
    payload,
    testResults,
    testHistory,
    isLoading,
    handleEndpointChange: setEndpointUrl,
    handleMethodChange: setMethod,
    handleTestNameChange: setTestName,
    handlePayloadChange: setPayload,
    handleRunTest,
    clearResults
  };
}
