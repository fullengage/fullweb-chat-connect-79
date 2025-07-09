
import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Settings, Mail, Shield, Eye, EyeOff } from "lucide-react"
import { emailService } from "@/services/emailService"
import { EmailConnectionTest } from "./EmailConnectionTest"

interface EmailConfigurationProps {
  onSave: () => void
}

export const EmailConfiguration = ({ onSave }: EmailConfigurationProps) => {
  const [formData, setFormData] = useState({
    username: "",
    password: "",
    incomingServer: "",
    outgoingServer: "",
    protocol: "IMAP" as "IMAP" | "POP3",
    imapPort: "993",
    smtpPort: "465",
    useSSL: true
  })
  const [showPassword, setShowPassword] = useState(false)
  const [connectionTested, setConnectionTested] = useState(false)

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
    setConnectionTested(false) // Reset connection test when config changes
  }

  const handleSave = () => {
    emailService.saveConfig(formData)
    onSave()
  }

  const handleQuickSetup = () => {
    setFormData({
      username: "adm@fullweb.com.br",
      password: "",
      incomingServer: "mail.fullweb.com.br",
      outgoingServer: "mail.fullweb.com.br",
      protocol: "IMAP",
      imapPort: "993",
      smtpPort: "465",
      useSSL: true
    })
    setConnectionTested(false)
  }

  const handleConnectionTestComplete = (success: boolean) => {
    setConnectionTested(success)
  }

  const isFormValid = formData.username && formData.password && formData.incomingServer && formData.outgoingServer

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center space-x-2">
              <Settings className="h-5 w-5" />
              <span>Configuração do Email</span>
            </CardTitle>
            <Button variant="outline" size="sm" onClick={handleQuickSetup}>
              Configuração Rápida
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="username">Nome de usuário</Label>
              <Input
                id="username"
                type="email"
                placeholder="exemplo@fullweb.com.br"
                value={formData.username}
                onChange={(e) => handleInputChange('username', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Senha</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Sua senha de email"
                  value={formData.password}
                  onChange={(e) => handleInputChange('password', e.target.value)}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="incoming">Servidor de entrada</Label>
              <Input
                id="incoming"
                placeholder="mail.fullweb.com.br"
                value={formData.incomingServer}
                onChange={(e) => handleInputChange('incomingServer', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="outgoing">Servidor de saída</Label>
              <Input
                id="outgoing"
                placeholder="mail.fullweb.com.br"
                value={formData.outgoingServer}
                onChange={(e) => handleInputChange('outgoingServer', e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="protocol">Protocolo</Label>
              <Select value={formData.protocol} onValueChange={(value: "IMAP" | "POP3") => handleInputChange('protocol', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="IMAP">IMAP</SelectItem>
                  <SelectItem value="POP3">POP3</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="imapPort">Porta IMAP/POP3</Label>
              <Input
                id="imapPort"
                placeholder="993"
                value={formData.imapPort}
                onChange={(e) => handleInputChange('imapPort', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="smtpPort">Porta SMTP</Label>
              <Input
                id="smtpPort"
                placeholder="465"
                value={formData.smtpPort}
                onChange={(e) => handleInputChange('smtpPort', e.target.value)}
              />
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Shield className="h-4 w-4 text-green-600" />
            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
              SSL/TLS Ativado
            </Badge>
            <span className="text-sm text-muted-foreground">
              Conexão segura habilitada
            </span>
          </div>

          <div className="flex space-x-4">
            <Button 
              onClick={handleSave} 
              className="flex-1"
              disabled={!isFormValid}
            >
              <Mail className="h-4 w-4 mr-2" />
              Salvar Configuração
            </Button>
          </div>

          {!isFormValid && (
            <p className="text-sm text-amber-600 text-center">
              Preencha todos os campos obrigatórios para salvar a configuração
            </p>
          )}

          {isFormValid && !connectionTested && (
            <p className="text-sm text-blue-600 text-center">
              Recomendamos testar a conexão antes de salvar para garantir que as configurações estão corretas
            </p>
          )}

          {connectionTested && (
            <p className="text-sm text-green-600 text-center">
              ✅ Conexão testada com sucesso! Configuração pronta para ser salva.
            </p>
          )}
        </CardContent>
      </Card>

      {/* Componente de teste de conexão */}
      {isFormValid && (
        <EmailConnectionTest onTestComplete={handleConnectionTestComplete} />
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Informações de Segurança</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground space-y-2">
          <p>• As configurações são armazenadas localmente no seu navegador</p>
          <p>• Certifique-se de usar senhas de aplicativo quando disponível</p>
          <p>• Todas as conexões utilizam SSL/TLS para segurança</p>
          <p>• IMAP e SMTP requerem autenticação</p>
          <p>• Teste sempre a conexão antes de salvar</p>
        </CardContent>
      </Card>
    </div>
  )
}
