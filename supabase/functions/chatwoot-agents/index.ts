
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
    )

    // Get the authorization header
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      throw new Error('No authorization header')
    }

    // Verify the user
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser(
      authHeader.replace('Bearer ', '')
    )

    if (authError || !user) {
      throw new Error('Invalid authorization')
    }

    const { account_id } = await req.json()

    const chatwootToken = Deno.env.get('CHATWOOT_API_TOKEN')
    const proxyUrl = 'https://api.chathook.com.br/api/chatwoot-proxy.php'
    
    if (!chatwootToken) {
      throw new Error('Chatwoot API token not configured')
    }

    // Build query parameters for proxy
    const params = new URLSearchParams()
    params.append('account_id', account_id.toString())
    params.append('endpoint', 'agents')

    const requestUrl = `${proxyUrl}?${params.toString()}`
    
    console.log('Fetching agents from proxy:', requestUrl)

    const response = await fetch(requestUrl, {
      headers: {
        'Authorization': `Bearer ${chatwootToken}`,
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('Proxy API error:', response.status, errorText)
      return new Response(
        JSON.stringify({ 
          success: true, 
          data: [], // Return empty array on error instead of throwing
          error: `Proxy API error: ${response.status}`,
          details: errorText 
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    const data = await response.json()
    console.log('Fetched agents from proxy:', data)

    // Ensure data is always an array
    const agentsData = Array.isArray(data) ? data : (data?.data || data?.agents || [])
    
    return new Response(
      JSON.stringify({ 
        success: true, 
        data: agentsData
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      },
    )

  } catch (error) {
    console.error('Error fetching agents:', error)
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message 
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      },
    )
  }
})
