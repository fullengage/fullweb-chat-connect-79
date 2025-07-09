
import { useState } from "react";
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Building2, Plus, Search, X, Download, Filter } from "lucide-react";
import { AccountStats } from "@/components/AccountStats";
import { AccountsList } from "@/components/AccountsList";
import { NewAccountDialog } from "@/components/NewAccountDialog";
import { AccountDetailsDialog } from "@/components/AccountDetailsDialog";
import { useToast } from "@/hooks/use-toast";
import { useAccounts, useCreateAccount, useUpdateAccount, type Account } from "@/hooks/useAccounts";

const Accounts = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [planFilter, setPlanFilter] = useState("all");
  const [isNewAccountOpen, setIsNewAccountOpen] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState<Account | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const { toast } = useToast();

  // Use real data from Supabase
  const { data: accounts = [], isLoading, error } = useAccounts();
  const createAccountMutation = useCreateAccount();
  const updateAccountMutation = useUpdateAccount();

  const handleNewAccount = async (newAccountData: any) => {
    try {
      await createAccountMutation.mutateAsync({
        name: newAccountData.name,
        email: newAccountData.email,
        phone: newAccountData.phone,
        cnpj: newAccountData.cnpj,
        city: newAccountData.city,
        state: newAccountData.state,
        industry: newAccountData.industry,
        description: newAccountData.description,
        plan_id: newAccountData.plan_id,
        is_active: true
      });
      setIsNewAccountOpen(false);
      toast({
        title: "Conta criada",
        description: "Nova conta empresarial criada com sucesso.",
      });
    } catch (error) {
      console.error('Error creating account:', error);
      toast({
        title: "Erro ao criar conta",
        description: "Não foi possível criar a conta. Tente novamente.",
        variant: "destructive",
      });
    }
  };

  const handleAccountClick = (account: Account) => {
    setSelectedAccount(account);
    setIsDetailsOpen(true);
  };

  const handleUpdateAccount = async (updatedAccount: Account) => {
    try {
      await updateAccountMutation.mutateAsync({
        id: updatedAccount.id,
        name: updatedAccount.name,
        email: updatedAccount.email,
        phone: updatedAccount.phone,
        cnpj: updatedAccount.cnpj,
        city: updatedAccount.city,
        state: updatedAccount.state,
        industry: updatedAccount.industry,
        description: updatedAccount.description,
        plan_id: updatedAccount.plan_id,
        is_active: updatedAccount.is_active
      });
      toast({
        title: "Conta atualizada",
        description: "Dados da conta atualizados com sucesso.",
      });
    } catch (error) {
      console.error('Error updating account:', error);
      toast({
        title: "Erro ao atualizar",
        description: "Não foi possível atualizar a conta.",
        variant: "destructive",
      });
    }
  };

  const clearSearch = () => {
    setSearchTerm("");
  };

  const exportAccounts = () => {
    const csv = [
      "Nome,Email,Telefone,CNPJ,Cidade,Estado,Setor,Plano,Status,Usuários,Conversas",
      ...accounts.map(account => [
        account.name,
        account.email,
        account.phone || "",
        account.cnpj || "",
        account.city || "",
        account.state || "",
        account.industry || "",
        account.plan_name || "",
        account.is_active ? "Ativa" : "Inativa",
        account.current_users || 0,
        account.current_conversations || 0
      ].join(","))
    ].join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "contas.csv";
    a.click();
    window.URL.revokeObjectURL(url);

    toast({
      title: "Exportação concluída",
      description: "A lista de contas foi exportada com sucesso.",
    });
  };

  // Count accounts by status and plan
  const getFilterCounts = () => {
    const statusCounts = accounts.reduce((acc, account) => {
      const status = account.is_active ? 'active' : 'inactive';
      acc[status] = (acc[status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const planCounts = accounts.reduce((acc, account) => {
      const plan = account.plan_name || 'free';
      acc[plan] = (acc[plan] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    return {
      all: accounts.length,
      active: statusCounts.active || 0,
      inactive: statusCounts.inactive || 0,
      plans: planCounts
    };
  };

  const filterCounts = getFilterCounts();

  if (error) {
    return (
      <SidebarProvider>
        <div className="min-h-screen flex w-full">
          <AppSidebar />
          <SidebarInset>
            <div className="flex-1 p-6">
              <div className="text-center">
                <h2 className="text-lg font-semibold text-red-600 mb-2">Erro ao carregar contas</h2>
                <p className="text-gray-600">Não foi possível carregar os dados das contas.</p>
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
                  <div className="p-2 bg-blue-600 rounded-lg">
                    <Building2 className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h1 className="text-2xl font-bold text-gray-900">Contas Empresariais</h1>
                    <p className="text-gray-600">Gerencie contas e multi-tenancy</p>
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <Button variant="outline" onClick={exportAccounts}>
                  <Download className="h-4 w-4 mr-2" />
                  Exportar
                </Button>
                <Button className="bg-blue-600 hover:bg-blue-700" onClick={() => setIsNewAccountOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Nova Conta
                </Button>
              </div>
            </div>

            {/* Stats Cards */}
            <AccountStats accounts={accounts} />

            {/* Filters */}
            <div className="flex items-center space-x-4 mb-6">
              <div className="relative flex-1 max-w-md">
                <Search className="h-4 w-4 absolute left-3 top-3 text-gray-400" />
                <Input
                  placeholder="Buscar contas..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-10"
                />
                {searchTerm && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="absolute right-1 top-1 h-8 w-8 p-0"
                    onClick={clearSearch}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
              
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-48">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">
                    Todos os status ({filterCounts.all})
                  </SelectItem>
                  <SelectItem value="active">
                    Ativas ({filterCounts.active})
                  </SelectItem>
                  <SelectItem value="inactive">
                    Inativas ({filterCounts.inactive})
                  </SelectItem>
                </SelectContent>
              </Select>

              <Select value={planFilter} onValueChange={setPlanFilter}>
                <SelectTrigger className="w-48">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Filtrar por plano" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os planos</SelectItem>
                  {Object.keys(filterCounts.plans).map(plan => (
                    <SelectItem key={plan} value={plan}>
                      {plan} ({filterCounts.plans[plan]})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Results Summary */}
            {(searchTerm || statusFilter !== "all" || planFilter !== "all") && (
              <div className="flex items-center justify-between bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span className="text-sm text-blue-700">
                    {accounts.filter(account => {
                      const matchesSearch = 
                        account.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        account.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        (account.cnpj && account.cnpj.includes(searchTerm));
                      const matchesStatus = statusFilter === "all" || 
                        (statusFilter === "active" && account.is_active) ||
                        (statusFilter === "inactive" && !account.is_active);
                      const matchesPlan = planFilter === "all" || account.plan_name === planFilter;
                      return matchesSearch && matchesStatus && matchesPlan;
                    }).length} conta(s) encontrada(s)
                  </span>
                </div>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => {
                    setSearchTerm("");
                    setStatusFilter("all");
                    setPlanFilter("all");
                  }}
                  className="text-blue-600 hover:text-blue-700"
                >
                  Limpar filtros
                </Button>
              </div>
            )}

            {/* Accounts List */}
            <AccountsList 
              searchTerm={searchTerm} 
              statusFilter={statusFilter}
              planFilter={planFilter}
              accounts={accounts}
              onAccountClick={handleAccountClick}
              isLoading={isLoading}
            />

            {/* Modals */}
            <NewAccountDialog
              open={isNewAccountOpen}
              onOpenChange={setIsNewAccountOpen}
              onSave={handleNewAccount}
            />

            <AccountDetailsDialog
              account={selectedAccount}
              open={isDetailsOpen}
              onOpenChange={setIsDetailsOpen}
              onSave={handleUpdateAccount}
            />
          </div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
};

export default Accounts;
