
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { formatDistanceToNow, isToday, isYesterday, format } from "date-fns"
import { ptBR } from "date-fns/locale/pt-BR"
import { Conversation } from "@/types"
import { User } from "@/hooks/useSupabaseData"

interface ChatMessagesProps {
  conversation: Conversation
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
    if (message.sender_type === 'contact') {
      return {
        name: conversation.contact?.name || 'Contato',
        avatar: conversation.contact?.avatar_url,
        isCurrentUser: false
      }
    } else if (message.sender_type === 'agent') {
      const sender = users.find(user => user.id === message.sender_id)
      return {
        name: sender?.name || 'Agente',
        avatar: sender?.avatar_url,
        isCurrentUser: message.sender_id === currentUser.id
      }
    } else {
      return {
        name: 'Sistema',
        avatar: undefined,
        isCurrentUser: false
      }
    }
  }

  if (messages.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="text-center text-gray-500">
          <p>Nenhuma mensagem ainda</p>
          <p className="text-sm mt-1">Seja o primeiro a enviar uma mensagem!</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4">
      {messages.map((message, index) => {
        const senderInfo = getSenderInfo(message)
        const showDateSeparator = shouldShowDateSeparator(index, messages)
        
        return (
          <div key={message.id || index}>
            {showDateSeparator && (
              <div className="flex justify-center my-4">
                <span className="bg-gray-100 text-gray-600 text-xs px-3 py-1 rounded-full">
                  {getDateSeparator(message.created_at)}
                </span>
              </div>
            )}

            {message.sender_type === 'system' ? (
              <div className="flex justify-center my-2">
                <span className="text-gray-500 text-sm italic">
                  {message.content}
                </span>
              </div>
            ) : (
              <div className={`flex ${senderInfo.isCurrentUser ? 'justify-end' : 'justify-start'}`}>
                <div className={`flex max-w-xs lg:max-w-md ${senderInfo.isCurrentUser ? 'flex-row-reverse' : 'flex-row'}`}>
                  <Avatar className="h-8 w-8 flex-shrink-0">
                    <AvatarImage src={senderInfo.avatar} />
                    <AvatarFallback className="text-xs">
                      {senderInfo.name.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  
                  <div className={`mx-2 ${senderInfo.isCurrentUser ? 'text-right' : 'text-left'}`}>
                    <div
                      className={`px-4 py-2 rounded-lg ${
                        senderInfo.isCurrentUser
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-200 text-gray-900'
                      }`}
                    >
                      <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                    </div>
                    
                    <div className={`mt-1 text-xs text-gray-500 ${senderInfo.isCurrentUser ? 'text-right' : 'text-left'}`}>
                      <span>{senderInfo.name}</span>
                      <span className="mx-1">•</span>
                      <span>{formatMessageDate(message.created_at)}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
