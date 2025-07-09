
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Building2, Users, MessageSquare, MapPin, Factory, Calendar, MoreHorizontal } from "lucide-react";
import { Account } from "@/hooks/useAccounts";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

interface AccountsListProps {
  searchTerm: string;
  statusFilter: string;
  planFilter: string;
  accounts: Account[];
  onAccountClick: (account: Account) => void;
  isLoading: boolean;
}

export const AccountsList = ({ 
  searchTerm, 
  statusFilter, 
  planFilter,
  accounts, 
  onAccountClick,
  isLoading 
}: AccountsListProps) => {
  
  const filteredAccounts = accounts.filter(account => {
    const matchesSearch = 
      account.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      account.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (account.cnpj && account.cnpj.includes(searchTerm));
    
    const matchesStatus = statusFilter === "all" || 
      (statusFilter === "active" && account.is_active) ||
      (statusFilter === "inactive" && !account.is_active);
    
    const matchesPlan = planFilter === "all" || account.plan_name === planFilter;
    
    return matchesSearch && matchesStatus && matchesPlan;
  });

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(6)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-gray-200 rounded-lg"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (filteredAccounts.length === 0) {
    return (
      <div className="text-center py-12">
        <Building2 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Nenhuma conta encontrada
        </h3>
        <p className="text-gray-600 mb-4">
          Não há contas que correspondam aos filtros aplicados.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {filteredAccounts.map((account) => (
        <Card 
          key={account.id} 
          className="cursor-pointer hover:shadow-md transition-all duration-200 border-l-4 border-l-blue-500"
          onClick={() => onAccountClick(account)}
        >
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4 flex-1">
                <div className="p-3 bg-blue-50 rounded-lg">
                  <Building2 className="h-6 w-6 text-blue-600" />
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-3 mb-2">
                    <h3 className="font-semibold text-gray-900 truncate">
                      {account.name}
                    </h3>
                    <Badge 
                      variant={account.is_active ? "default" : "secondary"}
                      className={account.is_active ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}
                    >
                      {account.is_active ? "Ativa" : "Inativa"}
                    </Badge>
                    {account.plan_name && (
                      <Badge variant="outline" className="text-xs">
                        {account.plan_name}
                      </Badge>
                    )}
                  </div>
                  
                  <p className="text-sm text-gray-600 mb-3">
                    {account.email}
                  </p>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div className="flex items-center space-x-2">
                      <Users className="h-4 w-4 text-gray-400" />
                      <span className="text-gray-600">
                        {account.current_users || 0} usuários
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <MessageSquare className="h-4 w-4 text-gray-400" />
                      <span className="text-gray-600">
                        {account.current_conversations || 0} conversas
                      </span>
                    </div>
                    {account.city && account.state && (
                      <div className="flex items-center space-x-2">
                        <MapPin className="h-4 w-4 text-gray-400" />
                        <span className="text-gray-600 truncate">
                          {account.city}, {account.state}
                        </span>
                      </div>
                    )}
                    {account.industry && (
                      <div className="flex items-center space-x-2">
                        <Factory className="h-4 w-4 text-gray-400" />
                        <span className="text-gray-600 truncate">
                          {account.industry}
                        </span>
                      </div>
                    )}
                  </div>
                  
                  {account.description && (
                    <p className="text-sm text-gray-500 mt-2 line-clamp-2">
                      {account.description}
                    </p>
                  )}
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <div className="text-right text-sm text-gray-500">
                  <div className="flex items-center space-x-1">
                    <Calendar className="h-3 w-3" />
                    <span>
                      {new Date(account.created_at).toLocaleDateString('pt-BR')}
                    </span>
                  </div>
                  {account.subscription_expires_at && (
                    <div className="text-xs text-orange-600 mt-1">
                      Expira: {new Date(account.subscription_expires_at).toLocaleDateString('pt-BR')}
                    </div>
                  )}
                </div>
                
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={(e) => {
                      e.stopPropagation();
                      onAccountClick(account);
                    }}>
                      Ver Detalhes
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={(e) => e.stopPropagation()}>
                      Editar
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      onClick={(e) => e.stopPropagation()}
                      className="text-red-600"
                    >
                      {account.is_active ? "Desativar" : "Ativar"}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
