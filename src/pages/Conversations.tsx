import { useState, useEffect } from "react"
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/AppSidebar"
import { ConversationStats } from "@/components/ConversationStats"
import { ConversationManagement } from "@/components/ConversationManagement"
import { useChatwootConversations, useChatwootAgents, useChatwootInboxes } from "@/hooks/useChatwootApi"
import { ConversationForStats } from "@/types"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { RefreshCw, MessageSquare } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/contexts/AuthContext"
import { supabase } from "@/integrations/supabase/client"

export default function Conversations() {
  const [accountId, setAccountId] = useState("")
  const [status, setStatus] = useState("all")
  const [assigneeId, setAssigneeId] = useState("all")
  const [inboxId, setInboxId] = useState("all")
  const [currentUser, setCurrentUser] = useState<any>(null)
  const { toast } = useToast()
  const { user: authUser } = useAuth()

  // Buscar dados do usuário atual
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
        toast({
          title: "Erro ao carregar dados do usuário",
          description: error.message,
          variant: "destructive",
        })
        return
      }

      setCurrentUser(userData)
      
      // Para admin e agent, definir automaticamente o account_id
      if (userData.role === 'admin' || userData.role === 'agent') {
        setAccountId(userData.account_id.toString())
      }
    }

    fetchCurrentUser()
  }, [authUser, toast])

  const accountIdNumber = accountId ? parseInt(accountId) : 0

  // Usar hooks do Chatwoot para todos os dados
  const {
    data: conversations = [],
    isLoading: conversationsLoading,
    error: conversationsError,
    refetch: refetchConversations
  } = useChatwootConversations()

  const {
    data: agents = [],
    isLoading: agentsLoading
  } = useChatwootAgents()

  const {
    data: inboxes = [],
    isLoading: inboxesLoading
  } = useChatwootInboxes()

  const handleRefresh = () => {
    refetchConversations()
    toast({
      title: "Atualizando conversas",
      description: "Buscando as conversas mais recentes do Chatwoot...",
    })
  }

  // Filtrar conversas localmente baseado nos filtros selecionados
  const filteredConversations = conversations.filter((conversation: any) => {
    // Filtro por status
    if (status !== "all" && conversation.status !== status) {
      return false;
    }
    
    // Filtro por assignee
    if (assigneeId === "unassigned") {
      return !conversation.assignee;
    } else if (assigneeId !== "all") {
      return conversation.assignee?.id === parseInt(assigneeId);
    }
    
    // Filtro por inbox
    if (inboxId !== "all" && conversation.inbox_id !== parseInt(inboxId)) {
      return false;
    }
    
    return true;
  });

  // Convert to ConversationForStats format for the stats component
  const conversationsForStats: ConversationForStats[] = filteredConversations.map((conv: any) => ({
    id: conv.id,
    status: conv.status,
    unread_count: conv.unread_count || 0,
    contact: {
      id: conv.contact?.id || 0,
      name: conv.contact?.name || 'Contato Desconhecido',
      email: conv.contact?.email,
      phone: conv.contact?.phone_number,
      avatar_url: conv.contact?.avatar
    },
    assignee: conv.assignee ? {
      id: conv.assignee.id,
      name: conv.assignee.name,
      avatar_url: conv.assignee.avatar
    } : undefined,
    inbox: {
      id: conv.inbox_id || 1,
      name: conv.meta?.inbox?.name || 'Inbox Padrão',
      channel_type: conv.meta?.inbox?.channel_type || 'webchat'
    },
    updated_at: conv.updated_at,
    messages: conv.messages || []
  }))

  if (!currentUser) {
    return (
      <SidebarProvider>
        <div className="min-h-screen flex w-full">
          <AppSidebar />
          <SidebarInset>
            <div className="flex-1 p-6">
              <div className="text-center py-16">
                <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-4 text-gray-500">Carregando dados do usuário...</p>
              </div>
            </div>
          </SidebarInset>
        </div>
      </SidebarProvider>
    )
  }

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AppSidebar />
        <SidebarInset>
          <div className="flex-1 space-y-6 p-6">
            <div className="flex items-center justify-between border-b pb-4">
              <div className="flex items-center space-x-4">
                <SidebarTrigger />
                <div>
                  <h1 className="text-3xl font-bold tracking-tight flex items-center space-x-2">
                    <MessageSquare className="h-8 w-8 text-blue-600" />
                    <span>Conversas</span>
                  </h1>
                  <p className="text-muted-foreground">
                    Gerencie todas as suas conversas do Chatwoot em um só lugar
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Button onClick={handleRefresh} disabled={conversationsLoading}>
                  <RefreshCw className={`h-4 w-4 mr-2 ${conversationsLoading ? 'animate-spin' : ''}`} />
                  Atualizar
                </Button>
              </div>
            </div>

            {/* Filtros */}
            <div className="space-y-4 p-4 bg-white rounded-lg border">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Filtros</h3>
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-500">
                    Papel: <span className="font-medium capitalize">{currentUser.role}</span>
                  </span>
                  {currentUser.account_id && (
                    <span className="text-sm text-gray-500">
                      Conta: <span className="font-medium">{currentUser.account_id}</span>
                    </span>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Campo ID da Conta - só visível para superadmin */}
                {currentUser.role === 'superadmin' && (
                  <div className="space-y-2">
                    <label className="text-sm font-medium">ID da Conta</label>
                    <Input
                      placeholder="Digite o ID da conta"
                      value={accountId}
                      onChange={(e) => setAccountId(e.target.value)}
                      type="number"
                      className="h-9"
                    />
                  </div>
                )}

                <div className="space-y-2">
                  <label className="text-sm font-medium">Status</label>
                  <Select value={status} onValueChange={setStatus}>
                    <SelectTrigger className="h-9">
                      <SelectValue placeholder="Selecione o status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos os Status</SelectItem>
                      <SelectItem value="open">Abertas</SelectItem>
                      <SelectItem value="pending">Pendentes</SelectItem>
                      <SelectItem value="resolved">Resolvidas</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Responsável</label>
                  <Select value={assigneeId} onValueChange={setAssigneeId} disabled={agentsLoading}>
                    <SelectTrigger className="h-9">
                      <SelectValue placeholder="Selecione o responsável" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos os Responsáveis</SelectItem>
                      <SelectItem value="unassigned">Não Atribuído</SelectItem>
                      {agents.map((agent) => (
                        <SelectItem key={agent.id} value={agent.id.toString()}>
                          {agent.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Canal</label>
                  <Select value={inboxId} onValueChange={setInboxId} disabled={inboxesLoading}>
                    <SelectTrigger className="h-9">
                      <SelectValue placeholder="Selecione o canal" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos os Canais</SelectItem>
                      {inboxes.map((inbox) => (
                        <SelectItem key={inbox.id} value={inbox.id.toString()}>
                          {inbox.name} ({inbox.channel_type})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Resumo dos filtros */}
              <div className="flex items-center justify-between pt-4 border-t">
                <div className="flex items-center space-x-4 text-sm text-gray-600">
                  <span>Total de conversas: <strong>{conversations.length}</strong></span>
                  <span>Filtradas: <strong>{filteredConversations.length}</strong></span>
                  <span>Agentes: <strong>{agents.length}</strong></span>
                  <span>Canais: <strong>{inboxes.length}</strong></span>
                </div>
                {(status !== "all" || assigneeId !== "all" || inboxId !== "all") && (
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => {
                      setStatus("all");
                      setAssigneeId("all");
                      setInboxId("all");
                    }}
                  >
                    Limpar filtros
                  </Button>
                )}
              </div>
            </div>

            {/* Estado de carregamento */}
            {conversationsLoading && (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <span className="ml-3 text-gray-600">Carregando conversas do Chatwoot...</span>
              </div>
            )}

            {/* Erro de conexão */}
            {conversationsError && (
              <div className="text-center py-8">
                <div className="max-w-md mx-auto">
                  <div className="bg-red-50 rounded-full p-6 w-24 h-24 mx-auto mb-4 flex items-center justify-center">
                    <MessageSquare className="h-12 w-12 text-red-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    Erro ao carregar conversas
                  </h3>
                  <p className="text-gray-500 mb-6">
                    Não foi possível conectar com o Chatwoot. Verifique a configuração do proxy.
                  </p>
                  <Button onClick={handleRefresh}>
                    Tentar novamente
                  </Button>
                </div>
              </div>
            )}

            {/* Conteúdo principal */}
            {!conversationsLoading && !conversationsError && (
              <div className="space-y-6">
                <ConversationStats
                  conversations={conversationsForStats}
                  isLoading={conversationsLoading}
                />
                
                <ConversationManagement
                  accountId={accountIdNumber || 1} // Usar 1 como padrão
                  selectedInboxId={inboxId !== "all" ? parseInt(inboxId) : undefined}
                />
              </div>
            )}
          </div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  )
}
