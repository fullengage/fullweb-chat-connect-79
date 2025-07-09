
import { useState } from "react"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  Mail,
  Reply,
  ReplyAll,
  Forward,
  Archive,
  Trash2,
  Star,
  Paperclip,
  Send,
  X
} from "lucide-react"
import { EmailMessage } from "@/services/emailService"

interface EmailDetailProps {
  email: EmailMessage | null
  isOpen: boolean
  onClose: () => void
}

export const EmailDetail = ({ email, isOpen, onClose }: EmailDetailProps) => {
  const [isReplying, setIsReplying] = useState(false)
  const [replyText, setReplyText] = useState("")

  if (!email) return null

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  const handleReply = () => {
    setIsReplying(true)
    setReplyText(`\n\n---\nEm ${email.date.toLocaleDateString('pt-BR')} às ${email.date.toLocaleTimeString('pt-BR')}, ${email.fromName} <${email.from}> escreveu:\n\n${email.body}`)
  }

  const handleSendReply = () => {
    // Aqui você implementaria o envio da resposta
    console.log('Enviando resposta:', replyText)
    setIsReplying(false)
    setReplyText("")
  }

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="w-full sm:max-w-2xl">
        <SheetHeader className="pb-4">
          <div className="flex items-center justify-between">
            <SheetTitle className="text-left">Email</SheetTitle>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </SheetHeader>

        <div className="space-y-6">
          {/* Header do Email */}
          <div className="space-y-4">
            <div className="flex items-start space-x-3">
              <Avatar className="h-12 w-12">
                <AvatarFallback className="bg-purple-100 text-purple-700">
                  {getInitials(email.fromName)}
                </AvatarFallback>
              </Avatar>
              
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-1">
                  <h3 className="font-semibold text-gray-900">{email.fromName}</h3>
                  {email.isImportant && (
                    <Star className="h-4 w-4 text-yellow-500 fill-current" />
                  )}
                </div>
                <p className="text-sm text-gray-600">{email.from}</p>
                <p className="text-sm text-gray-500">
                  Para: {email.to}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {email.date.toLocaleString('pt-BR')}
                </p>
              </div>
            </div>

            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-2">
                {email.subject}
              </h2>
              
              <div className="flex items-center space-x-2">
                <Badge variant="outline">
                  {email.folder === 'inbox' ? 'Entrada' : email.folder}
                </Badge>
                {email.hasAttachments && (
                  <Badge variant="outline" className="text-xs">
                    <Paperclip className="h-3 w-3 mr-1" />
                    Anexos
                  </Badge>
                )}
                {!email.isRead && (
                  <Badge variant="secondary">Não lido</Badge>
                )}
              </div>
            </div>
          </div>

          <Separator />

          {/* Corpo do Email */}
          <div className="space-y-4">
            <div className="prose prose-sm max-w-none">
              <div className="whitespace-pre-wrap text-gray-700 leading-relaxed">
                {email.body}
              </div>
            </div>

            {email.hasAttachments && (
              <div className="space-y-2">
                <h4 className="text-sm font-medium text-gray-900">Anexos</h4>
                <div className="border border-gray-200 rounded-lg p-3">
                  <div className="flex items-center space-x-2">
                    <Paperclip className="h-4 w-4 text-gray-400" />
                    <span className="text-sm text-gray-600">documento.pdf</span>
                    <span className="text-xs text-gray-500">(125 KB)</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          <Separator />

          {/* Ações */}
          {!isReplying ? (
            <div className="flex flex-wrap gap-2">
              <Button onClick={handleReply} className="flex-1 sm:flex-none">
                <Reply className="h-4 w-4 mr-2" />
                Responder
              </Button>
              <Button variant="outline" className="flex-1 sm:flex-none">
                <ReplyAll className="h-4 w-4 mr-2" />
                Resp. Todos
              </Button>
              <Button variant="outline" className="flex-1 sm:flex-none">
                <Forward className="h-4 w-4 mr-2" />
                Encaminhar
              </Button>
              <Button variant="outline" size="sm">
                <Archive className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="sm">
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-medium">Responder para {email.fromName}</h4>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsReplying(false)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
              
              <Textarea
                placeholder="Digite sua resposta..."
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                className="min-h-[200px]"
              />
              
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setIsReplying(false)}>
                  Cancelar
                </Button>
                <Button onClick={handleSendReply}>
                  <Send className="h-4 w-4 mr-2" />
                  Enviar
                </Button>
              </div>
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  )
}
