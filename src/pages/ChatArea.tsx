// ChatArea.tsx - VERSÃO FINAL COM LAYOUT MODERNO
import { useState, useEffect, useRef } from "react";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { 
  useChatwootConversations,
  useSelectedConversation,
  useSendChatwootMessage,
  useUpdateConversationStatus,
} from "@/hooks/useChatwootApi";
import { useToast } from "@/hooks/use-toast";
import { 
  MessageSquare, 
  User, 
  Send, 
  Search, 
  MoreVertical,
  Phone,
  Mail,
  CheckCircle2,
  RotateCcw,
  Users,
  X,
  Calendar,
  Tag,
  FileText,
  Settings,
  Circle,
  AlertCircle,
  Clock,
  Paperclip,
  Smile
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

// Mock do usuário atual
const MOCK_CURRENT_USER = {
  id: 1,
  name: 'Agente Fullweb',
  email: 'agente@fullweb.com.br',
  avatar: null
};

const getContactInitials = (name?: string, email?: string) => {
  if (name) {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  }
  if (email) {
    return email.slice(0, 2).toUpperCase();
  }
  return 'U';
};

const formatTime = (timestamp: string) => {
  const date = new Date(timestamp);
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const minutes = Math.floor(diff / (1000 * 60));
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));

  if (minutes < 60) {
    return `${minutes}m`;
  } else if (hours < 24) {
    return `${hours}h`;
  } else if (days < 7) {
    return `${days}d`;
  } else {
    return date.toLocaleDateString('pt-BR', { 
      day: '2-digit', 
      month: '2-digit' 
    });
  }
};

const formatMessageTime = (timestamp: string) => {
  return new Date(timestamp).toLocaleTimeString('pt-BR', {
    hour: '2-digit',
    minute: '2-digit'
  });
};

const getStatusConfig = (status: string) => {
  switch (status) {
    case 'open':
      return {
        color: 'bg-green-500',
        icon: Circle,
        text: 'Aberta',
        textColor: 'text-green-700',
        bgColor: 'bg-green-50'
      };
    case 'resolved':
      return {
        color: 'bg-gray-500',
        icon: CheckCircle2,
        text: 'Resolvida',
        textColor: 'text-gray-700',
        bgColor: 'bg-gray-50'
      };
    case 'pending':
      return {
        color: 'bg-yellow-500',
        icon: AlertCircle,
        text: 'Pendente',
        textColor: 'text-yellow-700',
        bgColor: 'bg-yellow-50'
      };
    default:
      return {
        color: 'bg-gray-400',
        icon: Circle,
        text: 'Desconhecido',
        textColor: 'text-gray-700',
        bgColor: 'bg-gray-50'
      };
  }
};

