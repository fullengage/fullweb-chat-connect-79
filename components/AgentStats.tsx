
import { Card, CardContent } from "@/components/ui/card";
import { Users, CheckCircle, Clock, Star } from "lucide-react";
import type { AgentWithStats } from "@/hooks/useAgents";

interface AgentStatsProps {
  agents: AgentWithStats[];
}

export const AgentStats = ({ agents }: AgentStatsProps) => {
  const totalAgents = agents.length;
  const activeAgents = agents.filter(agent => agent.is_active).length;
  const onlineAgents = agents.filter(agent => agent.status === 'online').length;
  const averageRating = totalAgents > 0 
    ? (agents.reduce((sum, agent) => sum + (agent.stats?.rating || 0), 0) / totalAgents).toFixed(1)
    : "0.0";

  const stats = [
    {
      title: "Total de Agentes",
      value: totalAgents.toString(),
      icon: Users,
      color: "text-blue-600",
      bgColor: "bg-blue-50"
    },
    {
      title: "Agentes Ativos",
      value: activeAgents.toString(),
      icon: CheckCircle,
      color: "text-green-600",
      bgColor: "bg-green-50"
    },
    {
      title: "Online Agora",
      value: onlineAgents.toString(),
      icon: Clock,
      color: "text-purple-600",
      bgColor: "bg-purple-50"
    },
    {
      title: "Média de Avaliação",
      value: averageRating,
      icon: Star,
      color: "text-orange-600",
      bgColor: "bg-orange-50"
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {stats.map((stat) => {
        const Icon = stat.icon;
        return (
          <Card key={stat.title} className="border-0 shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">
                    {stat.title}
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    {stat.value}
                  </p>
                </div>
                <div className={`p-3 rounded-lg ${stat.bgColor}`}>
                  <Icon className={`h-6 w-6 ${stat.color}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};
