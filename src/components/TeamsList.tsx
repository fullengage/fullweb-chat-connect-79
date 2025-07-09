
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Users, MoreHorizontal, Mail, Phone } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface TeamsListProps {
  searchTerm: string;
  departmentFilter: string;
}

export function TeamsList({ searchTerm, departmentFilter }: TeamsListProps) {
  const teams = [
    {
      id: 1,
      name: "Equipe de Vendas A",
      department: "vendas",
      leader: {
        name: "Ana Silva",
        avatar: "",
        email: "ana.silva@empresa.com",
        phone: "+55 11 99999-1111"
      },
      members: 8,
      performance: 92,
      status: "ativa",
      description: "Responsável pela prospecção e fechamento de novos clientes enterprise"
    },
    {
      id: 2,
      name: "Suporte Técnico",
      department: "suporte",
      leader: {
        name: "Carlos Oliveira",
        avatar: "",
        email: "carlos.oliveira@empresa.com",
        phone: "+55 11 99999-2222"
      },
      members: 12,
      performance: 88,
      status: "ativa",
      description: "Atendimento técnico especializado e resolução de problemas complexos"
    },
    {
      id: 3,
      name: "Marketing Digital",
      department: "marketing",
      leader: {
        name: "Mariana Costa",
        avatar: "",
        email: "mariana.costa@empresa.com",
        phone: "+55 11 99999-3333"
      },
      members: 6,
      performance: 95,
      status: "ativa",
      description: "Estratégias de marketing digital e campanhas de aquisição"
    },
    {
      id: 4,
      name: "Desenvolvimento Backend",
      department: "desenvolvimento",
      leader: {
        name: "João Santos",
        avatar: "",
        email: "joao.santos@empresa.com",
        phone: "+55 11 99999-4444"
      },
      members: 10,
      performance: 90,
      status: "ativa",
      description: "Desenvolvimento e manutenção da infraestrutura backend"
    }
  ];

  const filteredTeams = teams.filter(team => {
    const matchesSearch = team.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         team.leader.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDepartment = departmentFilter === "all" || team.department === departmentFilter;
    return matchesSearch && matchesDepartment;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "ativa":
        return "bg-green-100 text-green-800";
      case "inativa":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getPerformanceColor = (performance: number) => {
    if (performance >= 90) return "text-green-600";
    if (performance >= 80) return "text-yellow-600";
    return "text-red-600";
  };

  const getDepartmentLabel = (department: string) => {
    const labels: { [key: string]: string } = {
      vendas: "Vendas",
      suporte: "Suporte",
      marketing: "Marketing",
      desenvolvimento: "Desenvolvimento"
    };
    return labels[department] || department;
  };

  return (
    <div className="space-y-4">
      {filteredTeams.length === 0 ? (
        <Card className="p-8 text-center">
          <div className="flex flex-col items-center space-y-4">
            <Users className="h-12 w-12 text-gray-400" />
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Nenhuma equipe encontrada
              </h3>
              <p className="text-gray-500">
                Tente ajustar os filtros ou criar uma nova equipe.
              </p>
            </div>
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredTeams.map((team) => (
            <Card key={team.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {team.name}
                      </h3>
                      <Badge className={getStatusColor(team.status)}>
                        {team.status}
                      </Badge>
                    </div>
                    <Badge variant="outline">
                      {getDepartmentLabel(team.department)}
                    </Badge>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem>Editar equipe</DropdownMenuItem>
                      <DropdownMenuItem>Ver membros</DropdownMenuItem>
                      <DropdownMenuItem>Relatórios</DropdownMenuItem>
                      <DropdownMenuItem className="text-red-600">
                        Desativar equipe
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-gray-600">{team.description}</p>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2">
                      <Users className="h-4 w-4 text-gray-500" />
                      <span className="text-sm text-gray-600">
                        {team.members} membros
                      </span>
                    </div>
                    <div className="text-sm">
                      <span className="text-gray-600">Performance: </span>
                      <span className={`font-medium ${getPerformanceColor(team.performance)}`}>
                        {team.performance}%
                      </span>
                    </div>
                  </div>
                </div>

                <div className="border-t pt-4">
                  <div className="flex items-center space-x-3">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={team.leader.avatar} />
                      <AvatarFallback>
                        {team.leader.name.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900">
                        {team.leader.name}
                      </p>
                      <p className="text-xs text-gray-500">Líder da equipe</p>
                    </div>
                    <div className="flex space-x-2">
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <Mail className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <Phone className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
