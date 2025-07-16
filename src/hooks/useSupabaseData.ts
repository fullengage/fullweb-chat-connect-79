import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useEffect, useRef } from 'react'
import { supabase } from '@/integrations/supabase/client'
import { useToast } from '@/hooks/use-toast'
import { useAuth } from '@/contexts/AuthContext'
import { Conversation } from '@/types'

// Types - using the main Conversation type from types/index.ts, only defining internal types here
interface Account {
  id: number
  name: string
  slug: string
  plan: string
  created_at: string
  updated_at: string
}

export interface User {
  id: string
  account_id: number
  role: 'superadmin' | 'admin' | 'agent'
  name: string
  email: string
  avatar_url?: string
  auth_user_id?: string
  created_at: string
  updated_at: string
}

interface Contact {
  id: number
  account_id: number
  name?: string
  email?: string
  phone?: string
  avatar_url?: string
  last_seen?: string
  custom_fields?: any
  created_at: string
  updated_at: string
}

interface Message {
  id: number
  conversation_id: number
  sender_type: 'contact' | 'agent' | 'system'
  sender_id?: string
  content?: string
  attachments?: any
  read_at?: string
  created_at: string
}

interface ConversationFilters {
  account_id: number
  status?: string
  assignee_id?: string
  kanban_stage?: string
}

interface Inbox {
  id: number
  name: string
  channel_type: string
  created_at?: string
}

interface KanbanStage {
  id: number
  account_id: number
  name: string
  position: number
  created_at: string
}

// Global channel registry to prevent duplicate subscriptions
const activeChannels = new Map<string, any>()

// Hook para buscar conversas com realtime baseado no papel do usuário
export const useConversations = (filters: ConversationFilters) => {
  const { toast } = useToast()
  const { user: authUser } = useAuth()
  const queryClient = useQueryClient()
  const hookInstanceId = useRef(Math.random().toString(36).substr(2, 9))

  const query = useQuery({
    queryKey: ['conversations', filters, authUser?.id],
    queryFn: async () => {
      console.log('Fetching conversations with filters:', filters)
      
      if (!authUser) {
        throw new Error('User not authenticated')
      }

      // Buscar dados do usuário na nossa tabela users
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('auth_user_id', authUser.id)
        .single()

      if (userError || !userData) {
        console.error('User data error:', userError)
        throw new Error('User data not found')
      }

      let query = supabase
        .from('conversations')
        .select(`
          *,
          contact:contacts(*),
          assignee:users(*)
        `)
        .order('updated_at', { ascending: false })

      // Aplicar filtros baseados no papel do usuário
      if (userData.role === 'superadmin') {
        // Superadmin pode ver conversas de qualquer conta se especificada
        if (filters.account_id) {
          query = query.eq('account_id', filters.account_id)
        }
      } else if (userData.role === 'admin') {
        // Admin pode ver todas as conversas da sua conta
        query = query.eq('account_id', userData.account_id)
      } else if (userData.role === 'agent') {
        // Agent só pode ver conversas da sua conta que estão atribuídas a ele ou não atribuídas
        query = query
          .eq('account_id', userData.account_id)
          .or(`assignee_id.eq.${userData.id},assignee_id.is.null`)
      } else {
        throw new Error('Invalid user role')
      }

      // Aplicar filtros adicionais
      if (filters.status && filters.status !== 'all') {
        query = query.eq('status', filters.status)
      }

      if (filters.assignee_id && filters.assignee_id !== 'all') {
        if (filters.assignee_id === 'unassigned') {
          query = query.is('assignee_id', null)
        } else {
          query = query.eq('assignee_id', filters.assignee_id)
        }
      }

      if (filters.kanban_stage) {
        query = query.eq('kanban_stage', filters.kanban_stage)
      }

      const { data, error } = await query

      if (error) {
        console.error('Database error:', error)
        toast({
          title: "Erro ao buscar conversas",
          description: error.message,
          variant: "destructive",
        })
        throw error
      }

      // Transform data to include inbox information and calculate unread count
      const conversationsWithInbox = data?.map(conversation => ({
        ...conversation,
        contact_id: conversation.contact?.id || 0, // Add missing contact_id property
        inbox: {
          id: 1,
          name: 'Chat Interno',
          channel_type: 'webchat'
        },
        messages: [],
        unread_count: 0
      })) || []

      console.log('Conversations fetched successfully:', conversationsWithInbox.length)
      return conversationsWithInbox as Conversation[]
    },
    enabled: !!authUser && !!filters.account_id,
    refetchInterval: 30000,
  })

  // Set up realtime subscription with improved channel management
  useEffect(() => {
    if (!authUser || !filters.account_id) return

    const channelKey = `conversations-${filters.account_id}`
    const instanceChannelKey = `${channelKey}-${hookInstanceId.current}`

    // Check if a channel for this account already exists
    let channel = activeChannels.get(channelKey)
    
    if (!channel) {
      console.log('Creating new realtime subscription for account:', filters.account_id)
      
      channel = supabase
        .channel(instanceChannelKey)
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'conversations',
            filter: `account_id=eq.${filters.account_id}`
          },
          () => {
            console.log('Conversations realtime update received')
            queryClient.invalidateQueries({ queryKey: ['conversations'] })
          }
        )
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'messages'
          },
          () => {
            console.log('Messages realtime update received')
            queryClient.invalidateQueries({ queryKey: ['conversations'] })
          }
        )

      // Subscribe only once
      channel.subscribe((status: string) => {
        if (status === 'SUBSCRIBED') {
          console.log('Successfully subscribed to realtime updates')
          activeChannels.set(channelKey, channel)
        } else if (status === 'CHANNEL_ERROR') {
          console.error('Channel subscription error')
          activeChannels.delete(channelKey)
        }
      })
    } else {
      console.log('Reusing existing realtime subscription for account:', filters.account_id)
    }

    return () => {
      console.log('Cleaning up realtime subscription for instance:', hookInstanceId.current)
      // Only clean up if this is the last instance using this channel
      const currentChannel = activeChannels.get(channelKey)
      if (currentChannel) {
        // In a real app, you'd want to track how many instances are using the channel
        // For now, we'll clean up after a delay to allow other instances to reuse
        setTimeout(() => {
          const stillActiveChannel = activeChannels.get(channelKey)
          if (stillActiveChannel) {
            console.log('Removing channel from active channels')
            supabase.removeChannel(stillActiveChannel)
            activeChannels.delete(channelKey)
          }
        }, 1000)
      }
    }
  }, [authUser?.id, filters.account_id, queryClient])

  return query
}

