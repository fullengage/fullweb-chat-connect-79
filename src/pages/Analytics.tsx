
import { useState } from "react"
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/AppSidebar"
import { ChatwootFilters } from "@/components/ChatwootFilters"
import { ConversationAnalytics } from "@/components/ConversationAnalytics"
import { ResponseTimeAnalytics } from "@/components/ResponseTimeAnalytics"
import { AgentPerformanceAnalytics } from "@/components/AgentPerformanceAnalytics"
import { 
  useChatwootConversations, 
  useChatwootAgents, 
  useChatwootInboxes, 
  useChatwootAnalytics 
} from "@/hooks/useChatwootApi"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { RefreshCw, BarChart3, Clock, Users, TrendingUp, PieChart, Activity } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

// Type adapter to convert Chatwoot agents to expected format
interface Agent {
  id: number
  name: string
  email: string
}

const convertChatwootAgentsToAgents = (chatwootAgents: any[]): Agent[] => {
  return chatwootAgents.map((agent) => ({
    id: agent.id,
    name: agent.name || 'Unknown Agent',
    email: agent.email || 'no-email@example.com'
  }))
}

export default function Analytics() {
  const [status, setStatus] = useState("all")
  const [assigneeId, setAssigneeId] = useState("all")
  const [inboxId, setInboxId] = useState("all")
  const [accountId, setAccountId] = useState("1") // Default account ID
  const [activeTab, setActiveTab] = useState("overview")
  const { toast } = useToast()

  // Use Chatwoot data hooks
  const {
    data: conversations = [],
    isLoading: conversationsLoading,
    error: conversationsError,
    refetch: refetchConversations
  } = useChatwootConversations()

  const {
    data: chatwootAgents = [],
    isLoading: agentsLoading
  } = useChatwootAgents()

  const {
    data: inboxes = [],
    isLoading: inboxesLoading
  } = useChatwootInboxes()

  const {
    data: analytics,
    isLoading: analyticsLoading,
    refetch: refetchAnalytics
  } = useChatwootAnalytics()

  const handleRefresh = () => {
    refetchConversations()
    refetchAnalytics()
    toast({
      title: "Atualizando análises",
      description: "Buscando os dados mais recentes do Chatwoot...",
    })
  }

  // Filter conversations based on filters
  const filteredConversations = conversations.filter(conversation => {
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

  // Convert Chatwoot agents to expected format
  const agents = convertChatwootAgentsToAgents(chatwootAgents)

  // Preparar dados para conversões de agentes (usar dados do Chatwoot)
  const agentsForComponents = chatwootAgents.map(agent => ({
    id: agent.id.toString(),
    name: agent.name,
    email: agent.email,
    role: agent.role,
    status: agent.status,
    is_active: agent.is_active,
    last_activity: agent.last_activity,
    created_at: agent.created_at,
    updated_at: agent.updated_at,
    account_id: agent.account_id || 1
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
                  <h1 className="text-3xl font-bold tracking-tight flex items-center space-x-2">
                    <TrendingUp className="h-8 w-8 text-blue-600" />
                    <span>Análises Avançadas</span>
                  </h1>
                  <p className="text-muted-foreground">
                    Dados em tempo real do Chatwoot - {filteredConversations.length} conversas filtradas de {conversations.length} total
                  </p>
                </div>
              </div>
              <Button onClick={handleRefresh} disabled={conversationsLoading || analyticsLoading}>
                <RefreshCw className={`h-4 w-4 mr-2 ${(conversationsLoading || analyticsLoading) ? 'animate-spin' : ''}`} />
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
              isLoading={agentsLoading || inboxesLoading}
            />

            {conversationsError && (
              <div className="bg-red-50 border border-red-200 rounded-md p-4">
                <p className="text-red-800">
                  Erro ao carregar dados do Chatwoot: {conversationsError.message}
                </p>
              </div>
            )}

            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="overview" className="flex items-center space-x-2">
                  <PieChart className="h-4 w-4" />
                  <span>Visão Geral</span>
                </TabsTrigger>
                <TabsTrigger value="conversations" className="flex items-center space-x-2">
                  <BarChart3 className="h-4 w-4" />
                  <span>Conversas</span>
                </TabsTrigger>
                <TabsTrigger value="response-time" className="flex items-center space-x-2">
                  <Clock className="h-4 w-4" />
                  <span>Tempo de Resposta</span>
                </TabsTrigger>
                <TabsTrigger value="agent-performance" className="flex items-center space-x-2">
                  <Users className="h-4 w-4" />
                  <span>Desempenho dos Agentes</span>
                </TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-6 mt-6">
                {analyticsLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                    <span className="ml-3 text-gray-600">Carregando estatísticas...</span>
                  </div>
                ) : analytics ? (
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    <Card>
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                          Total de Conversas
                        </CardTitle>
                        <BarChart3 className="h-4 w-4 text-muted-foreground" />
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">{analytics.totalConversations}</div>
                        <p className="text-xs text-muted-foreground">
                          +{analytics.conversationGrowth} desde ontem
                        </p>
                      </CardContent>
                    </Card>
                    
                    <Card>
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Agentes Online</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">{analytics.onlineAgents}</div>
                        <p className="text-xs text-muted-foreground">
                          de {analytics.totalAgents} agentes total
                        </p>
                      </CardContent>
                    </Card>
                    
                    <Card>
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Taxa de Resposta</CardTitle>
                        <Activity className="h-4 w-4 text-muted-foreground" />
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">{analytics.responseRate}%</div>
                        <p className="text-xs text-muted-foreground">
                          Tempo médio: {analytics.avgResponseTime}
                        </p>
                      </CardContent>
                    </Card>
                    
                    <Card>
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Satisfação</CardTitle>
                        <TrendingUp className="h-4 w-4 text-muted-foreground" />
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">{analytics.customerSatisfaction}/5</div>
                        <p className="text-xs text-muted-foreground">
                          Avaliação média dos clientes
                        </p>
                      </CardContent>
                    </Card>

                    <Card className="md:col-span-2">
                      <CardHeader>
                        <CardTitle>Status das Conversas</CardTitle>
                        <CardDescription>Distribuição atual</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-sm">Abertas</span>
                            <span className="text-sm font-medium">{analytics.openConversations}</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-sm">Pendentes</span>
                            <span className="text-sm font-medium">{analytics.pendingConversations}</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-sm">Resolvidas</span>
                            <span className="text-sm font-medium">{analytics.resolvedConversations}</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="md:col-span-2">
                      <CardHeader>
                        <CardTitle>Atividade Recente</CardTitle>
                        <CardDescription>Conversas por período</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-sm">Hoje</span>
                            <span className="text-sm font-medium">{analytics.todayConversations}</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-sm">Ontem</span>
                            <span className="text-sm font-medium">{analytics.yesterdayConversations}</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-sm">Esta semana</span>
                            <span className="text-sm font-medium">{analytics.weekConversations}</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                ) : null}
              </TabsContent>

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
                  agents={agentsForComponents}
                />
              </TabsContent>

              <TabsContent value="agent-performance" className="space-y-6 mt-6">
                <AgentPerformanceAnalytics
                  conversations={filteredConversations}
                  agents={agentsForComponents}
                  isLoading={conversationsLoading || agentsLoading}
                />
              </TabsContent>
            </Tabs>
          </div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  )
}
