
import { useState } from "react"
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/AppSidebar"
import { ChatwootFilters } from "@/components/ChatwootFilters"
import { ConversationAnalytics } from "@/components/ConversationAnalytics"
import { ResponseTimeAnalytics } from "@/components/ResponseTimeAnalytics"
import { AgentPerformanceAnalytics } from "@/components/AgentPerformanceAnalytics"
import { useConversations, useUsers, useInboxes, User } from "@/hooks/useSupabaseData"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { RefreshCw, BarChart3, Clock, Users, TrendingUp } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

// Type adapter to convert User to Agent format expected by ChatwootFilters
interface Agent {
  id: number
  name: string
  email: string
}

const convertUsersToAgents = (users: User[]): Agent[] => {
  return users.map((user, index) => ({
    id: index + 1, // Use index as number ID for compatibility
    name: user.name || 'Unknown Agent',
    email: user.email || 'no-email@example.com'
  }))
}

export default function Analytics() {
  const [status, setStatus] = useState("all")
  const [assigneeId, setAssigneeId] = useState("all")
  const [inboxId, setInboxId] = useState("all")
  const [accountId, setAccountId] = useState("1") // Default account ID
  const [activeTab, setActiveTab] = useState("conversations")
  const { toast } = useToast()

  const accountIdNumber = accountId ? parseInt(accountId) : 1

  // Build filters object for real data
  const filters = {
    account_id: accountIdNumber,
    ...(status !== "all" && { status }),
    ...(assigneeId !== "all" && assigneeId !== "unassigned" && { assignee_id: assigneeId }),
    ...(inboxId !== "all" && { inbox_id: parseInt(inboxId) }),
  }

  // Use real data hooks
  const {
    data: conversations = [],
    isLoading: conversationsLoading,
    error: conversationsError,
    refetch: refetchConversations
  } = useConversations(filters)

  const {
    data: users = [],
    isLoading: usersLoading
  } = useUsers(accountIdNumber)

  const {
    data: inboxes = [],
    isLoading: inboxesLoading
  } = useInboxes(accountIdNumber)

  const handleRefresh = () => {
    refetchConversations()
    toast({
      title: "Atualizando análises",
      description: "Buscando os dados mais recentes do banco de dados...",
    })
  }

  // Filter conversations based on assignee
  const filteredConversations = conversations.filter(conversation => {
    if (assigneeId === "unassigned") {
      return !conversation.assignee
    }
    return true
  })

  // Convert users to agents format for ChatwootFilters
  const agents = convertUsersToAgents(users)

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
                    <TrendingUp className="h-8 w-8 text-blue-600" />
                    <span>Análises Avançadas</span>
                  </h1>
                  <p className="text-muted-foreground">
                    Dados em tempo real do banco de dados - {filteredConversations.length} conversas encontradas
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
              agents={agents}
              inboxes={inboxes}
              isLoading={usersLoading || inboxesLoading}
            />

            {conversationsError && (
              <div className="bg-red-50 border border-red-200 rounded-md p-4">
                <p className="text-red-800">
                  Erro ao carregar dados: {conversationsError.message}
                </p>
              </div>
            )}

            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="conversations" className="flex items-center space-x-2">
                  <BarChart3 className="h-4 w-4" />
                  <span>Estatísticas de Conversas</span>
                </TabsTrigger>
                <TabsTrigger value="response-time" className="flex items-center space-x-2">
                  <Clock className="h-4 w-4" />
                  <span>Tempo de Resposta</span>
                </TabsTrigger>
                <TabsTrigger value="agent-performance" className="flex items-center space-x-2">
                  <Users className="h-4 w-4" />
                  <span>Desempenho dos Atendentes</span>
                </TabsTrigger>
              </TabsList>

              <TabsContent value="conversations" className="space-y-6 mt-6">
                <ConversationAnalytics
                  conversations={filteredConversations}
                  isLoading={conversationsLoading}
                  inboxes={inboxes}
                />
              </TabsContent>

              <TabsContent value="response-time" className="space-y-6 mt-6">
                <ResponseTimeAnalytics
                  conversations={filteredConversations}
                  isLoading={conversationsLoading}
                  agents={users}
                />
              </TabsContent>

              <TabsContent value="agent-performance" className="space-y-6 mt-6">
                <AgentPerformanceAnalytics
                  conversations={filteredConversations}
                  agents={users}
                  isLoading={conversationsLoading || usersLoading}
                />
              </TabsContent>
            </Tabs>
          </div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  )
}
