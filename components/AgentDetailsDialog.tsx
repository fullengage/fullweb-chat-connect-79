
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  User, 
  Mail, 
  Phone, 
  Users, 
  Clock, 
  Star, 
  MessageCircle, 
  CheckCircle,
  Calendar,
  Edit2
} from "lucide-react";
import type { AgentWithStats } from "@/hooks/useAgents";

interface AgentDetailsDialogProps {
  agent: AgentWithStats | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (agent: AgentWithStats) => void;
}

export const AgentDetailsDialog = ({ agent, open, onOpenChange, onSave }: AgentDetailsDialogProps) => {
  const [editMode, setEditMode] = useState(false);
  const [editData, setEditData] = useState<AgentWithStats | null>(null);

  if (!agent) return null;

  const handleEdit = () => {
    setEditData({ ...agent });
    setEditMode(true);
  };

  const handleSave = () => {
    if (editData) {
      onSave(editData);
      setEditMode(false);
      setEditData(null);
    }
  };

  const handleCancel = () => {
    setEditMode(false);
    setEditData(null);
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case "agent": return "Agente";
      case "supervisor": return "Supervisor";
      case "administrator": return "Administrador";
      default: return role;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "online": return "bg-green-100 text-green-800";
      case "busy": return "bg-yellow-100 text-yellow-800";
      case "offline": return "bg-red-100 text-red-800";
      case "away": return "bg-gray-100 text-gray-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  // Mock data for charts and activity since we don't have this data yet
  const weeklyStats = [
    { day: "Seg", conversations: 12 },
    { day: "Ter", conversations: 15 },
    { day: "Qua", conversations: 8 },
    { day: "Qui", conversations: 18 },
    { day: "Sex", conversations: agent.conversationsToday },
    { day: "Sab", conversations: 0 },
    { day: "Dom", conversations: 0 }
  ];

  const recentActivity = [
    "Respondeu conversa #1234 há 5 minutos",
    "Resolveu ticket #5678 há 15 minutos", 
    "Iniciou conversa com cliente há 30 minutos",
    "Transferiu conversa para supervisor há 1 hora"
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold">
                {agent.initials}
              </div>
              <div>
                <h2 className="text-xl font-bold">{agent.name}</h2>
                <p className="text-sm text-gray-600">{getRoleLabel(agent.role)}</p>
              </div>
            </DialogTitle>
            <Badge className={getStatusColor(agent.status)}>
              {agent.status}
            </Badge>
          </div>
        </DialogHeader>

        <Tabs defaultValue="info" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="info">Informações</TabsTrigger>
            <TabsTrigger value="settings">Configurações</TabsTrigger>
          </TabsList>

          <TabsContent value="info" className="space-y-6">
            {/* Personal Info */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <User className="h-5 w-5" />
                  <span>Dados Pessoais</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center space-x-3">
                    <Mail className="h-4 w-4 text-gray-500" />
                    <div>
                      <p className="text-sm text-gray-600">Email</p>
                      <p className="font-medium">{agent.email}</p>
                    </div>
                  </div>
                  {agent.phone && (
                    <div className="flex items-center space-x-3">
                      <Phone className="h-4 w-4 text-gray-500" />
                      <div>
                        <p className="text-sm text-gray-600">Telefone</p>
                        <p className="font-medium">{agent.phone}</p>
                      </div>
                    </div>
                  )}
                </div>
                {agent.teams && agent.teams.length > 0 && (
                  <div className="flex items-center space-x-3">
                    <Users className="h-4 w-4 text-gray-500" />
                    <div>
                      <p className="text-sm text-gray-600">Equipes</p>
                      <div className="flex flex-wrap gap-2 mt-1">
                        {agent.teams.map((team) => (
                          <Badge key={team} variant="outline">{team}</Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Performance Stats */}
            <Card>
              <CardHeader>
                <CardTitle>Estatísticas de Performance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <MessageCircle className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                    <p className="text-2xl font-bold text-blue-600">{agent.conversationsToday}</p>
                    <p className="text-sm text-gray-600">Conversas Hoje</p>
                  </div>
                  <div className="text-center p-4 bg-orange-50 rounded-lg">
                    <Clock className="h-8 w-8 text-orange-600 mx-auto mb-2" />
                    <p className="text-2xl font-bold text-orange-600">{agent.avgResponseTime}</p>
                    <p className="text-sm text-gray-600">Tempo Resposta</p>
                  </div>
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <CheckCircle className="h-8 w-8 text-green-600 mx-auto mb-2" />
                    <p className="text-2xl font-bold text-green-600">{agent.resolutionRate}%</p>
                    <p className="text-sm text-gray-600">Taxa Resolução</p>
                  </div>
                  <div className="text-center p-4 bg-yellow-50 rounded-lg">
                    <Star className="h-8 w-8 text-yellow-600 mx-auto mb-2" />
                    <p className="text-2xl font-bold text-yellow-600">{agent.stats?.rating || 0}</p>
                    <p className="text-sm text-gray-600">Avaliação</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Weekly Chart */}
            <Card>
              <CardHeader>
                <CardTitle>Conversas da Semana</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-end space-x-2 h-32">
                  {weeklyStats.map((day) => (
                    <div key={day.day} className="flex-1 flex flex-col items-center">
                      <div 
                        className="w-full bg-blue-500 rounded-t"
                        style={{ height: `${(day.conversations / 20) * 100}%`, minHeight: '4px' }}
                      ></div>
                      <p className="text-xs mt-2">{day.day}</p>
                      <p className="text-xs font-semibold">{day.conversations}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Calendar className="h-5 w-5" />
                  <span>Atividade Recente</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {recentActivity.map((activity, index) => (
                    <div key={index} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      <p className="text-sm">{activity}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="settings" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Configurações do Agente</CardTitle>
                  {!editMode && (
                    <Button onClick={handleEdit} variant="outline" size="sm">
                      <Edit2 className="h-4 w-4 mr-2" />
                      Editar
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {editMode && editData ? (
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="edit-name">Nome</Label>
                      <Input
                        id="edit-name"
                        value={editData.name}
                        onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label htmlFor="edit-email">Email</Label>
                      <Input
                        id="edit-email"
                        value={editData.email}
                        onChange={(e) => setEditData({ ...editData, email: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label htmlFor="edit-phone">Telefone</Label>
                      <Input
                        id="edit-phone"
                        value={editData.phone || ''}
                        onChange={(e) => setEditData({ ...editData, phone: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label>Status</Label>
                      <Select 
                        value={editData.status} 
                        onValueChange={(value: 'online' | 'offline' | 'busy' | 'away') => setEditData({ ...editData, status: value })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="online">Online</SelectItem>
                          <SelectItem value="busy">Ocupado</SelectItem>
                          <SelectItem value="offline">Offline</SelectItem>
                          <SelectItem value="away">Ausente</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex space-x-2">
                      <Button onClick={handleSave}>Salvar</Button>
                      <Button onClick={handleCancel} variant="outline">Cancelar</Button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div>
                      <Label>Nome</Label>
                      <p className="font-medium">{agent.name}</p>
                    </div>
                    <div>
                      <Label>Email</Label>
                      <p className="font-medium">{agent.email}</p>
                    </div>
                    {agent.phone && (
                      <div>
                        <Label>Telefone</Label>
                        <p className="font-medium">{agent.phone}</p>
                      </div>
                    )}
                    <div>
                      <Label>Status</Label>
                      <Badge className={getStatusColor(agent.status)}>
                        {agent.status}
                      </Badge>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};
