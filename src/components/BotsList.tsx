
import { BotCard } from "./BotCard";
import { useDifyBots } from "@/hooks/useDifyData";
import { Card, CardContent } from "@/components/ui/card";
import { Bot } from "lucide-react";

interface BotsListProps {
  searchTerm: string;
  onApiKeyRequired: () => void;
}

export const BotsList = ({ searchTerm, onApiKeyRequired }: BotsListProps) => {
  const { data: bots = [], isLoading, error } = useDifyBots();

  const filteredBots = bots.filter(bot => 
    bot.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    bot.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => (
          <Card key={i} className="border-0 shadow-sm">
            <CardContent className="p-6">
              <div className="animate-pulse">
                <div className="h-4 bg-gray-200 rounded mb-2"></div>
                <div className="h-3 bg-gray-200 rounded mb-4"></div>
                <div className="h-2 bg-gray-200 rounded mb-2"></div>
                <div className="h-2 bg-gray-200 rounded"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <Bot className="h-16 w-16 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Erro ao carregar bots
        </h3>
        <p className="text-gray-500">
          Verifique sua conexão e tente novamente
        </p>
      </div>
    );
  }

  if (filteredBots.length === 0) {
    return (
      <div className="text-center py-12">
        <Bot className="h-16 w-16 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          {searchTerm ? "Nenhum bot encontrado" : "Nenhum bot criado"}
        </h3>
        <p className="text-gray-500">
          {searchTerm 
            ? "Tente ajustar os termos de busca"
            : "Comece criando seu primeiro bot de IA"
          }
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {filteredBots.map((bot) => (
        <BotCard key={bot.id} bot={bot} onApiKeyRequired={onApiKeyRequired} />
      ))}
    </div>
  );
};
