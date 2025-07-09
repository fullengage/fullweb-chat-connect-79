
import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { 
  Loader2, 
  CheckCircle, 
  XCircle, 
  Wifi, 
  AlertTriangle,
  Info
} from "lucide-react"
import { emailService } from "@/services/emailService"

interface EmailConnectionTestProps {
  onTestComplete?: (success: boolean) => void
}

export const EmailConnectionTest = ({ onTestComplete }: EmailConnectionTestProps) => {
  const [isLoading, setIsLoading] = useState(false)
  const [testResult, setTestResult] = useState<{
    success: boolean
    message: string
    details?: any
  } | null>(null)

  const runConnectionTest = async () => {
    setIsLoading(true)
    setTestResult(null)

    try {
      const result = await emailService.testConnection()
      setTestResult(result)
      onTestComplete?.(result.success)
    } catch (error) {
      const errorResult = {
        success: false,
        message: `Erro inesperado: ${error instanceof Error ? error.message : 'Erro desconhecido'}`
      }
      setTestResult(errorResult)
      onTestComplete?.(false)
    } finally {
      setIsLoading(false)
    }
  }

  const config = emailService.getConfig()

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Wifi className="h-5 w-5" />
          <span>Teste de Conexão</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {config && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium">Configuração Atual:</h4>
            <div className="text-sm text-muted-foreground space-y-1">
              <p><strong>Servidor:</strong> {config.incomingServer}:{config.imapPort}</p>
              <p><strong>Usuário:</strong> {config.username}</p>
              <p><strong>Protocolo:</strong> {config.protocol}</p>
              <p><strong>SSL:</strong> {config.useSSL ? 'Ativado' : 'Desativado'}</p>
            </div>
          </div>
        )}

        <Button 
          onClick={runConnectionTest} 
          disabled={isLoading || !config}
          className="w-full"
        >
          {isLoading ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Testando conexão...
            </>
          ) : (
            <>
              <Wifi className="h-4 w-4 mr-2" />
              Testar Conexão
            </>
          )}
        </Button>

        {testResult && (
          <Alert className={testResult.success ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"}>
            <div className="flex items-start space-x-2">
              {testResult.success ? (
                <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
              ) : (
                <XCircle className="h-4 w-4 text-red-600 mt-0.5" />
              )}
              <div className="flex-1">
                <AlertDescription>
                  <div className="space-y-2">
                    <p className="font-medium">{testResult.message}</p>
                    
                    {testResult.details?.suggestion && (
                      <div className="flex items-start space-x-2">
                        <Info className="h-3 w-3 text-blue-500 mt-0.5 flex-shrink-0" />
                        <p className="text-xs text-blue-700">{testResult.details.suggestion}</p>
                      </div>
                    )}

                    {testResult.details?.error && (
                      <Badge variant="outline" className="text-xs">
                        {testResult.details.error}
                      </Badge>
                    )}
                  </div>
                </AlertDescription>
              </div>
            </div>
          </Alert>
        )}

        {!config && (
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              Configure suas credenciais de email primeiro antes de testar a conexão.
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  )
}
