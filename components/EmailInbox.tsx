import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { EmailCard } from "./EmailCard"
import { EmailDetail } from "./EmailDetail"
import { 
  Mail, 
  Search, 
  Filter,
  Clock,
  CheckCircle,
  AlertCircle,
  Archive,
  Loader2,
  AlertTriangle
} from "lucide-react"
import { emailService, EmailMessage } from "@/services/emailService"
import { useToast } from "@/hooks/use-toast"

interface EmailInboxProps {
  refreshTrigger: number
}

// Mock data para demonstração
const mockEmails = [
  {
    id: "1",
    from: "cliente@empresa.com",
    fromName: "João Silva",
    to: "adm@fullweb.com.br",
    subject: "Dúvida sobre o produto",
    preview: "Gostaria de saber mais informações sobre os preços...",
    body: "Olá, gostaria de saber mais informações sobre os preços dos seus produtos. Poderia me enviar uma tabela completa?",
    date: new Date(),
    isRead: false,
    isImportant: true,
    hasAttachments: false,
    folder: "inbox"
  },
  {
    id: "2",
    from: "contato@clienteabc.com.br",
    fromName: "Maria Santos",
    to: "adm@fullweb.com.br",
    subject: "Proposta comercial",
    preview: "Seguem em anexo os documentos solicitados...",
    body: "Prezados, seguem em anexo os documentos solicitados para a proposta comercial. Aguardo retorno.",
    date: new Date(Date.now() - 86400000),
    isRead: true,
    isImportant: false,
    hasAttachments: true,
    folder: "inbox"
  },
  {
    id: "3",
    from: "suporte@fornecedor.com",
    fromName: "Suporte Técnico",
    to: "adm@fullweb.com.br",
    subject: "Ticket #12345 - Resolvido",
    preview: "Seu ticket foi resolvido com sucesso...",
    body: "Informamos que seu ticket #12345 foi resolvido com sucesso. Caso tenha outras dúvidas, entre em contato.",
    date: new Date(Date.now() - 172800000),
    isRead: true,
    isImportant: false,
    hasAttachments: false,
    folder: "inbox"
  }
]

