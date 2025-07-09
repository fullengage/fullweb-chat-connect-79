
import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Inbox, Mail, MessageSquare, Plus } from "lucide-react"
import { useInboxes } from "@/hooks/useSupabaseData"

interface InboxManagementProps {
  accountId: number
}

export const InboxManagement = ({ accountId }: InboxManagementProps) => {
  const {
    data: inboxes = [],
    isLoading: inboxesLoading,
    error: inboxesError,
    refetch: refetchInboxes
  } = useInboxes(accountId)

  if (inboxesLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Inbox className="h-5 w-5" />
            <span>Gerenciar Caixas de Entrada</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-20 bg-gray-100 rounded-lg animate-pulse" />
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  if (inboxesError) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Inbox className="h-5 w-5" />
            <span>Gerenciar Caixas de Entrada</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <p className="text-red-600 mb-2">Erro ao carregar caixas de entrada</p>
            <Button onClick={() => refetchInboxes()} variant="outline">
              Tentar Novamente
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  const getChannelIcon = (channelType: string) => {
    switch (channelType) {
      case 'email':
        return <Mail className="h-4 w-4" />
      case 'whatsapp':
        return <MessageSquare className="h-4 w-4" />
      case 'webchat':
        return <MessageSquare className="h-4 w-4" />
      default:
        return <Inbox className="h-4 w-4" />
    }
  }

  const getChannelColor = (channelType: string) => {
    switch (channelType) {
      case 'email':
        return 'bg-blue-100 text-blue-800'
      case 'whatsapp':
        return 'bg-green-100 text-green-800'
      case 'webchat':
        return 'bg-purple-100 text-purple-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center space-x-2">
            <Inbox className="h-5 w-5" />
            <span>Caixas de Entrada</span>
            <Badge variant="outline">{inboxes.length} total</Badge>
          </CardTitle>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Nova Caixa
          </Button>
        </div>
      </CardHeader>
      
      <CardContent>
        {inboxes.length === 0 ? (
          <div className="text-center py-8">
            <Inbox className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">Nenhuma caixa de entrada encontrada</p>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {inboxes.map((inbox) => (
              <Card key={inbox.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      {getChannelIcon(inbox.channel_type)}
                      <h3 className="font-semibold">{inbox.name}</h3>
                    </div>
                    <Badge className={getChannelColor(inbox.channel_type)}>
                      {inbox.channel_type}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Criado em {new Date(inbox.created_at).toLocaleDateString('pt-BR')}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
