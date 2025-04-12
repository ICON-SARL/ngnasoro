
import { useState, useEffect, useCallback } from 'react';
import { logAuditEvent } from '@/utils/audit';

// Mock data for demonstration purposes
const mockWebhooks = [
  {
    id: '1a2b3c4d-5e6f-7g8h-9i0j-1k2l3m4n5o6p',
    provider: 'Orange Money',
    type: 'PAYMENT',
    status: 'success',
    reference: 'OM123456789',
    receivedAt: new Date(Date.now() - 1000 * 60 * 5).toISOString(), // 5 minutes ago
    payload: { amount: 5000, phone: '+22501234567', status: 'SUCCESS' }
  },
  {
    id: '2b3c4d5e-6f7g-8h9i-0j1k-2l3m4n5o6p7q',
    provider: 'MTN Mobile Money',
    type: 'PAYMENT',
    status: 'failed',
    reference: 'MTN987654321',
    receivedAt: new Date(Date.now() - 1000 * 60 * 15).toISOString(), // 15 minutes ago
    payload: { amount: 10000, phone: '+22507654321', status: 'FAILED', error: 'INSUFFICIENT_FUNDS' }
  },
  {
    id: '3c4d5e6f-7g8h-9i0j-1k2l-3m4n5o6p7q8r',
    provider: 'Moov Money',
    type: 'REFUND',
    status: 'pending',
    reference: 'MOOV456789123',
    receivedAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(), // 30 minutes ago
    payload: { amount: 2500, phone: '+22509876543', status: 'PENDING' }
  },
  {
    id: '4d5e6f7g-8h9i-0j1k-2l3m-4n5o6p7q8r9s',
    provider: 'Orange Money',
    type: 'VERIFICATION',
    status: 'success',
    reference: 'OM567891234',
    receivedAt: new Date(Date.now() - 1000 * 60 * 60).toISOString(), // 1 hour ago
    payload: { phone: '+22504567890', status: 'VERIFIED' }
  },
  {
    id: '5e6f7g8h-9i0j-1k2l-3m4n-5o6p7q8r9s0t',
    provider: 'MTN Mobile Money',
    type: 'PAYMENT',
    status: 'success',
    reference: 'MTN234567891',
    receivedAt: new Date(Date.now() - 1000 * 60 * 120).toISOString(), // 2 hours ago
    payload: { amount: 7500, phone: '+22508765432', status: 'SUCCESS' }
  }
];

export function useWebhookMonitor() {
  const [webhooks, setWebhooks] = useState(mockWebhooks);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Filter webhooks based on search query and status filter
  const filteredWebhooks = webhooks.filter(webhook => {
    const matchesSearch = 
      webhook.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      webhook.provider.toLowerCase().includes(searchQuery.toLowerCase()) ||
      webhook.reference.toLowerCase().includes(searchQuery.toLowerCase()) ||
      webhook.type.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || webhook.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  // Function to refresh webhook data
  const refreshWebhooks = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Log the refresh action
      await logAuditEvent({
        category: 'monitoring',
        action: 'refresh_webhooks',
        metadata: {
          triggered_by: 'manual',
          timestamp: new Date().toISOString()
        }
      });

      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // In a real application, this would fetch data from the API
      setWebhooks(mockWebhooks.map(webhook => ({
        ...webhook,
        receivedAt: new Date(Date.now() - Math.random() * 1000 * 60 * 180).toISOString() // Random time within last 3 hours
      })));
      
    } catch (err) {
      console.error("Webhook refresh error:", err);
      setError("Une erreur s'est produite lors de l'actualisation des webhooks.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Load initial data
  useEffect(() => {
    refreshWebhooks();
  }, [refreshWebhooks]);

  return {
    webhooks,
    isLoading,
    error,
    refreshWebhooks,
    statusFilter,
    setStatusFilter,
    searchQuery,
    setSearchQuery,
    filteredWebhooks
  };
}