export const EmailInbox = ({ refreshTrigger }: EmailInboxProps) => {
  const [emails, setEmails] = useState<EmailMessage[]>([])
  const [selectedEmail, setSelectedEmail] = useState<any>(null)
  const [isDetailOpen, setIsDetailOpen] = useState(false)
  const [folderFilter, setFolderFilter] = useState("inbox")
  const [searchQuery, setSearchQuery] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { toast } = useToast()

  const fetchEmails = async () => {
    setIsLoading(true)
    setError(null)
    
    try {
      console.log("Buscando emails...")
      const fetchedEmails = await emailService.fetchEmails()
      setEmails(fetchedEmails)
      
      toast({
        title: "Emails carregados",
        description: `${fetchedEmails.length} emails encontrados`,
      })
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro ao buscar emails'
      setError(errorMessage)
      console.error("Erro ao buscar emails:", error)
      
      toast({
        title: "Erro ao carregar emails",
        description: errorMessage,
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchEmails()
  }, [refreshTrigger])

  const handleEmailClick = (email: any) => {
    setSelectedEmail(email)
    setIsDetailOpen(true)
    
    // Marcar como lido
    setEmails(prev => prev.map(e => 
      e.id === email.id ? { ...e, isRead: true } : e
    ))
  }

  const handleCloseDetail = () => {
    setIsDetailOpen(false)
    setSelectedEmail(null)
  }

  // Filtrar emails
  const filteredEmails = emails.filter(email => {
    const matchesFolder = folderFilter === "all" || email.folder === folderFilter
    const matchesSearch = searchQuery === "" || 
      email.fromName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      email.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
      email.from.toLowerCase().includes(searchQuery.toLowerCase())
    
    return matchesFolder && matchesSearch
  })

  // Agrupar emails por status
  const emailsByStatus = {
    unread: filteredEmails.filter(e => !e.isRead),
    read: filteredEmails.filter(e => e.isRead),
    important: filteredEmails.filter(e => e.isImportant),
  }

  const getTabCount = (status: string) => {
    return emailsByStatus[status as keyof typeof emailsByStatus]?.length || 0
  }

  const unreadCount = emails.filter(e => !e.isRead).length

  if (error) {
    return (
      <Card>
        <CardContent className="p-6">
          <Alert className="border-red-200 bg-red-50">
            <AlertTriangle className="h-4 w-4 text-red-600" />
            <AlertDescription>
              <div className="space-y-2">
                <p className="font-medium text-red-800">Erro ao conectar com o servidor de email</p>
                <p className="text-red-700">{error}</p>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={fetchEmails}
                  className="mt-2"
                >
                  Tentar novamente
                </Button>
              </div>
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    )
  }

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
            <CardTitle className="flex items-center space-x-2">
              <Mail className="h-5 w-5" />
              <span>Caixa de Entrada</span>
              {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
              <Badge variant="outline">{filteredEmails.length} total</Badge>
              {unreadCount > 0 && (
                <Badge variant="destructive">{unreadCount} não lidos</Badge>
              )}
            </CardTitle>
            
            <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar emails..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 w-full sm:w-64"
                />
              </div>
              
              <Select value={folderFilter} onValueChange={setFolderFilter}>
                <SelectTrigger className="w-full sm:w-48">
                  <SelectValue placeholder="Filtrar por pasta" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas as pastas</SelectItem>
                  <SelectItem value="inbox">Entrada</SelectItem>
                  <SelectItem value="sent">Enviados</SelectItem>
                  <SelectItem value="archive">Arquivados</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">
              <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
              <p className="text-muted-foreground">Carregando emails...</p>
            </div>
          ) : (
            <Tabs value={folderFilter} onValueChange={setFolderFilter} className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="inbox" className="flex items-center space-x-2">
                  <Mail className="h-4 w-4" />
                  <span>Entrada</span>
                  <Badge variant="secondary" className="ml-1">
                    {filteredEmails.length}
                  </Badge>
                </TabsTrigger>
                <TabsTrigger value="unread" className="flex items-center space-x-2">
                  <Clock className="h-4 w-4" />
                  <span>Não lidos</span>
                  <Badge variant="secondary" className="ml-1">
                    {getTabCount('unread')}
                  </Badge>
                </TabsTrigger>
                <TabsTrigger value="important" className="flex items-center space-x-2">
                  <AlertCircle className="h-4 w-4" />
                  <span>Importantes</span>
                  <Badge variant="secondary" className="ml-1">
                    {getTabCount('important')}
                  </Badge>
                </TabsTrigger>
                <TabsTrigger value="archive" className="flex items-center space-x-2">
                  <Archive className="h-4 w-4" />
                  <span>Arquivados</span>
                  <Badge variant="secondary" className="ml-1">
                    0
                  </Badge>
                </TabsTrigger>
              </TabsList>

              <TabsContent value="inbox" className="mt-4">
                <EmailList 
                  emails={filteredEmails}
                  onEmailClick={handleEmailClick}
                />
              </TabsContent>

              <TabsContent value="unread" className="mt-4">
                <EmailList 
                  emails={emailsByStatus.unread}
                  onEmailClick={handleEmailClick}
                />
              </TabsContent>

              <TabsContent value="important" className="mt-4">
                <EmailList 
                  emails={emailsByStatus.important}
                  onEmailClick={handleEmailClick}
                />
              </TabsContent>

              <TabsContent value="archive" className="mt-4">
                <div className="text-center py-8">
                  <Archive className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">Nenhum email arquivado</p>
                </div>
              </TabsContent>
            </Tabs>
          )}
        </CardContent>
      </Card>

      <EmailDetail
        email={selectedEmail}
        isOpen={isDetailOpen}
        onClose={handleCloseDetail}
      />
    </>
  )
}

// Componente auxiliar para renderizar a lista de emails
const EmailList = ({ 
  emails, 
  onEmailClick 
}: { 
  emails: any[], 
  onEmailClick: (email: any) => void 
}) => {
  if (emails.length === 0) {
    return (
      <div className="text-center py-8">
        <Mail className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-500">Nenhum email encontrado</p>
      </div>
    )
  }

  return (
    <div className="space-y-2">
      {emails.map((email) => (
        <EmailCard
          key={email.id}
          email={email}
          onClick={() => onEmailClick(email)}
        />
      ))}
    </div>
  )
}
