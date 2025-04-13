
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { corsHeaders } from "../_shared/cors.ts";

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Get the request body
    const body = await req.json();
    
    // Validation des paramètres requis
    if (!body || !body.sfdId || !body.fromAccountId || !body.toPhone || !body.amount) {
      throw new Error("Paramètres manquants pour le transfert");
    }

    // Simulation du transfert (à remplacer par l'intégration réelle)
    const transferResult = {
      success: true,
      transferId: `tf-${Date.now()}`,
      amount: body.amount,
      from: body.fromAccountId,
      to: body.toPhone,
      timestamp: new Date().toISOString(),
      message: "Transfert effectué avec succès"
    };
    
    // Log the successful transfer
    console.log("Transfert réussi:", JSON.stringify(transferResult));

    // Return successful response
    return new Response(
      JSON.stringify(transferResult),
      { 
        headers: { 
          ...corsHeaders,
          "Content-Type": "application/json" 
        }, 
        status: 200 
      }
    );
  } catch (error) {
    // Log the error
    console.error("Erreur de transfert:", error.message);
    
    // Return error response
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message 
      }),
      { 
        headers: { 
          ...corsHeaders,
          "Content-Type": "application/json" 
        }, 
        status: 400 
      }
    );
  }
});
