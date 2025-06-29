
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/integrations/supabase/client'
import { useToast } from '@/hooks/use-toast'
import { useAuth } from '@/contexts/AuthContext'

// Types for the new Kanban system
export interface KanbanBoard {
  id: number
  account_id: number
  name: string
  description?: string
  is_default: boolean
  visibility: 'team' | 'agents_only' | 'admins_only'
  background_color: string
  is_active: boolean
  created_by?: string
  created_at: string
  updated_at: string
}

export interface KanbanColumn {
  id: number
  board_id: number
  account_id: number
  name: string
  description?: string
  color: string
  position: number
  max_cards?: number
  auto_assign_agent: boolean
  is_final_stage: boolean
  created_at: string
  updated_at: string
}

export interface ConversationKanban {
  id: number
  conversation_id: number
  board_id: number
  column_id: number
  account_id: number
  position: number
  moved_by?: string
  moved_at: string
}

export interface KanbanLabel {
  id: number
  account_id: number
  name: string
  color: string
  board_id?: number
  created_at: string
}

export interface ConversationLabel {
  conversation_id: number
  label_id: number
  account_id: number
  added_by?: string
  added_at: string
}

export interface EnhancedConversation {
  id: number
  account_id: number
  contact_id: number
  status: string
  assignee_id?: string
  kanban_stage: string
  priority?: 'high' | 'medium' | 'low'
  due_date?: string
  estimated_time?: number
  complexity: 'low' | 'medium' | 'high'
  last_activity_at: string
  created_at: string
  updated_at: string
  unread_count?: number
  contact?: {
    id: number
    name: string
    email?: string
    phone?: string
    avatar_url?: string
  }
  assignee?: {
    id: string
    name: string
    avatar_url?: string
  }
  inbox: {
    id: number
    name: string
    channel_type: string
  }
  messages?: any[]
  labels?: KanbanLabel[]
  kanban_position?: ConversationKanban
}

// Hook para buscar boards
export const useKanbanBoards = (account_id: number) => {
  const { toast } = useToast()

  return useQuery({
    queryKey: ['kanban-boards', account_id],
    queryFn: async () => {
      console.log('Fetching kanban boards for account:', account_id)
      
      const { data, error } = await supabase
        .from('kanban_boards')
        .select('*')
        .eq('account_id', account_id)
        .eq('is_active', true)
        .order('name')

      if (error) {
        console.error('Error fetching kanban boards:', error)
        toast({
          title: "Erro ao buscar quadros",
          description: error.message,
          variant: "destructive",
        })
        throw error
      }

      return data as KanbanBoard[]
    },
    enabled: !!account_id,
    staleTime: 5 * 60 * 1000,
  })
}

// Hook para buscar colunas de um board
export const useKanbanColumns = (board_id: number) => {
  const { toast } = useToast()

  return useQuery({
    queryKey: ['kanban-columns', board_id],
    queryFn: async () => {
      console.log('Fetching kanban columns for board:', board_id)
      
      const { data, error } = await supabase
        .from('kanban_columns')
        .select('*')
        .eq('board_id', board_id)
        .order('position')

      if (error) {
        console.error('Error fetching kanban columns:', error)
        toast({
          title: "Erro ao buscar colunas",
          description: error.message,
          variant: "destructive",
        })
        throw error
      }

      return data as KanbanColumn[]
    },
    enabled: !!board_id,
    staleTime: 5 * 60 * 1000,
  })
}

// Hook para buscar conversas com posição no Kanban
export const useKanbanConversations = (board_id: number) => {
  const { toast } = useToast()
  const { user: authUser } = useAuth()

  return useQuery({
    queryKey: ['kanban-conversations', board_id, authUser?.id],
    queryFn: async () => {
      console.log('Fetching kanban conversations for board:', board_id)
      
      if (!authUser) {
        throw new Error('User not authenticated')
      }

      const { data, error } = await supabase
        .from('conversations')
        .select(`
          *,
          contact:contacts(*),
          assignee:users(*),
          conversation_kanban!inner(
            id,
            board_id,
            column_id,
            position,
            moved_by,
            moved_at
          ),
          conversation_labels(
            label_id,
            kanban_labels(*)
          )
        `)
        .eq('conversation_kanban.board_id', board_id)
        .order('conversation_kanban.position')

      if (error) {
        console.error('Error fetching kanban conversations:', error)
        toast({
          title: "Erro ao buscar conversas",
          description: error.message,
          variant: "destructive",
        })
        throw error
      }

      // Transform data to include inbox information and labels
      const conversationsWithExtras = data?.map(conversation => ({
        ...conversation,
        inbox: {
          id: 1,
          name: 'Chat Interno',
          channel_type: 'webchat'
        },
        messages: [],
        labels: conversation.conversation_labels?.map((cl: any) => cl.kanban_labels).filter(Boolean) || [],
        kanban_position: conversation.conversation_kanban?.[0]
      })) || []

      console.log('Kanban conversations fetched successfully:', conversationsWithExtras.length)
      return conversationsWithExtras as EnhancedConversation[]
    },
    enabled: !!board_id && !!authUser,
    refetchInterval: 30000,
  })
}

