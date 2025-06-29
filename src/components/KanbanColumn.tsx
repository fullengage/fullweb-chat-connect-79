
import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { KanbanCard } from './KanbanCard'
import { Plus, AlertCircle } from 'lucide-react'
import { type KanbanColumn as KanbanColumnType } from '@/hooks/useKanbanData'
import { type EnhancedConversation } from '@/hooks/useKanbanData'

interface KanbanColumnProps {
  column: KanbanColumnType
  conversations: EnhancedConversation[]
  onCardMove: (conversationId: number, targetColumnId: number, newPosition: number) => void
  onConversationClick?: (conversation: EnhancedConversation) => void
  isLoading?: boolean
}

export const KanbanColumn: React.FC<KanbanColumnProps> = ({
  column,
  conversations,
  onCardMove,
  onConversationClick,
  isLoading = false
}) => {
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    const conversationId = parseInt(e.dataTransfer.getData('conversation-id'))
    const newPosition = conversations.length + 1 // Add to end of column
    
    if (conversationId) {
      onCardMove(conversationId, column.id, newPosition)
    }
  }

  // Check if column is over WIP limit
  const isOverWipLimit = column.max_cards && conversations.length > column.max_cards
  const wipUtilization = column.max_cards ? (conversations.length / column.max_cards) * 100 : 0

  return (
    <Card 
      className="w-80 flex-shrink-0"
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle 
            className="text-lg flex items-center space-x-2"
            style={{ color: column.color }}
          >
            <span>{column.name}</span>
            <Badge variant="secondary" className="ml-2">
              {conversations.length}
            </Badge>
          </CardTitle>
          
          {column.auto_assign_agent && (
            <Badge variant="outline" className="text-xs">
              Auto-assign
            </Badge>
          )}
        </div>
        
        {column.description && (
          <p className="text-sm text-muted-foreground">{column.description}</p>
        )}
        
        {/* WIP Limit Indicator */}
        {column.max_cards && (
          <div className="mt-2">
            <div className="flex items-center justify-between text-xs">
              <span>WIP Limit: {conversations.length}/{column.max_cards}</span>
              {isOverWipLimit && (
                <AlertCircle className="h-4 w-4 text-red-500" />
              )}
            </div>
            <div className="w-full bg-gray-200 rounded-full h-1 mt-1">
              <div 
                className={`h-1 rounded-full transition-all ${
                  isOverWipLimit ? 'bg-red-500' : wipUtilization > 80 ? 'bg-yellow-500' : 'bg-green-500'
                }`}
                style={{ width: `${Math.min(wipUtilization, 100)}%` }}
              />
            </div>
          </div>
        )}
      </CardHeader>

      <CardContent className="space-y-3 max-h-[600px] overflow-y-auto">
        {isLoading ? (
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-100 rounded animate-pulse" />
            ))}
          </div>
        ) : conversations.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <div className="text-4xl mb-2">📝</div>
            <p className="text-sm">Nenhum card nesta coluna</p>
          </div>
        ) : (
          conversations.map((conversation, index) => (
            <KanbanCard
              key={conversation.id}
              conversation={conversation}
              onClick={() => onConversationClick?.(conversation)}
              position={index}
              columnColor={column.color}
            />
          ))
        )}
        
        {/* Add new card button */}
        <Button 
          variant="ghost" 
          className="w-full border-2 border-dashed border-gray-300 hover:border-gray-400"
          size="sm"
        >
          <Plus className="h-4 w-4 mr-2" />
          Adicionar Card
        </Button>
      </CardContent>
    </Card>
  )
}
