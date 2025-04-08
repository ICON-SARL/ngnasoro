
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.31.0'
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Create a Supabase client with the service role key for privileged operations
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    console.log("Starting dashboard data initialization...");
    
    // Get all SFDs
    const { data: sfds, error: sfdsError } = await supabase
      .from('sfds')
      .select('id, name');
      
    if (sfdsError) throw sfdsError;
    
    if (!sfds || sfds.length === 0) {
      return new Response(
        JSON.stringify({ success: false, message: "No SFDs found" }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    const results = [];
    
    // For each SFD, generate sample data if none exists
    for (const sfd of sfds) {
      console.log(`Processing SFD: ${sfd.name} (${sfd.id})`);
      
      // Check if SFD has any clients
      const { count: clientCount, error: clientError } = await supabase
        .from('sfd_clients')
        .select('*', { count: 'exact', head: true })
        .eq('sfd_id', sfd.id);
        
      if (clientError) throw clientError;
      
      // If no clients, generate sample clients
      if (clientCount === 0) {
        console.log(`No clients found for SFD ${sfd.name}, generating sample data...`);
        
        // Generate between 80 and 150 sample clients
        const clientsToCreate = Math.floor(Math.random() * 70) + 80;
        
        const clients = [];
        const clientStatuses = ['pending', 'validated', 'rejected'];
        const regions = ['Dakar', 'Saint-Louis', 'Thiès', 'Ziguinchor', 'Diourbel', 'Kaolack'];
        
        for (let i = 1; i <= clientsToCreate; i++) {
          const randomStatus = clientStatuses[Math.floor(Math.random() * clientStatuses.length)];
          const randomRegion = regions[Math.floor(Math.random() * regions.length)];
          
          clients.push({
            sfd_id: sfd.id,
            full_name: `Client ${i} de ${sfd.name}`,
            email: `client${i}_${sfd.id.substring(0, 5)}@example.com`,
            phone: `+221${Math.floor(Math.random() * 90000000) + 700000000}`,
            status: randomStatus,
            address: `Adresse ${i}, ${randomRegion}`,
            id_type: Math.random() > 0.5 ? 'national_id' : 'passport',
            id_number: `ID${Math.floor(Math.random() * 1000000)}`,
            kyc_level: Math.floor(Math.random() * 3),
            created_at: new Date(Date.now() - Math.floor(Math.random() * 30 * 24 * 60 * 60 * 1000)).toISOString()
          });
        }
        
        // Insert clients in batches of 20
        for (let i = 0; i < clients.length; i += 20) {
          const batch = clients.slice(i, i + 20);
          const { error: insertError } = await supabase
            .from('sfd_clients')
            .insert(batch);
            
          if (insertError) {
            console.error(`Error inserting client batch: ${insertError.message}`);
          }
        }
        
        results.push({
          sfd: sfd.name,
          clients_created: clients.length,
          status: 'success'
        });
      } else {
        results.push({
          sfd: sfd.name,
          clients_created: 0,
          status: 'skipped',
          message: 'Clients already exist'
        });
      }
      
      // Check if SFD has any loans
      const { count: loanCount, error: loanError } = await supabase
        .from('sfd_loans')
        .select('*', { count: 'exact', head: true })
        .eq('sfd_id', sfd.id);
        
      if (loanError) throw loanError;
      
      // If no loans, generate sample loans
      if (loanCount === 0) {
        console.log(`No loans found for SFD ${sfd.name}, generating sample loans...`);
        
        // Get client IDs for this SFD
        const { data: clientIds, error: clientIdsError } = await supabase
          .from('sfd_clients')
          .select('id')
          .eq('sfd_id', sfd.id)
          .eq('status', 'validated');
          
        if (clientIdsError) throw clientIdsError;
        
        if (clientIds && clientIds.length > 0) {
          // Generate between 30 and 60 sample loans
          const loansToCreate = Math.floor(Math.random() * 30) + 30;
          
          const loans = [];
          const loanStatuses = ['pending', 'approved', 'active', 'completed', 'rejected'];
          const loanPurposes = [
            'Financement d\'agriculture', 
            'Commerce de détail', 
            'Achat d\'équipement', 
            'Rénovation', 
            'Expansion d\'entreprise'
          ];
          
          for (let i = 1; i <= loansToCreate; i++) {
            const randomStatus = loanStatuses[Math.floor(Math.random() * loanStatuses.length)];
            const randomPurpose = loanPurposes[Math.floor(Math.random() * loanPurposes.length)];
            const randomClientId = clientIds[Math.floor(Math.random() * clientIds.length)].id;
            const amount = Math.floor(Math.random() * 4500000) + 500000; // Between 500,000 and 5,000,000
            const duration = Math.floor(Math.random() * 24) + 6; // Between 6 and 30 months
            const interestRate = Math.random() * 10 + 5; // Between 5% and 15%
            const monthlyPayment = amount * (1 + interestRate/100) / duration;
            
            loans.push({
              sfd_id: sfd.id,
              client_id: randomClientId,
              amount,
              duration_months: duration,
              interest_rate: interestRate,
              monthly_payment: Math.round(monthlyPayment),
              purpose: randomPurpose,
              status: randomStatus,
              created_at: new Date(Date.now() - Math.floor(Math.random() * 90 * 24 * 60 * 60 * 1000)).toISOString()
            });
          }
          
          // Insert loans in batches of 20
          for (let i = 0; i < loans.length; i += 20) {
            const batch = loans.slice(i, i + 20);
            const { error: insertError } = await supabase
              .from('sfd_loans')
              .insert(batch);
              
            if (insertError) {
              console.error(`Error inserting loan batch: ${insertError.message}`);
            }
          }
          
          results.push({
            sfd: sfd.name,
            loans_created: loans.length,
            status: 'success'
          });
        } else {
          results.push({
            sfd: sfd.name,
            loans_created: 0,
            status: 'skipped',
            message: 'No validated clients available'
          });
        }
      } else {
        results.push({
          sfd: sfd.name,
          loans_created: 0,
          status: 'skipped',
          message: 'Loans already exist'
        });
      }
      
      // Check if SFD has any subsidy requests
      const { count: requestCount, error: requestError } = await supabase
        .from('subsidy_requests')
        .select('*', { count: 'exact', head: true })
        .eq('sfd_id', sfd.id);
        
      if (requestError) throw requestError;
      
      // If no subsidy requests, generate sample requests
      if (requestCount === 0) {
        console.log(`No subsidy requests found for SFD ${sfd.name}, generating sample requests...`);
        
        // Generate between 3 and 8 sample subsidy requests
        const requestsToCreate = Math.floor(Math.random() * 5) + 3;
        
        // Get admin user IDs for this SFD (fallback to first admin if none found)
        const { data: adminUsers, error: adminUsersError } = await supabase
          .from('user_roles')
          .select('user_id')
          .eq('role', 'sfd_admin');
          
        if (adminUsersError) throw adminUsersError;
        
        const adminId = adminUsers && adminUsers.length > 0 ? 
          adminUsers[Math.floor(Math.random() * adminUsers.length)].user_id :
          '59d6d3eb-899b-4829-8975-d1cd7acb4758'; // Default SFD admin
        
        const requests = [];
        const requestStatuses = ['pending', 'approved', 'rejected'];
        const priorities = ['low', 'normal', 'high', 'urgent'];
        const purposes = [
          'Programme de microfinance rurale',
          'Soutien aux petites entreprises',
          'Financement de l\'agriculture',
          'Prêts pour femmes entrepreneures',
          'Programme d\'inclusion financière'
        ];
        
        for (let i = 1; i <= requestsToCreate; i++) {
          const randomStatus = requestStatuses[Math.floor(Math.random() * requestStatuses.length)];
          const randomPriority = priorities[Math.floor(Math.random() * priorities.length)];
          const randomPurpose = purposes[Math.floor(Math.random() * purposes.length)];
          const amount = Math.floor(Math.random() * 45000000) + 5000000; // Between 5M and 50M
          
          requests.push({
            sfd_id: sfd.id,
            requested_by: adminId,
            amount,
            purpose: randomPurpose,
            justification: `Justification pour ${randomPurpose}`,
            expected_impact: 'Amélioration des conditions de vie et de l\'économie locale',
            priority: randomPriority,
            status: randomStatus,
            created_at: new Date(Date.now() - Math.floor(Math.random() * 60 * 24 * 60 * 60 * 1000)).toISOString()
          });
        }
        
        // Insert subsidy requests
        const { error: insertError } = await supabase
          .from('subsidy_requests')
          .insert(requests);
          
        if (insertError) {
          console.error(`Error inserting subsidy requests: ${insertError.message}`);
          results.push({
            sfd: sfd.name,
            requests_created: 0,
            status: 'error',
            message: insertError.message
          });
        } else {
          results.push({
            sfd: sfd.name,
            requests_created: requests.length,
            status: 'success'
          });
        }
      } else {
        results.push({
          sfd: sfd.name,
          requests_created: 0,
          status: 'skipped',
          message: 'Subsidy requests already exist'
        });
      }
    }

    return new Response(
      JSON.stringify({ success: true, results }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error("Edge function error:", error);
    
    return new Response(
      JSON.stringify({ success: false, message: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});
