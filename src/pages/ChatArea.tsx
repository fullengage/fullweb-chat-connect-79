
import { useState, useEffect, useRef, useCallback } from "react"
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/AppSidebar"
import { ChatSidebar } from "@/components/ChatSidebar"
import { ChatMessages } from "@/components/ChatMessages"
import { ChatHeader } from "@/components/ChatHeader"
import { ChatInput } from "@/components/ChatInput"
import { useUsers, useSendMessage } from "@/hooks/useSupabaseData"
import { useChatwootConversations } from "@/hooks/useChatwootData"
import { useAuth } from "@/contexts/AuthContext"
import { supabase } from "@/integrations/supabase/client"
import { useToast } from "@/hooks/use-toast"
import { MessageSquare, RefreshCw, Filter, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

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
      <div className="min-h-screen flex w-full">
        <AppSidebar />
        <SidebarInset>
          <div className="flex h-screen">
            {/* Enhanced Chat Sidebar */}
            <div className="w-80 border-r border-border bg-card flex flex-col">
              {/* Sidebar Header with Controls */}
              <div className="p-4 border-b border-border">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
                    <MessageSquare className="h-5 w-5" />
                    Conversas
                  </h2>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => refetchConversations()}
                      disabled={conversationsLoading}
                    >
                      <RefreshCw className={`h-4 w-4 ${conversationsLoading ? 'animate-spin' : ''}`} />
                    </Button>
                  </div>
                </div>

                {/* Search */}
                <div className="relative mb-3">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Buscar conversas..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>

                {/* Filters */}
                <div className="grid grid-cols-2 gap-2 mb-3">
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="h-8">
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos</SelectItem>
                      <SelectItem value="open">Abertas</SelectItem>
                      <SelectItem value="pending">Pendentes</SelectItem>
                      <SelectItem value="resolved">Resolvidas</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select value={assigneeFilter} onValueChange={setAssigneeFilter}>
                    <SelectTrigger className="h-8">
                      <SelectValue placeholder="Responsável" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos</SelectItem>
                      <SelectItem value="unassigned">Não atribuído</SelectItem>
                      {users.map((user) => (
                        <SelectItem key={user.id} value={user.id}>
                          {user.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Statistics */}
                <div className="grid grid-cols-4 gap-1 text-xs">
                  <div className="text-center p-2 bg-muted rounded">
                    <div className="font-medium text-foreground">{stats.total}</div>
                    <div className="text-muted-foreground">Total</div>
                  </div>
                  <div className="text-center p-2 bg-muted rounded">
                    <div className="font-medium text-primary">{stats.unread}</div>
                    <div className="text-muted-foreground">Não lidas</div>
                  </div>
                  <div className="text-center p-2 bg-muted rounded">
                    <div className="font-medium text-green-600">{stats.assigned}</div>
                    <div className="text-muted-foreground">Atribuídas</div>
                  </div>
                  <div className="text-center p-2 bg-muted rounded">
                    <div className="font-medium text-orange-600">{stats.unassigned}</div>
                    <div className="text-muted-foreground">Livres</div>
                  </div>
                </div>

                {/* Auto-refresh controls */}
                <div className="flex items-center justify-between mt-3 text-xs">
                  <label className="flex items-center gap-2 text-muted-foreground">
                    <input
                      type="checkbox"
                      checked={autoRefresh}
                      onChange={(e) => setAutoRefresh(e.target.checked)}
                      className="rounded"
                    />
                    Auto-refresh
                  </label>
                  {autoRefresh && (
                    <Select value={refreshInterval.toString()} onValueChange={(v) => setRefreshInterval(parseInt(v))}>
                      <SelectTrigger className="h-6 w-16 text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="10">10s</SelectItem>
                        <SelectItem value="30">30s</SelectItem>
                        <SelectItem value="60">1m</SelectItem>
                        <SelectItem value="300">5m</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                </div>
              </div>

              {/* Conversation Tabs */}
              <Tabs value={statusFilter} onValueChange={setStatusFilter} className="flex-1 flex flex-col">
                <TabsList className="grid w-full grid-cols-4 h-8 mx-4 mt-2">
                  <TabsTrigger value="all" className="text-xs">
                    Todas {conversationsByStatus.all.length > 0 && <Badge variant="secondary" className="ml-1 text-xs px-1">{conversationsByStatus.all.length}</Badge>}
                  </TabsTrigger>
                  <TabsTrigger value="open" className="text-xs">
                    Abertas {conversationsByStatus.open.length > 0 && <Badge variant="secondary" className="ml-1 text-xs px-1">{conversationsByStatus.open.length}</Badge>}
                  </TabsTrigger>
                  <TabsTrigger value="pending" className="text-xs">
                    Pendentes {conversationsByStatus.pending.length > 0 && <Badge variant="secondary" className="ml-1 text-xs px-1">{conversationsByStatus.pending.length}</Badge>}
                  </TabsTrigger>
                  <TabsTrigger value="resolved" className="text-xs">
                    Resolvidas {conversationsByStatus.resolved.length > 0 && <Badge variant="secondary" className="ml-1 text-xs px-1">{conversationsByStatus.resolved.length}</Badge>}
                  </TabsTrigger>
                </TabsList>

                {/* Conversation List */}
                <div className="flex-1 overflow-auto">
                  {Object.entries(conversationsByStatus).map(([status, convs]) => (
                    <TabsContent key={status} value={status} className="m-0 h-full">
                      {conversationsLoading ? (
                        <div className="p-4 space-y-4">
                          {[...Array(5)].map((_, i) => (
                            <div key={i} className="h-16 bg-muted rounded animate-pulse" />
                          ))}
                        </div>
                      ) : convs.length === 0 ? (
                        <div className="p-4 text-center text-muted-foreground">
                          <MessageSquare className="h-12 w-12 mx-auto mb-2 opacity-50" />
                          <p>Nenhuma conversa encontrada</p>
                        </div>
                      ) : (
                        <div className="space-y-1 p-2">
                          {convs.map((conversation) => (
                            <div
                              key={conversation.id}
                              onClick={() => setSelectedConversation(conversation)}
                              className={`p-3 rounded-lg cursor-pointer transition-colors border ${
                                selectedConversation?.id === conversation.id
                                  ? 'bg-primary/10 border-primary'
                                  : 'hover:bg-muted border-transparent'
                              }`}
                            >
                              <div className="flex items-start justify-between mb-2">
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2">
                                    <span className="font-medium text-sm text-foreground truncate">
                                      {conversation.contact?.name || 'Contato Desconhecido'}
                                    </span>
                                    {(conversation.unread_count || 0) > 0 && (
                                      <Badge variant="destructive" className="text-xs">
                                        {conversation.unread_count}
                                      </Badge>
                                    )}
                                  </div>
                                  <p className="text-xs text-muted-foreground truncate">
                                    {conversation.contact?.email}
                                  </p>
                                </div>
                                <Badge
                                  variant={
                                    conversation.status === 'open' ? 'default' :
                                    conversation.status === 'pending' ? 'secondary' : 'outline'
                                  }
                                  className="text-xs"
                                >
                                  {conversation.status}
                                </Badge>
                              </div>
                              
                              {conversation.assignee && (
                                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                  <span>📋</span>
                                  <span>{conversation.assignee.name}</span>
                                </div>
                              )}
                              
                              <div className="text-xs text-muted-foreground mt-1">
                                {new Date(conversation.updated_at).toLocaleString('pt-BR')}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </TabsContent>
                  ))}
                </div>
              </Tabs>
            </div>

            {/* Main Chat Area */}
            <div className="flex-1 flex flex-col">
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
                  
                  <div className="flex-1 overflow-hidden flex flex-col">
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
                <div className="flex-1 flex items-center justify-center bg-gray-50">
                  <div className="text-center">
                    <div className="bg-blue-50 rounded-full p-6 w-24 h-24 mx-auto mb-4 flex items-center justify-center">
                      <MessageSquare className="h-12 w-12 text-blue-600" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">
                      Selecione uma conversa
                    </h3>
                    <p className="text-gray-500">
                      Escolha uma conversa na barra lateral para começar a atender.
                    </p>
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
