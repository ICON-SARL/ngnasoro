
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Create Supabase client
const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
const supabase = createClient(supabaseUrl, supabaseKey);

interface MobileMoneyWebhook {
  transaction_id: string;
  amount: number;
  phone_number: string;
  transaction_type: string;
  status: string;
  reference: string;
  timestamp: string;
  provider: string;
  signature: string;
}

serve(async (req: Request) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Parse webhook data
    const webhook: MobileMoneyWebhook = await req.json();
    console.log('Mobile Money webhook received:', webhook);

    // Validate webhook signature (in a real implementation, you would verify the signature)
    // For this example, we'll just log it
    console.log('Webhook signature verification would happen here');

    // Store the webhook in the database
    const { data: storedWebhook, error: webhookError } = await supabase
      .from('mobile_money_webhooks')
      .insert({
        reference_id: webhook.reference,
        amount: webhook.amount,
        phone_number: webhook.phone_number,
        transaction_type: webhook.transaction_type,
        provider: webhook.provider,
        signature: webhook.signature,
        raw_payload: webhook,
        status: 'received'
      })
      .select()
      .single();

    if (webhookError) throw new Error(`Failed to store webhook: ${webhookError.message}`);
    
    // Try to match the webhook to a user based on phone number
    const { data: client } = await supabase
      .from('sfd_clients')
      .select('id, user_id, sfd_id')
      .eq('phone', webhook.phone_number)
      .single();

    if (client?.user_id) {
      console.log('Found matching client:', client);
      
      // Process transaction (deposit or payment confirmation)
      if (webhook.transaction_type === 'payment' || webhook.transaction_type === 'deposit') {
        const { data: transaction, error: txError } = await supabase
          .from('transactions')
          .insert({
            user_id: client.user_id,
            sfd_id: client.sfd_id,
            amount: webhook.amount,
            type: webhook.transaction_type,
            name: `Mobile Money ${webhook.transaction_type}`,
            description: `Transaction Mobile Money via ${webhook.provider}`,
            reference_id: webhook.reference,
            status: 'success',
            payment_method: 'mobile_money',
            provider_reference: webhook.transaction_id
          })
          .select()
          .single();

        if (txError) throw new Error(`Failed to create transaction: ${txError.message}`);
        
        // Update webhook status
        await supabase
          .from('mobile_money_webhooks')
          .update({ 
            status: 'processed',
            user_id: client.user_id,
            processed_at: new Date().toISOString()
          })
          .eq('id', storedWebhook.id);
        
        // Create audit log
        await supabase
          .from('audit_logs')
          .insert({
            user_id: client.user_id,
            action: `mobile_money_${webhook.transaction_type}`,
            category: 'FINANCIAL',
            severity: 'info',
            status: 'success',
            target_resource: 'transactions',
            details: {
              webhook_id: storedWebhook.id,
              transaction_id: transaction.id,
              provider: webhook.provider,
              amount: webhook.amount,
              phone: webhook.phone_number
            }
          });
      }
    } else {
      console.log('No matching client found for phone number:', webhook.phone_number);
      
      // Mark webhook for manual review
      await supabase
        .from('mobile_money_webhooks')
        .update({ 
          status: 'pending_review',
          processed_at: new Date().toISOString()
        })
        .eq('id', storedWebhook.id);
    }

    return new Response(
      JSON.stringify({ success: true, webhook_id: storedWebhook.id }),
      { 
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  } catch (error) {
    console.error('Mobile Money webhook processing error:', error.message);
    
    return new Response(
      JSON.stringify({ 
        success: false,
        error: error.message
      }),
      { 
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
