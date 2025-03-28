
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { SfdManagement } from '@/components/admin/SfdManagement';
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

describe('SFD Creation Test', () => {
  let queryClient: ReturnType<typeof createTestQueryClient>;

  beforeEach(() => {
    queryClient = createTestQueryClient();
    jest.clearAllMocks();
  });

  test('Super Admin can create a new SFD', async () => {
    render(
      <TestProviders queryClient={queryClient} initialEntries={['/admin/sfds']}>
        <SfdManagement />
      </TestProviders>
    );

    // Mock SFD creation
    const addSfdButton = screen.getByText(/Ajouter une SFD/i);
    fireEvent.click(addSfdButton);
    
    // Fill the form
    const nameInput = screen.getByLabelText(/Nom/i);
    const codeInput = screen.getByLabelText(/Code/i);
    const regionInput = screen.getByLabelText(/Région/i);
    
    fireEvent.change(nameInput, { target: { value: 'Test SFD' } });
    fireEvent.change(codeInput, { target: { value: 'TST001' } });
    fireEvent.change(regionInput, { target: { value: 'Dakar' } });
    
    // Submit form
    const submitButton = screen.getByText(/Créer/i);
    fireEvent.click(submitButton);
    
    // Wait for SFD creation
    await waitFor(() => {
      expect(supabase.from).toHaveBeenCalledWith('sfds');
    });
  });
});
