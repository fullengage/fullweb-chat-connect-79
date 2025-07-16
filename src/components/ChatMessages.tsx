
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { formatDistanceToNow, isToday, isYesterday, format } from "date-fns"
import { ptBR } from "date-fns/locale/pt-BR"
import { MessageSquare } from "lucide-react"
import { Conversation } from "@/types"
import { User } from "@/hooks/useSupabaseData"

interface ChatMessagesProps {
  conversation: any // Using any to handle Chatwoot conversation structure
  currentUser: any
  users: User[]
}

export const ChatMessages = ({ conversation, currentUser, users }: ChatMessagesProps) => {
  const messages = conversation.messages || []

  const formatMessageDate = (dateString: string) => {
    const date = new Date(dateString)
    
    if (isToday(date)) {
      return format(date, "HH:mm")
    } else if (isYesterday(date)) {
      return `Ontem ${format(date, "HH:mm")}`
    } else {
      return format(date, "dd/MM/yyyy HH:mm")
    }
  }

  const getDateSeparator = (dateString: string) => {
    const date = new Date(dateString)
    
    if (isToday(date)) {
      return "Hoje"
    } else if (isYesterday(date)) {
      return "Ontem"
    } else {
      return format(date, "dd/MM/yyyy", { locale: ptBR })
    }
  }

  const shouldShowDateSeparator = (currentIndex: number, messages: any[]) => {
    if (currentIndex === 0) return true
    
    const currentDate = new Date(messages[currentIndex].created_at).toDateString()
    const previousDate = new Date(messages[currentIndex - 1].created_at).toDateString()
    
    return currentDate !== previousDate
  }

  const getSenderInfo = (message: any) => {
    // Handle Chatwoot message types
    if (message.sender_type === 'User' || message.sender_type === 'contact') {
      return {
        name: conversation.contact?.name || conversation.meta?.sender?.name || 'Cliente',
        avatar: conversation.contact?.avatar_url || conversation.meta?.sender?.thumbnail,
        isCurrentUser: false,
        isCustomer: true
      }
    } else if (message.sender_type === 'Agent' || message.sender_type === 'agent') {
      const sender = users.find(user => user.id === message.sender_id) || message.sender
      return {
        name: sender?.name || sender?.available_name || 'Agente',
        avatar: sender?.avatar_url,
        isCurrentUser: message.sender_id === currentUser?.id,
        isCustomer: false
      }
    } else {
      return {
        name: 'Sistema',
        avatar: undefined,
        isCurrentUser: false,
        isCustomer: false
      }
    }
  }

  if (messages.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="text-center animate-fade-in">
          <div className="bg-primary/10 rounded-full p-6 w-20 h-20 mx-auto mb-4 flex items-center justify-center">
            <MessageSquare className="h-10 w-10 text-primary" />
          </div>
          <p className="text-foreground font-medium">Nenhuma mensagem ainda</p>
          <p className="text-sm mt-2 text-muted-foreground">Seja o primeiro a enviar uma mensagem para este cliente!</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gradient-to-b from-muted/5 to-background">
      {messages.map((message, index) => {
        const senderInfo = getSenderInfo(message)
        const showDateSeparator = shouldShowDateSeparator(index, messages)
        
        return (
          <div key={message.id || index} className="animate-fade-in">
            {showDateSeparator && (
              <div className="flex justify-center my-6">
                <span className="bg-muted text-muted-foreground text-xs px-4 py-2 rounded-full shadow-sm">
                  {getDateSeparator(message.created_at)}
                </span>
              </div>
            )}

            {message.sender_type === 'system' ? (
              <div className="flex justify-center my-4">
                <span className="text-muted-foreground text-sm italic bg-muted/50 px-3 py-2 rounded-lg">
                  {message.content}
                </span>
              </div>
            ) : (
              <div className={`flex mb-6 ${senderInfo.isCustomer ? 'justify-start' : 'justify-end'}`}>
                <div className={`flex max-w-[75%] ${senderInfo.isCustomer ? 'flex-row' : 'flex-row-reverse'}`}>
                  {/* Avatar só para mensagens do cliente */}
                  {senderInfo.isCustomer && (
                    <Avatar className="h-10 w-10 flex-shrink-0 mr-3 hover-scale">
                      <AvatarImage src={senderInfo.avatar} />
                      <AvatarFallback className="text-sm bg-gradient-to-br from-muted to-muted/80 text-foreground">
                        {senderInfo.name.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                  )}
                  
                  <div className={`${senderInfo.isCustomer ? 'text-left' : 'text-right'}`}>
                    {/* Nome do remetente acima da mensagem */}
                    <div className={`text-xs text-muted-foreground mb-2 ${senderInfo.isCustomer ? 'text-left' : 'text-right'}`}>
                      <span className="font-medium">{senderInfo.name}</span>
                    </div>
                    
                    {/* Balão da mensagem */}
                    <div
                      className={`px-4 py-3 rounded-2xl shadow-sm transition-all duration-200 hover:shadow-md ${
                        senderInfo.isCustomer
                          ? 'bg-card border border-border text-foreground'
                          : 'bg-primary text-primary-foreground'
                      }`}
                    >
                      <p className="text-sm whitespace-pre-wrap break-words leading-relaxed">{message.content}</p>
                    </div>
                    
                    {/* Horário da mensagem */}
                    <div className={`mt-2 text-xs text-muted-foreground/70 ${senderInfo.isCustomer ? 'text-left' : 'text-right'}`}>
                      <span>{formatMessageDate(message.created_at)}</span>
                      {!senderInfo.isCustomer && (
                        <span className="ml-2 text-primary">✓✓</span>
                      )}
                    </div>
                  </div>
                  
                  {/* Avatar para agentes (lado direito) */}
                  {!senderInfo.isCustomer && (
                    <Avatar className="h-10 w-10 flex-shrink-0 ml-3 hover-scale">
                      <AvatarImage src={senderInfo.avatar} />
                      <AvatarFallback className="text-sm bg-gradient-to-br from-primary/90 to-primary text-primary-foreground">
                        {senderInfo.name.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                  )}
                </div>
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
