
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { 
  Mail, 
  Paperclip, 
  Star,
  Clock
} from "lucide-react"
import { EmailMessage } from "@/services/emailService"

interface EmailCardProps {
  email: EmailMessage
  onClick: () => void
}

export const EmailCard = ({ email, onClick }: EmailCardProps) => {
  const formatDate = (date: Date) => {
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const hours = Math.floor(diff / (1000 * 60 * 60))
    
    if (hours < 1) {
      const minutes = Math.floor(diff / (1000 * 60))
      return `${minutes}m atrás`
    } else if (hours < 24) {
      return `${hours}h atrás`
    } else {
      return date.toLocaleDateString('pt-BR')
    }
  }

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  return (
    <Card 
      className={`cursor-pointer hover:shadow-md transition-shadow ${
        !email.isRead ? 'border-blue-200 bg-blue-50/30' : 'hover:bg-gray-50'
      }`}
      onClick={onClick}
    >
      <CardContent className="p-4">
        <div className="flex items-start space-x-3">
          <Avatar className="h-10 w-10">
            <AvatarFallback className="bg-purple-100 text-purple-700">
              {getInitials(email.fromName)}
            </AvatarFallback>
          </Avatar>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center space-x-2">
                <h3 className={`text-sm font-medium text-gray-900 truncate ${
                  !email.isRead ? 'font-semibold' : ''
                }`}>
                  {email.fromName}
                </h3>
                {email.isImportant && (
                  <Star className="h-4 w-4 text-yellow-500 fill-current" />
                )}
              </div>
              <div className="flex items-center space-x-2">
                {email.hasAttachments && (
                  <Paperclip className="h-4 w-4 text-gray-400" />
                )}
                <span className="text-xs text-gray-500">
                  {formatDate(email.date)}
                </span>
              </div>
            </div>
            
            <h4 className={`text-sm text-gray-900 mb-1 truncate ${
              !email.isRead ? 'font-medium' : ''
            }`}>
              {email.subject}
            </h4>
            
            <p className="text-sm text-gray-600 truncate">
              {email.preview}
            </p>
            
            <div className="flex items-center justify-between mt-2">
              <Badge variant="outline" className="text-xs">
                {email.folder === 'inbox' ? 'Entrada' : email.folder}
              </Badge>
              
              {!email.isRead && (
                <div className="flex items-center text-xs text-blue-600">
                  <Clock className="h-3 w-3 mr-1" />
                  Não lido
                </div>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
