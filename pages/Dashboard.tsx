import { useState } from "react"
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/AppSidebar"
import { ChatwootFilters } from "@/components/ChatwootFilters"
import { ConversationStats } from "@/components/ConversationStats"
import { ConversationManagement } from "@/components/ConversationManagement"
import { InboxManagement } from "@/components/InboxManagement"
import { useConversations, useUsers, useInboxes, useUpdateConversationStatus, type User } from "@/hooks/useSupabaseData"
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
    ...(assigneeId !== "all" && assigneeId !== "unassigned" && { assignee_id: assigneeId }),
  }

  const {
    data: conversations = [],
    isLoading: conversationsLoading,
    error: conversationsError,
    refetch: refetchConversations
  } = useConversations(filters)

  const {
    data: agents = [],
    isLoading: agentsLoading
  } = useUsers(accountIdNumber)

  const {
    data: inboxes = [],
    isLoading: inboxesLoading
  } = useInboxes(accountIdNumber)

  const updateStatus = useUpdateConversationStatus()

  const handleRefresh = () => {
    refetchConversations()
    toast({
      title: "Atualizando dados",
      description: "Buscando as informações mais recentes...",
    })
  }

  const handleKanbanStatusChange = async (conversationId: number, newStatus: string) => {
    try {
      await updateStatus.mutateAsync({ conversationId, status: newStatus })
      
      // Atualizar dados para refletir mudança
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

  const filteredConversations = conversations.filter((conversation: Conversation) => {
    if (assigneeId === "unassigned") {
      return !conversation.assignee
    }
    return true
  })

  // Convert conversations to the format expected by components
  const conversationsForStats: ConversationForStats[] = filteredConversations.map((conv: Conversation) => ({
    id: conv.id,
    status: conv.status,
    unread_count: conv.unread_count || 0,
    contact: {
      id: conv.contact?.id || 0,
      name: conv.contact?.name || 'Contato Desconhecido',
      email: conv.contact?.email,
      phone: conv.contact?.phone,
      avatar_url: conv.contact?.avatar_url
    },
    assignee: conv.assignee ? {
      id: conv.assignee.id,
      name: conv.assignee.name,
      avatar_url: conv.assignee.avatar_url
    } : undefined,
    inbox: {
      id: 1, // Mock inbox id since we don't have inbox_id in conversations table
      name: 'Inbox Padrão',
      channel_type: 'webchat'
    },
    updated_at: conv.updated_at,
    messages: conv.messages || []
  }))

  const agentsForFilter: LocalAgent[] = agents.map((user: User, index: number) => ({
    id: index + 1, // Use index as number ID since ChatwootFilters expects number
    name: user.name,
    email: user.email
  }))

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
                  <h1 className="text-3xl font-bold tracking-tight">Painel de Atendimento ao Cliente</h1>
                  <p className="text-muted-foreground">
                    Gerencie suas conversas em tempo real
                  </p>
                </div>
              </div>
              <Button onClick={handleRefresh} disabled={conversationsLoading}>
                <RefreshCw className={`h-4 w-4 mr-2 ${conversationsLoading ? 'animate-spin' : ''}`} />
                Atualizar
              </Button>
            </div>

            <ChatwootFilters
              status={status}
              assigneeId={assigneeId}
              inboxId={inboxId}
              accountId={accountId}
              onStatusChange={setStatus}
              onAssigneeChange={setAssigneeId}
              onInboxChange={setInboxId}
              onAccountIdChange={setAccountId}
              agents={agentsForFilter}
              inboxes={inboxes}
              isLoading={agentsLoading || inboxesLoading}
            />

            {accountIdNumber > 0 && (
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="overview" className="flex items-center space-x-2">
                    <BarChart3 className="h-4 w-4" />
                    <span>Visão Geral</span>
                  </TabsTrigger>
                  <TabsTrigger value="kanban" className="flex items-center space-x-2">
                    <Kanban className="h-4 w-4" />
                    <span>Kanban</span>
                  </TabsTrigger>
                  <TabsTrigger value="conversations" className="flex items-center space-x-2">
                    <MessageSquare className="h-4 w-4" />
                    <span>Conversas</span>
                  </TabsTrigger>
                  <TabsTrigger value="inboxes" className="flex items-center space-x-2">
                    <Inbox className="h-4 w-4" />
                    <span>Caixas de Entrada</span>
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="space-y-6 mt-6">
                  <ConversationStats
                    conversations={conversationsForStats}
                    isLoading={conversationsLoading}
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

            {accountIdNumber === 0 && (
              <div className="text-center py-12">
                <MessageSquare className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Selecione uma conta para começar
                </h3>
                <p className="text-gray-500">
                  Selecione uma conta nos filtros acima para visualizar suas conversas
                </p>
              </div>
            )}
          </div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  )
}
