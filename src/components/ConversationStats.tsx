
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { MessageCircle, Clock, Users, CheckCircle } from "lucide-react"
import { ConversationForStats } from "@/types"

interface ConversationStatsProps {
  conversations: ConversationForStats[]
  isLoading?: boolean
}

export const ConversationStats = ({ conversations, isLoading }: ConversationStatsProps) => {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i}>
            <CardHeader className="space-y-0 pb-2">
              <div className="h-4 bg-gray-200 rounded animate-pulse" />
            </CardHeader>
            <CardContent>
              <div className="h-8 bg-gray-200 rounded animate-pulse" />
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  const totalConversations = conversations.length
  const openConversations = conversations.filter(c => c.status === 'open').length
  const pendingConversations = conversations.filter(c => c.status === 'pending').length
  const resolvedConversations = conversations.filter(c => c.status === 'resolved').length
  const unassignedConversations = conversations.filter(c => !c.assignee).length
  const totalUnread = conversations.reduce((sum, c) => sum + c.unread_count, 0)

  const stats = [
    {
      title: "Total de Conversas",
      value: totalConversations,
      icon: MessageCircle,
      color: "text-blue-400",
      bgColor: "bg-blue-500/20",
      borderColor: "border-blue-500/30"
    },
    {
      title: "Abertas",
      value: openConversations,
      icon: Clock,
      color: "text-green-400",
      bgColor: "bg-green-500/20",
      borderColor: "border-green-500/30"
    },
    {
      title: "Pendentes",
      value: pendingConversations,
      icon: Users,
      color: "text-yellow-400",
      bgColor: "bg-yellow-500/20",
      borderColor: "border-yellow-500/30"
    },
    {
      title: "Resolvidas",
      value: resolvedConversations,
      icon: CheckCircle,
      color: "text-purple-400",
      bgColor: "bg-purple-500/20",
      borderColor: "border-purple-500/30"
    }
  ]

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {stats.map((stat) => {
          const Icon = stat.icon
          return (
            <Card key={stat.title} className={`card-hover-effect border ${stat.borderColor} bg-card/50 backdrop-blur-sm`}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-foreground">
                  {stat.title}
                </CardTitle>
                <div className={`p-3 rounded-xl ${stat.bgColor} ${stat.borderColor} border`}>
                  <Icon className={`h-5 w-5 ${stat.color}`} />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-foreground">{stat.value}</div>
                <div className="flex items-center text-xs text-muted-foreground mt-1">
                  <span className={`w-2 h-2 rounded-full ${stat.bgColor} mr-2`}></span>
                  {stat.title.toLowerCase()}
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {(unassignedConversations > 0 || totalUnread > 0) && (
        <div className="flex space-x-4">
          {unassignedConversations > 0 && (
            <Badge variant="outline" className="text-orange-600 border-orange-600">
              {unassignedConversations} Não Atribuídas
            </Badge>
          )}
          {totalUnread > 0 && (
            <Badge variant="destructive">
              {totalUnread} Mensagens Não Lidas
            </Badge>
          )}
        </div>
      )}
    </div>
  )
}
