
export const formatCurrencyAmount = (amount: number): string => {
  // Format the amount to include thousands separator
  return amount.toLocaleString('fr-FR');
};

export const convertDatabaseRecordsToTransactions = (data: any[], sfdId: string) => {
  return data.map(record => ({
    ...record,
    sfd_id: sfdId,
    id: record.id || `tx-${Date.now()}-${Math.random().toString(36).substring(2, 15)}`
  }));
};

export const generateMockTransactions = (sfdId: string) => {
  // This function creates mock transactions for demo purposes
  const mockTransactions = [
    {
      id: `tx-${Date.now()}-1`,
      type: 'deposit',
      amount: 50000,
      name: 'Dépôt initial',
      description: 'Dépôt initial sur votre compte',
      created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
      status: 'success',
      sfd_id: sfdId
    },
    {
      id: `tx-${Date.now()}-2`,
      type: 'withdrawal',
      amount: -15000,
      name: 'Retrait',
      description: 'Retrait pour dépenses personnelles',
      created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
      status: 'success',
      sfd_id: sfdId
    },
    {
      id: `tx-${Date.now()}-3`,
      type: 'deposit',
      amount: 25000,
      name: 'Dépôt',
      description: 'Dépôt mensuel',
      created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      status: 'success',
      sfd_id: sfdId
    }
  ];
  
  return mockTransactions;
};
