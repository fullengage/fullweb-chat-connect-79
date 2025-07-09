
import { useState, useRef, KeyboardEvent } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Send, Paperclip } from "lucide-react"

interface ChatInputProps {
  onSendMessage: (content: string) => void
  isLoading: boolean
}

export const ChatInput = ({ onSendMessage, isLoading }: ChatInputProps) => {
  const [message, setMessage] = useState("")
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const handleSend = () => {
    const trimmedMessage = message.trim()
    if (!trimmedMessage || isLoading) return

    onSendMessage(trimmedMessage)
    setMessage("")
    
    // Reset textarea height
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
    }
  }

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const adjustTextareaHeight = () => {
    const textarea = textareaRef.current
    if (textarea) {
      textarea.style.height = 'auto'
      textarea.style.height = Math.min(textarea.scrollHeight, 120) + 'px'
    }
  }

  return (
    <div className="border-t bg-white p-4">
      <div className="flex items-end space-x-2">
        <Button variant="ghost" size="sm" className="mb-2">
          <Paperclip className="h-4 w-4" />
        </Button>
        
        <div className="flex-1">
          <Textarea
            ref={textareaRef}
            placeholder="Digite sua mensagem... (Enter para enviar, Shift+Enter para nova linha)"
            value={message}
            onChange={(e) => {
              setMessage(e.target.value)
              adjustTextareaHeight()
            }}
            onKeyDown={handleKeyDown}
            rows={1}
            className="resize-none min-h-[40px] max-h-[120px]"
            disabled={isLoading}
          />
        </div>
        
        <Button 
          onClick={handleSend} 
          disabled={!message.trim() || isLoading}
          className="mb-2"
        >
          <Send className="h-4 w-4" />
        </Button>
      </div>
      
      <div className="flex justify-between items-center mt-2 text-xs text-gray-500">
        <span>Enter para enviar • Shift+Enter para nova linha</span>
        {isLoading && <span className="text-blue-600">Enviando...</span>}
      </div>
    </div>
  )
}
