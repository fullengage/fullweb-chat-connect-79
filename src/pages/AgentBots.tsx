
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Bot, Plus, Search, Activity, Key } from "lucide-react";
import { BotStats } from "@/components/BotStats";
import { BotsList } from "@/components/BotsList";
import { CreateBotDialog } from "@/components/CreateBotDialog";
import { ApiKeyDialog } from "@/components/ApiKeyDialog";
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { hasApiKey } from "@/hooks/useDifyData";

const AgentBots = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showApiKeyDialog, setShowApiKeyDialog] = useState(false);
  const [apiKeyConfigured, setApiKeyConfigured] = useState(hasApiKey());

  const handleApiKeySaved = (apiKey: string) => {
    setApiKeyConfigured(true);
  };

  const handleApiKeyRequired = () => {
    setShowApiKeyDialog(true);
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AppSidebar />
        <SidebarInset>
          <div className="flex-1 p-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-8 border-b pb-4">
              <div className="flex items-center space-x-4">
                <SidebarTrigger />
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-purple-600 rounded-lg">
                    <Bot className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h1 className="text-2xl font-bold text-gray-900">Agent Bots (Dify)</h1>
                    <p className="text-gray-600">Gerencie seus bots de IA inteligentes</p>
                  </div>
                </div>
              </div>
              <div className="flex space-x-3">
                <Button 
                  variant="outline" 
                  className="flex items-center space-x-2"
                  onClick={() => setShowApiKeyDialog(true)}
                >
                  <Key className="h-4 w-4" />
                  <span>{apiKeyConfigured ? 'Reconfigurar API' : 'Configurar API'}</span>
                </Button>
                <Button variant="outline" className="flex items-center space-x-2">
                  <Activity className="h-4 w-4" />
                  <span>Monitorar</span>
                </Button>
                <Button 
                  className="bg-purple-600 hover:bg-purple-700"
                  onClick={() => setShowCreateDialog(true)}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Novo Bot
                </Button>
              </div>
            </div>

            {/* API Key Warning */}
            {!apiKeyConfigured && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
                <div className="flex items-center space-x-3">
                  <Key className="h-5 w-5 text-yellow-600" />
                  <div>
                    <h3 className="font-medium text-yellow-800">Configuração necessária</h3>
                    <p className="text-sm text-yellow-700">
                      Configure sua chave da API do Dify para usar todas as funcionalidades.
                    </p>
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => setShowApiKeyDialog(true)}
                  >
                    Configurar agora
                  </Button>
                </div>
              </div>
            )}

            {/* Stats Cards */}
            <BotStats />

            {/* Search */}
            <div className="flex items-center space-x-4 mb-6">
              <div className="relative flex-1 max-w-md">
                <Search className="h-4 w-4 absolute left-3 top-3 text-gray-400" />
                <Input
                  placeholder="Buscar bots..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Bots List */}
            <BotsList searchTerm={searchTerm} onApiKeyRequired={handleApiKeyRequired} />

            {/* Create Bot Dialog */}
            <CreateBotDialog 
              open={showCreateDialog} 
              onOpenChange={setShowCreateDialog} 
            />

            {/* API Key Dialog */}
            <ApiKeyDialog
              open={showApiKeyDialog}
              onOpenChange={setShowApiKeyDialog}
              onApiKeySaved={handleApiKeySaved}
            />
          </div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
};

export default AgentBots;
