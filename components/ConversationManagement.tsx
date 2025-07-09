import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ConversationCard } from "./ConversationCard"
import { ConversationDetail } from "./ConversationDetail"
import { 
  MessageCircle, 
  Search, 
  Filter,
  Clock,
  CheckCircle,
  AlertCircle,
  Users
} from "lucide-react"
import { useConversations, useUsers, type User } from "@/hooks/useSupabaseData"
import { Conversation } from "@/types"
import { useToast } from "@/hooks/use-toast"

interface ConversationManagementProps {
  accountId: number
  selectedInboxId?: number
}

// Define Agent type to match what ConversationDetail expects
interface LocalAgent {
  id: number
  name: string
  email: string
}

export const ConversationManagement = ({ 
  accountId, 
  selectedInboxId 
}: ConversationManagementProps) => {
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null)
  const [isDetailOpen, setIsDetailOpen] = useState(false)
  const [statusFilter, setStatusFilter] = useState("all")
  const [assigneeFilter, setAssigneeFilter] = useState("all")
  const [searchQuery, setSearchQuery] = useState("")
  const { toast } = useToast()

  // Build filters object
  const filters = {
    account_id: accountId,
    ...(statusFilter !== "all" && { status: statusFilter }),
    ...(assigneeFilter !== "all" && assigneeFilter !== "unassigned" && { assignee_id: assigneeFilter }),
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
  } = useUsers(accountId)

  // Convert User[] to LocalAgent[] format expected by ConversationDetail
  const agentsForFilter: LocalAgent[] = agents.map((user: User, index: number) => ({
    id: index + 1, // Use index as number ID since ConversationDetail expects number
    name: user.name,
    email: user.email
  }))

  const handleConversationClick = (conversation: Conversation) => {
    setSelectedConversation(conversation)
    setIsDetailOpen(true)
  }

  const handleCloseDetail = () => {
    setIsDetailOpen(false)
    setSelectedConversation(null)
  }

  // Filter conversations based on search query and filters
  const filteredConversations = conversations.filter((conversation: Conversation) => {
    const matchesSearch = searchQuery === "" || 
      conversation.contact?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      conversation.contact?.email?.toLowerCase().includes(searchQuery.toLowerCase())
    
    const matchesAssignee = assigneeFilter === "all" || 
      (assigneeFilter === "unassigned" && !conversation.assignee) ||
      (assigneeFilter !== "unassigned" && conversation.assignee?.id === assigneeFilter)

    return matchesSearch && matchesAssignee
  })

  // Group conversations by status
  const conversationsByStatus = {
    open: filteredConversations.filter((c: Conversation) => c.status === 'open'),
    pending: filteredConversations.filter((c: Conversation) => c.status === 'pending'),
    resolved: filteredConversations.filter((c: Conversation) => c.status === 'resolved'),
  }

  const getTabCount = (status: string) => {
    return conversationsByStatus[status as keyof typeof conversationsByStatus]?.length || 0
  }

  if (conversationsLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <MessageCircle className="h-5 w-5" />
            <span>Gerenciar Conversas</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-24 bg-gray-100 rounded-lg animate-pulse" />
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  if (conversationsError) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <MessageCircle className="h-5 w-5" />
            <span>Gerenciar Conversas</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <p className="text-red-600 mb-2">Erro ao carregar conversas</p>
            <Button onClick={() => refetchConversations()} variant="outline">
              Tentar Novamente
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
            <CardTitle className="flex items-center space-x-2">
              <MessageCircle className="h-5 w-5" />
              <span>Gerenciar Conversas</span>
              <Badge variant="outline">{filteredConversations.length} total</Badge>
            </CardTitle>
            
            <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar conversas..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 w-full sm:w-64"
                />
              </div>
              
              <Select value={assigneeFilter} onValueChange={setAssigneeFilter}>
                <SelectTrigger className="w-full sm:w-48">
                  <SelectValue placeholder="Filtrar por responsável" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os responsáveis</SelectItem>
                  <SelectItem value="unassigned">Não atribuídos</SelectItem>
                  {agents.map((agent) => (
                    <SelectItem key={agent.id} value={agent.id}>
                      {agent.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Button onClick={() => refetchConversations()} variant="outline">
                <Filter className="h-4 w-4 mr-2" />
                Atualizar
              </Button>
            </div>
          </div>
        </CardHeader>
        
        <CardContent>
          <Tabs value={statusFilter} onValueChange={setStatusFilter} className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="all" className="flex items-center space-x-2">
                <MessageCircle className="h-4 w-4" />
                <span>Todas</span>
                <Badge variant="secondary" className="ml-1">
                  {filteredConversations.length}
                </Badge>
              </TabsTrigger>
              <TabsTrigger value="open" className="flex items-center space-x-2">
                <Clock className="h-4 w-4" />
                <span>Abertas</span>
                <Badge variant="secondary" className="ml-1">
                  {getTabCount('open')}
                </Badge>
              </TabsTrigger>
              <TabsTrigger value="pending" className="flex items-center space-x-2">
                <AlertCircle className="h-4 w-4" />
                <span>Pendentes</span>
                <Badge variant="secondary" className="ml-1">
                  {getTabCount('pending')}
                </Badge>
              </TabsTrigger>
              <TabsTrigger value="resolved" className="flex items-center space-x-2">
                <CheckCircle className="h-4 w-4" />
                <span>Resolvidas</span>
                <Badge variant="secondary" className="ml-1">
                  {getTabCount('resolved')}
                </Badge>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="all" className="mt-4">
              <ConversationList 
                conversations={filteredConversations}
                onConversationClick={handleConversationClick}
              />
            </TabsContent>

            <TabsContent value="open" className="mt-4">
              <ConversationList 
                conversations={conversationsByStatus.open}
                onConversationClick={handleConversationClick}
              />
            </TabsContent>

            <TabsContent value="pending" className="mt-4">
              <ConversationList 
                conversations={conversationsByStatus.pending}
                onConversationClick={handleConversationClick}
              />
            </TabsContent>

            <TabsContent value="resolved" className="mt-4">
              <ConversationList 
                conversations={conversationsByStatus.resolved}
                onConversationClick={handleConversationClick}
              />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      <ConversationDetail
        conversation={selectedConversation}
        agents={agentsForFilter}
        isOpen={isDetailOpen}
        onClose={handleCloseDetail}
      />
    </>
  )
}

// Componente auxiliar para renderizar a lista de conversas
const ConversationList = ({ 
  conversations, 
  onConversationClick 
}: { 
  conversations: Conversation[], 
  onConversationClick: (conversation: Conversation) => void 
}) => {
  if (conversations.length === 0) {
    return (
      <div className="text-center py-8">
        <MessageCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-500">Nenhuma conversa encontrada</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {conversations.map((conversation) => (
        <ConversationCard
          key={conversation.id}
          conversation={conversation}
          onClick={() => onConversationClick(conversation)}
        />
      ))}
    </div>
  )
}
