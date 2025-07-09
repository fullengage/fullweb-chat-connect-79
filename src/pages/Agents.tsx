import { useState } from "react";
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Users, Plus, Search, X, Download, Filter } from "lucide-react";
import { AgentStats } from "@/components/AgentStats";
import { AgentsList } from "@/components/AgentsList";
import { NewAgentDialog } from "@/components/NewAgentDialog";
import { AgentDetailsDialog } from "@/components/AgentDetailsDialog";
import { useToast } from "@/hooks/use-toast";
import { 
  useChatwootAgents, 
  useCreateChatwootAgent, 
  useUpdateChatwootAgent 
} from "@/hooks/useChatwootApi";
import type { AgentWithStats } from "@/hooks/useAgents";

const Agents = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [isNewAgentOpen, setIsNewAgentOpen] = useState(false);
  const [selectedAgent, setSelectedAgent] = useState<AgentWithStats | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const { toast } = useToast();

  // Usar hooks do Chatwoot em vez do Supabase
  const { data: chatwootAgents = [], isLoading, error } = useChatwootAgents();
  const createAgentMutation = useCreateChatwootAgent();
  const updateAgentMutation = useUpdateChatwootAgent();

  // Transformar dados do Chatwoot para o formato AgentWithStats esperado
  const agents: AgentWithStats[] = chatwootAgents.map(agent => {
    const initials = agent.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    const isOnline = agent.status === 'online';
    
    return {
      id: agent.id.toString(), // Converter para string como esperado
      account_id: agent.account_id || 1,
      name: agent.name,
      email: agent.email,
      phone: agent.phone,
      role: agent.role as 'agent' | 'supervisor' | 'administrator',
      status: agent.status as 'online' | 'offline' | 'busy' | 'away',
      teams: agent.teams || [],
      avatar_url: agent.avatar,
      is_active: agent.is_active !== false,
      last_activity: agent.last_activity || new Date().toISOString(),
      created_at: agent.created_at || new Date().toISOString(),
      updated_at: agent.updated_at || new Date().toISOString(),
      // Propriedades derivadas necessárias para AgentWithStats
      stats: agent.stats ? {
        id: `${agent.id}-stats`,
        agent_id: agent.id.toString(),
        conversations_today: agent.conversationsToday || 0,
        avg_response_time_seconds: 0, // Calculado se necessário
        resolution_rate: agent.resolutionRate || 0,
        rating: agent.stats.rating || 0,
        attendances: agent.stats.totalConversations || 0,
        date: new Date().toISOString().split('T')[0],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      } : undefined,
      initials,
      isOnline,
      conversationsToday: agent.conversationsToday || 0,
      avgResponseTime: agent.avgResponseTime || '0m',
      resolutionRate: agent.resolutionRate || 0,
    };
  });

  const handleNewAgent = async (newAgentData: any) => {
    try {
      await createAgentMutation.mutateAsync({
        name: newAgentData.name,
        email: newAgentData.email,
        password: newAgentData.password || 'temp123', // Senha temporária
        role: newAgentData.role || 'agent',
      });
      
      setIsNewAgentOpen(false);
      toast({
        title: "Agente criado",
        description: "O novo agente foi criado com sucesso.",
      });
    } catch (error) {
      console.error('Error creating agent:', error);
      toast({
        title: "Erro ao criar agente",
        description: "Não foi possível criar o agente.",
        variant: "destructive",
      });
    }
  };

  const handleAgentClick = (agent: AgentWithStats) => {
    setSelectedAgent(agent);
    setIsDetailsOpen(true);
  };

  const handleUpdateAgent = async (updatedAgent: AgentWithStats) => {
    try {
      await updateAgentMutation.mutateAsync({
        agentId: parseInt(updatedAgent.id), // Converter de volta para número
        agentData: {
          name: updatedAgent.name,
          email: updatedAgent.email,
          role: updatedAgent.role as 'agent' | 'administrator',
        }
      });
      
      toast({
        title: "Agente atualizado",
        description: "Os dados do agente foram atualizados com sucesso.",
      });
    } catch (error) {
      console.error('Error updating agent:', error);
      toast({
        title: "Erro ao atualizar agente",
        description: "Não foi possível atualizar o agente.",
        variant: "destructive",
      });
    }
  };

  const clearSearch = () => {
    setSearchTerm("");
  };

  const exportAgents = () => {
    const csv = [
      "Nome,Email,Telefone,Função,Status,Equipes,Conversas Hoje,Tempo Resposta,Taxa Resolução,Avaliação",
      ...agents.map(agent => [
        agent.name,
        agent.email,
        agent.phone || "",
        agent.role,
        agent.status,
        agent.teams?.join("; ") || "",
        agent.conversationsToday || 0,
        agent.avgResponseTime || '0m',
        `${agent.resolutionRate || 0}%`,
        agent.stats?.rating || 0
      ].join(","))
    ].join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "agentes.csv";
    a.click();
    window.URL.revokeObjectURL(url);

    toast({
      title: "Exportação concluída",
      description: "A lista de agentes foi exportada com sucesso.",
    });
  };

  // Count agents by role for filter
  const getRoleCounts = () => {
    const counts = agents.reduce((acc, agent) => {
      acc[agent.role] = (acc[agent.role] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    return {
      all: agents.length,
      agent: counts.agent || 0,
      supervisor: counts.supervisor || 0,
      administrator: counts.administrator || 0
    };
  };

  const roleCounts = getRoleCounts();

  if (error) {
    return (
      <SidebarProvider>
        <div className="min-h-screen flex w-full">
          <AppSidebar />
          <SidebarInset>
            <div className="flex-1 p-6">
              <div className="text-center">
                <h2 className="text-lg font-semibold text-red-600 mb-2">Erro ao carregar agentes</h2>
                <p className="text-gray-600">Não foi possível carregar os dados dos agentes do Chatwoot.</p>
                <p className="text-sm text-gray-500 mt-2">Verifique a conexão com o proxy do Chatwoot.</p>
              </div>
            </div>
          </SidebarInset>
        </div>
      </SidebarProvider>
    );
  }

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AppSidebar />
        <SidebarInset>
          <div className="flex-1 space-y-6 p-6">
            {/* Header */}
            <div className="flex items-center justify-between border-b pb-4">
              <div className="flex items-center space-x-4">
                <SidebarTrigger />
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-blue-600 rounded-lg">
                    <Users className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h1 className="text-2xl font-bold text-gray-900">Agentes</h1>
                    <p className="text-gray-600">Gerencie sua equipe de atendimento via Chatwoot</p>
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <Button variant="outline" onClick={exportAgents}>
                  <Download className="h-4 w-4 mr-2" />
                  Exportar
                </Button>
                <Button className="bg-blue-600 hover:bg-blue-700" onClick={() => setIsNewAgentOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Novo Agente
                </Button>
              </div>
            </div>

            {/* Stats Cards */}
            <AgentStats agents={agents} />

            {/* Filters */}
            <div className="flex items-center space-x-4 mb-6">
              <div className="relative flex-1 max-w-md">
                <Search className="h-4 w-4 absolute left-3 top-3 text-gray-400" />
                <Input
                  placeholder="Buscar agentes..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-10"
                />
                {searchTerm && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="absolute right-1 top-1 h-8 w-8 p-0"
                    onClick={clearSearch}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
              
              <Select value={roleFilter} onValueChange={setRoleFilter}>
                <SelectTrigger className="w-64">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">
                    Todas as funções ({roleCounts.all})
                  </SelectItem>
                  <SelectItem value="agent">
                    Agente ({roleCounts.agent})
                  </SelectItem>
                  <SelectItem value="supervisor">
                    Supervisor ({roleCounts.supervisor})
                  </SelectItem>
                  <SelectItem value="administrator">
                    Administrador ({roleCounts.administrator})
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Results Summary */}
            {(searchTerm || roleFilter !== "all") && (
              <div className="flex items-center justify-between bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span className="text-sm text-blue-700">
                    {agents.filter(agent => {
                      const matchesSearch = 
                        agent.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        agent.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        (agent.phone && agent.phone.includes(searchTerm));
                      const matchesRole = roleFilter === "all" || agent.role === roleFilter;
                      return matchesSearch && matchesRole;
                    }).length} agente(s) encontrado(s)
                  </span>
                </div>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => {
                    setSearchTerm("");
                    setRoleFilter("all");
                  }}
                  className="text-blue-600 hover:text-blue-700"
                >
                  Limpar filtros
                </Button>
              </div>
            )}

            {/* Loading state */}
            {isLoading && (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <span className="ml-3 text-gray-600">Carregando agentes do Chatwoot...</span>
              </div>
            )}

            {/* Agents List */}
            <AgentsList 
              searchTerm={searchTerm} 
              roleFilter={roleFilter}
              agents={agents}
              onAgentClick={handleAgentClick}
              isLoading={isLoading}
            />

            {/* Modals */}
            <NewAgentDialog
              open={isNewAgentOpen}
              onOpenChange={setIsNewAgentOpen}
              onSave={handleNewAgent}
            />

            <AgentDetailsDialog
              agent={selectedAgent}
              open={isDetailsOpen}
              onOpenChange={setIsDetailsOpen}
              onSave={handleUpdateAgent}
            />
          </div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
};

export default Agents;
