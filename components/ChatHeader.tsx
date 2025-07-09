
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { CheckCircle, MoreVertical } from "lucide-react"
import { Conversation } from "@/types"

interface ChatHeaderProps {
  conversation: Conversation
  onResolve: () => void
}

export const ChatHeader = ({ conversation, onResolve }: ChatHeaderProps) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open':
        return 'bg-green-100 text-green-800'
      case 'pending':
        return 'bg-yellow-100 text-yellow-800'
      case 'resolved':
        return 'bg-blue-100 text-blue-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'open':
        return 'Aberta'
      case 'pending':
        return 'Pendente'
      case 'resolved':
        return 'Resolvida'
      default:
        return status
    }
  }

  return (
    <div className="border-b bg-white p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Avatar className="h-12 w-12">
            <AvatarImage src={conversation.contact?.avatar_url} />
            <AvatarFallback>
              {conversation.contact?.name?.charAt(0).toUpperCase() || 'U'}
            </AvatarFallback>
          </Avatar>
          
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-lg font-semibold">
                {conversation.contact?.name || 'Contato Desconhecido'}
              </h2>
              <Badge className={`text-xs ${getStatusColor(conversation.status)}`}>
                {getStatusText(conversation.status)}
              </Badge>
            </div>
            
            <div className="flex items-center space-x-4 text-sm text-gray-500">
              {conversation.contact?.email && (
                <span>{conversation.contact.email}</span>
              )}
              {conversation.contact?.phone && (
                <span>{conversation.contact.phone}</span>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          {conversation.status !== 'resolved' && (
            <Button onClick={onResolve} variant="outline" size="sm">
              <CheckCircle className="h-4 w-4 mr-2" />
              Resolver
            </Button>
          )}
          
          <Button variant="ghost" size="sm">
            <MoreVertical className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}
