import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Textarea } from "@/components/ui/textarea"
import { Separator } from "@/components/ui/separator"
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { 
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { 
  MessageCircle, 
  Send, 
  User, 
  Clock, 
  Tag, 
  UserCheck,
  X,
  Phone,
  Mail
} from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import { ptBR } from "date-fns/locale/pt-BR"
import { Conversation } from "@/types"

interface Agent {
  id: number
  name: string
  email: string
  avatar_url?: string
}

interface ConversationDetailProps {
  conversation: Conversation | null
  agents: Agent[]
  isOpen: boolean
  onClose: () => void
}

export const ConversationDetail = ({ 
  conversation, 
  agents, 
  isOpen, 
  onClose 
}: ConversationDetailProps) => {
  const [newMessage, setNewMessage] = useState("")
  const [selectedStatus, setSelectedStatus] = useState("")
  const [selectedAssignee, setSelectedAssignee] = useState("")

  if (!conversation) return null

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

  const handleSendMessage = () => {
    if (!newMessage.trim()) return
    
    // Aqui seria implementada a lógica para enviar mensagem
    console.log('Enviando mensagem:', newMessage)
    setNewMessage("")
  }

  const handleStatusChange = (newStatus: string) => {
    setSelectedStatus(newStatus)
    // Aqui seria implementada a lógica para alterar status
    console.log('Alterando status para:', newStatus)
  }

  const handleAssigneeChange = (assigneeId: string) => {
    setSelectedAssignee(assigneeId)
    // Aqui seria implementada a lógica para alterar responsável
    console.log('Alterando responsável para:', assigneeId)
  }

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent side="right" className="w-full sm:max-w-2xl">
        <SheetHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Avatar className="h-10 w-10">
                <AvatarImage src={conversation.contact?.avatar_url} />
                <AvatarFallback>
                  {conversation.contact?.name?.charAt(0).toUpperCase() || 'U'}
                </AvatarFallback>
              </Avatar>
              <div>
                <SheetTitle>{conversation.contact?.name || 'Contato Desconhecido'}</SheetTitle>
                <SheetDescription>
                  Conversa #{conversation.id} • {conversation.inbox.name}
                </SheetDescription>
              </div>
            </div>
            <Badge className={getStatusColor(conversation.status)}>
              {getStatusText(conversation.status)}
            </Badge>
          </div>
        </SheetHeader>

        <div className="flex flex-col h-full mt-6">
          {/* Informações do contato */}
          <Card className="mb-4">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Informações do Contato</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {conversation.contact?.email && (
                <div className="flex items-center space-x-2 text-sm">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span>{conversation.contact.email}</span>
                </div>
              )}
              {conversation.contact?.phone && (
                <div className="flex items-center space-x-2 text-sm">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <span>{conversation.contact.phone}</span>
                </div>
              )}
              <div className="flex items-center space-x-2 text-sm">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span>
                  Criado {formatDistanceToNow(new Date(conversation.created_at), { 
                    addSuffix: true, 
                    locale: ptBR 
                  })}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Controles de gerenciamento */}
          <Card className="mb-4">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Gerenciar Conversa</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <label className="text-sm font-medium">Status</label>
                <Select value={selectedStatus || conversation.status} onValueChange={handleStatusChange}>
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="open">Aberta</SelectItem>
                    <SelectItem value="pending">Pendente</SelectItem>
                    <SelectItem value="resolved">Resolvida</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium">Responsável</label>
                <Select value={selectedAssignee || conversation.assignee?.id || ""} onValueChange={handleAssigneeChange}>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Selecionar responsável" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Não atribuído</SelectItem>
                    {agents.map((agent) => (
                      <SelectItem key={agent.id} value={agent.id.toString()}>
                        {agent.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {conversation.assignee && (
                <div className="flex items-center space-x-2 text-sm">
                  <UserCheck className="h-4 w-4 text-muted-foreground" />
                  <span>Atribuído a {conversation.assignee.name}</span>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Área de mensagens */}
          <Card className="flex-1 flex flex-col">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center space-x-2">
                <MessageCircle className="h-4 w-4" />
                <span>Mensagens ({conversation.messages?.length || 0})</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col">
              <div className="flex-1 space-y-4 mb-4 max-h-96 overflow-y-auto">
                {conversation.messages && conversation.messages.length > 0 ? (
                  conversation.messages.map((message, index) => (
                    <div key={index} className="flex space-x-3">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback className="text-xs">
                          {message.sender_type === 'contact' ? 'C' : 'A'}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 space-y-1">
                        <div className="flex items-center space-x-2">
                          <span className="text-sm font-medium">
                            {message.sender_type === 'contact' ? conversation.contact?.name || 'Contato' : 'Agente'}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {message.created_at && formatDistanceToNow(new Date(message.created_at), { 
                              addSuffix: true, 
                              locale: ptBR 
                            })}
                          </span>
                        </div>
                        <p className="text-sm">{message.content || 'Mensagem sem conteúdo'}</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground text-center py-8">
                    Nenhuma mensagem encontrada
                  </p>
                )}
              </div>

              <Separator className="my-4" />

              {/* Campo de nova mensagem */}
              <div className="space-y-3">
                <Textarea
                  placeholder="Digite sua mensagem..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  rows={3}
                />
                <div className="flex justify-end">
                  <Button onClick={handleSendMessage} disabled={!newMessage.trim()}>
                    <Send className="h-4 w-4 mr-2" />
                    Enviar
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </SheetContent>
    </Sheet>
  )
}
