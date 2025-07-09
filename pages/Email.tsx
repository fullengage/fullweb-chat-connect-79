
import { useState } from "react"
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/AppSidebar"
import { EmailConfiguration } from "@/components/EmailConfiguration"
import { EmailInbox } from "@/components/EmailInbox"
import { Button } from "@/components/ui/button"
import { RefreshCw, Mail, Settings } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export default function Email() {
  const [isConfigured, setIsConfigured] = useState(false)
  const [refreshTrigger, setRefreshTrigger] = useState(0)
  const { toast } = useToast()

  const handleRefresh = () => {
    setRefreshTrigger(prev => prev + 1)
    toast({
      title: "Atualizando emails",
      description: "Buscando novos emails...",
    })
  }

  const handleConfigurationSave = () => {
    setIsConfigured(true)
    toast({
      title: "Configuração salva",
      description: "Configurações de email foram salvas com sucesso!",
    })
  }

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AppSidebar />
        <SidebarInset>
          <div className="flex-1 space-y-6 p-6">
            <div className="flex items-center justify-between border-b pb-4">
              <div className="flex items-center space-x-4">
                <SidebarTrigger />
                <div>
                  <h1 className="text-3xl font-bold tracking-tight flex items-center space-x-2">
                    <Mail className="h-8 w-8 text-blue-600" />
                    <span>Caixa de Entrada</span>
                  </h1>
                  <p className="text-muted-foreground">
                    Gerencie emails dos seus clientes em um só lugar
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                {isConfigured && (
                  <Button onClick={handleRefresh}>
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Atualizar
                  </Button>
                )}
              </div>
            </div>

            {!isConfigured ? (
              <div className="space-y-6">
                <div className="text-center py-8">
                  <div className="max-w-md mx-auto">
                    <div className="bg-blue-50 rounded-full p-6 w-24 h-24 mx-auto mb-4 flex items-center justify-center">
                      <Settings className="h-12 w-12 text-blue-600" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">
                      Configure sua caixa de entrada
                    </h3>
                    <p className="text-gray-500 mb-6">
                      Configure as credenciais do seu servidor de email para começar a receber mensagens.
                    </p>
                  </div>
                </div>
                <EmailConfiguration onSave={handleConfigurationSave} />
              </div>
            ) : (
              <EmailInbox refreshTrigger={refreshTrigger} />
            )}
          </div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  )
}
