
import { useState } from "react"
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/AppSidebar"
import { EmailConfiguration } from "@/components/EmailConfiguration"
import { EmailInbox } from "@/components/EmailInbox"
import { useChatwootInboxes, useChatwootConversations } from "@/hooks/useChatwootApi"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { RefreshCw, Mail, Settings, Inbox, Plus, Filter } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export default function Email() {
  const [activeTab, setActiveTab] = useState("inboxes")
  const [statusFilter, setStatusFilter] = useState("all")
  const { toast } = useToast()

  // Buscar inboxes e conversas do Chatwoot
  const { data: inboxes = [], isLoading: inboxesLoading, error: inboxesError, refetch: refetchInboxes } = useChatwootInboxes()
  const { data: conversations = [], isLoading: conversationsLoading, refetch: refetchConversations } = useChatwootConversations()

  // Filtrar inboxes de email
  const emailInboxes = inboxes.filter(inbox => 
    inbox.channel_type === 'Channel::Email' || 
    inbox.name.toLowerCase().includes('email') ||
    inbox.name.toLowerCase().includes('e-mail')
  )

  // Filtrar conversas por inbox de email
  const emailConversations = conversations.filter(conv => 
    emailInboxes.some(inbox => inbox.id === conv.inbox_id)
  )

  // Aplicar filtro de status
  const filteredEmailConversations = emailConversations.filter(conv => {
    if (statusFilter === "all") return true;
    return conv.status === statusFilter;
  })

  const handleRefresh = () => {
    refetchInboxes()
    refetchConversations()
    toast({
      title: "Atualizando dados",
      description: "Buscando informações mais recentes dos inboxes de email...",
    })
  }

  // Estatísticas dos emails
  const emailStats = {
    totalInboxes: emailInboxes.length,
    totalConversations: emailConversations.length,
    openConversations: emailConversations.filter(c => c.status === 'open').length,
    pendingConversations: emailConversations.filter(c => c.status === 'pending').length,
    resolvedConversations: emailConversations.filter(c => c.status === 'resolved').length,
  }

  if (inboxesError) {
    return (
      <SidebarProvider>
        <div className="min-h-screen flex w-full">
          <AppSidebar />
          <SidebarInset>
            <div className="flex-1 p-6">
              <div className="text-center">
                <h2 className="text-lg font-semibold text-red-600 mb-2">Erro ao carregar inboxes</h2>
                <p className="text-gray-600">Não foi possível carregar os dados dos inboxes do Chatwoot.</p>
                <p className="text-sm text-gray-500 mt-2">Verifique a conexão com o proxy do Chatwoot.</p>
              </div>
            </div>
          </SidebarInset>
        </div>
      </SidebarProvider>
    );
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
                    <Mail className="h-8 w-8 text-blue-600" />
                    <span>Inboxes de Email</span>
                  </h1>
                  <p className="text-muted-foreground">
                    Gerencie inboxes de email do Chatwoot e suas conversas
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Button onClick={handleRefresh} disabled={inboxesLoading || conversationsLoading}>
                  <RefreshCw className={`h-4 w-4 mr-2 ${(inboxesLoading || conversationsLoading) ? 'animate-spin' : ''}`} />
                  Atualizar
                </Button>
              </div>
            </div>

            {/* Estatísticas */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Inboxes de Email</CardTitle>
                  <Inbox className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{emailStats.totalInboxes}</div>
                  <p className="text-xs text-muted-foreground">Configurados no Chatwoot</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total de Conversas</CardTitle>
                  <Mail className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{emailStats.totalConversations}</div>
                  <p className="text-xs text-muted-foreground">Conversas por email</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Abertas</CardTitle>
                  <Mail className="h-4 w-4 text-green-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">{emailStats.openConversations}</div>
                  <p className="text-xs text-muted-foreground">Aguardando resposta</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Pendentes</CardTitle>
                  <Mail className="h-4 w-4 text-yellow-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-yellow-600">{emailStats.pendingConversations}</div>
                  <p className="text-xs text-muted-foreground">Aguardando agente</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Resolvidas</CardTitle>
                  <Mail className="h-4 w-4 text-gray-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-gray-600">{emailStats.resolvedConversations}</div>
                  <p className="text-xs text-muted-foreground">Conversas finalizadas</p>
                </CardContent>
              </Card>
            </div>

            {/* Estados de carregamento */}
            {(inboxesLoading || conversationsLoading) && (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <span className="ml-3 text-gray-600">Carregando dados do Chatwoot...</span>
              </div>
            )}

            {/* Conteúdo principal */}
            {!inboxesLoading && !conversationsLoading && (
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="inboxes" className="flex items-center space-x-2">
                    <Inbox className="h-4 w-4" />
                    <span>Inboxes ({emailInboxes.length})</span>
                  </TabsTrigger>
                  <TabsTrigger value="conversations" className="flex items-center space-x-2">
                    <Mail className="h-4 w-4" />
                    <span>Conversas ({filteredEmailConversations.length})</span>
                  </TabsTrigger>
                  <TabsTrigger value="configuration" className="flex items-center space-x-2">
                    <Settings className="h-4 w-4" />
                    <span>Configuração</span>
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="inboxes" className="space-y-4 mt-6">
                  {emailInboxes.length === 0 ? (
                    <div className="text-center py-12">
                      <div className="max-w-md mx-auto">
                        <div className="bg-blue-50 rounded-full p-6 w-24 h-24 mx-auto mb-4 flex items-center justify-center">
                          <Mail className="h-12 w-12 text-blue-600" />
                        </div>
                        <h3 className="text-xl font-semibold text-gray-900 mb-2">
                          Nenhum inbox de email encontrado
                        </h3>
                        <p className="text-gray-500 mb-6">
                          Configure inboxes de email no Chatwoot para começar a receber mensagens por email.
                        </p>
                        <Button variant="outline">
                          <Plus className="h-4 w-4 mr-2" />
                          Configurar no Chatwoot
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                      {emailInboxes.map((inbox) => (
                        <Card key={inbox.id} className="hover:shadow-lg transition-shadow">
                          <CardHeader>
                            <div className="flex items-center justify-between">
                              <CardTitle className="text-lg">{inbox.name}</CardTitle>
                              <Badge variant="secondary">{inbox.channel_type}</Badge>
                            </div>
                            <CardDescription>
                              {inbox.welcome_message || 'Inbox de email configurado'}
                            </CardDescription>
                          </CardHeader>
                          <CardContent className="space-y-2">
                            <div className="flex items-center justify-between text-sm">
                              <span className="text-gray-600">Conversas:</span>
                              <span className="font-semibold">
                                {conversations.filter(c => c.inbox_id === inbox.id).length}
                              </span>
                            </div>
                            <div className="flex items-center justify-between text-sm">
                              <span className="text-gray-600">Timezone:</span>
                              <span className="font-semibold">{inbox.timezone || 'UTC'}</span>
                            </div>
                            <div className="flex items-center justify-between text-sm">
                              <span className="text-gray-600">Horário de funcionamento:</span>
                              <span className={`font-semibold ${inbox.working_hours_enabled ? 'text-green-600' : 'text-gray-600'}`}>
                                {inbox.working_hours_enabled ? 'Habilitado' : 'Desabilitado'}
                              </span>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="conversations" className="space-y-4 mt-6">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold">Conversas por Email</h3>
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                      <SelectTrigger className="w-48">
                        <Filter className="h-4 w-4 mr-2" />
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Todos os status</SelectItem>
                        <SelectItem value="open">Abertas</SelectItem>
                        <SelectItem value="pending">Pendentes</SelectItem>
                        <SelectItem value="resolved">Resolvidas</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {filteredEmailConversations.length === 0 ? (
                    <div className="text-center py-12">
                      <Mail className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        Nenhuma conversa por email
                      </h3>
                      <p className="text-gray-500">
                        Não há conversas por email no momento ou com os filtros selecionados.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {filteredEmailConversations.map((conversation) => (
                        <Card key={conversation.id} className="hover:shadow-md transition-shadow">
                          <CardContent className="p-4">
                            <div className="flex items-start justify-between">
                              <div className="space-y-1 flex-1">
                                <div className="flex items-center space-x-2">
                                  <h4 className="font-semibold text-sm">
                                    {conversation.contact?.name || conversation.contact?.email || 'Contato sem nome'}
                                  </h4>
                                  <Badge variant={
                                    conversation.status === 'open' ? 'default' :
                                    conversation.status === 'pending' ? 'secondary' : 'outline'
                                  }>
                                    {conversation.status}
                                  </Badge>
                                </div>
                                <p className="text-sm text-gray-600">
                                  {conversation.contact?.email}
                                </p>
                                <p className="text-xs text-gray-500">
                                  Última atividade: {new Date(conversation.last_activity_at).toLocaleString('pt-BR')}
                                </p>
                              </div>
                              <div className="text-right">
                                <p className="text-xs text-gray-500">
                                  Inbox: {emailInboxes.find(i => i.id === conversation.inbox_id)?.name || 'N/A'}
                                </p>
                                {conversation.unread_count > 0 && (
                                  <Badge variant="destructive" className="text-xs mt-1">
                                    {conversation.unread_count} não lidas
                                  </Badge>
                                )}
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="configuration" className="space-y-6 mt-6">
                  <div className="text-center py-8">
                    <div className="max-w-md mx-auto">
                      <div className="bg-blue-50 rounded-full p-6 w-24 h-24 mx-auto mb-4 flex items-center justify-center">
                        <Settings className="h-12 w-12 text-blue-600" />
                      </div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-2">
                        Configuração via Chatwoot
                      </h3>
                      <p className="text-gray-500 mb-6">
                        Para configurar novos inboxes de email, acesse diretamente o painel administrativo do Chatwoot.
                      </p>
                      <div className="space-y-3">
                        <p className="text-sm text-gray-600">
                          • Configuração de servidores SMTP/IMAP<br/>
                          • Definição de assinaturas automáticas<br/>
                          • Configuração de horários de funcionamento<br/>
                          • Regras de roteamento automático
                        </p>
                        <Button variant="outline" className="mt-4">
                          Abrir Chatwoot
                        </Button>
                      </div>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            )}
          </div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  )
}
