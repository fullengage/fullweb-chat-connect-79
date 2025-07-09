
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Eye, Edit, MoreHorizontal, Star, MessageCircle, Clock, CheckCircle } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import type { AgentWithStats } from "@/hooks/useAgents";

interface AgentCardProps {
  agent: AgentWithStats;
  onClick?: () => void;
}

const getRoleBadge = (role: string) => {
  switch (role) {
    case "agent":
      return <Badge className="bg-teal-100 text-teal-700 hover:bg-teal-100">Agente</Badge>;
    case "supervisor":
      return <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100">Supervisor</Badge>;
    case "administrator":
      return <Badge className="bg-purple-100 text-purple-700 hover:bg-purple-100">Administrador</Badge>;
    default:
      return <Badge>{role}</Badge>;
  }
};

const getStatusColor = (status: string) => {
  switch (status.toLowerCase()) {
    case "online":
      return "bg-green-500";
    case "busy":
      return "bg-yellow-500";
    case "offline":
      return "bg-red-500";
    case "away":
      return "bg-gray-500";
    default:
      return "bg-gray-500";
  }
};

const getStatusText = (status: string) => {
  switch (status.toLowerCase()) {
    case "online":
      return "Online";
    case "busy":
      return "Ocupado";
    case "offline":
      return "Offline";
    case "away":
      return "Ausente";
    default:
      return status;
  }
};

export const AgentCard = ({ agent, onClick }: AgentCardProps) => {
  const handleCardClick = (e: React.MouseEvent) => {
    // Don't trigger onClick if clicking on buttons or dropdowns
    if ((e.target as HTMLElement).closest('button, [role="menuitem"]')) {
      return;
    }
    onClick?.();
  };

  return (
    <Card className="hover:shadow-lg transition-all duration-200 cursor-pointer group" onClick={handleCardClick}>
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="relative">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold">
                {agent.initials}
              </div>
              <div 
                className={`absolute -bottom-1 -right-1 w-3 h-3 ${getStatusColor(agent.status)} rounded-full border-2 border-white`}
              ></div>
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-gray-900 truncate">{agent.name}</h3>
              <p className="text-sm text-gray-600 truncate">{agent.email}</p>
              <p className="text-xs text-gray-500">{getStatusText(agent.status)}</p>
              {agent.last_activity && (
                <p className="text-xs text-gray-400">
                  Ativo {new Date(agent.last_activity).toLocaleString('pt-BR')}
                </p>
              )}
            </div>
          </div>
          
          <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <Button size="sm" variant="ghost" className="h-8 w-8 p-0" onClick={(e) => e.stopPropagation()}>
              <Eye className="h-4 w-4" />
            </Button>
            <Button size="sm" variant="ghost" className="h-8 w-8 p-0" onClick={(e) => e.stopPropagation()}>
              <Edit className="h-4 w-4" />
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button size="sm" variant="ghost" className="h-8 w-8 p-0" onClick={(e) => e.stopPropagation()}>
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem>
                  <Eye className="mr-2 h-4 w-4" />
                  Ver detalhes
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Edit className="mr-2 h-4 w-4" />
                  Editar
                </DropdownMenuItem>
                <DropdownMenuItem className="text-red-600">
                  Desativar agente
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        <div className="mb-4">
          {getRoleBadge(agent.role)}
          {agent.teams && agent.teams.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-1">
              {agent.teams.slice(0, 2).map((team) => (
                <Badge key={team} variant="outline" className="text-xs">
                  {team}
                </Badge>
              ))}
              {agent.teams.length > 2 && (
                <Badge variant="outline" className="text-xs">
                  +{agent.teams.length - 2}
                </Badge>
              )}
            </div>
          )}
        </div>

        <div className="space-y-3 text-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <MessageCircle className="h-4 w-4 text-blue-600" />
              <span className="text-gray-600">Conversas hoje</span>
            </div>
            <span className="font-semibold">{agent.conversationsToday}</span>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Clock className="h-4 w-4 text-orange-600" />
              <span className="text-gray-600">Resp. média</span>
            </div>
            <span className="font-semibold">{agent.avgResponseTime}</span>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <span className="text-gray-600">Taxa resolução</span>
            </div>
            <span className="font-semibold text-green-600">{agent.resolutionRate}%</span>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Star className="h-4 w-4 text-yellow-500" />
              <span className="text-gray-600">Avaliação</span>
            </div>
            <div className="flex items-center space-x-1">
              <span className="font-semibold">{agent.stats?.rating || 0}</span>
              <div className="flex">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={`h-3 w-3 ${
                      star <= Math.floor(agent.stats?.rating || 0)
                        ? "text-yellow-400 fill-current"
                        : "text-gray-300"
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="mt-4 pt-4 border-t">
          <Button 
            className={`w-full ${
              getStatusColor(agent.status).includes('green') 
                ? 'bg-green-600 hover:bg-green-700' 
                : getStatusColor(agent.status).includes('yellow')
                ? 'bg-yellow-600 hover:bg-yellow-700'
                : 'bg-gray-600 hover:bg-gray-700'
            } text-white`}
            onClick={(e) => e.stopPropagation()}
          >
            {getStatusText(agent.status)}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
