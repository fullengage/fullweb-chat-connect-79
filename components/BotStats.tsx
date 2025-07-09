
import { Card, CardContent } from "@/components/ui/card";
import { Bot, MessageSquare, Clock, TrendingUp } from "lucide-react";
import { useDifyBots } from "@/hooks/useDifyData";

const stats = [
  {
    title: "Total de Bots",
    value: "0",
    icon: Bot,
    color: "text-purple-600",
    bgColor: "bg-purple-50"
  },
  {
    title: "Conversas Hoje",
    value: "0",
    icon: MessageSquare,
    color: "text-blue-600",
    bgColor: "bg-blue-50"
  },
  {
    title: "Bots Ativos",
    value: "0",
    icon: Clock,
    color: "text-green-600",
    bgColor: "bg-green-50"
  },
  {
    title: "Taxa de Sucesso",
    value: "0%",
    icon: TrendingUp,
    color: "text-orange-600",
    bgColor: "bg-orange-50"
  }
];

export const BotStats = () => {
  const { data: bots = [] } = useDifyBots();

  const updatedStats = [
    { ...stats[0], value: bots.length.toString() },
    { ...stats[1], value: "0" }, // Seria calculado com dados reais
    { ...stats[2], value: bots.filter(bot => bot.status === 'active').length.toString() },
    { ...stats[3], value: "0%" } // Seria calculado com dados reais
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {updatedStats.map((stat) => {
        const Icon = stat.icon;
        return (
          <Card key={stat.title} className="border-0 shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">
                    {stat.title}
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    {stat.value}
                  </p>
                </div>
                <div className={`p-3 rounded-lg ${stat.bgColor}`}>
                  <Icon className={`h-6 w-6 ${stat.color}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};
