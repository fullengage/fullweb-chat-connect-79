
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Building2, Users, MessageSquare, DollarSign, TrendingUp, AlertTriangle } from "lucide-react";
import { Account } from "@/hooks/useAccounts";

interface AccountStatsProps {
  accounts: Account[];
}

export const AccountStats = ({ accounts }: AccountStatsProps) => {
  const totalAccounts = accounts.length;
  const activeAccounts = accounts.filter(account => account.is_active).length;
  const totalUsers = accounts.reduce((sum, account) => sum + (account.current_users || 0), 0);
  const totalConversations = accounts.reduce((sum, account) => sum + (account.current_conversations || 0), 0);
  const inactiveAccounts = totalAccounts - activeAccounts;
  
  // Calculate average usage per account
  const avgUsersPerAccount = totalAccounts > 0 ? Math.round(totalUsers / totalAccounts) : 0;
  const avgConversationsPerAccount = totalAccounts > 0 ? Math.round(totalConversations / totalAccounts) : 0;

  const stats = [
    {
      title: "Total de Contas",
      value: totalAccounts,
      description: `${activeAccounts} ativas, ${inactiveAccounts} inativas`,
      icon: Building2,
      trend: activeAccounts > inactiveAccounts ? "up" : "down",
      color: "text-blue-600",
      bgColor: "bg-blue-50"
    },
    {
      title: "Usuários Totais",
      value: totalUsers,
      description: `Média de ${avgUsersPerAccount} por conta`,
      icon: Users,
      trend: "up",
      color: "text-green-600",
      bgColor: "bg-green-50"
    },
    {
      title: "Conversas Ativas",
      value: totalConversations,
      description: `Média de ${avgConversationsPerAccount} por conta`,
      icon: MessageSquare,
      trend: "up",
      color: "text-purple-600",
      bgColor: "bg-purple-50"
    },
    {
      title: "Taxa de Atividade",
      value: `${totalAccounts > 0 ? Math.round((activeAccounts / totalAccounts) * 100) : 0}%`,
      description: `${activeAccounts} de ${totalAccounts} contas ativas`,
      icon: TrendingUp,
      trend: activeAccounts > inactiveAccounts ? "up" : "down",
      color: "text-orange-600",
      bgColor: "bg-orange-50"
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {stats.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <Card key={index} className="hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                {stat.title}
              </CardTitle>
              <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                <Icon className={`h-4 w-4 ${stat.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900 mb-1">
                {stat.value}
              </div>
              <p className="text-xs text-gray-600 flex items-center">
                {stat.trend === "up" ? (
                  <TrendingUp className="h-3 w-3 text-green-500 mr-1" />
                ) : (
                  <AlertTriangle className="h-3 w-3 text-red-500 mr-1" />
                )}
                {stat.description}
              </p>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};
