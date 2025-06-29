
import React from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { 
  MessageCircle, 
  Clock, 
  Calendar, 
  User, 
  AlertTriangle,
  CheckCircle,
  Timer,
  Tag
} from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { type EnhancedConversation } from '@/hooks/useKanbanData'

interface KanbanCardProps {
  conversation: EnhancedConversation
  onClick?: () => void
  position: number
  columnColor: string
}

export const KanbanCard: React.FC<KanbanCardProps> = ({
  conversation,
  onClick,
  position,
  columnColor
}) => {
  const handleDragStart = (e: React.DragEvent) => {
    e.dataTransfer.setData('conversation-id', conversation.id.toString())
    e.dataTransfer.setData('position', position.toString())
  }

  // Priority colors
  const getPriorityColor = (priority?: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800 border-red-200'
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'low': return 'bg-green-100 text-green-800 border-green-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  // Priority icons
  const getPriorityIcon = (priority?: string) => {
    switch (priority) {
      case 'high': return <AlertTriangle className="h-3 w-3" />
      case 'medium': return <Clock className="h-3 w-3" />
      case 'low': return <CheckCircle className="h-3 w-3" />
      default: return null
    }
  }

  // Complexity colors
  const getComplexityColor = (complexity: string) => {
    switch (complexity) {
      case 'high': return 'bg-purple-100 text-purple-800 border-purple-200'
      case 'medium': return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'low': return 'bg-green-100 text-green-800 border-green-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const isOverdue = conversation.due_date && new Date(conversation.due_date) < new Date()
  const timeAgo = formatDistanceToNow(new Date(conversation.created_at), { 
    addSuffix: true, 
    locale: ptBR 
  })

  return (
    <Card 
      className="cursor-pointer hover:shadow-md transition-all duration-200 border-l-4"
      style={{ borderLeftColor: columnColor }}
      draggable
      onDragStart={handleDragStart}
      onClick={onClick}
    >
      <CardContent className="p-4 space-y-3">
        {/* Header with ID and Channel */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Badge variant="outline" className="text-xs">
              #{conversation.id}
            </Badge>
            <Badge 
              variant="secondary" 
              className="text-xs bg-blue-100 text-blue-800"
            >
              {conversation.inbox.channel_type}
            </Badge>
          </div>
          
          {conversation.priority && (
            <Badge 
              className={`text-xs border ${getPriorityColor(conversation.priority)}`}
              variant="outline"
            >
              {getPriorityIcon(conversation.priority)}
              <span className="ml-1 capitalize">{conversation.priority}</span>
            </Badge>
          )}
        </div>

        {/* Contact Info */}
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <Avatar className="h-6 w-6">
              <AvatarImage src={conversation.contact?.avatar_url} />
              <AvatarFallback className="text-xs">
                {conversation.contact?.name?.charAt(0)?.toUpperCase() || '?'}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">
                {conversation.contact?.name || 'Contato Desconhecido'}
              </p>
              {conversation.contact?.email && (
                <p className="text-xs text-muted-foreground truncate">
                  {conversation.contact.email}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Labels */}
        {conversation.labels && conversation.labels.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {conversation.labels.slice(0, 3).map((label) => (
              <Badge 
                key={label.id} 
                className="text-xs"
                style={{ 
                  backgroundColor: label.color + '20',
                  color: label.color,
                  borderColor: label.color + '40'
                }}
                variant="outline"
              >
                <Tag className="h-3 w-3 mr-1" />
                {label.name}
              </Badge>
            ))}
            {conversation.labels.length > 3 && (
              <Badge variant="outline" className="text-xs">
                +{conversation.labels.length - 3}
              </Badge>
            )}
          </div>
        )}

        {/* Assignee */}
        {conversation.assignee && (
          <div className="flex items-center space-x-2">
            <User className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">
              {conversation.assignee.name}
            </span>
          </div>
        )}

        {/* Time Information */}
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <div className="flex items-center space-x-1">
            <Clock className="h-3 w-3" />
            <span>{timeAgo}</span>
          </div>
          
          {conversation.unread_count && conversation.unread_count > 0 && (
            <div className="flex items-center space-x-1">
              <MessageCircle className="h-3 w-3" />
              <span>{conversation.unread_count}</span>
            </div>
          )}
        </div>

        {/* Due Date */}
        {conversation.due_date && (
          <div className={`flex items-center space-x-1 text-xs ${
            isOverdue ? 'text-red-600' : 'text-muted-foreground'
          }`}>
            <Calendar className="h-3 w-3" />
            <span>
              Vence: {formatDistanceToNow(new Date(conversation.due_date), { 
                addSuffix: true,
                locale: ptBR 
              })}
            </span>
            {isOverdue && <AlertTriangle className="h-3 w-3 text-red-500" />}
          </div>
        )}

        {/* Estimated Time & Complexity */}
        <div className="flex items-center justify-between">
          {conversation.estimated_time && (
            <div className="flex items-center space-x-1 text-xs text-muted-foreground">
              <Timer className="h-3 w-3" />
              <span>{conversation.estimated_time}min</span>
            </div>
          )}
          
          <Badge 
            className={`text-xs border ${getComplexityColor(conversation.complexity)}`}
            variant="outline"
          >
            {conversation.complexity}
          </Badge>
        </div>

        {/* Action Buttons */}
        <div className="flex space-x-2 pt-2">
          <Button size="sm" variant="outline" className="flex-1 text-xs">
            👁️ Ver
          </Button>
          <Button size="sm" variant="outline" className="flex-1 text-xs">
            💬 Responder
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