// Hook para buscar etiquetas
export const useKanbanLabels = (account_id: number, board_id?: number) => {
  const { toast } = useToast()

  return useQuery({
    queryKey: ['kanban-labels', account_id, board_id],
    queryFn: async () => {
      console.log('Fetching kanban labels for account:', account_id)
      
      let query = supabase
        .from('kanban_labels')
        .select('*')
        .eq('account_id', account_id)

      if (board_id) {
        query = query.or(`board_id.eq.${board_id},board_id.is.null`)
      } else {
        query = query.is('board_id', null) // Global labels only
      }

      const { data, error } = await query.order('name')

      if (error) {
        console.error('Error fetching kanban labels:', error)
        toast({
          title: "Erro ao buscar etiquetas",
          description: error.message,
          variant: "destructive",
        })
        throw error
      }

      return data as KanbanLabel[]
    },
    enabled: !!account_id,
    staleTime: 5 * 60 * 1000,
  })
}

// Hook para mover conversa entre colunas
export const useMoveConversation = () => {
  const queryClient = useQueryClient()
  const { toast } = useToast()

  return useMutation({
    mutationFn: async ({ 
      conversationId, 
      columnId, 
      position 
    }: { 
      conversationId: number
      columnId: number
      position: number 
    }) => {
      console.log('Moving conversation:', { conversationId, columnId, position })

      const { data, error } = await supabase
        .from('conversation_kanban')
        .update({ 
          column_id: columnId,
          position: position,
          moved_at: new Date().toISOString()
        })
        .eq('conversation_id', conversationId)
        .select()
        .single()

      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['kanban-conversations'] })
      toast({
        title: "Conversa movida",
        description: "A conversa foi movida com sucesso",
      })
    },
    onError: (error: any) => {
      console.error('Error moving conversation:', error)
      toast({
        title: "Erro ao mover conversa",
        description: error.message,
        variant: "destructive",
      })
    }
  })
}

// Hook para adicionar etiqueta a conversa
export const useAddConversationLabel = () => {
  const queryClient = useQueryClient()
  const { toast } = useToast()

  return useMutation({
    mutationFn: async ({ 
      conversationId, 
      labelId,
      accountId 
    }: { 
      conversationId: number
      labelId: number
      accountId: number
    }) => {
      const { data, error } = await supabase
        .from('conversation_labels')
        .insert({ 
          conversation_id: conversationId,
          label_id: labelId,
          account_id: accountId
        })
        .select()
        .single()

      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['kanban-conversations'] })
      toast({
        title: "Etiqueta adicionada",
        description: "A etiqueta foi adicionada à conversa",
      })
    },
    onError: (error: any) => {
      console.error('Error adding label to conversation:', error)
      toast({
        title: "Erro ao adicionar etiqueta",
        description: error.message,
        variant: "destructive",
      })
    }
  })
}

// Hook para criar novo board
export const useCreateKanbanBoard = () => {
  const queryClient = useQueryClient()
  const { toast } = useToast()

  return useMutation({
    mutationFn: async (boardData: {
      account_id: number
      name: string
      description?: string
      visibility?: 'team' | 'agents_only' | 'admins_only'
      background_color?: string
    }) => {
      const { data, error } = await supabase
        .from('kanban_boards')
        .insert(boardData)
        .select()
        .single()

      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['kanban-boards'] })
      toast({
        title: "Quadro criado",
        description: "O quadro Kanban foi criado com sucesso",
      })
    },
    onError: (error: any) => {
      console.error('Error creating kanban board:', error)
      toast({
        title: "Erro ao criar quadro",
        description: error.message,
        variant: "destructive",
      })
    }
  })
}

// Hook para criar coluna
export const useCreateKanbanColumn = () => {
  const queryClient = useQueryClient()
  const { toast } = useToast()

  return useMutation({
    mutationFn: async (columnData: {
      board_id: number
      account_id: number
      name: string
      description?: string
      color?: string
      position: number
      max_cards?: number
      auto_assign_agent?: boolean
      is_final_stage?: boolean
    }) => {
      const { data, error } = await supabase
        .from('kanban_columns')
        .insert(columnData)
        .select()
        .single()

      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['kanban-columns'] })
      toast({
        title: "Coluna criada",
        description: "A coluna foi criada com sucesso",
      })
    },
    onError: (error: any) => {
      console.error('Error creating kanban column:', error)
      toast({
        title: "Erro ao criar coluna",
        description: error.message,
        variant: "destructive",
      })
    }
  })
}
