import { useState } from "react"
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/AppSidebar"
import { ChatwootFilters } from "@/components/ChatwootFilters"
import { ConversationStats } from "@/components/ConversationStats"
import { ConversationManagement } from "@/components/ConversationManagement"
import { InboxManagement } from "@/components/InboxManagement"
import { 
  useChatwootConversations,
  useChatwootAgents,
  useChatwootInboxes
} from "@/hooks/useChatwootData"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { RefreshCw, Inbox, MessageSquare, BarChart3 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { KanbanBoard } from "@/components/KanbanBoard"
import { Kanban } from "lucide-react"
import { ConversationForStats, Conversation } from "@/types"

// Define Agent type locally to match what ChatwootFilters expects
interface LocalAgent {
  id: number
  name: string
  email: string
}

export default function Dashboard() {
  const [accountId, setAccountId] = useState("1")
  const [status, setStatus] = useState("all")
  const [assigneeId, setAssigneeId] = useState("all")
  const [inboxId, setInboxId] = useState("all")
  const [activeTab, setActiveTab] = useState("overview")
  const { toast } = useToast()

  const accountIdNumber = accountId ? parseInt(accountId) : 1

  // Build filters object
  const filters = {
    account_id: accountIdNumber,
    ...(status !== "all" && { status }),
    ...(assigneeId !== "all" && assigneeId !== "unassigned" && { assignee_id: parseInt(assigneeId) }),
    ...(inboxId !== "all" && { inbox_id: parseInt(inboxId) }),
  }

  // Use Chatwoot hooks - same as ChatArea  
  const {
    data: conversations = [],
    isLoading: conversationsLoading,
    refetch: refetchConversations
  } = useChatwootConversations(filters)

  const {
    data: agents = [],
    isLoading: agentsLoading
  } = useChatwootAgents(accountIdNumber)

  const {
    data: inboxes = [],
    isLoading: inboxesLoading
  } = useChatwootInboxes(accountIdNumber)

  const handleRefresh = () => {
    refetchConversations()
    toast({
      title: "Atualizando dados",
      description: "Buscando as informações mais recentes...",
    })
  }

  const handleKanbanStatusChange = async (conversationId: number, newStatus: string) => {
    try {
      // Note: This would need to be implemented with the proxy
      console.log('Updating conversation status:', conversationId, newStatus)
      
      // Refresh data after change
      refetchConversations()
      
      toast({
        title: "Status atualizado",
        description: `Conversa movida para ${newStatus}`,
        variant: "default",
      })
    } catch (error) {
      console.error('Error updating conversation status:', error)
      toast({
        title: "Erro ao atualizar status",
        description: "Não foi possível atualizar o status da conversa",
        variant: "destructive",
      })
    }
  }

  const filteredConversations = conversations.filter((conversation: any) => {
    if (assigneeId === "unassigned") {
      return !conversation.assignee_id
    }
    return true
  })

  // Convert conversations to the format expected by components
  const conversationsForStats: ConversationForStats[] = filteredConversations.map((conv: any) => ({
    id: conv.id,
    status: conv.status,
    unread_count: conv.unread_count || 0,
    contact: {
      id: conv.meta?.sender?.id || 0,
      name: conv.meta?.sender?.name || 'Contato Desconhecido',
      email: conv.meta?.sender?.email,
      phone: conv.meta?.sender?.phone_number,
      avatar_url: conv.meta?.sender?.thumbnail
    },
    assignee: conv.assignee ? {
      id: conv.assignee.id,
      name: conv.assignee.name,
      avatar_url: conv.assignee.avatar_url
    } : undefined,
    inbox: {
      id: conv.inbox_id || 1,
      name: conv.inbox?.name || 'Chat',
      channel_type: conv.meta?.channel || 'webchat'
    },
    updated_at: conv.updated_at,
    messages: conv.messages || []
  }))

  const agentsForFilter: LocalAgent[] = agents.map((agent: any, index: number) => ({
    id: agent.id || index + 1,
    name: agent.name,
    email: agent.email
  }))

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <AppSidebar />
        <SidebarInset>
          <div className="flex-1 space-y-6">
            {/* Modern Header with gradient */}
            <div className="gradient-purple p-6 border-b border-border/10">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <SidebarTrigger className="text-white hover:bg-white/10" />
                  <div>
                    <h1 className="text-3xl font-bold text-white tracking-tight">Painel de Atendimento ao Cliente</h1>
                    <p className="text-white/80 mt-1">
                      Gerencie suas conversas em tempo real
                    </p>
                  </div>
                </div>
                <Button 
                  onClick={handleRefresh} 
                  disabled={conversationsLoading}
                  variant="secondary"
                  className="bg-white/10 hover:bg-white/20 text-white border-white/20"
                >
                  <RefreshCw className={`h-4 w-4 mr-2 ${conversationsLoading ? 'animate-spin' : ''}`} />
                  Atualizar
                </Button>
              </div>
            </div>
            
            <div className="px-6 space-y-6">

            {accountIdNumber > 0 && (
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid w-full grid-cols-4 bg-card/50 backdrop-blur-sm border border-border/50">
                  <TabsTrigger 
                    value="overview" 
                    className="flex items-center space-x-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                  >
                    <BarChart3 className="h-4 w-4" />
                    <span>Visão Geral</span>
                  </TabsTrigger>
                  <TabsTrigger 
                    value="kanban" 
                    className="flex items-center space-x-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                  >
                    <Kanban className="h-4 w-4" />
                    <span>Kanban</span>
                  </TabsTrigger>
                  <TabsTrigger 
                    value="conversations" 
                    className="flex items-center space-x-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                  >
                    <MessageSquare className="h-4 w-4" />
                    <span>Conversas</span>
                  </TabsTrigger>
                  <TabsTrigger 
                    value="inboxes" 
                    className="flex items-center space-x-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                  >
                    <Inbox className="h-4 w-4" />
                    <span>Caixas de Entrada</span>
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="space-y-6 mt-6">
                  <ConversationStats
                    stats={{
                      total: conversationsForStats.length,
                      unread: conversationsForStats.filter(c => c.unread_count > 0).length,
                      assigned: conversationsForStats.filter(c => c.assignee).length,
                      unassigned: conversationsForStats.filter(c => !c.assignee).length
                    }}
                  />
                  
                  <ConversationManagement
                    accountId={accountIdNumber}
                    selectedInboxId={inboxId !== "all" ? parseInt(inboxId) : undefined}
                  />
                </TabsContent>

                <TabsContent value="kanban" className="space-y-6 mt-6">
                  <KanbanBoard
                    accountId={accountIdNumber}
                    onConversationClick={(conversation) => {
                      console.log('Opening conversation:', conversation.id)
                    }}
                    selectedBoardId={undefined}
                    onBoardChange={(boardId) => {
                      console.log('Board changed to:', boardId)
                    }}
                  />
                </TabsContent>

                <TabsContent value="conversations" className="space-y-6 mt-6">
                  <ConversationManagement
                    accountId={accountIdNumber}
                    selectedInboxId={inboxId !== "all" ? parseInt(inboxId) : undefined}
                  />
                </TabsContent>

                <TabsContent value="inboxes" className="space-y-6 mt-6">
                  <InboxManagement accountId={accountIdNumber} />
                </TabsContent>
              </Tabs>
            )}
            </div>

            {accountIdNumber === 0 && (
              <div className="text-center py-12 px-6">
                <div className="max-w-md mx-auto">
                  <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-primary/10 flex items-center justify-center">
                    <MessageSquare className="h-12 w-12 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold text-foreground mb-3">
                    Selecione uma conta para começar
                  </h3>
                  <p className="text-muted-foreground">
                    Selecione uma conta nos filtros acima para visualizar suas conversas
                  </p>
                </div>
              </div>
            )}
          </div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  )
}
