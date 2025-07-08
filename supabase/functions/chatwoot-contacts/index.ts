import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { account_id } = await req.json()
    
    if (!account_id) {
      return new Response(
        JSON.stringify({ error: 'account_id is required' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    const chatwootToken = Deno.env.get('CHATWOOT_API_TOKEN')
    const proxyUrl = 'https://api.chathook.com.br/api/chatwoot-proxy.php'

    if (!chatwootToken) {
      return new Response(
        JSON.stringify({ error: 'Chatwoot API token not configured' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Build query parameters for proxy
    const params = new URLSearchParams()
    params.append('account_id', account_id.toString())
    params.append('endpoint', 'contacts')

    const requestUrl = `${proxyUrl}?${params.toString()}`
    console.log('Fetching contacts from proxy:', requestUrl)

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
    console.log('Fetched contacts from proxy:', data)

    // Ensure data is always an array
    const contactsData = Array.isArray(data) ? data : (data?.data || data?.payload || [])
    
    return new Response(
      JSON.stringify({ 
        success: true, 
        data: contactsData
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('Function error:', error)
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error',
        details: error.message 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})