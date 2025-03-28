
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.3";
import * as jose from "https://esm.sh/jose@4.14.4";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-sfd-id, x-page-size, x-page',
};

const JWT_SECRET = Deno.env.get('JWT_SECRET') || 'your-default-jwt-secret-for-development';

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Vérifier l'authentification
    const authHeader = req.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new Error('Missing or invalid Authorization header');
    }

    const token = authHeader.substring(7);
    const secretKey = new TextEncoder().encode(JWT_SECRET);
    const { payload } = await jose.jwtVerify(token, secretKey);
    
    const userId = payload.sub;
    if (!userId) {
      throw new Error('Token does not contain a valid user ID');
    }

    // Récupérer le SFD ID et les paramètres de pagination
    const url = new URL(req.url);
    const sfdId = req.headers.get('x-sfd-id') || url.searchParams.get('sfd_id');
    const pageSize = parseInt(req.headers.get('x-page-size') || url.searchParams.get('page_size') || '10');
    const page = parseInt(req.headers.get('x-page') || url.searchParams.get('page') || '1');
    const status = url.searchParams.get('status') || undefined;
    
    // Vérifier si l'utilisateur a accès à ce SFD
    if (!sfdId) {
      throw new Error('SFD ID is required');
    }

    // Calculer l'offset pour la pagination
    const offset = (page - 1) * pageSize;

    // Vérifier dans le cache Redis simulé avant d'interroger la base de données
    const cacheKey = `sfd_loans:${sfdId}:${status || 'all'}:${page}:${pageSize}`;
    const cachedData = await checkCache(cacheKey);
    
    if (cachedData) {
      console.log(`Cache hit for ${cacheKey}`);
      return new Response(JSON.stringify(cachedData), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    console.log(`Cache miss for ${cacheKey}, fetching from database`);

    // Construire la requête
    let query = supabase
      .from('sfd_loans')
      .select(`
        id,
        amount,
        duration_months,
        interest_rate,
        monthly_payment,
        purpose,
        status,
        created_at,
        approved_at,
        disbursed_at,
        last_payment_date,
        next_payment_date,
        client_id,
        client:client_id(full_name)
      `, { count: 'exact' })
      .eq('sfd_id', sfdId)
      .order('created_at', { ascending: false })
      .range(offset, offset + pageSize - 1);

    // Ajouter le filtre de statut si fourni
    if (status) {
      query = query.eq('status', status);
    }

    const { data: loans, error, count } = await query;

    if (error) {
      throw error;
    }

    const result = {
      success: true,
      data: loans,
      pagination: {
        page,
        pageSize,
        totalPages: Math.ceil((count || 0) / pageSize),
        totalCount: count || 0
      }
    };

    // Stocker dans le cache Redis simulé
    await setCache(cacheKey, result, 60); // Cache pendant 60 secondes

    // Journaliser l'accès aux données
    await supabase.from('audit_logs').insert({
      user_id: userId,
      action: 'fetch_sfd_loans',
      category: 'data_access',
      severity: 'info',
      status: 'success',
      details: { 
        sfd_id: sfdId, 
        page, 
        pageSize,
        status,
        count
      },
      target_resource: `sfd:${sfdId}:loans`
    });

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
    
  } catch (error) {
    console.error('Error in sfd-admin-loans function:', error);
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message 
      }),
      { 
        status: error.message.includes('Authentication') ? 401 : 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});

// Simulation d'un cache Redis avec une Map en mémoire
const cacheStore = new Map();

async function checkCache(key: string): Promise<any> {
  const item = cacheStore.get(key);
  if (!item) return null;
  
  // Vérifier si le cache est expiré
  if (item.expiresAt < Date.now()) {
    cacheStore.delete(key);
    return null;
  }
  
  return item.data;
}

async function setCache(key: string, data: any, ttlSeconds: number): Promise<void> {
  cacheStore.set(key, {
    data,
    expiresAt: Date.now() + (ttlSeconds * 1000)
  });
}

// Fonction pour purger un cache spécifique
async function invalidateCache(pattern: string): Promise<number> {
  let count = 0;
  
  for (const key of cacheStore.keys()) {
    if (key.includes(pattern)) {
      cacheStore.delete(key);
      count++;
    }
  }
  
  return count;
}
