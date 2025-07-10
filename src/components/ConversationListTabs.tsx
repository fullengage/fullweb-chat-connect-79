import { MessageSquare } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface ConversationListTabsProps {
  statusFilter: string
  setStatusFilter: (status: string) => void
  conversationsByStatus: {
    all: any[]
    open: any[]
    pending: any[]
    resolved: any[]
  }
  selectedConversation: any
  setSelectedConversation: (conversation: any) => void
  conversationsLoading: boolean
}

export const ConversationListTabs = ({
  statusFilter,
  setStatusFilter,
  conversationsByStatus,
  selectedConversation,
  setSelectedConversation,
  conversationsLoading
}: ConversationListTabsProps) => {
  return (
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
  )
}