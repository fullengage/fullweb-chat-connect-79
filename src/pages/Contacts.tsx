
import { useState } from "react";
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { Input } from "@/components/ui/input";
import { Users, Search, Plus, Download, Filter } from "lucide-react";
import { ContactStats } from "@/components/ContactStats";
import { ContactsList } from "@/components/ContactsList";
import { NewContactDialog } from "@/components/NewContactDialog";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { 
  useChatwootContacts, 
  useCreateChatwootContact, 
  useUpdateChatwootContact 
} from "@/hooks/useChatwootApi";

const Contacts = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const { toast } = useToast();

  // Usar hooks do Chatwoot em vez de dados mock
  const { data: contacts = [], isLoading, error, refetch } = useChatwootContacts();
  const createContactMutation = useCreateChatwootContact();
  const updateContactMutation = useUpdateChatwootContact();

  const handleContactAdded = async (newContactData: any) => {
    try {
      await createContactMutation.mutateAsync({
        name: newContactData.name,
        email: newContactData.email,
        phone_number: newContactData.phone,
        additional_attributes: {
          company: newContactData.company,
          city: newContactData.city,
          country: newContactData.country,
        }
      });
      
      // Recarregar dados
      refetch();
    } catch (error) {
      console.error('Error creating contact:', error);
      toast({
        title: "Erro ao criar contato",
        description: "Não foi possível criar o contato.",
        variant: "destructive",
      });
    }
  };

  const handleContactUpdate = () => {
    // Recarregar dados quando um contato for atualizado
    refetch();
    toast({
      title: "Contato atualizado",
      description: "Os dados do contato foram atualizados com sucesso.",
    });
  };

  const exportContacts = () => {
    const csv = [
      "Nome,Email,Telefone,Status,Último Contato,Total Conversas",
      ...contacts.map(contact => [
        contact.name,
        contact.email,
        contact.phone_number || "",
        contact.status || "inactive",
        contact.lastContactedAt ? new Date(contact.lastContactedAt).toLocaleDateString('pt-BR') : "",
        contact.totalConversations || 0
      ].join(","))
    ].join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "contatos.csv";
    a.click();
    window.URL.revokeObjectURL(url);

    toast({
      title: "Exportação concluída",
      description: "A lista de contatos foi exportada com sucesso.",
    });
  };

  // Filtrar contatos
  const filteredContacts = contacts.filter(contact => {
    const matchesSearch = searchTerm === "" || 
      contact.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contact.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (contact.phone_number && contact.phone_number.includes(searchTerm));
    
    const matchesStatus = statusFilter === "all" || 
      (statusFilter === "active" && contact.status === "active") ||
      (statusFilter === "inactive" && contact.status === "inactive");
    
    return matchesSearch && matchesStatus;
  });

  // Count contacts by status for filter
  const getStatusCounts = () => {
    const counts = contacts.reduce((acc, contact) => {
      const status = contact.status || 'inactive';
      acc[status] = (acc[status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    return {
      all: contacts.length,
      active: counts.active || 0,
      inactive: counts.inactive || 0,
    };
  };

  const statusCounts = getStatusCounts();

  if (error) {
    return (
      <SidebarProvider>
        <div className="min-h-screen flex w-full">
          <AppSidebar />
          <SidebarInset>
            <div className="flex-1 p-6">
              <div className="text-center">
                <h2 className="text-lg font-semibold text-red-600 mb-2">Erro ao carregar contatos</h2>
                <p className="text-gray-600">Não foi possível carregar os dados dos contatos do Chatwoot.</p>
                <p className="text-sm text-gray-500 mt-2">Verifique a conexão com o proxy do Chatwoot.</p>
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
                    <Users className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h1 className="text-2xl font-bold text-gray-900">Contatos</h1>
                    <p className="text-gray-600">Gerencie seus clientes e contatos via Chatwoot</p>
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <Button variant="outline" onClick={exportContacts}>
                  <Download className="h-4 w-4 mr-2" />
                  Exportar
                </Button>
                <Button 
                  className="bg-blue-600 hover:bg-blue-700" 
                  onClick={() => {}} // Removed setIsNewContactOpen(true)
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Novo Contato
                </Button>
              </div>
            </div>

            {/* Stats Cards */}
            <ContactStats />

            {/* Filters */}
            <div className="flex items-center space-x-4 mb-6">
              <div className="relative flex-1 max-w-md">
                <Search className="h-4 w-4 absolute left-3 top-3 text-gray-400" />
                <Input
                  placeholder="Buscar contatos..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-64">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">
                    Todos os status ({statusCounts.all})
                  </SelectItem>
                  <SelectItem value="active">
                    Ativos ({statusCounts.active})
                  </SelectItem>
                  <SelectItem value="inactive">
                    Inativos ({statusCounts.inactive})
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Results Summary */}
            {(searchTerm || statusFilter !== "all") && (
              <div className="flex items-center justify-between bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span className="text-sm text-blue-700">
                    {filteredContacts.length} contato(s) encontrado(s)
                  </span>
                </div>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => {
                    setSearchTerm("");
                    setStatusFilter("all");
                  }}
                  className="text-blue-600 hover:text-blue-700"
                >
                  Limpar filtros
                </Button>
              </div>
            )}

            {/* Loading state */}
            {isLoading && (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <span className="ml-3 text-gray-600">Carregando contatos do Chatwoot...</span>
              </div>
            )}

            {/* Contacts List */}
            <ContactsList 
              searchTerm={searchTerm} 
              tagFilter={statusFilter}
              contacts={filteredContacts}
              onContactUpdate={handleContactUpdate}
            />

            {/* New Contact Dialog */}
            <NewContactDialog onContactAdded={handleContactAdded} />
          </div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
};

export default Contacts;