// Hook para buscar usuários/agentes baseado no papel do usuário atual
export const useUsers = (account_id: number) => {
  const { toast } = useToast()
  const { user: authUser } = useAuth()

  return useQuery({
    queryKey: ['users', account_id, authUser?.id],
    queryFn: async () => {
      console.log('Fetching users for account:', account_id)
      
      if (!authUser) {
        throw new Error('User not authenticated')
      }

      // Buscar dados do usuário atual
      const { data: currentUserData, error: currentUserError } = await supabase
        .from('users')
        .select('*')
        .eq('auth_user_id', authUser.id)
        .single()

      if (currentUserError || !currentUserData) {
        console.error('Current user data error:', currentUserError)
        throw new Error('Current user data not found')
      }

      let query = supabase
        .from('users')
        .select('*')
        .order('name')

      // Aplicar filtros baseados no papel do usuário
      if (currentUserData.role === 'superadmin') {
        // Superadmin pode ver usuários de qualquer conta se especificada
        if (account_id) {
          query = query.eq('account_id', account_id)
        }
      } else {
        // Admin e Agent só podem ver usuários da sua própria conta
        query = query.eq('account_id', currentUserData.account_id)
      }

      const { data, error } = await query

      if (error) {
        console.error('Database error:', error)
        toast({
          title: "Erro ao buscar usuários",
          description: error.message,
          variant: "destructive",
        })
        throw error
      }

      console.log('Users fetched successfully:', data?.length)
      return data as User[]
    },
    enabled: !!authUser,
    staleTime: 5 * 60 * 1000,
  })
}

// Mock hook for inboxes since table doesn't exist
export const useInboxes = (account_id: number) => {
  return useQuery({
    queryKey: ['inboxes', account_id],
    queryFn: async () => {
      // Return mock data since inboxes table doesn't exist
      return [
        { id: 1, name: 'WhatsApp', channel_type: 'whatsapp', created_at: new Date().toISOString() },
        { id: 2, name: 'Email', channel_type: 'email', created_at: new Date().toISOString() },
        { id: 3, name: 'Website', channel_type: 'webchat', created_at: new Date().toISOString() }
      ] as Inbox[]
    },
    enabled: !!account_id,
    staleTime: 5 * 60 * 1000,
  })
}

// Hook para buscar contatos baseado no papel do usuário
export const useContacts = (account_id: number) => {
  const { toast } = useToast()
  const { user: authUser } = useAuth()

  return useQuery({
    queryKey: ['contacts', account_id, authUser?.id],
    queryFn: async () => {
      console.log('Fetching contacts for account:', account_id)
      
      if (!authUser) {
        throw new Error('User not authenticated')
      }

      // Buscar dados do usuário atual
      const { data: currentUserData, error: currentUserError } = await supabase
        .from('users')
        .select('*')
        .eq('auth_user_id', authUser.id)
        .single()

      if (currentUserError || !currentUserData) {
        console.error('Current user data error:', currentUserError)
        throw new Error('Current user data not found')
      }

      let query = supabase
        .from('contacts')
        .select('*')
        .order('name')

      // Aplicar filtros baseados no papel do usuário
      if (currentUserData.role === 'superadmin') {
        // Superadmin pode ver contatos de qualquer conta se especificada
        if (account_id) {
          query = query.eq('account_id', account_id)
        }
      } else {
        // Admin e Agent só podem ver contatos da sua própria conta
        query = query.eq('account_id', currentUserData.account_id)
      }

      const { data, error } = await query

      if (error) {
        console.error('Database error:', error)
        toast({
          title: "Erro ao buscar contatos",
          description: error.message,
          variant: "destructive",
        })
        throw error
      }

      console.log('Contacts fetched successfully:', data?.length)
      return data as Contact[]
    },
    enabled: !!authUser,
    staleTime: 5 * 60 * 1000,
  })
}

