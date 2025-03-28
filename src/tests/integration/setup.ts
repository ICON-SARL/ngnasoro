
// Integration test setup file
import { supabase } from '@/integrations/supabase/client';

/**
 * Runs before all integration tests to set up test environment
 */
export async function setupIntegrationTests() {
  // Create necessary database indexes for performance optimization
  try {
    await supabase.rpc('create_performance_indexes');
    console.log('Performance indexes created successfully for tests');
  } catch (error) {
    console.error('Failed to create performance indexes:', error);
  }
  
  // Create test users
  try {
    await supabase.functions.invoke('create-test-accounts', {
      body: JSON.stringify({
        createSuperAdmin: true,
        createSfdAdmin: true,
        createClient: true
      })
    });
    console.log('Test accounts created successfully');
  } catch (error) {
    console.error('Failed to create test accounts:', error);
  }
}

/**
 * Runs after all integration tests to clean up test environment
 */
export async function teardownIntegrationTests() {
  // Clean up test data
  try {
    const testDataIds = [
      'test-super-admin-id',
      'test-sfd-admin-id',
      'test-client-id',
      'test-sfd-id',
      'test-loan-id'
    ];
    
    // Clean up in reverse order to avoid foreign key constraints
    await supabase.from('loan_activities').delete().in('loan_id', [testDataIds[4]]);
    await supabase.from('sfd_loans').delete().in('id', [testDataIds[4]]);
    await supabase.from('sfd_clients').delete().in('id', [testDataIds[2]]);
    await supabase.from('sfds').delete().in('id', [testDataIds[3]]);
    
    console.log('Test data cleaned up successfully');
  } catch (error) {
    console.error('Failed to clean up test data:', error);
  }
}
