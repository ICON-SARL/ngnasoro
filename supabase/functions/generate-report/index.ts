
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { corsHeaders } from "../_shared/cors.ts";

const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // Create a Supabase client with the service role key
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    // Parse the request body
    const { report_id, definition_id, parameters } = await req.json();
    
    if (!report_id || !definition_id || !parameters) {
      return new Response(
        JSON.stringify({
          error: "Missing required parameters",
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 400,
        }
      );
    }

    // First, update the report status to processing
    const { error: updateError } = await supabase
      .from('generated_reports')
      .update({
        status: 'processing'
      })
      .eq('id', report_id);
      
    if (updateError) {
      throw updateError;
    }

    // Fetch the report definition
    const { data: definition, error: definitionError } = await supabase
      .from('report_definitions')
      .select('*')
      .eq('id', definition_id)
      .single();
      
    if (definitionError) {
      throw definitionError;
    }

    // Get the report type and execute the appropriate query
    const reportType = definition.type;
    let reportData = null;
    
    // Extract date range from parameters
    const startDate = parameters.date_range?.from 
      ? new Date(parameters.date_range.from).toISOString() 
      : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
      
    const endDate = parameters.date_range?.to 
      ? new Date(parameters.date_range.to).toISOString() 
      : new Date().toISOString();

    // Execute query based on report type
    switch (reportType) {
      case 'transaction_summary':
        const { data: transactions, error: transactionsError } = await supabase
          .from('transactions')
          .select('*')
          .gte('created_at', startDate)
          .lte('created_at', endDate);
          
        if (transactionsError) throw transactionsError;
        reportData = transactions;
        break;
        
      case 'client_activity':
        const { data: activities, error: activitiesError } = await supabase
          .from('client_activities')
          .select('*, sfd_clients(full_name)')
          .gte('performed_at', startDate)
          .lte('performed_at', endDate);
          
        if (activitiesError) throw activitiesError;
        reportData = activities;
        break;
        
      case 'personal_transactions':
        // For personal transactions, we need the user_id from the generated_report
        const { data: report, error: reportError } = await supabase
          .from('generated_reports')
          .select('user_id')
          .eq('id', report_id)
          .single();
          
        if (reportError) throw reportError;
        
        const { data: userTransactions, error: userTransactionsError } = await supabase
          .from('transactions')
          .select('*')
          .eq('user_id', report.user_id)
          .gte('created_at', startDate)
          .lte('created_at', endDate);
          
        if (userTransactionsError) throw userTransactionsError;
        reportData = userTransactions;
        break;
        
      default:
        throw new Error(`Unknown report type: ${reportType}`);
    }

    // Store the data temporarily (in a real system, we would generate a file and upload it)
    // For this example, we'll store the data in a Storage bucket
    const filename = `${report_id}.json`;
    
    // Convert data to a string
    const jsonData = JSON.stringify(reportData);
    
    // Store in a "reports" bucket (assuming it exists)
    // In a real system, you would create proper CSV/Excel/PDF files
    // For demo purposes, we're just storing JSON
    const { error: storageError } = await supabase
      .storage
      .from('reports')
      .upload(filename, jsonData, {
        contentType: 'application/json',
        upsert: true
      });
      
    if (storageError) {
      throw storageError;
    }
    
    // Generate a public URL for the file
    const { data: urlData } = await supabase
      .storage
      .from('reports')
      .getPublicUrl(filename);
      
    const publicUrl = urlData.publicUrl;
    
    // Update the report with the URL and mark as completed
    const { error: finalUpdateError } = await supabase
      .from('generated_reports')
      .update({
        result_url: publicUrl,
        status: 'completed',
        completed_at: new Date().toISOString()
      })
      .eq('id', report_id);
      
    if (finalUpdateError) {
      throw finalUpdateError;
    }

    return new Response(
      JSON.stringify({
        success: true,
        report_id,
        status: 'completed',
        url: publicUrl
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    console.error("Error:", error);
    
    // Update the report status to failed
    if (req.method !== "OPTIONS") {
      try {
        const { report_id } = await req.json();
        
        if (report_id) {
          const supabase = createClient(supabaseUrl, supabaseServiceKey);
          
          await supabase
            .from('generated_reports')
            .update({
              status: 'failed',
              error: error.message
            })
            .eq('id', report_id);
        }
      } catch (updateError) {
        console.error("Error updating report status:", updateError);
      }
    }
    
    return new Response(
      JSON.stringify({
        error: error.message,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});
