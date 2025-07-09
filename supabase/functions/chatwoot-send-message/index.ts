import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface SendMessageRequest {
  conversation_id: number
  content: string
  message_type?: string
  account_id: number
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

    const { conversation_id, content, message_type = 'outgoing', account_id } = await req.json() as SendMessageRequest

    const chatwootToken = Deno.env.get('CHATWOOT_API_TOKEN')
    const proxyUrl = 'https://api.chathook.com.br/api/chatwoot-proxy.php'
    
    if (!chatwootToken) {
      throw new Error('Chatwoot API token not configured')
    }

    // Build the correct proxy URL for sending messages
    const requestUrl = `${proxyUrl}?endpoint=conversations/${conversation_id}/messages&account_id=${account_id}`
    
    console.log('Sending message via proxy:', requestUrl)

    const response = await fetch(requestUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${chatwootToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        content,
        message_type
      })
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('Proxy API error:', response.status, errorText)
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: `Proxy API error: ${response.status}`,
          details: errorText 
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: response.status
        }
      )
    }

    const data = await response.json()
    console.log('Message sent via proxy:', data)
    
    return new Response(
      JSON.stringify({ 
        success: true, 
        data: data
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      },
    )

  } catch (error) {
    console.error('Error sending message:', error)
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