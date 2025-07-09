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
import { useAgents, useUpdateAgent, useCreateAgent, type AgentWithStats } from "@/hooks/useAgents";

const Agents = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [isNewAgentOpen, setIsNewAgentOpen] = useState(false);
  const [selectedAgent, setSelectedAgent] = useState<AgentWithStats | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const { toast } = useToast();

  // Use real data from Supabase
  const { data: agents = [], isLoading, error } = useAgents();
  const updateAgentMutation = useUpdateAgent();
  const createAgentMutation = useCreateAgent();

  const handleNewAgent = async (newAgentData: any) => {
    try {
      await createAgentMutation.mutateAsync({
        account_id: 1, // Default account for now
        name: newAgentData.name,
        email: newAgentData.email,
        phone: newAgentData.phone,
        role: newAgentData.role,
        status: newAgentData.status,
        teams: newAgentData.teams,
        is_active: true,
        last_activity: new Date().toISOString()
      });
      setIsNewAgentOpen(false);
    } catch (error) {
      console.error('Error creating agent:', error);
    }
  };

  const handleAgentClick = (agent: AgentWithStats) => {
    setSelectedAgent(agent);
    setIsDetailsOpen(true);
  };

  const handleUpdateAgent = async (updatedAgent: AgentWithStats) => {
    try {
      await updateAgentMutation.mutateAsync({
        id: updatedAgent.id,
        name: updatedAgent.name,
        email: updatedAgent.email,
        phone: updatedAgent.phone,
        status: updatedAgent.status,
        role: updatedAgent.role,
        teams: updatedAgent.teams
      });
    } catch (error) {
      console.error('Error updating agent:', error);
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
        agent.conversationsToday,
        agent.avgResponseTime,
        `${agent.resolutionRate}%`,
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
                <p className="text-gray-600">Não foi possível carregar os dados dos agentes.</p>
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
                    <p className="text-gray-600">Gerencie sua equipe de atendimento</p>
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
