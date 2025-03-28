
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

// Function to generate JWT token for API requests
export const generateApiToken = async (): Promise<string | null> => {
  try {
    // Get current session
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      throw new Error('No active session found');
    }
    
    // Use the access token from Supabase session
    // In a production app, you might want to create a custom token instead
    return session.access_token;
  } catch (error) {
    console.error('Error generating API token:', error);
    toast({
      title: "Erreur d'authentification",
      description: "Impossible de générer le token d'API",
      variant: "destructive"
    });
    return null;
  }
};

// Base API call function
const callMobileApi = async <T>(
  endpoint: string, 
  method: string = 'GET', 
  data?: any
): Promise<T | null> => {
  try {
    const token = await generateApiToken();
    if (!token) {
      throw new Error('Authentication token not available');
    }

    const baseUrl = import.meta.env.PROD 
      ? 'https://xnqysvnychmsockivqhb.supabase.co/functions/v1'
      : 'http://localhost:54321/functions/v1';
    
    const url = `${baseUrl}${endpoint}`;
    
    const headers = {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };
    
    const options: RequestInit = {
      method,
      headers,
      body: data ? JSON.stringify(data) : undefined
    };
    
    const response = await fetch(url, options);
    const result = await response.json();
    
    if (!response.ok) {
      throw new Error(result.error || 'An error occurred with the API request');
    }
    
    return result.data as T;
  } catch (error) {
    console.error(`Error calling mobile API (${endpoint}):`, error);
    toast({
      title: "Erreur API",
      description: error instanceof Error ? error.message : "Une erreur s'est produite",
      variant: "destructive"
    });
    return null;
  }
};

// API specific functions
export const mobileApi = {
  // Get user loans
  getUserLoans: async () => {
    return callMobileApi<any[]>('/user-loans');
  },
  
  // Apply for a new loan
  applyForLoan: async (loanData: {
    amount: number;
    duration_months: number;
    purpose: string;
    sfd_id: string;
    attachments?: string[];
    full_name?: string;
  }) => {
    return callMobileApi<any>('/apply-loan', 'POST', loanData);
  },
  
  // Get notifications
  getNotifications: async (lastFetched?: string) => {
    const endpoint = lastFetched 
      ? `/notifications?last_fetched=${encodeURIComponent(lastFetched)}`
      : '/notifications';
    return callMobileApi<any[]>(endpoint);
  }
};
