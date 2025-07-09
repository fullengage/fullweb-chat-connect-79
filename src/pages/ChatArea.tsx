
import { useState, useEffect, useRef } from "react"
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/AppSidebar"
import { ChatSidebar } from "@/components/ChatSidebar"
import { ChatMessages } from "@/components/ChatMessages"
import { ChatHeader } from "@/components/ChatHeader"
import { ChatInput } from "@/components/ChatInput"
import { useUsers, useSendMessage } from "@/hooks/useSupabaseData"
import { useChatwootConversations } from "@/hooks/useChatwootData"
import { useAuth } from "@/contexts/AuthContext"
import { supabase } from "@/integrations/supabase/client"
import { useToast } from "@/hooks/use-toast"
import { MessageSquare } from "lucide-react"

export default function ChatArea() {
  const [selectedConversation, setSelectedConversation] = useState<any>(null)
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const { user: authUser } = useAuth()
  const { toast } = useToast()
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Fetch current user data
  useEffect(() => {
    const fetchCurrentUser = async () => {
      if (!authUser) return

      const { data: userData, error } = await supabase
        .from('users')
        .select('*')
        .eq('auth_user_id', authUser.id)
        .single()

      if (error) {
        console.error('Error fetching user data:', error)
        return
      }

      setCurrentUser(userData)
    }

    fetchCurrentUser()
  }, [authUser])

  // Build filters for conversations
  const filters = {
    account_id: currentUser?.account_id || 0,
  }

  const {
    data: conversations = [],
    isLoading: conversationsLoading,
    error: conversationsError,
    refetch: refetchConversations
  } = useChatwootConversations(filters)

  const {
    data: users = [],
    isLoading: usersLoading
  } = useUsers(currentUser?.account_id || 0)

  const sendMessageMutation = useSendMessage()

  // Auto scroll to bottom when new messages arrive
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [selectedConversation?.messages])

  // Filter conversations based on search (ensure conversations is always an array)
  const filteredConversations = (Array.isArray(conversations) ? conversations : []).filter(conversation =>
    conversation.contact?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    conversation.contact?.email?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleSendMessage = async (content: string) => {
    if (!selectedConversation || !currentUser) return

    try {
      await sendMessageMutation.mutateAsync({
        conversation_id: selectedConversation.id,
        sender_type: 'agent',
        sender_id: currentUser.id,
        content
      })

      // Refresh conversations to get updated messages
      refetchConversations()
    } catch (error) {
      console.error('Error sending message:', error)
      toast({
        title: "Erro ao enviar mensagem",
        description: "Não foi possível enviar a mensagem. Tente novamente.",
        variant: "destructive",
      })
    }
  }

  const handleResolveConversation = async () => {
    if (!selectedConversation) return

    try {
      const { error } = await supabase
        .from('conversations')
        .update({ status: 'resolved', updated_at: new Date().toISOString() })
        .eq('id', selectedConversation.id)

      if (error) throw error

      toast({
        title: "Conversa resolvida",
        description: "A conversa foi marcada como resolvida com sucesso.",
      })

      // Update local state
      setSelectedConversation(prev => prev ? { ...prev, status: 'resolved' } : null)
      refetchConversations()
    } catch (error) {
      console.error('Error resolving conversation:', error)
      toast({
        title: "Erro ao resolver conversa",
        description: "Não foi possível resolver a conversa. Tente novamente.",
        variant: "destructive",
      })
    }
  }

  if (!currentUser) {
    return (
      <SidebarProvider>
        <div className="min-h-screen flex w-full">
          <AppSidebar />
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-500">Carregando dados do usuário...</p>
            </div>
          </div>
        </div>
      </SidebarProvider>
    )
  }

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AppSidebar />
        <SidebarInset>
          <div className="flex h-screen">
            {/* Chat Sidebar */}
            <ChatSidebar
              conversations={filteredConversations}
              selectedConversation={selectedConversation}
              onSelectConversation={setSelectedConversation}
              searchTerm={searchTerm}
              onSearchChange={setSearchTerm}
              isLoading={conversationsLoading}
            />

            {/* Main Chat Area */}
            <div className="flex-1 flex flex-col">
              {selectedConversation ? (
                <>
                  <ChatHeader
                    conversation={selectedConversation}
                    onResolve={handleResolveConversation}
                  />
                  
                  <div className="flex-1 overflow-hidden flex flex-col">
                    <ChatMessages
                      conversation={selectedConversation}
                      currentUser={currentUser}
                      users={users}
                    />
                    <div ref={messagesEndRef} />
                  </div>

                  <ChatInput
                    onSendMessage={handleSendMessage}
                    isLoading={sendMessageMutation.isPending}
                  />
                </>
              ) : (
                <div className="flex-1 flex items-center justify-center bg-gray-50">
                  <div className="text-center">
                    <div className="bg-blue-50 rounded-full p-6 w-24 h-24 mx-auto mb-4 flex items-center justify-center">
                      <MessageSquare className="h-12 w-12 text-blue-600" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">
                      Selecione uma conversa
                    </h3>
                    <p className="text-gray-500">
                      Escolha uma conversa na barra lateral para começar a atender.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  )
}