// Mock hook for kanban stages since table doesn't exist
export const useKanbanStages = (account_id: number) => {
  return useQuery({
    queryKey: ['kanban-stages', account_id],
    queryFn: async () => {
      // Return mock data since kanban_stages table doesn't exist
      return [
        { id: 1, account_id, name: 'Novo', position: 1, created_at: new Date().toISOString() },
        { id: 2, account_id, name: 'Em Andamento', position: 2, created_at: new Date().toISOString() },
        { id: 3, account_id, name: 'Aguardando', position: 3, created_at: new Date().toISOString() },
        { id: 4, account_id, name: 'Resolvido', position: 4, created_at: new Date().toISOString() }
      ] as KanbanStage[]
    },
    enabled: !!account_id,
    staleTime: 5 * 60 * 1000,
  })
}

// Hook para atualizar status da conversa
export const useUpdateConversationStatus = () => {
  const queryClient = useQueryClient()
  const { toast } = useToast()

  return useMutation({
    mutationFn: async ({ conversationId, status }: { conversationId: number, status: string }) => {
      const { data, error } = await supabase
        .from('conversations')
        .update({ 
          status, 
          updated_at: new Date().toISOString() 
        })
        .eq('id', conversationId)
        .select()
        .single()

      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['conversations'] })
      toast({
        title: "Status atualizado",
        description: "Status da conversa foi atualizado com sucesso",
      })
    },
    onError: (error: any) => {
      console.error('Error updating conversation status:', error)
      toast({
        title: "Erro ao atualizar status",
        description: error.message,
        variant: "destructive",
      })
    }
  })
}

// Hook para atualizar estágio do kanban da conversa
export const useUpdateConversationKanbanStage = () => {
  const queryClient = useQueryClient()
  const { toast } = useToast()

  return useMutation({
    mutationFn: async ({ conversationId, kanbanStage }: { conversationId: number, kanbanStage: string }) => {
      const { data, error } = await supabase
        .from('conversations')
        .update({ 
          kanban_stage: kanbanStage, 
          updated_at: new Date().toISOString() 
        })
        .eq('id', conversationId)
        .select()
        .single()

      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['conversations'] })
      toast({
        title: "Estágio atualizado",
        description: "Conversa movida para novo estágio",
      })
    },
    onError: (error: any) => {
      console.error('Error updating conversation kanban stage:', error)
      toast({
        title: "Erro ao atualizar estágio",
        description: error.message,
        variant: "destructive",
      })
    }
  })
}

// Hook para criar uma nova conversa
export const useCreateConversation = () => {
  const queryClient = useQueryClient()
  const { toast } = useToast()

  return useMutation({
    mutationFn: async (conversationData: {
      account_id: number
      contact_id: number
      status?: string
      kanban_stage?: string
    }) => {
      const { data, error } = await supabase
        .from('conversations')
        .insert(conversationData)
        .select()
        .single()

      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['conversations'] })
      toast({
        title: "Conversa criada",
        description: "Nova conversa criada com sucesso",
      })
    },
    onError: (error: any) => {
      console.error('Error creating conversation:', error)
      toast({
        title: "Erro ao criar conversa",
        description: error.message,
        variant: "destructive",
      })
    }
  })
}

// Hook para enviar mensagem via proxy do Chatwoot
export const useSendMessage = () => {
  const queryClient = useQueryClient()
  const { toast } = useToast()

  return useMutation({
    mutationFn: async (messageData: {
      conversation_id: number
      sender_type?: 'contact' | 'agent' | 'system'
      sender_id?: string
      content: string
      account_id: number
    }) => {
      const { data: session } = await supabase.auth.getSession()
      if (!session.session) {
        throw new Error('No active session')
      }

      const { data, error } = await supabase.functions.invoke('chatwoot-send-message', {
        body: {
          conversation_id: messageData.conversation_id,
          content: messageData.content,
          message_type: 'outgoing',
          account_id: messageData.account_id
        },
        headers: {
          Authorization: `Bearer ${session.session.access_token}`,
        },
      })

      if (error) {
        console.error('Supabase function error:', error)
        throw error
      }

      if (!data.success) {
        console.error('Chatwoot API error:', data.error)
        throw new Error(data.error)
      }

      return data.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['chatwoot-conversations'] })
      toast({
        title: "Mensagem enviada",
        description: "Mensagem enviada com sucesso",
      })
    },
    onError: (error: any) => {
      console.error('Error sending message:', error)
      toast({
        title: "Erro ao enviar mensagem",
        description: error.message,
        variant: "destructive",
      })
    }
  })
}

// Export only the internal types, not Conversation (use the one from types/index.ts)
export type { 
  Account, 
  Contact, 
  Message,
  ConversationFilters,
  Inbox,
  KanbanStage
}
