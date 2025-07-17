import { useQuery } from '@tanstack/react-query'
import { useToast } from '@/hooks/use-toast'

interface ConversationCounts {
  all: number
  open: number
  resolved: number
  pending: number
  snoozed: number
}

interface ConversationFilters {
  account_id: number
  status?: string
  assignee_id?: number
  inbox_id?: number
}

interface Conversation {
  id: number
  messages: any[]
  account_id: number
  inbox_id: number
  status: string
  assignee_id?: number
  unread_count: number
  meta: {
    sender: {
      id: number
      name: string
      email?: string
      phone_number?: string
      thumbnail?: string
    }
    channel: string
  }
  assignee?: {
    id: number
    name: string
    email: string
    avatar_url?: string
  }
  created_at: string
  updated_at: string
}

const PROXY_BASE_URL = 'api/chatwoot-proxy.php'

// Hook para buscar contadores de conversas
export const useChatwootConversationCounts = (account_id: number, status: string = 'all') => {
  const { toast } = useToast()

  return useQuery({
    queryKey: ['chatwoot-conversation-counts', account_id, status],
    queryFn: async () => {
      console.log('Fetching conversation counts for account:', account_id)
      
      const params = new URLSearchParams({
        endpoint: 'conversations/meta',
        account_id: account_id.toString(),
        status
      })

      const response = await fetch(`${PROXY_BASE_URL}?${params}`)
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      
      if (!data.success) {
        console.error('Chatwoot API error:', data.error)
        toast({
          title: "Erro da API Chatwoot",
          description: data.error,
          variant: "destructive",
        })
        throw new Error(data.error)
      }

      console.log('Conversation counts fetched successfully:', data.data)
      return data.data as ConversationCounts
    },
    enabled: !!account_id,
    staleTime: 2 * 60 * 1000, // Fresh for 2 minutes
    refetchInterval: 30000, // Refetch every 30 seconds
  })
}

// Hook para buscar conversas
export const useChatwootConversationsProxy = (filters: ConversationFilters) => {
  const { toast } = useToast()

  return useQuery({
    queryKey: ['chatwoot-conversations-proxy', filters],
    queryFn: async () => {
      console.log('Fetching conversations with filters:', filters)
      
      const params = new URLSearchParams({
        endpoint: 'conversations',
        account_id: filters.account_id.toString(),
        ...(filters.status && filters.status !== 'all' && { status: filters.status }),
        ...(filters.assignee_id && { assignee_id: filters.assignee_id.toString() }),
        ...(filters.inbox_id && { inbox_id: filters.inbox_id.toString() })
      })

      const response = await fetch(`${PROXY_BASE_URL}?${params}`)
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      
      if (!data.success) {
        console.error('Chatwoot API error:', data.error)
        toast({
          title: "Erro da API Chatwoot",
          description: data.error,
          variant: "destructive",
        })
        throw new Error(data.error)
      }

      console.log('Conversations fetched successfully:', data.data?.payload?.length || 0)
      return data.data?.payload || data.data?.data || []
    },
    enabled: !!filters.account_id,
    staleTime: 1 * 60 * 1000, // Fresh for 1 minute
    refetchInterval: 30000, // Refetch every 30 seconds
  })
}

// Hook para buscar agentes
export const useChatwootAgentsProxy = (account_id: number) => {
  const { toast } = useToast()

  return useQuery({
    queryKey: ['chatwoot-agents-proxy', account_id],
    queryFn: async () => {
      console.log('Fetching agents for account:', account_id)
      
      const params = new URLSearchParams({
        endpoint: 'agents',
        account_id: account_id.toString()
      })

      const response = await fetch(`${PROXY_BASE_URL}?${params}`)
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      
      if (!data.success) {
        console.error('Chatwoot API error:', data.error)
        toast({
          title: "Erro da API Chatwoot",
          description: data.error,
          variant: "destructive",
        })
        throw new Error(data.error)
      }

      console.log('Agents fetched successfully:', data.data?.payload?.length || 0)
      return data.data?.payload || data.data?.data || []
    },
    enabled: !!account_id,
    staleTime: 5 * 60 * 1000, // Fresh for 5 minutes
  })
}

// Hook para buscar inboxes
export const useChatwootInboxesProxy = (account_id: number) => {
  const { toast } = useToast()

  return useQuery({
    queryKey: ['chatwoot-inboxes-proxy', account_id],
    queryFn: async () => {
      console.log('Fetching inboxes for account:', account_id)
      
      const params = new URLSearchParams({
        endpoint: 'inboxes',
        account_id: account_id.toString()
      })

      const response = await fetch(`${PROXY_BASE_URL}?${params}`)
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      
      if (!data.success) {
        console.error('Chatwoot API error:', data.error)
        toast({
          title: "Erro da API Chatwoot",
          description: data.error,
          variant: "destructive",
        })
        throw new Error(data.error)
      }

      console.log('Inboxes fetched successfully:', data.data?.payload?.length || 0)
      return data.data?.payload || data.data?.data || []
    },
    enabled: !!account_id,
    staleTime: 5 * 60 * 1000, // Fresh for 5 minutes
  })
}