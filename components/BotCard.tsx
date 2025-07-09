
import { useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Bot, MessageSquare, Settings, Play, Pause, MoreVertical } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { BotChatDialog } from "./BotChatDialog";
import { getApiKey } from "@/hooks/useDifyData";
import { useToast } from "@/hooks/use-toast";

interface Bot {
  id: string;
  name: string;
  description?: string;
  status: 'active' | 'inactive' | 'training';
  created_at: string;
  model_config?: any;
  conversations_count?: number;
}

interface BotCardProps {
  bot: Bot;
  onApiKeyRequired: () => void;
}

export const BotCard = ({ bot, onApiKeyRequired }: BotCardProps) => {
  const [showChatDialog, setShowChatDialog] = useState(false);
  const { toast } = useToast();

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'inactive':
        return 'bg-gray-100 text-gray-800';
      case 'training':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active':
        return 'Ativo';
      case 'inactive':
        return 'Inativo';
      case 'training':
        return 'Treinando';
      default:
        return 'Desconhecido';
    }
  };

  const handleChatClick = () => {
    const apiKey = getApiKey();
    if (!apiKey) {
      onApiKeyRequired();
      return;
    }
    setShowChatDialog(true);
  };

  const handleConfigureClick = () => {
    toast({
      title: "Em desenvolvimento",
      description: "Funcionalidade de configuração será implementada em breve",
    });
  };

  return (
    <>
      <Card className="border-0 shadow-sm hover:shadow-md transition-shadow">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Bot className="h-5 w-5 text-purple-600" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900 truncate">{bot.name}</h3>
                <Badge className={getStatusColor(bot.status)}>
                  {getStatusText(bot.status)}
                </Badge>
              </div>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={handleConfigureClick}>
                  <Settings className="h-4 w-4 mr-2" />
                  Configurar
                </DropdownMenuItem>
                <DropdownMenuItem>
                  {bot.status === 'active' ? (
                    <>
                      <Pause className="h-4 w-4 mr-2" />
                      Pausar
                    </>
                  ) : (
                    <>
                      <Play className="h-4 w-4 mr-2" />
                      Ativar
                    </>
                  )}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          {bot.description && (
            <p className="text-sm text-gray-600 mb-4 line-clamp-2">
              {bot.description}
            </p>
          )}
          
          <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
            <div className="flex items-center space-x-1">
              <MessageSquare className="h-4 w-4" />
              <span>{bot.conversations_count || 0} conversas</span>
            </div>
            <span>
              Criado em {new Date(bot.created_at).toLocaleDateString('pt-BR')}
            </span>
          </div>

          <div className="flex space-x-2">
            <Button 
              variant="outline" 
              size="sm" 
              className="flex-1"
              onClick={handleChatClick}
            >
              <MessageSquare className="h-4 w-4 mr-2" />
              Testar
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              className="flex-1"
              onClick={handleConfigureClick}
            >
              <Settings className="h-4 w-4 mr-2" />
              Configurar
            </Button>
          </div>
        </CardContent>
      </Card>

      <BotChatDialog
        open={showChatDialog}
        onOpenChange={setShowChatDialog}
        botName={bot.name}
        apiKey={getApiKey() || ""}
      />
    </>
  );
};
