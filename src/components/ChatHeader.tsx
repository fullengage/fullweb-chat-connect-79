
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { 
  CheckCircle, 
  MoreVertical,
  UserPlus,
  Tag,
  Eye
} from "lucide-react"
import { Conversation } from "@/types"
import { useState } from "react"

interface ChatHeaderProps {
  conversation: Conversation
  onResolve: () => void
  onAssignAgent: (conversationId: number, agentId: string) => void
  onMarkAsRead: (conversationId: number) => void
  onAddLabel: (conversationId: number, label: string) => void
  users: any[]
}

export const ChatHeader = ({ 
  conversation, 
  onResolve, 
  onAssignAgent, 
  onMarkAsRead, 
  onAddLabel, 
  users 
}: ChatHeaderProps) => {
  const [newLabel, setNewLabel] = useState("")
  const [showLabelInput, setShowLabelInput] = useState(false)
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
    <div className="border-b bg-card/80 backdrop-blur-sm p-3 animate-fade-in">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3 min-w-0 flex-1">
          <Avatar className="h-10 w-10 hover-scale flex-shrink-0">
            <AvatarImage src={conversation.contact?.avatar_url} />
            <AvatarFallback className="bg-gradient-to-br from-primary/20 to-primary/10 text-primary font-semibold text-sm">
              {conversation.contact?.name?.charAt(0).toUpperCase() || 'U'}
            </AvatarFallback>
          </Avatar>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-2 mb-1">
              <h2 className="text-base font-semibold text-foreground truncate">
                {conversation.contact?.name || 'Contato Desconhecido'}
              </h2>
              <Badge className={`text-xs animate-scale-in flex-shrink-0 ${getStatusColor(conversation.status)}`}>
                {getStatusText(conversation.status)}
              </Badge>
            </div>
            
            <div className="flex items-center space-x-3 text-xs text-muted-foreground">
              {conversation.contact?.email && (
                <span className="flex items-center gap-1 truncate">
                  <div className="w-1 h-1 bg-primary rounded-full flex-shrink-0"></div>
                  <span className="truncate">{conversation.contact.email}</span>
                </span>
              )}
              {conversation.contact?.phone && (
                <span className="flex items-center gap-1 flex-shrink-0">
                  <div className="w-1 h-1 bg-primary rounded-full"></div>
                  {conversation.contact.phone}
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-1 flex-shrink-0">
          {/* Assign Agent */}
          <Select onValueChange={(agentId) => onAssignAgent(conversation.id, agentId)}>
            <SelectTrigger className="w-32 h-8 text-xs hover-scale">
              <UserPlus className="h-3 w-3 mr-1 text-primary" />
              <SelectValue placeholder="Atribuir" />
            </SelectTrigger>
            <SelectContent className="z-50">
              {users.map((user) => (
                <SelectItem key={user.id} value={user.id}>
                  <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                    <span className="text-xs">{user.name}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Add Label */}
          <div className="flex items-center gap-1">
            {showLabelInput ? (
              <div className="flex gap-1 animate-scale-in">
                <Input
                  placeholder="Etiqueta"
                  value={newLabel}
                  onChange={(e) => setNewLabel(e.target.value)}
                  className="w-24 h-8 text-xs"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter' && newLabel.trim()) {
                      onAddLabel(conversation.id, newLabel.trim())
                      setNewLabel("")
                      setShowLabelInput(false)
                    }
                  }}
                />
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setShowLabelInput(false)}
                  className="h-8 w-8 p-0 hover-scale"
                >
                  ✕
                </Button>
              </div>
            ) : (
              <Button
                onClick={() => setShowLabelInput(true)}
                variant="outline"
                size="sm"
                className="h-8 hover-scale"
              >
                <Tag className="h-3 w-3" />
              </Button>
            )}
          </div>

          {/* Mark as Read */}
          <Button
            onClick={() => onMarkAsRead(conversation.id)}
            variant="outline"
            size="sm"
            disabled={!conversation.unread_count}
            className="h-8 hover-scale"
          >
            <Eye className="h-3 w-3" />
          </Button>

          {/* Resolve */}
          {conversation.status !== 'resolved' && (
            <Button 
              onClick={onResolve} 
              variant="outline" 
              size="sm"
              className="h-8 hover-scale bg-green-50 hover:bg-green-100 text-green-700 border-green-200"
            >
              <CheckCircle className="h-3 w-3" />
            </Button>
          )}
          
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0 hover-scale">
            <MoreVertical className="h-3 w-3" />
          </Button>
        </div>
      </div>
    </div>
  )
}
