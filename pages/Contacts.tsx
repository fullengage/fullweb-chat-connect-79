
import { useState } from "react";
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { Input } from "@/components/ui/input";
import { Users, Search } from "lucide-react";
import { ContactStats } from "@/components/ContactStats";
import { ContactsList } from "@/components/ContactsList";
import { NewContactDialog } from "@/components/NewContactDialog";

const Contacts = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [contacts, setContacts] = useState<any[]>([]);
  const [updateTrigger, setUpdateTrigger] = useState(0);

  const handleContactAdded = (newContact: any) => {
    setContacts(prev => [newContact, ...prev]);
    setUpdateTrigger(prev => prev + 1);
  };

  const handleContactUpdate = () => {
    setUpdateTrigger(prev => prev + 1);
  };

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
                    <p className="text-gray-600">Gerencie seus clientes e contatos</p>
                  </div>
                </div>
              </div>
              <NewContactDialog onContactAdded={handleContactAdded} />
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
            </div>

            {/* Contacts List */}
            <ContactsList 
              searchTerm={searchTerm} 
              tagFilter="all"
              contacts={contacts.length > 0 ? contacts : undefined}
              onContactUpdate={handleContactUpdate}
            />
          </div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
};

export default Contacts;
