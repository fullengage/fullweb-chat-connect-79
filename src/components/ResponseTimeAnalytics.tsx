import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { 
  ChartContainer, 
  ChartTooltip, 
  ChartTooltipContent 
} from "@/components/ui/chart"
import { 
  BarChart, 
  Bar, 
  LineChart, 
  Line,
  XAxis, 
  YAxis, 
  ResponsiveContainer 
} from "recharts"
import { Clock, Timer, Zap, AlertCircle } from "lucide-react"
import { Conversation } from "@/types"
import { User } from "@/hooks/useSupabaseData"

interface ResponseTimeAnalyticsProps {
  conversations: Conversation[]
  agents: User[]
  isLoading: boolean
}

const chartConfig = {
  responseTime: {
    label: "Tempo de Resposta (min)"
  },
  average: {
    label: "Média"
  }
}

export const ResponseTimeAnalytics = ({ 
  conversations, 
  agents, 
  isLoading 
}: ResponseTimeAnalyticsProps) => {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {[...Array(4)].map((_, i) => (
          <Card key={i}>
            <CardHeader>
              <div className="h-4 bg-gray-200 rounded animate-pulse" />
            </CardHeader>
            <CardContent>
              <div className="h-32 bg-gray-200 rounded animate-pulse" />
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  // Calcular métricas reais de tempo de resposta baseadas nos dados
  const calculateResponseTime = (conversation: Conversation) => {
    if (!conversation.created_at || !conversation.updated_at) return 0
    const created = new Date(conversation.created_at).getTime()
    const updated = new Date(conversation.updated_at).getTime()
    return Math.floor((updated - created) / (1000 * 60)) // em minutos
  }

  // Calcular primeira resposta média (tempo entre criação e primeira atualização)
  const responseTimes = conversations
    .filter(c => c.created_at && c.updated_at)
    .map(calculateResponseTime)
    .filter(time => time > 0)

  const avgFirstResponse = responseTimes.length > 0
    ? Math.floor(responseTimes.reduce((sum, time) => sum + time, 0) / responseTimes.length)
    : 0

  const avgResponseTime = Math.floor(avgFirstResponse * 0.7) // Estimativa para tempo médio entre mensagens
  const fastResponses = responseTimes.filter(time => time <= 5).length
  const slowResponses = responseTimes.filter(time => time > 30).length

  // Dados para gráfico de tempo de resposta por hora (baseado nos horários das conversas)
  const hourlyData = Array.from({ length: 24 }, (_, hour) => {
    const hourConversations = conversations.filter(c => {
      if (!c.created_at) return false
      const createdHour = new Date(c.created_at).getHours()
      return createdHour === hour
    })
    
    const hourResponseTimes = hourConversations
      .map(calculateResponseTime)
      .filter(time => time > 0)
    
    const avgTime = hourResponseTimes.length > 0
      ? Math.floor(hourResponseTimes.reduce((sum, time) => sum + time, 0) / hourResponseTimes.length)
      : 0

    return {
      hour: `${hour.toString().padStart(2, '0')}:00`,
      responseTime: avgTime,
      conversations: hourConversations.length
    }
  })

  // Dados para gráfico de performance por agente (baseado nos dados reais)
  const agentData = agents.slice(0, 5).map(agent => {
    const agentConversations = conversations.filter(c => c.assignee?.id === agent.id)
    const agentResponseTimes = agentConversations
      .map(calculateResponseTime)
      .filter(time => time > 0)
    
    const avgResponse = agentResponseTimes.length > 0
      ? Math.floor(agentResponseTimes.reduce((sum, time) => sum + time, 0) / agentResponseTimes.length)
      : 0

    return {
      name: agent.name,
      avgResponse,
      conversations: agentConversations.length
    }
  }).filter(agent => agent.conversations > 0)

  // Dados para tendência dos últimos 7 dias (baseado nos dados reais)
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const date = new Date()
    date.setDate(date.getDate() - i)
    return date.toISOString().split('T')[0]
  }).reverse()

  const trendData = last7Days.map(date => {
    const dayConversations = conversations.filter(c => 
      c.created_at && c.created_at.split('T')[0] === date
    )
    
    const dayResponseTimes = dayConversations
      .map(calculateResponseTime)
      .filter(time => time > 0)
    
    const avgTime = dayResponseTimes.length > 0
      ? Math.floor(dayResponseTimes.reduce((sum, time) => sum + time, 0) / dayResponseTimes.length)
      : 0

    return {
      date: new Date(date).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }),
      responseTime: avgTime
    }
  })

  return (
    <div className="space-y-6">
      {/* Métricas principais baseadas em dados reais */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Primeira Resposta</CardTitle>
            <Zap className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{avgFirstResponse}min</div>
            <p className="text-xs text-muted-foreground mt-1">
              Baseado em {responseTimes.length} conversas
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tempo Médio</CardTitle>
            <Clock className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{avgResponseTime}min</div>
            <p className="text-xs text-muted-foreground mt-1">
              Tempo médio estimado entre mensagens
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Respostas Rápidas</CardTitle>
            <Timer className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{fastResponses}</div>
            <Badge variant="outline" className="mt-green-600 border-green-600">
              &lt; 5 minutos
            </Badge>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Respostas Lentas</CardTitle>
            <AlertCircle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{slowResponses}</div>
            <Badge variant="outline" className="mt-1 text-red-600 border-red-600">
              &gt; 30 minutos
            </Badge>
          </CardContent>
        </Card>
      </div>

      {/* Gráficos baseados em dados reais */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Tempo de Resposta por Hora */}
        <Card>
          <CardHeader>
            <CardTitle>Tempo de Resposta por Hora</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-[300px]">
              <LineChart data={hourlyData}>
                <XAxis dataKey="hour" />
                <YAxis />
                <Line 
                  type="monotone" 
                  dataKey="responseTime" 
                  stroke="#3B82F6" 
                  strokeWidth={2}
                  dot={{ fill: '#3B82F6', strokeWidth: 2, r: 3 }}
                />
                <ChartTooltip 
                  content={<ChartTooltipContent />}
                  formatter={(value) => [`${value} min`, 'Tempo de Resposta']}
                />
              </LineChart>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Performance por Agente */}
        <Card>
          <CardHeader>
            <CardTitle>Performance por Agente</CardTitle>
          </CardHeader>
          <CardContent>
            {agentData.length > 0 ? (
              <ChartContainer config={chartConfig} className="h-[300px]">
                <BarChart data={agentData} layout="horizontal">
                  <XAxis type="number" />
                  <YAxis dataKey="name" type="category" width={100} />
                  <Bar dataKey="avgResponse" fill="#8B5CF6" />
                  <ChartTooltip 
                    content={<ChartTooltipContent />}
                    formatter={(value) => [`${value} min`, 'Tempo Médio']}
                  />
                </BarChart>
              </ChartContainer>
            ) : (
              <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                Nenhum agente com dados disponíveis
              </div>
            )}
          </CardContent>
        </Card>

        {/* Tendência dos Últimos 7 Dias */}
        <Card>
          <CardHeader>
            <CardTitle>Tendência dos Últimos 7 Dias</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-[300px]">
              <LineChart data={trendData}>
                <XAxis dataKey="date" />
                <YAxis />
                <Line 
                  type="monotone" 
                  dataKey="responseTime" 
                  stroke="#10B981" 
                  strokeWidth={3}
                  dot={{ fill: '#10B981', strokeWidth: 2, r: 4 }}
                />
                <ChartTooltip 
                  content={<ChartTooltipContent />}
                  formatter={(value) => [`${value} min`, 'Tempo Médio']}
                />
              </LineChart>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Metas e Benchmarks */}
        <Card>
          <CardHeader>
            <CardTitle>Metas e Benchmarks</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm">Meta: Primeira Resposta</span>
                <Badge variant={avgFirstResponse <= 15 ? "default" : "destructive"}>
                  {avgFirstResponse <= 15 ? "✓ Atingida" : "✗ Não Atingida"}
                </Badge>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className={`h-2 rounded-full ${avgFirstResponse <= 15 ? 'bg-green-600' : 'bg-red-600'}`}
                  style={{ width: `${Math.min((15 / Math.max(avgFirstResponse, 1)) * 100, 100)}%` }}
                ></div>
              </div>
              <p className="text-xs text-muted-foreground">Meta: 15 minutos</p>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm">Meta: Tempo Médio</span>
                <Badge variant={avgResponseTime <= 10 ? "default" : "destructive"}>
                  {avgResponseTime <= 10 ? "✓ Atingida" : "✗ Não Atingida"}
                </Badge>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className={`h-2 rounded-full ${avgResponseTime <= 10 ? 'bg-green-600' : 'bg-red-600'}`}
                  style={{ width: `${Math.min((10 / Math.max(avgResponseTime, 1)) * 100, 100)}%` }}
                ></div>
              </div>
              <p className="text-xs text-muted-foreground">Meta: 10 minutos</p>
            </div>

            <div className="pt-4 border-t">
              <h4 className="text-sm font-medium mb-2">Insights dos Dados</h4>
              <ul className="text-xs text-muted-foreground space-y-1">
                <li>• {responseTimes.length} conversas analisadas</li>
                <li>• {fastResponses} respostas em menos de 5 minutos</li>
                <li>• {slowResponses} respostas lentas identificadas</li>
                {agentData.length > 0 && (
                  <li>• {agentData.length} agentes com atividade</li>
                )}
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
