import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const payload = await req.json();
    const signature = req.headers.get('X-Signature');

    console.log('Mobile Money webhook received:', { 
      operator: payload.operator,
      transactionId: payload.transaction_id,
      hasSignature: !!signature
    });

    // Valider la signature (implémentation spécifique à chaque opérateur)
    // Pour l'instant, on accepte tous les webhooks en développement
    const isValidSignature = true; // TODO: Implémenter validation selon opérateur

    if (!isValidSignature) {
      throw new Error('Invalid webhook signature');
    }

    const { 
      operator, 
      transaction_id, 
      amount, 
      phone_number, 
      status,
      event_type,
      reference,
      timestamp
    } = payload;

    // Vérifier que la transaction n'existe pas déjà
    const { data: existingWebhook } = await supabase
      .from('mobile_money_webhooks')
      .select('id')
      .eq('operator', operator)
      .eq('event_type', event_type)
      .contains('payload', { transaction_id })
      .maybeSingle();

    if (existingWebhook) {
      console.log('Webhook already processed:', transaction_id);
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'Webhook already processed',
          webhook_id: existingWebhook.id
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Enregistrer le webhook
    const { data: webhook, error: webhookError } = await supabase
      .from('mobile_money_webhooks')
      .insert({
        operator,
        event_type,
        payload,
        processed: false
      })
      .select()
      .single();

    if (webhookError) {
      console.error('Error saving webhook:', webhookError);
      throw new Error('Failed to save webhook');
    }

    // Si le statut est "completed", créer la transaction
    if (status === 'completed' || status === 'success') {
      // Trouver l'utilisateur par numéro de téléphone
      const { data: profile } = await supabase
        .from('profiles')
        .select('id')
        .eq('phone', phone_number)
        .maybeSingle();

      if (!profile) {
        console.warn('No user found for phone:', phone_number);
        // Marquer comme traité mais sans créer de transaction
        await supabase
          .from('mobile_money_webhooks')
          .update({ processed: true })
          .eq('id', webhook.id);

        return new Response(
          JSON.stringify({ 
            success: true, 
            message: 'Webhook saved but no user found',
            webhook_id: webhook.id
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Récupérer le client pour obtenir le SFD
      const { data: client } = await supabase
        .from('sfd_clients')
        .select('id, sfd_id')
        .eq('user_id', profile.id)
        .maybeSingle();

      if (!client) {
        console.warn('No client found for user:', profile.id);
        await supabase
          .from('mobile_money_webhooks')
          .update({ processed: true })
          .eq('id', webhook.id);

        return new Response(
          JSON.stringify({ 
            success: true, 
            message: 'Webhook saved but no client found',
            webhook_id: webhook.id
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Créer la transaction
      const { data: transaction, error: transactionError } = await supabase
        .from('transactions')
        .insert({
          user_id: profile.id,
          sfd_id: client.sfd_id,
          amount,
          type: event_type === 'deposit' ? 'deposit' : 'mobile_money_payment',
          payment_method: 'mobile_money',
          status: 'completed',
          reference: reference || transaction_id,
          description: `Mobile Money ${event_type} via ${operator}`
        })
        .select()
        .single();

      if (transactionError) {
        console.error('Error creating transaction:', transactionError);
        // Ne pas échouer le webhook, juste logger
      } else {
        console.log('Transaction created:', transaction.id);

        // Mettre à jour le solde du compte si dépôt
        if (event_type === 'deposit') {
          const { data: account } = await supabase
            .from('accounts')
            .select('id, balance')
            .eq('user_id', profile.id)
            .eq('sfd_id', client.sfd_id)
            .maybeSingle();

          if (account) {
            await supabase
              .from('accounts')
              .update({ 
                balance: (account.balance || 0) + amount,
                updated_at: new Date().toISOString()
              })
              .eq('id', account.id);
          }
        }

        // Notifier l'utilisateur
        await supabase.from('admin_notifications').insert({
          user_id: profile.id,
          type: 'mobile_money_transaction',
          title: 'Transaction Mobile Money',
          message: `${event_type === 'deposit' ? 'Dépôt' : 'Paiement'} de ${amount} FCFA via ${operator} reçu`,
          action_url: `/client/transactions/${transaction.id}`
        });
      }

      // Marquer le webhook comme traité
      await supabase
        .from('mobile_money_webhooks')
        .update({ processed: true })
        .eq('id', webhook.id);
    }

    // Logger dans audit_logs
    await supabase.from('audit_logs').insert({
      action: 'mobile_money_webhook',
      category: 'PAYMENT',
      severity: 'info',
      status: 'success',
      details: {
        webhook_id: webhook.id,
        operator,
        transaction_id,
        amount,
        event_type,
        processed: status === 'completed' || status === 'success'
      }
    });

    console.log('Webhook processed successfully:', webhook.id);

    return new Response(
      JSON.stringify({ 
        success: true, 
        data: webhook,
        message: 'Webhook processed successfully'
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in validate-mobile-money-webhook:', error);
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
