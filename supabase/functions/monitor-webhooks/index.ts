
// Follow Deno Edge Function conventions
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders } from "../_shared/cors.ts";

const corsWrapper = (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      headers: corsHeaders,
    });
  }
};

serve(async (req) => {
  // Handle CORS
  const corsResponse = corsWrapper(req);
  if (corsResponse) return corsResponse;

  try {
    const { limit = 10 } = await req.json();
    
    // Log the request
    console.log(`Webhook monitoring request, limit: ${limit}`);
    
    // This is a mock implementation
    // In production, this would query your transaction_audit_logs table
    
    const mockTransactions = [
      {
        id: '1',
        webhook_id: 'wh_123456',
        provider: 'Mobile Money',
        status: 'success',
        amount: 25000,
        reference_id: 'mm_tx_123456',
        created_at: new Date().toISOString(),
        transaction_type: 'payment'
      },
      {
        id: '2',
        webhook_id: 'wh_123457',
        provider: 'Mobile Money',
        status: 'failed',
        amount: 15000,
        reference_id: 'mm_tx_123457',
        created_at: new Date(Date.now() - 3600000).toISOString(),
        transaction_type: 'transfer'
      },
      {
        id: '3',
        webhook_id: 'wh_123458',
        provider: 'Mobile Money',
        status: 'success',
        amount: 50000,
        reference_id: 'mm_tx_123458',
        created_at: new Date(Date.now() - 7200000).toISOString(),
        transaction_type: 'withdrawal'
      }
    ];
    
    return new Response(
      JSON.stringify(mockTransactions.slice(0, limit)),
      {
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
        status: 200,
      }
    );
  } catch (error) {
    console.error("Error in monitor-webhooks function:", error);
    
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
        status: 400,
      }
    );
  }
});
