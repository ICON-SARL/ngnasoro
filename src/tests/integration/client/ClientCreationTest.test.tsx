
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import ClientsManagement from '@/components/sfd/ClientsManagement';
import { supabase } from '@/integrations/supabase/client';
import { createTestQueryClient } from '../../utils/testQueryClient';
import { TestProviders } from '../../utils/TestProviders';

// Mock Supabase client
jest.mock('@/integrations/supabase/client', () => ({
  supabase: {
    from: jest.fn(() => ({
      insert: jest.fn(() => ({
        select: jest.fn(() => ({
          single: jest.fn(() => ({
            data: { id: 'mock-id' },
            error: null
          }))
        }))
      })),
      select: jest.fn(() => ({
        eq: jest.fn(() => ({
          single: jest.fn(() => ({
            data: { id: 'mock-id' },
            error: null
          }))
        })),
        order: jest.fn(() => ({
          data: [],
          error: null
        }))
      }))
    }))
  }
}));

describe('Client Creation Test', () => {
  let queryClient: ReturnType<typeof createTestQueryClient>;

  beforeEach(() => {
    queryClient = createTestQueryClient();
    jest.clearAllMocks();
  });

  test('SFD Admin can add a new client', async () => {
    render(
      <TestProviders queryClient={queryClient} initialEntries={['/sfd/clients']}>
        <ClientsManagement />
      </TestProviders>
    );
    
    // Click on "Nouveau Client" button
    const newClientButton = screen.getByText(/Nouveau Client/i);
    fireEvent.click(newClientButton);
    
    // Fill client form
    const fullNameInput = screen.getByLabelText(/Nom complet/i);
    const phoneInput = screen.getByLabelText(/Téléphone/i);
    const emailInput = screen.getByLabelText(/Email/i);
    
    fireEvent.change(fullNameInput, { target: { value: 'Test Client' } });
    fireEvent.change(phoneInput, { target: { value: '+221777777777' } });
    fireEvent.change(emailInput, { target: { value: 'test.client@example.com' } });
    
    // Submit client form
    const clientSubmitButton = screen.getByText(/Enregistrer/i);
    fireEvent.click(clientSubmitButton);
    
    // Wait for client creation
    await waitFor(() => {
      expect(supabase.from).toHaveBeenCalledWith('sfd_clients');
    });
  });
});
