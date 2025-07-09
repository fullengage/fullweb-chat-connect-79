
import { Input } from "@/components/ui/input"
import { Search } from "lucide-react"
// Using any type for flexibility with Chatwoot conversations
import { ConversationCard } from "@/components/ConversationCard"

interface ChatSidebarProps {
  conversations: any[]
  selectedConversation: any | null
  onSelectConversation: (conversation: any) => void
  searchTerm: string
  onSearchChange: (term: string) => void
  isLoading: boolean
}

export const ChatSidebar = ({
  conversations,
  selectedConversation,
  onSelectConversation,
  searchTerm,
  onSearchChange,
  isLoading
}: ChatSidebarProps) => {
  return (
    <div className="w-80 border-r bg-white flex flex-col">
      {/* Header */}
      <div className="p-4 border-b">
        <h2 className="text-lg font-semibold mb-3">Conversas</h2>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Buscar conversas..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Conversations List */}
      <div className="flex-1 overflow-y-auto">
        {isLoading ? (
          <div className="p-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="mb-3 p-3 border rounded-lg animate-pulse">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
                  <div className="flex-1">
                    <div className="h-4 bg-gray-200 rounded mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-3/4"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : conversations.length === 0 ? (
          <div className="p-4 text-center text-gray-500">
            <p>Nenhuma conversa encontrada</p>
          </div>
        ) : (
          <div className="p-2">
            {conversations.map((conversation) => (
              <div
                key={conversation.id}
                className={`mb-2 cursor-pointer rounded-lg transition-colors ${
                  selectedConversation?.id === conversation.id
                    ? 'bg-blue-50 border-blue-200'
                    : 'hover:bg-gray-50'
                }`}
                onClick={() => onSelectConversation(conversation)}
              >
                <ConversationCard conversation={conversation} />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
