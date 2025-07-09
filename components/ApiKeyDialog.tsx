
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Key, Globe } from "lucide-react";

interface ApiKeyDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onApiKeySaved: (apiKey: string) => void;
}

export const ApiKeyDialog = ({ open, onOpenChange, onApiKeySaved }: ApiKeyDialogProps) => {
  const [apiKey, setApiKey] = useState("");
  const [baseUrl, setBaseUrl] = useState("http://meuevento-dify.n1n956.easypanel.host/v1");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    // Carregar configurações salvas
    const savedApiKey = localStorage.getItem('dify_api_key') || "";
    const savedBaseUrl = localStorage.getItem('dify_base_url') || "http://meuevento-dify.n1n956.easypanel.host/v1";
    
    setApiKey(savedApiKey);
    setBaseUrl(savedBaseUrl);
  }, [open]);

  const handleSave = async () => {
    if (!apiKey.trim()) {
      toast({
        title: "Erro",
        description: "Chave da API é obrigatória",
        variant: "destructive"
      });
      return;
    }

    if (!baseUrl.trim()) {
      toast({
        title: "Erro",
        description: "Base URL é obrigatória",
        variant: "destructive"
      });
      return;
    }

    // Validar formato da API Key
    if (!apiKey.startsWith('app-')) {
      toast({
        title: "Erro",
        description: "A chave da API deve começar com 'app-'",
        variant: "destructive"
      });
      return;
    }

    // Validar formato da Base URL
    try {
      new URL(baseUrl);
    } catch {
      toast({
        title: "Erro",
        description: "Base URL deve ser uma URL válida",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    try {
      // Salvar no localStorage
      localStorage.setItem('dify_api_key', apiKey.trim());
      localStorage.setItem('dify_base_url', baseUrl.trim());
      
      onApiKeySaved(apiKey.trim());
      onOpenChange(false);
      
      toast({
        title: "Configuração salva!",
        description: "Agora você pode usar os bots do Dify."
      });
      
    } catch (error) {
      toast({
        title: "Erro ao salvar configuração",
        description: "Tente novamente",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Key className="h-5 w-5" />
            <span>Configurar API Dify</span>
          </DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="baseUrl" className="flex items-center space-x-2">
              <Globe className="h-4 w-4" />
              <span>Base URL</span>
            </Label>
            <Input
              id="baseUrl"
              type="url"
              placeholder="http://meuevento-dify.n1n956.easypanel.host/v1"
              value={baseUrl}
              onChange={(e) => setBaseUrl(e.target.value)}
            />
            <p className="text-xs text-gray-500">
              URL base da sua instância Dify (deve terminar com /v1)
            </p>
          </div>
          
          <div className="grid gap-2">
            <Label htmlFor="apiKey" className="flex items-center space-x-2">
              <Key className="h-4 w-4" />
              <span>Chave Secreta da API</span>
            </Label>
            <Input
              id="apiKey"
              type="password"
              placeholder="app-pmIrUkTuI4HQpyYc4l1rOkGR"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
            />
            <p className="text-xs text-gray-500">
              Chave da API do seu app Dify (deve começar com 'app-')
            </p>
          </div>
          
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <h4 className="font-medium text-blue-800 mb-1">Como encontrar suas credenciais:</h4>
            <ol className="text-xs text-blue-700 space-y-1">
              <li>1. Acesse seu painel Dify</li>
              <li>2. Vá em "Apps" e selecione seu aplicativo</li>
              <li>3. Clique em "API Access" no menu lateral</li>
              <li>4. Copie a "API Key" que começa com "app-"</li>
            </ol>
          </div>
        </div>
        <DialogFooter>
          <Button 
            variant="outline" 
            onClick={() => onOpenChange(false)}
            disabled={isLoading}
          >
            Cancelar
          </Button>
          <Button 
            onClick={handleSave} 
            disabled={isLoading}
          >
            {isLoading ? "Salvando..." : "Salvar Configuração"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
