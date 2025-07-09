
import { AgentCard } from "./AgentCard";
import { Button } from "@/components/ui/button";
import type { AgentWithStats } from "@/hooks/useAgents";

interface AgentsListProps {
  searchTerm: string;
  roleFilter: string;
  agents: AgentWithStats[];
  onAgentClick?: (agent: AgentWithStats) => void;
  isLoading?: boolean;
}

export const AgentsList = ({ searchTerm, roleFilter, agents, onAgentClick, isLoading }: AgentsListProps) => {
  const filteredAgents = agents.filter(agent => {
    const matchesSearch = 
      agent.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      agent.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (agent.phone && agent.phone.includes(searchTerm));
    
    const matchesRole = roleFilter === "all" || agent.role === roleFilter;
    
    return matchesSearch && matchesRole;
  });

  if (isLoading) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center animate-pulse">
          <span className="text-2xl">👥</span>
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Carregando agentes...</h3>
        <p className="text-gray-600">Aguarde enquanto buscamos os dados dos agentes.</p>
      </div>
    );
  }

  if (filteredAgents.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
          <span className="text-2xl">👥</span>
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Nenhum agente encontrado</h3>
        <p className="text-gray-600 mb-4">
          {searchTerm 
            ? `Não encontramos agentes que correspondam à busca "${searchTerm}"`
            : "Não há agentes com o filtro selecionado"
          }
        </p>
        {searchTerm && (
          <Button 
            variant="outline" 
            onClick={() => window.location.reload()}
            className="text-blue-600 border-blue-600 hover:bg-blue-50"
          >
            Limpar filtros
          </Button>
        )}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {filteredAgents.map((agent) => (
        <AgentCard 
          key={agent.id} 
          agent={agent} 
          onClick={() => onAgentClick?.(agent)}
        />
      ))}
    </div>
  );
};

// Remove the mock data and export the updated type
export type { AgentWithStats as Agent };
