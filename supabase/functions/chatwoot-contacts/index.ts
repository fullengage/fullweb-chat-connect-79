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
    const chatwootBaseUrl = Deno.env.get('CHATWOOT_BASE_URL')

    if (!chatwootToken || !chatwootBaseUrl) {
      return new Response(
        JSON.stringify({ error: 'Chatwoot credentials not configured' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    const url = `${chatwootBaseUrl}/api/v1/accounts/${account_id}/contacts`
    console.log('Fetching contacts from:', url)

    const response = await fetch(url, {
      headers: {
        'api_access_token': chatwootToken,
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('Chatwoot API error:', response.status, errorText)
      return new Response(
        JSON.stringify({ 
          error: `Chatwoot API error: ${response.status}`,
          details: errorText 
        }),
        { 
          status: response.status, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    const data = await response.json()
    
    return new Response(
      JSON.stringify({ 
        success: true, 
        data: data.payload || [] 
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