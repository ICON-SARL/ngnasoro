import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

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
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    const { clientId } = await req.json();

    if (!clientId) {
      return new Response(
        JSON.stringify({ success: false, error: 'clientId is required' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    console.log('Recalculating KYC level for client:', clientId);

    // Récupérer le niveau actuel
    const { data: currentClient } = await supabase
      .from('sfd_clients')
      .select('kyc_level')
      .eq('id', clientId)
      .single();

    const oldLevel = currentClient?.kyc_level || 1;

    // Récupérer documents vérifiés
    const { data: documents, error: docsError } = await supabase
      .from('client_documents')
      .select('document_type')
      .eq('client_id', clientId)
      .eq('verified', true);

    if (docsError) {
      console.error('Error fetching documents:', docsError);
      throw docsError;
    }

    const docTypes = new Set(documents?.map(d => d.document_type) || []);
    console.log('Verified document types:', Array.from(docTypes));

    // Calculer nouveau niveau KYC
    let newLevel = 1;

    // Niveau 3: Tous les documents requis
    if (docTypes.has('identity') && 
        docTypes.has('proof_of_address') && 
        docTypes.has('bank_statement')) {
      newLevel = 3;
    }
    // Niveau 2: Pièce d'identité uniquement
    else if (docTypes.has('identity')) {
      newLevel = 2;
    }

    console.log(`KYC Level calculation: ${oldLevel} -> ${newLevel}`);

    // Mettre à jour niveau seulement si changement
    if (newLevel !== oldLevel) {
      const { error: updateError } = await supabase
        .from('sfd_clients')
        .update({ kyc_level: newLevel })
        .eq('id', clientId);

      if (updateError) {
        console.error('Error updating KYC level:', updateError);
        throw updateError;
      }

      // Log audit
      await supabase.from('audit_logs').insert({
        action: 'kyc_level_updated',
        category: 'client',
        severity: 'info',
        status: 'success',
        target_resource: clientId,
        details: { 
          old_level: oldLevel, 
          new_level: newLevel,
          documents: Array.from(docTypes)
        }
      });

      console.log('KYC level updated successfully');
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        oldLevel,
        newLevel,
        changed: newLevel !== oldLevel
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  } catch (error) {
    console.error('Error in recalculate-kyc-level:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
