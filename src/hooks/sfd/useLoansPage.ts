import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { loanService } from '@/utils/sfdLoanApi';
import { useAuth } from '@/hooks/useAuth';
import { Loan } from '@/types/sfdClients';

interface LoanFormData {
  client_id: string;
  amount: string;
  duration_months: string;
  interest_rate: string;
  purpose: string;
  subsidy_requested: boolean;
  subsidy_amount: string;
  subsidy_justification: string;
}

interface LoanPaginationData {
  loans: Loan[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export function useLoansPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loans, setLoans] = useState<Loan[]>([]);
  const [loading, setLoading] = useState(true);
  const [openNewLoanDialog, setOpenNewLoanDialog] = useState(false);
  const [openSubsidyRequestDialog, setOpenSubsidyRequestDialog] = useState(false);
  const [activeTab, setActiveTab] = useState('all');
  
  // New loan form state
  const [loanForm, setLoanForm] = useState<LoanFormData>({
    client_id: '',
    amount: '',
    duration_months: '',
    interest_rate: '',
    purpose: '',
    subsidy_requested: false,
    subsidy_amount: '',
    subsidy_justification: ''
  });
  
  // Fetch loans on component mount
  useEffect(() => {
    fetchLoans();
  }, []);
  
  const fetchLoans = async () => {
    setLoading(true);
    try {
      const loansData = await loanService.getSfdLoans();
      
      // Fix the type issue by only setting the loans array
      if (Array.isArray(loansData)) {
        // Convert to the local Loan type to avoid type conflicts
        setLoans(loansData as unknown as Loan[]);
      } else if (loansData && 'loans' in loansData) {
        // If it's a pagination object, just set the loans array
        setLoans((loansData as LoanPaginationData).loans as unknown as Loan[]);
      } else {
        setLoans([]);
      }
    } catch (error) {
      console.error('Error fetching loans:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de charger les prêts',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type, checked } = e.target as HTMLInputElement;
    setLoanForm({
      ...loanForm,
      [name]: type === 'checkbox' ? checked : value
    });
  };
  
  const handleSelectChange = (name: string, value: string) => {
    setLoanForm({
      ...loanForm,
      [name]: value
    });
  };
  
  const handleCreateLoan = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      // Calculate monthly payment (simplified formula)
      const amount = parseFloat(loanForm.amount);
      const rate = parseFloat(loanForm.interest_rate) / 100 / 12; // Monthly interest rate
      const duration = parseInt(loanForm.duration_months);
      const monthlyPayment = (amount * rate * Math.pow(1 + rate, duration)) / (Math.pow(1 + rate, duration) - 1);
      
      // Create loan data
      const loanData = {
        client_id: loanForm.client_id,
        sfd_id: user?.sfd_id, // Assuming user has sfd_id
        amount: amount,
        duration_months: duration,
        interest_rate: parseFloat(loanForm.interest_rate),
        purpose: loanForm.purpose,
        monthly_payment: monthlyPayment,
        subsidy_amount: loanForm.subsidy_requested ? parseFloat(loanForm.subsidy_amount) : 0,
      };
      
      await loanService.createLoan(loanData);
      
      // If subsidy requested, create a subsidy request
      if (loanForm.subsidy_requested && parseFloat(loanForm.subsidy_amount) > 0) {
        // This would be handled by a separate API call to create a subsidy request
        toast({
          title: 'Demande de subvention créée',
          description: 'Votre demande de subvention a été soumise au MEREF',
        });
      }
      
      toast({
        title: 'Prêt créé',
        description: 'Le prêt a été créé avec succès',
      });
      
      // Reset form and close dialog
      setLoanForm({
        client_id: '',
        amount: '',
        duration_months: '',
        interest_rate: '',
        purpose: '',
        subsidy_requested: false,
        subsidy_amount: '',
        subsidy_justification: ''
      });
      setOpenNewLoanDialog(false);
      
      // Refresh loans list
      fetchLoans();
      
    } catch (error) {
      console.error('Error creating loan:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de créer le prêt',
        variant: 'destructive',
      });
    }
  };
  
  const handleCreateSubsidyRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      toast({
        title: 'Demande de subvention soumise',
        description: 'Votre demande a été soumise au MEREF pour approbation',
      });
      setOpenSubsidyRequestDialog(false);
    } catch (error) {
      toast({
        title: 'Erreur',
        description: 'Impossible de créer la demande de subvention',
        variant: 'destructive',
      });
    }
  };
  
  // Mock clients for the demo
  const clients = [
    { id: 'client1', full_name: 'Aissatou Diallo' },
    { id: 'client2', full_name: 'Mamadou Sy' },
    { id: 'client3', full_name: 'Fatou Ndiaye' },
    { id: 'client4', full_name: 'Ibrahim Sow' },
  ];

  return {
    loans,
    loading,
    activeTab,
    setActiveTab,
    openNewLoanDialog,
    setOpenNewLoanDialog,
    openSubsidyRequestDialog,
    setOpenSubsidyRequestDialog,
    loanForm,
    handleInputChange,
    handleSelectChange,
    handleCreateLoan,
    handleCreateSubsidyRequest,
    clients,
  };
}
