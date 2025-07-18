
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface ConversationFilters {
  status?: string
  assignee_id?: number
  inbox_id?: number
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

    const { account_id, status, assignee_id, inbox_id } = await req.json() as ConversationFilters

    const chatwootToken = Deno.env.get('CHATWOOT_API_TOKEN')
    const proxyUrl = 'https://api.chathook.com.br/api/chatwoot-proxy.php'
    
    if (!chatwootToken) {
      throw new Error('Chatwoot API token not configured')
    }

    // Build the correct proxy URL
    const requestUrl = `${proxyUrl}?endpoint=conversations&account_id=${account_id}`
    
    console.log('Fetching conversations from proxy:', requestUrl)

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
    console.log('Fetched conversations from proxy:', data)

    // CORREÇÃO: Acessar conversas seguindo o padrão especificado: data.data.payload
    const conversations = data?.data?.payload || []
    console.log('Extracted conversations data:', Array.isArray(conversations), conversations?.length || 0)
    
    // Garantir que é um array antes de mapear
    if (!Array.isArray(conversations)) {
      console.warn('O retorno do proxy não é um array de conversas!', conversations)
      console.log('Full data structure received:', JSON.stringify(data, null, 2))
      return new Response(
        JSON.stringify({ 
          success: true, 
          data: []
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        },
      )
    }

    // Para cada conversa, buscar suas mensagens
    const conversationsWithMessages = await Promise.all(
      conversations.map(async (conversation: any) => {
        try {
          const messagesUrl = `${proxyUrl}?endpoint=conversations/${conversation.id}/messages&account_id=${account_id}`
          console.log('Fetching messages for conversation:', conversation.id)
          
          const messagesResponse = await fetch(messagesUrl, {
            headers: {
              'Authorization': `Bearer ${chatwootToken}`,
              'Content-Type': 'application/json',
            },
          })

          if (messagesResponse.ok) {
            const messagesData = await messagesResponse.json()
            // Acessar mensagens seguindo o mesmo padrão: data.data.payload
            const messages = messagesData?.data?.payload || messagesData?.data || []
            console.log(`Fetched ${Array.isArray(messages) ? messages.length : 0} messages for conversation ${conversation.id}`)
            
            return {
              ...conversation,
              messages: Array.isArray(messages) ? messages : []
            }
          } else {
            console.warn(`Failed to fetch messages for conversation ${conversation.id}`)
            return {
              ...conversation,
              messages: []
            }
          }
        } catch (error) {
          console.error(`Error fetching messages for conversation ${conversation.id}:`, error)
          return {
            ...conversation,
            messages: []
          }
        }
      })
    )
    
    return new Response(
      JSON.stringify({ 
        success: true, 
        data: conversationsWithMessages
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      },
    )

  } catch (error) {
    console.error('Error fetching conversations:', error)
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
