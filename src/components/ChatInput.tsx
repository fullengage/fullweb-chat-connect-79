
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
    <div className="border-t bg-card/80 backdrop-blur-sm p-3 animate-fade-in">
      <div className="flex items-end space-x-2">
        <Button variant="ghost" size="sm" className="mb-1 hover-scale text-muted-foreground hover:text-foreground h-8 w-8 p-0">
          <Paperclip className="h-3 w-3" />
        </Button>
        
        <div className="flex-1">
          <Textarea
            ref={textareaRef}
            placeholder="Digite sua mensagem... (Enter para enviar)"
            value={message}
            onChange={(e) => {
              setMessage(e.target.value)
              adjustTextareaHeight()
            }}
            onKeyDown={handleKeyDown}
            rows={1}
            className="resize-none min-h-[36px] max-h-[100px] border-border/50 focus:border-primary/50 transition-colors text-sm"
            disabled={isLoading}
          />
        </div>
        
        <Button 
          onClick={handleSend} 
          disabled={!message.trim() || isLoading}
          className="mb-1 hover-scale bg-primary hover:bg-primary/90 h-8 w-8 p-0"
          size="sm"
        >
          <Send className="h-3 w-3" />
        </Button>
      </div>
      
      <div className="flex justify-between items-center mt-2 text-xs text-muted-foreground">
        <span>Enter para enviar • Shift+Enter para nova linha</span>
        {isLoading && (
          <span className="text-primary font-medium animate-pulse">
            Enviando...
          </span>
        )}
      </div>
    </div>
  )
}
