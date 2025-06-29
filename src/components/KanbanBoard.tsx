
import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { KanbanColumn } from './KanbanColumn'
import { KanbanCard } from './KanbanCard'
import { Search, Filter, Plus, Settings } from 'lucide-react'
import { useKanbanBoards, useKanbanColumns, useKanbanConversations, useKanbanLabels, useMoveConversation, type EnhancedConversation } from '@/hooks/useKanbanData'
import { useToast } from '@/hooks/use-toast'

interface KanbanBoardProps {
  accountId: number
  onConversationClick?: (conversation: EnhancedConversation) => void
  selectedBoardId?: number
  onBoardChange?: (boardId: number) => void
}

interface KanbanFilters {
  search: string
  assigneeId: string
  labelIds: number[]
  priority: string
}

export const KanbanBoard: React.FC<KanbanBoardProps> = ({
  accountId,
  onConversationClick,
  selectedBoardId,
  onBoardChange
}) => {
  const [currentBoardId, setCurrentBoardId] = useState<number>(selectedBoardId || 0)
  const [filters, setFilters] = useState<KanbanFilters>({
    search: '',
    assigneeId: 'all',
    labelIds: [],
    priority: 'all'
  })

  const { toast } = useToast()

  // Data hooks
  const { data: boards = [], isLoading: boardsLoading } = useKanbanBoards(accountId)
  const { data: columns = [], isLoading: columnsLoading } = useKanbanColumns(currentBoardId)
  const { data: conversations = [], isLoading: conversationsLoading, refetch: refetchConversations } = useKanbanConversations(currentBoardId)
  const { data: labels = [] } = useKanbanLabels(accountId, currentBoardId)

  const moveConversation = useMoveConversation()

  // Set default board when boards are loaded
  useEffect(() => {
    if (boards.length > 0 && !currentBoardId) {
      const defaultBoard = boards.find(board => board.is_default) || boards[0]
      setCurrentBoardId(defaultBoard.id)
      onBoardChange?.(defaultBoard.id)
    }
  }, [boards, currentBoardId, onBoardChange])

  // Handle board selection
  const handleBoardChange = (boardId: string) => {
    setCurrentBoardId(parseInt(boardId))
    onBoardChange?.(parseInt(boardId))
  }

  // Handle card move between columns
  const handleCardMove = async (conversationId: number, targetColumnId: number, newPosition: number) => {
    try {
      await moveConversation.mutateAsync({
        conversationId,
        columnId: targetColumnId,
        position: newPosition
      })
      refetchConversations()
    } catch (error) {
      console.error('Error moving card:', error)
    }
  }

  // Filter conversations based on current filters
  const filteredConversations = conversations.filter(conversation => {
    if (filters.search && !conversation.contact?.name?.toLowerCase().includes(filters.search.toLowerCase()) &&
        !conversation.contact?.email?.toLowerCase().includes(filters.search.toLowerCase())) {
      return false
    }
    
    if (filters.assigneeId !== 'all' && conversation.assignee_id !== filters.assigneeId) {
      return false
    }
    
    if (filters.priority !== 'all' && conversation.priority !== filters.priority) {
      return false
    }
    
    if (filters.labelIds.length > 0) {
      const conversationLabelIds = conversation.labels?.map(l => l.id) || []
      if (!filters.labelIds.some(id => conversationLabelIds.includes(id))) {
        return false
      }
    }
    
    return true
  })

  // Group conversations by column
  const conversationsByColumn = columns.reduce((acc, column) => {
    acc[column.id] = filteredConversations.filter(
      conv => conv.kanban_position?.column_id === column.id
    ).sort((a, b) => (a.kanban_position?.position || 0) - (b.kanban_position?.position || 0))
    return acc
  }, {} as Record<number, EnhancedConversation[]>)

  if (boardsLoading || columnsLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Carregando Kanban...</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded" />
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  const currentBoard = boards.find(board => board.id === currentBoardId)

  return (
    <div className="space-y-6">
      {/* Board Header */}
      <Card>
        <CardHeader>
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
            <div className="flex items-center space-x-4">
              <CardTitle className="text-2xl">
                📋 {currentBoard?.name || 'Kanban Board'}
              </CardTitle>
              {currentBoard?.description && (
                <p className="text-muted-foreground">{currentBoard.description}</p>
              )}
            </div>
            
            <div className="flex items-center space-x-2">
              <Select value={currentBoardId.toString()} onValueChange={handleBoardChange}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Selecionar quadro" />
                </SelectTrigger>
                <SelectContent>
                  {boards.map(board => (
                    <SelectItem key={board.id} value={board.id.toString()}>
                      {board.name} {board.is_default && '(Padrão)'}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <Button variant="outline" size="sm">
                <Settings className="h-4 w-4 mr-2" />
                Configurar
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar conversas..."
                value={filters.search}
                onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                className="pl-10"
              />
            </div>
            
            <Select 
              value={filters.assigneeId} 
              onValueChange={(value) => setFilters(prev => ({ ...prev, assigneeId: value }))}
            >
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Responsável" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="unassigned">Não atribuído</SelectItem>
              </SelectContent>
            </Select>

            <Select 
              value={filters.priority} 
              onValueChange={(value) => setFilters(prev => ({ ...prev, priority: value }))}
            >
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Prioridade" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas</SelectItem>
                <SelectItem value="high">Alta</SelectItem>
                <SelectItem value="medium">Média</SelectItem>
                <SelectItem value="low">Baixa</SelectItem>
              </SelectContent>
            </Select>

            <Button variant="outline" size="sm">
              <Filter className="h-4 w-4 mr-2" />
              Filtros
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Kanban Board */}
      <div className="overflow-x-auto">
        <div className="flex space-x-6 pb-4" style={{ minWidth: 'max-content' }}>
          {columns.map((column) => (
            <KanbanColumn
              key={column.id}
              column={column}
              conversations={conversationsByColumn[column.id] || []}
              onCardMove={handleCardMove}
              onConversationClick={onConversationClick}
              isLoading={conversationsLoading}
            />
          ))}
        </div>
      </div>

      {/* Board Stats */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Estatísticas do Quadro</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{filteredConversations.length}</div>
              <div className="text-sm text-muted-foreground">Total de Cards</div>
            </div>
            {columns.map((column) => (
              <div key={column.id} className="text-center">
                <div className="text-2xl font-bold" style={{ color: column.color }}>
                  {conversationsByColumn[column.id]?.length || 0}
                </div>
                <div className="text-sm text-muted-foreground">{column.name}</div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
