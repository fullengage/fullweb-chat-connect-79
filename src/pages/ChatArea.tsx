
import { useState, useEffect, useRef, useCallback } from "react"
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/AppSidebar"
import { ChatMessages } from "@/components/ChatMessages"
import { ChatHeader } from "@/components/ChatHeader"
import { ChatInput } from "@/components/ChatInput"
import { ConversationFilters } from "@/components/ConversationFilters"
import { ConversationStats } from "@/components/ConversationStats"
import { AutoRefreshControls } from "@/components/AutoRefreshControls"
import { ConversationListTabs } from "@/components/ConversationListTabs"
import { useUsers, useSendMessage } from "@/hooks/useSupabaseData"
import { useChatwootConversations } from "@/hooks/useChatwootData"
import { useAuth } from "@/contexts/AuthContext"
import { supabase } from "@/integrations/supabase/client"
import { useToast } from "@/hooks/use-toast"
import { MessageSquare, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function ChatArea() {
  const [selectedConversation, setSelectedConversation] = useState<any>(null)
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [assigneeFilter, setAssigneeFilter] = useState("all")
  const [autoRefresh, setAutoRefresh] = useState(true)
  const [refreshInterval, setRefreshInterval] = useState(30) // seconds
  const { user: authUser } = useAuth()
  const { toast } = useToast()
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const refreshTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  // Fetch current user data
  useEffect(() => {
    const fetchCurrentUser = async () => {
      if (!authUser) return

      const { data: userData, error } = await supabase
        .from('users')
        .select('*')
        .eq('auth_user_id', authUser.id)
        .single()

      if (error) {
        console.error('Error fetching user data:', error)
        return
      }

      setCurrentUser(userData)
    }

    fetchCurrentUser()
  }, [authUser])

  // Build filters for conversations
  const filters = {
    account_id: currentUser?.account_id || 0,
    ...(statusFilter !== "all" && { status: statusFilter }),
    ...(assigneeFilter !== "all" && assigneeFilter !== "unassigned" && { assignee_id: parseInt(assigneeFilter) }),
  }

  const {
    data: conversations = [],
    isLoading: conversationsLoading,
    error: conversationsError,
    refetch: refetchConversations
  } = useChatwootConversations(filters)

  const {
    data: users = [],
    isLoading: usersLoading
  } = useUsers(currentUser?.account_id || 0)

  const sendMessageMutation = useSendMessage()

  // Auto refresh functionality
  const setupAutoRefresh = useCallback(() => {
    if (refreshTimeoutRef.current) {
      clearTimeout(refreshTimeoutRef.current)
    }

    if (autoRefresh && refreshInterval > 0) {
      refreshTimeoutRef.current = setTimeout(() => {
        refetchConversations()
        setupAutoRefresh()
      }, refreshInterval * 1000)
    }
  }, [autoRefresh, refreshInterval, refetchConversations])

  useEffect(() => {
    setupAutoRefresh()
    return () => {
      if (refreshTimeoutRef.current) {
        clearTimeout(refreshTimeoutRef.current)
      }
    }
  }, [setupAutoRefresh])

  // Auto scroll to bottom when new messages arrive
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [selectedConversation?.messages])

  // Filter conversations based on search and filters
  const filteredConversations = (Array.isArray(conversations) ? conversations : []).filter(conversation => {
    const matchesSearch = searchTerm === "" || 
      conversation.contact?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      conversation.contact?.email?.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesStatus = statusFilter === "all" || conversation.status === statusFilter
    
    const matchesAssignee = assigneeFilter === "all" || 
      (assigneeFilter === "unassigned" && !conversation.assignee) ||
      (assigneeFilter !== "unassigned" && conversation.assignee?.id === parseInt(assigneeFilter))

    return matchesSearch && matchesStatus && matchesAssignee
  })

  // Group conversations by status for tabs
  const conversationsByStatus = {
    all: filteredConversations,
    open: filteredConversations.filter(c => c.status === 'open'),
    pending: filteredConversations.filter(c => c.status === 'pending'), 
    resolved: filteredConversations.filter(c => c.status === 'resolved'),
  }

  // Calculate statistics
  const stats = {
    total: filteredConversations.length,
    unread: filteredConversations.filter(c => (c.unread_count || 0) > 0).length,
    assigned: filteredConversations.filter(c => c.assignee).length,
    unassigned: filteredConversations.filter(c => !c.assignee).length,
  }

  const handleSendMessage = async (content: string) => {
    if (!selectedConversation || !currentUser) return

    try {
      await sendMessageMutation.mutateAsync({
        conversation_id: selectedConversation.id,
        sender_type: 'agent',
        sender_id: currentUser.id,
        content,
        account_id: currentUser.account_id
      })

      // Refresh conversations to get updated messages
      refetchConversations()
    } catch (error) {
      console.error('Error sending message:', error)
      toast({
        title: "Erro ao enviar mensagem",
        description: "Não foi possível enviar a mensagem. Tente novamente.",
        variant: "destructive",
      })
    }
  }

  const handleResolveConversation = async () => {
    if (!selectedConversation) return

    try {
      const { error } = await supabase
        .from('conversations')
        .update({ status: 'resolved', updated_at: new Date().toISOString() })
        .eq('id', selectedConversation.id)

      if (error) throw error

      toast({
        title: "Conversa resolvida",
        description: "A conversa foi marcada como resolvida com sucesso.",
      })

      // Update local state
      setSelectedConversation(prev => prev ? { ...prev, status: 'resolved' } : null)
      refetchConversations()
    } catch (error) {
      console.error('Error resolving conversation:', error)
      toast({
        title: "Erro ao resolver conversa",
        description: "Não foi possível resolver a conversa. Tente novamente.",
        variant: "destructive",
      })
    }
  }

  const handleAssignAgent = async (conversationId: number, agentId: string) => {
    try {
      // Here you would call the Chatwoot API to assign agent
      // For now, just show success message
      toast({
        title: "Agente atribuído",
        description: "O agente foi atribuído à conversa com sucesso.",
      })
      refetchConversations()
    } catch (error) {
      console.error('Error assigning agent:', error)
      toast({
        title: "Erro ao atribuir agente",
        description: "Não foi possível atribuir o agente. Tente novamente.",
        variant: "destructive",
      })
    }
  }

  const handleMarkAsRead = async (conversationId: number) => {
    try {
      // Here you would call the Chatwoot API to mark as read
      toast({
        title: "Marcada como lida",
        description: "A conversa foi marcada como lida.",
      })
      refetchConversations()
    } catch (error) {
      console.error('Error marking as read:', error)
      toast({
        title: "Erro ao marcar como lida",
        description: "Não foi possível marcar a conversa como lida.",
        variant: "destructive",
      })
    }
  }

  const handleAddLabel = async (conversationId: number, label: string) => {
    try {
      // Here you would call the Chatwoot API to add label
      toast({
        title: "Etiqueta adicionada",
        description: `Etiqueta "${label}" adicionada à conversa.`,
      })
      refetchConversations()
    } catch (error) {
      console.error('Error adding label:', error)
      toast({
        title: "Erro ao adicionar etiqueta",
        description: "Não foi possível adicionar a etiqueta.",
        variant: "destructive",
      })
    }
  }

  if (!currentUser) {
    return (
      <SidebarProvider>
        <div className="min-h-screen flex w-full">
          <AppSidebar />
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-500">Carregando dados do usuário...</p>
            </div>
          </div>
        </div>
      </SidebarProvider>
    )
  }

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <AppSidebar />
        <SidebarInset className="flex-1">
          <div className="flex h-screen">
            {/* Enhanced Chat Sidebar */}
            <div className="w-80 border-r border-border bg-card/50 backdrop-blur-sm flex flex-col animate-fade-in">
              {/* Sidebar Header with Controls */}
              <div className="p-4 border-b border-border bg-gradient-to-r from-primary/5 to-primary/10">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
                    <MessageSquare className="h-5 w-5 text-primary" />
                    Conversas
                  </h2>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => refetchConversations()}
                      disabled={conversationsLoading}
                      className="hover-scale"
                    >
                      <RefreshCw className={`h-4 w-4 ${conversationsLoading ? 'animate-spin' : ''}`} />
                    </Button>
                  </div>
                </div>

                <ConversationFilters
                  searchTerm={searchTerm}
                  setSearchTerm={setSearchTerm}
                  statusFilter={statusFilter}
                  setStatusFilter={setStatusFilter}
                  assigneeFilter={assigneeFilter}
                  setAssigneeFilter={setAssigneeFilter}
                  users={users}
                />

                <ConversationStats stats={stats} />

                <AutoRefreshControls
                  autoRefresh={autoRefresh}
                  setAutoRefresh={setAutoRefresh}
                  refreshInterval={refreshInterval}
                  setRefreshInterval={setRefreshInterval}
                />
              </div>

              <ConversationListTabs
                statusFilter={statusFilter}
                setStatusFilter={setStatusFilter}
                conversationsByStatus={conversationsByStatus}
                selectedConversation={selectedConversation}
                setSelectedConversation={setSelectedConversation}
                conversationsLoading={conversationsLoading}
              />
            </div>

            {/* Main Chat Area */}
            <div className="flex-1 flex flex-col bg-background">
              {selectedConversation ? (
                <>
                  <ChatHeader
                    conversation={selectedConversation}
                    onResolve={handleResolveConversation}
                    onAssignAgent={handleAssignAgent}
                    onMarkAsRead={handleMarkAsRead}
                    onAddLabel={handleAddLabel}
                    users={users}
                  />
                  
                  <div className="flex-1 overflow-hidden flex flex-col bg-gradient-to-b from-muted/10 to-muted/5">
                    <ChatMessages
                      conversation={selectedConversation}
                      currentUser={currentUser}
                      users={users}
                    />
                    <div ref={messagesEndRef} />
                  </div>

                  <ChatInput
                    onSendMessage={handleSendMessage}
                    isLoading={sendMessageMutation.isPending}
                  />
                </>
              ) : (
                <div className="flex-1 flex items-center justify-center bg-gradient-to-br from-muted/20 via-background to-primary/5">
                  <div className="text-center animate-fade-in">
                    <div className="bg-primary/10 rounded-full p-8 w-32 h-32 mx-auto mb-6 flex items-center justify-center animate-scale-in">
                      <MessageSquare className="h-16 w-16 text-primary" />
                    </div>
                    <h3 className="text-2xl font-semibold text-foreground mb-3">
                      Selecione uma conversa
                    </h3>
                    <p className="text-muted-foreground text-lg max-w-md mx-auto">
                      Escolha uma conversa na barra lateral para começar a atender seus clientes.
                    </p>
                    <div className="mt-8 flex flex-col items-center gap-3">
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                          <span>{stats.total} conversas ativas</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse"></div>
                          <span>{stats.unread} não lidas</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  )
}
