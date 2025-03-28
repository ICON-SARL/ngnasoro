
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { SfdManagement } from '@/components/admin/SfdManagement';
import ClientsManagement from '@/components/sfd/ClientsManagement';
import SfdLoansPage from '@/pages/SfdLoansPage';
import { AuthProvider } from '@/hooks/auth/AuthProvider';
import { ToastProvider } from '@/hooks/use-toast';

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
    }),
    functions: {
      invoke: jest.fn(() => ({
        data: {},
        error: null
      }))
    }
  }
}));

// Query client setup for tests
const createTestQueryClient = () => new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
      cacheTime: 0,
      staleTime: 0,
    },
  },
});

describe('Admin Client Loan Flow Integration Test', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = createTestQueryClient();
    jest.clearAllMocks();
  });

  test('Super Admin creates SFD, SFD Admin adds client, Client applies for loan, SFD Admin approves', async () => {
    // Step 1: Super Admin creates a SFD
    const { rerender } = render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={['/admin/sfds']}>
          <AuthProvider>
            <ToastProvider>
              <SfdManagement />
            </ToastProvider>
          </AuthProvider>
        </MemoryRouter>
      </QueryClientProvider>
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
    
    // Step 2: SFD Admin adds a client
    rerender(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={['/sfd/clients']}>
          <AuthProvider>
            <ToastProvider>
              <ClientsManagement />
            </ToastProvider>
          </AuthProvider>
        </MemoryRouter>
      </QueryClientProvider>
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
    
    // Step 3: Client applies for loan, then SFD Admin approves
    rerender(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={['/sfd/loans']}>
          <AuthProvider>
            <ToastProvider>
              <SfdLoansPage />
            </ToastProvider>
          </AuthProvider>
        </MemoryRouter>
      </QueryClientProvider>
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
