
import { useState } from "react";
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Users, Plus, Search, Download, Filter } from "lucide-react";
import { TeamStats } from "@/components/TeamStats";
import { TeamsList } from "@/components/TeamsList";
import { CreateTeamDialog } from "@/components/CreateTeamDialog";
import { useChatwootAgents } from "@/hooks/useChatwootApi";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

const Teams = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const { toast } = useToast();

  // Usar dados dos agentes do Chatwoot
  const { data: agents = [], isLoading, error } = useChatwootAgents();

  // Organizar agentes por role (que funciona como "equipe" no Chatwoot)
  const agentsByRole = agents.reduce((acc, agent) => {
    const role = agent.role || 'agent';
    if (!acc[role]) {
      acc[role] = [];
    }
    acc[role].push(agent);
    return acc;
  }, {} as Record<string, any[]>);

  // Criar estrutura de "equipes" baseada nos roles
  const teams = Object.entries(agentsByRole).map(([role, members]) => ({
    id: role,
    name: role === 'agent' ? 'Agentes' : 
          role === 'administrator' ? 'Administradores' : 
          role === 'supervisor' ? 'Supervisores' : role,
    department: role === 'administrator' ? 'Gestão' : 
               role === 'supervisor' ? 'Supervisão' : 'Atendimento',
    members,
    memberCount: members.length,
    onlineCount: members.filter(m => m.status === 'online').length,
    totalConversations: members.reduce((sum, m) => sum + (m.conversationsToday || 0), 0),
    avgResponseTime: calculateAvgResponseTime(members),
    created_at: new Date().toISOString()
  }));

  // Filtrar equipes baseado nos filtros
  const filteredTeams = teams.filter(team => {
    const matchesSearch = searchTerm === "" || 
      team.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      team.department.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesRole = roleFilter === "all" || team.id === roleFilter;
    
    return matchesSearch && matchesRole;
  });

  // Função auxiliar para calcular tempo médio de resposta
  function calculateAvgResponseTime(members: any[]) {
    const responseTimes = members
      .map(m => m.avgResponseTime || '0m')
      .map(time => parseFloat(time.replace('m', '')) || 0);
    
    if (responseTimes.length === 0) return '0m';
    
    const avg = responseTimes.reduce((sum, time) => sum + time, 0) / responseTimes.length;
    return `${Math.round(avg)}m`;
  }

  const exportTeams = () => {
    const csv = [
      "Equipe,Departamento,Membros,Online,Conversas Hoje,Tempo Médio Resposta",
      ...filteredTeams.map(team => [
        team.name,
        team.department,
        team.memberCount,
        team.onlineCount,
        team.totalConversations,
        team.avgResponseTime
      ].join(","))
    ].join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "equipes.csv";
    a.click();
    window.URL.revokeObjectURL(url);

    toast({
      title: "Exportação concluída",
      description: "A lista de equipes foi exportada com sucesso.",
    });
  };

  if (error) {
    return (
      <SidebarProvider>
        <div className="min-h-screen flex w-full">
          <AppSidebar />
          <SidebarInset>
            <div className="flex-1 p-6">
              <div className="text-center">
                <h2 className="text-lg font-semibold text-red-600 mb-2">Erro ao carregar equipes</h2>
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
                  <div className="p-2 bg-green-600 rounded-lg">
                    <Users className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h1 className="text-3xl font-bold text-gray-900">Equipes Chatwoot</h1>
                    <p className="text-gray-600">Visualize a organização dos agentes por função</p>
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <Button variant="outline" onClick={exportTeams}>
                  <Download className="h-4 w-4 mr-2" />
                  Exportar
                </Button>
                <Button 
                  className="bg-green-600 hover:bg-green-700"
                  onClick={() => setIsCreateDialogOpen(true)}
                  disabled
                  title="Funcionalidade não disponível no Chatwoot"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Nova Equipe
                </Button>
              </div>
            </div>

            {/* Stats Cards */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total de Equipes</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{teams.length}</div>
                  <p className="text-xs text-muted-foreground">
                    Baseado em roles do Chatwoot
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total de Membros</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{agents.length}</div>
                  <p className="text-xs text-muted-foreground">
                    Agentes ativos no Chatwoot
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Agentes Online</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {agents.filter(agent => agent.status === 'online').length}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Agentes disponíveis agora
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Conversas Hoje</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {agents.reduce((sum, agent) => sum + (agent.conversationsToday || 0), 0)}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Total de conversas atendidas
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Filters */}
            <div className="flex items-center space-x-4 mb-6">
              <div className="relative flex-1 max-w-md">
                <Search className="h-4 w-4 absolute left-3 top-3 text-gray-400" />
                <Input
                  placeholder="Buscar equipes..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              
              <Select value={roleFilter} onValueChange={setRoleFilter}>
                <SelectTrigger className="w-64">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas as funções</SelectItem>
                  <SelectItem value="agent">Agentes</SelectItem>
                  <SelectItem value="supervisor">Supervisores</SelectItem>
                  <SelectItem value="administrator">Administradores</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Loading state */}
            {isLoading && (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
                <span className="ml-3 text-gray-600">Carregando equipes do Chatwoot...</span>
              </div>
            )}

            {/* Teams List */}
            {!isLoading && (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {filteredTeams.map((team) => (
                  <Card key={team.id} className="hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg">{team.name}</CardTitle>
                        <Badge variant="secondary">{team.department}</Badge>
                      </div>
                      <CardDescription>
                        {team.memberCount} membro(s) • {team.onlineCount} online
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">Conversas hoje:</span>
                        <span className="font-semibold">{team.totalConversations}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">Tempo médio:</span>
                        <span className="font-semibold">{team.avgResponseTime}</span>
                      </div>
                      
                      {/* Lista de membros */}
                      <div className="space-y-2">
                        <span className="text-sm font-medium text-gray-700">Membros:</span>
                        <div className="space-y-1">
                          {team.members.slice(0, 3).map((member) => (
                            <div key={member.id} className="flex items-center space-x-2">
                              <Avatar className="h-6 w-6">
                                <AvatarImage src={member.avatar} />
                                <AvatarFallback className="text-xs">
                                  {member.name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2)}
                                </AvatarFallback>
                              </Avatar>
                              <span className="text-sm truncate">{member.name}</span>
                              <div className={`w-2 h-2 rounded-full ${
                                member.status === 'online' ? 'bg-green-500' : 'bg-gray-400'
                              }`} />
                            </div>
                          ))}
                          {team.members.length > 3 && (
                            <div className="text-xs text-gray-500 pl-8">
                              +{team.members.length - 3} outros membros
                            </div>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            {/* Empty state */}
            {!isLoading && filteredTeams.length === 0 && (
              <div className="text-center py-12">
                <Users className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Nenhuma equipe encontrada
                </h3>
                <p className="text-gray-500">
                  Não há equipes que correspondam aos filtros selecionados
                </p>
              </div>
            )}

            {/* Create Team Dialog */}
            <CreateTeamDialog 
              open={isCreateDialogOpen} 
              onOpenChange={setIsCreateDialogOpen} 
            />
          </div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
};

export default Teams;
