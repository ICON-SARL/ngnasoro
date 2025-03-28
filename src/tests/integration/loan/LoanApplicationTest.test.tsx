
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import SfdLoansPage from '@/pages/SfdLoansPage';
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
      })),
      update: jest.fn(() => ({
        eq: jest.fn(() => ({
          select: jest.fn(() => ({
            single: jest.fn(() => ({
              data: { id: 'mock-id' },
              error: null
            }))
          }))
        }))
      }))
    })),
    functions: {
      invoke: jest.fn(() => ({
        data: {},
        error: null
      }))
    }
  }
}));

describe('Loan Application and Approval Test', () => {
  let queryClient: ReturnType<typeof createTestQueryClient>;

  beforeEach(() => {
    queryClient = createTestQueryClient();
    jest.clearAllMocks();
  });

  test('Client can apply for loan and SFD Admin can approve it', async () => {
    render(
      <TestProviders queryClient={queryClient} initialEntries={['/sfd/loans']}>
        <SfdLoansPage />
      </TestProviders>
    );
    
    // Click on "Nouveau Prêt" button
    const newLoanButton = screen.getByText(/Nouveau Prêt/i);
    fireEvent.click(newLoanButton);
    
    // Fill loan form
    const clientSelect = screen.getByText(/Sélectionner un client/i);
    fireEvent.click(clientSelect);
    const clientOption = screen.getByText(/Test Client/i);
    fireEvent.click(clientOption);
    
    const amountInput = screen.getByLabelText(/Montant/i);
    const durationInput = screen.getByLabelText(/Durée/i);
    const rateInput = screen.getByLabelText(/Taux d'intérêt/i);
    const purposeInput = screen.getByLabelText(/Objet du prêt/i);
    
    fireEvent.change(amountInput, { target: { value: '100000' } });
    fireEvent.change(durationInput, { target: { value: '12' } });
    fireEvent.change(rateInput, { target: { value: '5' } });
    fireEvent.change(purposeInput, { target: { value: 'Test loan purpose' } });
    
    // Submit loan application
    const loanSubmitButton = screen.getByText(/Créer le prêt/i);
    fireEvent.click(loanSubmitButton);
    
    // Wait for loan creation
    await waitFor(() => {
      expect(supabase.from).toHaveBeenCalledWith('sfd_loans');
    });
    
    // Navigate to loan details
    const viewDetailsButton = screen.getByText(/Détails/i);
    fireEvent.click(viewDetailsButton);
    
    // Approve the loan
    const approveButton = screen.getByText(/Approuver/i);
    fireEvent.click(approveButton);
    
    // Wait for loan approval
    await waitFor(() => {
      expect(supabase.from).toHaveBeenCalledWith('sfd_loans');
      expect(supabase.functions.invoke).toHaveBeenCalledWith('api-gateway', {
        body: expect.stringContaining('loan-status-webhooks')
      });
    });
  });
});
