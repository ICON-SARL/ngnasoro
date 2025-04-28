
import { createClient, approveAdhesion } from '@/services/clients/clientService';
import { supabase } from '@/integrations/supabase/client';

describe('Client Creation without Loan', () => {
  const clientData = {
    full_name: 'Test Client Sans Crédit',
    email: 'nocredit@example.com',
    phone: '+22961234567',
    address: 'Cotonou, Bénin',
    sfd_id: 'sfd_123',
    status: 'pending'
  };

  test('SFD can create a client without a loan', async () => {
    // Créer un client
    const clientId = await createClient(clientData);
    expect(clientId).toBeTruthy();

    // Approuver l'adhésion
    const approvalResult = await approveAdhesion(clientId, 'admin_123');
    expect(approvalResult).toBeTruthy();

    // Vérifier que le client existe dans sfd_clients
    const { data: sfdClient, error } = await supabase
      .from('sfd_clients')
      .select('*')
      .eq('id', clientId)
      .single();

    expect(error).toBeNull();
    expect(sfdClient).toBeTruthy();
    expect(sfdClient.status).toBe('validated');

    // Vérifier qu'aucun prêt n'existe pour ce client
    const { data: loans } = await supabase
      .from('sfd_loans')
      .select('*')
      .eq('client_id', clientId);

    expect(loans).toHaveLength(0);
  });
});