export default function ChatArea() {
  const [searchTerm, setSearchTerm] = useState("");
  const [showContactPanel, setShowContactPanel] = useState(true);
  const [messageText, setMessageText] = useState("");
  const { toast } = useToast();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const currentUser = MOCK_CURRENT_USER;

  // Hooks do Chatwoot
  const {
    data: conversations = [],
    isLoading: conversationsLoading,
    error: conversationsError,
    refetch: refetchConversations
  } = useChatwootConversations();

  const {
    selectedConversation,
    setSelectedConversation,
    messages,
    messagesLoading
  } = useSelectedConversation();

  const sendMessageMutation = useSendChatwootMessage();
  const updateStatusMutation = useUpdateConversationStatus();

  // Auto scroll
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  // Filtrar conversas
  const filteredConversations = conversations.filter(conversation => {
    if (!searchTerm) return true;
    const contactName = conversation.contact?.name?.toLowerCase() || '';
    const contactEmail = conversation.contact?.email?.toLowerCase() || '';
    const search = searchTerm.toLowerCase();
    return contactName.includes(search) || contactEmail.includes(search);
  });

  // Separar por status
  const openConversations = filteredConversations.filter(c => c.status === 'open');
  const pendingConversations = filteredConversations.filter(c => c.status === 'pending');
  const resolvedConversations = filteredConversations.filter(c => c.status === 'resolved');

  // Handlers
  const handleSendMessage = async () => {
    if (!messageText.trim() || !selectedConversation) return;

    try {
      await sendMessageMutation.mutateAsync({
        conversationId: selectedConversation.id,
        payload: {
          content: messageText.trim(),
          message_type: 'outgoing',
          private: false,
        }
      });

      setMessageText("");
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }

      toast({
        title: "Mensagem enviada",
        description: "Sua mensagem foi enviada com sucesso.",
      });
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: "Erro ao enviar mensagem",
        description: "Não foi possível enviar a mensagem.",
        variant: "destructive",
      });
    }
  };

  const handleResolveConversation = async () => {
    if (!selectedConversation) return;

    try {
      await updateStatusMutation.mutateAsync({
        conversationId: selectedConversation.id,
        status: 'resolved'
      });

      toast({
        title: "Conversa resolvida",
        description: "A conversa foi marcada como resolvida.",
      });

      setSelectedConversation(prev => 
        prev ? { ...prev, status: 'resolved' } : null
      );
    } catch (error) {
      console.error('Error resolving conversation:', error);
      toast({
        title: "Erro ao resolver conversa",
        description: "Não foi possível resolver a conversa.",
        variant: "destructive",
      });
    }
  };

  const handleReopenConversation = async () => {
    if (!selectedConversation) return;

    try {
      await updateStatusMutation.mutateAsync({
        conversationId: selectedConversation.id,
        status: 'open'
      });

      toast({
        title: "Conversa reaberta",
        description: "A conversa foi reaberta com sucesso.",
      });

      setSelectedConversation(prev => 
        prev ? { ...prev, status: 'open' } : null
      );
    } catch (error) {
      console.error('Error reopening conversation:', error);
      toast({
        title: "Erro ao reabrir conversa",
        description: "Não foi possível reabrir a conversa.",
        variant: "destructive",
      });
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMessageText(e.target.value);
    const textarea = e.target;
    textarea.style.height = 'auto';
    textarea.style.height = Math.min(textarea.scrollHeight, 120) + 'px';
  };

  if (conversationsError) {
    return (
      <SidebarProvider>
        <div className="min-h-screen flex w-full">
          <AppSidebar />
          <div className="flex-1 flex items-center justify-center">
            <Alert variant="destructive" className="max-w-md">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Erro ao conectar com o Chatwoot. Verifique a configuração.
              </AlertDescription>
            </Alert>
          </div>
        </div>
      </SidebarProvider>
    );
  }

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-gray-50">
        <AppSidebar />
        <SidebarInset>
          <div className="flex h-screen">
            {/* Painel 1: Lista de Conversas */}
            <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
              {/* Header */}
              <div className="p-4 border-b border-gray-200">
                <div className="flex items-center justify-between mb-3">
                  <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                    <MessageSquare className="h-5 w-5" />
                    Conversas
                  </h2>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowContactPanel(!showContactPanel)}
                    className="p-2"
                  >
                    <Users className="h-4 w-4" />
                  </Button>
                </div>
                
                <div className="flex gap-2 mb-3">
                  <Badge variant="default" className="bg-blue-500">
                    Abertas {openConversations.length}
                  </Badge>
                  <Badge variant="secondary">
                    Pendentes {pendingConversations.length}
                  </Badge>
                  <Badge variant="outline">
                    Resolvidas {resolvedConversations.length}
                  </Badge>
                </div>

                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Buscar conversas..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 bg-gray-50 border-gray-200 focus:bg-white"
                  />
                </div>
              </div>

              {/* Lista de Conversas */}
              <ScrollArea className="flex-1">
                <div className="p-2">
                  {conversationsLoading ? (
                    <div className="flex items-center justify-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                    </div>
                  ) : filteredConversations.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-8 text-center">
                      <MessageSquare className="h-12 w-12 text-gray-300 mb-3" />
                      <p className="text-gray-500 font-medium">Nenhuma conversa</p>
                    </div>
                  ) : (
                    <div className="space-y-1">
                      {filteredConversations.map((conversation) => {
                        const statusConfig = getStatusConfig(conversation.status);
                        const StatusIcon = statusConfig.icon;
                        const isSelected = selectedConversation?.id === conversation.id;
                        
                        return (
                          <div
                            key={conversation.id}
                            onClick={() => setSelectedConversation(conversation)}
                            className={cn(
                              "flex items-center space-x-3 p-3 rounded-lg cursor-pointer transition-all duration-200 hover:bg-gray-50",
                              isSelected ? "bg-blue-50 border border-blue-200" : ""
                            )}
                          >
                            <div className="relative">
                              <Avatar className="h-12 w-12">
                                <AvatarImage src={conversation.contact?.avatar} />
                                <AvatarFallback className="bg-gradient-to-br from-blue-400 to-blue-600 text-white text-sm font-medium">
                                  {getContactInitials(conversation.contact?.name, conversation.contact?.email)}
                                </AvatarFallback>
                              </Avatar>
                              <div className={cn("absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white", statusConfig.color)}>
                                <StatusIcon className="h-2.5 w-2.5 text-white absolute inset-0.5" />
                              </div>
                            </div>

                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between mb-1">
                                <h4 className={cn("font-medium text-sm truncate", isSelected ? "text-blue-900" : "text-gray-900")}>
                                  {conversation.contact?.name || conversation.contact?.email || 'Contato sem nome'}
                                </h4>
                                <span className="text-xs text-gray-500 ml-2 flex-shrink-0">
                                  {formatTime(conversation.last_activity_at)}
                                </span>
                              </div>
                              
                              <p className="text-xs text-gray-600 truncate">
                                {conversation.messages && conversation.messages.length > 0 
                                  ? conversation.messages[conversation.messages.length - 1]?.content || "Última mensagem"
                                  : "Nenhuma mensagem"}
                              </p>

                              <div className="flex items-center gap-1 mt-1">
                                {conversation.contact?.phone_number && (
                                  <div className="flex items-center gap-1 bg-gray-100 rounded-full px-2 py-0.5">
                                    <Phone className="h-3 w-3 text-gray-500" />
                                    <span className="text-xs text-gray-600">WhatsApp</span>
                                  </div>
                                )}
                                {conversation.unread_count > 0 && (
                                  <Badge variant="destructive" className="text-xs px-1.5 py-0.5 h-5">
                                    {conversation.unread_count}
                                  </Badge>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </ScrollArea>
            </div>

            {/* Painel 2: Área de Mensagens */}
            <div className={cn("flex-1 flex flex-col", showContactPanel ? "mr-80" : "")}>
              {selectedConversation ? (
                <>
                  {/* Header da Conversa */}
                  <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-white">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={selectedConversation.contact?.avatar} />
                        <AvatarFallback className="bg-gradient-to-br from-blue-400 to-blue-600 text-white">
                          {getContactInitials(selectedConversation.contact?.name, selectedConversation.contact?.email)}
                        </AvatarFallback>
                      </Avatar>
                      
                      <div>
                        <h3 className="font-semibold text-gray-900">
                          {selectedConversation.contact?.name || selectedConversation.contact?.email || 'Contato'}
                        </h3>
                        <div className="flex items-center gap-2">
                          <div className={cn("w-2 h-2 rounded-full", getStatusConfig(selectedConversation.status).color)}></div>
                          <span className="text-sm text-gray-500">{getStatusConfig(selectedConversation.status).text}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {selectedConversation.status === 'resolved' ? (
                        <Button
                          onClick={handleReopenConversation}
                          disabled={updateStatusMutation.isPending}
                          variant="outline"
                          size="sm"
                        >
                          <RotateCcw className="h-4 w-4 mr-2" />
                          Reabrir
                        </Button>
                      ) : (
                        <Button
                          onClick={handleResolveConversation}
                          disabled={updateStatusMutation.isPending}
                          variant="outline"
                          size="sm"
                        >
                          <CheckCircle2 className="h-4 w-4 mr-2" />
                          Resolver
                        </Button>
                      )}

                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>Atribuir agente</DropdownMenuItem>
                          <DropdownMenuItem>Adicionar etiqueta</DropdownMenuItem>
                          <DropdownMenuItem>Ver histórico</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>

                  {/* Área de Mensagens */}
                  <ScrollArea className="flex-1 p-4">
                    {messagesLoading ? (
                      <div className="flex items-center justify-center h-full">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {messages && messages.length > 0 ? (
                          messages.map((message, index) => {
                            const isOutgoing = message.message_type === 'outgoing';
                            const showAvatar = index === 0 || 
                              messages[index - 1].message_type !== message.message_type;

                            return (
                              <div key={message.id} className={cn(
                                "flex gap-3 max-w-[85%]",
                                isOutgoing ? "ml-auto flex-row-reverse" : "mr-auto"
                              )}>
                                {showAvatar && (
                                  <Avatar className="h-8 w-8 flex-shrink-0">
                                    <AvatarImage src={
                                      isOutgoing 
                                        ? currentUser.avatar 
                                        : selectedConversation.contact?.avatar
                                    } />
                                    <AvatarFallback className={cn(
                                      "text-xs font-medium",
                                      isOutgoing 
                                        ? "bg-blue-500 text-white" 
                                        : "bg-gray-500 text-white"
                                    )}>
                                      {isOutgoing 
                                        ? currentUser.name.split(' ').map(n => n[0]).join('').slice(0, 2)
                                        : getContactInitials(selectedConversation.contact?.name, selectedConversation.contact?.email)
                                      }
                                    </AvatarFallback>
                                  </Avatar>
                                )}

                                <div className={cn(
                                  "flex flex-col",
                                  isOutgoing ? "items-end" : "items-start"
                                )}>
                                  <div className={cn(
                                    "px-4 py-2 rounded-2xl max-w-full break-words",
                                    isOutgoing
                                      ? "bg-blue-600 text-white rounded-br-md"
                                      : "bg-gray-100 text-gray-900 rounded-bl-md"
                                  )}>
                                    <p className="text-sm leading-relaxed whitespace-pre-wrap">
                                      {message.content}
                                    </p>
                                  </div>

                                  <span className="text-xs text-gray-400 mt-1 px-1">
                                    {formatMessageTime(message.created_at)}
                                  </span>
                                </div>
                              </div>
                            );
                          })
                        ) : (
                          <div className="flex items-center justify-center h-full text-center">
                            <div>
                              <MessageSquare className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                              <p className="text-gray-500">Nenhuma mensagem ainda</p>
                            </div>
                          </div>
                        )}
                        <div ref={messagesEndRef} />
                      </div>
                    )}
                  </ScrollArea>

                  {/* Campo de Input */}
                  {selectedConversation.can_reply && selectedConversation.status !== 'resolved' && (
                    <div className="p-4 border-t border-gray-200 bg-gray-50">
                      <div className="flex items-end gap-3">
                        <div className="flex-1 bg-white rounded-2xl border border-gray-200 focus-within:border-blue-500">
                          <Textarea
                            ref={textareaRef}
                            value={messageText}
                            onChange={handleTextareaChange}
                            onKeyPress={handleKeyPress}
                            placeholder="Digite sua mensagem..."
                            className="border-0 resize-none bg-transparent focus-visible:ring-0 min-h-[44px] max-h-[120px]"
                            rows={1}
                          />
                          
                          <div className="flex items-center justify-between p-2 pt-0">
                            <div className="flex items-center gap-2">
                              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                <Paperclip className="h-4 w-4 text-gray-500" />
                              </Button>
                              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                <Smile className="h-4 w-4 text-gray-500" />
                              </Button>
                            </div>
                            
                            <Button
                              onClick={handleSendMessage}
                              disabled={!messageText.trim() || sendMessageMutation.isPending}
                              size="sm"
                              className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl px-4"
                            >
                              <Send className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <div className="flex-1 flex items-center justify-center bg-white">
                  <div className="text-center">
                    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-full p-8 w-32 h-32 mx-auto mb-6 flex items-center justify-center">
                      <MessageSquare className="h-16 w-16 text-blue-600" />
                    </div>
                    <h3 className="text-2xl font-semibold text-gray-900 mb-3">
                      Bem-vindo ao Fullweb Engage
                    </h3>
                    <p className="text-gray-500 text-lg">
                      Selecione uma conversa para começar a atender.
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Painel 3: Detalhes do Contato */}
            {showContactPanel && selectedConversation && (
              <div className="w-80 bg-white border-l border-gray-200 flex flex-col">
                <div className="flex items-center justify-between p-4 border-b border-gray-200">
                  <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                    <User className="h-5 w-5" />
                    Detalhes
                  </h3>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowContactPanel(false)}
                    className="h-8 w-8 p-0"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>

                <ScrollArea className="flex-1 p-4">
                  <div className="space-y-6">
                    {/* Perfil do Contato */}
                    <div className="text-center">
                      <Avatar className="h-20 w-20 mx-auto mb-3">
                        <AvatarImage src={selectedConversation.contact?.avatar} />
                        <AvatarFallback className="bg-gradient-to-br from-blue-400 to-blue-600 text-white text-xl">
                          {getContactInitials(selectedConversation.contact?.name, selectedConversation.contact?.email)}
                        </AvatarFallback>
                      </Avatar>
                      
                      <h4 className="font-semibold text-lg text-gray-900 mb-1">
                        {selectedConversation.contact?.name || 'Nome não informado'}
                      </h4>
                      
                      <p className="text-gray-500 text-sm">
                        Cliente #{selectedConversation.contact?.id}
                      </p>
                    </div>

                    <Separator />

                    {/* Informações de Contato */}
                    <div>
                      <h5 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
                        <Mail className="h-4 w-4" />
                        Contato
                      </h5>
                      
                      <div className="space-y-3 text-sm">
                        <div>
                          <span className="text-gray-500">Email:</span>
                          <p className="text-gray-900">{selectedConversation.contact?.email || 'N/A'}</p>
                        </div>
                        <div>
                          <span className="text-gray-500">Telefone:</span>
                          <p className="text-gray-900">{selectedConversation.contact?.phone_number || 'N/A'}</p>
                        </div>
                      </div>
                    </div>

                    <Separator />

                    {/* Status da Conversa */}
                    <div>
                      <h5 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
                        <Settings className="h-4 w-4" />
                        Conversa
                      </h5>
                      
                      <div className="space-y-3 text-sm">
                        <div>
                          <span className="text-gray-500">Status:</span>
                          <div className="mt-1">
                            <Badge variant={
                              selectedConversation.status === 'open' ? 'default' :
                              selectedConversation.status === 'resolved' ? 'secondary' : 'outline'
                            }>
                              {getStatusConfig(selectedConversation.status).text}
                            </Badge>
                          </div>
                        </div>
                        
                        <div>
                          <span className="text-gray-500">Mensagens:</span>
                          <p className="text-gray-900">{messages?.length || 0}</p>
                        </div>
                        
                        <div>
                          <span className="text-gray-500">Criada em:</span>
                          <p className="text-gray-900">
                            {new Date(selectedConversation.created_at).toLocaleDateString('pt-BR')}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </ScrollArea>
              </div>
            )}
          </div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}