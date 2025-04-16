
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import * as pdfMake from "https://esm.sh/pdfmake@0.2.7";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Create Supabase client
const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
const supabase = createClient(supabaseUrl, supabaseKey);

serve(async (req: Request) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Parse transaction ID from URL or request body
    const url = new URL(req.url);
    const transactionId = url.searchParams.get('id');
    
    if (!transactionId) {
      const body = await req.json();
      if (!body.id) {
        throw new Error('Transaction ID is required');
      }
    }

    console.log('Generating receipt for transaction:', transactionId);

    // Fetch transaction details
    const { data: transaction, error: txError } = await supabase
      .from('transactions')
      .select(`
        *,
        sfds:sfd_id (name, logo_url),
        profiles:user_id (full_name)
      `)
      .eq('id', transactionId)
      .single();

    if (txError) throw new Error(`Failed to fetch transaction: ${txError.message}`);
    if (!transaction) throw new Error('Transaction not found');

    // Format date nicely
    const transactionDate = new Date(transaction.created_at);
    const formattedDate = `${transactionDate.toLocaleDateString()} ${transactionDate.toLocaleTimeString()}`;
    
    // Create PDF content
    const docDefinition = {
      content: [
        { text: 'REÇU DE TRANSACTION', style: 'header' },
        { text: `SFD: ${transaction.sfds?.name || 'N/A'}`, style: 'subheader' },
        { text: `Date: ${formattedDate}`, style: 'subheader' },
        { text: `Référence: ${transaction.reference_id || transaction.id}`, style: 'subheader' },
        { text: '\n' },
        {
          table: {
            widths: ['*', '*'],
            body: [
              [{ text: 'Détails de la transaction', style: 'tableHeader', colSpan: 2 }, {}],
              ['Type', transaction.type.toUpperCase()],
              ['Montant', `${Math.abs(transaction.amount).toLocaleString()} FCFA`],
              ['Client', transaction.profiles?.full_name || 'N/A'],
              ['Description', transaction.description || 'N/A'],
              ['Statut', transaction.status.toUpperCase()],
            ]
          }
        },
        { text: '\n' },
        { text: 'Ce reçu est généré électroniquement et ne nécessite pas de signature.', style: 'footer' },
        { text: `ID: ${transaction.id}`, style: 'footer' },
        { text: 'Conservez ce reçu comme preuve de votre transaction.', style: 'footer' },
      ],
      styles: {
        header: { fontSize: 18, bold: true, alignment: 'center', margin: [0, 0, 0, 10] },
        subheader: { fontSize: 14, margin: [0, 5, 0, 5] },
        tableHeader: { bold: true, fontSize: 13, color: 'black' },
        footer: { fontSize: 8, alignment: 'center', margin: [0, 10, 0, 0] }
      }
    };

    // Generate PDF (in a real implementation this would create and store the PDF)
    // For this example, we'll just return the transaction data that would be used to generate the PDF
    
    const receiptData = {
      success: true,
      fileName: `transaction_receipt_${transaction.id}.pdf`,
      transaction: {
        id: transaction.id,
        type: transaction.type,
        amount: transaction.amount,
        date: formattedDate,
        reference: transaction.reference_id,
        client: transaction.profiles?.full_name,
        sfd: transaction.sfds?.name,
        status: transaction.status
      }
    };

    return new Response(JSON.stringify(receiptData), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Receipt generation error:', error.message);
    
    return new Response(JSON.stringify({
      success: false,
      errorMessage: error.message,
    }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
