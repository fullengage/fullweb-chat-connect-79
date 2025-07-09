
import { ContactCard } from "./ContactCard";
import { useContacts } from "@/hooks/useSupabaseData";
import { useChatwootContacts } from "@/hooks/useChatwootData";
import { useAuth } from "@/contexts/AuthContext";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { EditContactDialog } from "./EditContactDialog";

interface Contact {
  id: number;
  name?: string;
  email?: string;
  phone?: string;
  created_at: string;
}

interface ContactForCard {
  id: string;
  initials: string;
  name: string;
  email: string;
  phone: string;
  createdAt: string;
  tag?: string;
}

interface ContactsListProps {
  searchTerm: string;
  tagFilter: string;
  contacts?: Contact[];
  onContactUpdate?: () => void;
}

export const ContactsList = ({ 
  searchTerm, 
  tagFilter, 
  contacts: externalContacts,
  onContactUpdate 
}: ContactsListProps) => {
  const { user: authUser } = useAuth();
  const [currentUserAccountId, setCurrentUserAccountId] = useState<number>(0);
  const [localContacts, setLocalContacts] = useState<Contact[]>([]);
  const [editingContact, setEditingContact] = useState<ContactForCard | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  
  // Buscar account_id do usuário atual
  useEffect(() => {
    const fetchUserAccountId = async () => {
      if (!authUser) return;
      
      const { data: userData } = await supabase
        .from('users')
        .select('account_id')
        .eq('auth_user_id', authUser.id)
        .single();
      
      if (userData) {
        setCurrentUserAccountId(userData.account_id);
      }
    };
    
    fetchUserAccountId();
  }, [authUser]);
  
  const { data: fetchedContacts = [], isLoading: supabaseLoading, error: supabaseError } = useContacts(currentUserAccountId);
  const { data: chatwootContacts = [], isLoading: chatwootLoading, error: chatwootError } = useChatwootContacts(currentUserAccountId);

  // Combine contacts from both sources
  const allContacts = [
    ...fetchedContacts,
    ...chatwootContacts.map((contact: any) => ({
      id: contact.id,
      name: contact.name,
      email: contact.email,
      phone: contact.phone_number,
      created_at: contact.created_at
    }))
  ];

  const isLoading = supabaseLoading || chatwootLoading;
  const error = supabaseError || chatwootError;

  // Use external contacts if provided, otherwise use combined contacts
  const contactsToUse = externalContacts || localContacts.length > 0 ? localContacts : allContacts;

  // Initialize local contacts when fetched contacts change
  useEffect(() => {
    if (!externalContacts && fetchedContacts.length > 0) {
      setLocalContacts(fetchedContacts);
    }
  }, [fetchedContacts, externalContacts]);

  // Use external contacts if provided
  useEffect(() => {
    if (externalContacts) {
      setLocalContacts(externalContacts);
    }
  }, [externalContacts]);

  const handleEditContact = (contact: ContactForCard) => {
    setEditingContact(contact);
    setEditDialogOpen(true);
  };

  const handleContactUpdated = (updatedContact: ContactForCard) => {
    const updatedContactData = {
      id: parseInt(updatedContact.id),
      name: updatedContact.name,
      email: updatedContact.email,
      phone: updatedContact.phone,
      created_at: new Date().toISOString(),
    };

    setLocalContacts(prev => 
      prev.map(contact => 
        contact.id === parseInt(updatedContact.id) 
          ? updatedContactData
          : contact
      )
    );

    if (onContactUpdate) {
      onContactUpdate();
    }
  };

  const handleDeleteContact = (contactId: string) => {
    setLocalContacts(prev => 
      prev.filter(contact => contact.id !== parseInt(contactId))
    );

    if (onContactUpdate) {
      onContactUpdate();
    }
  };

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="bg-white rounded-lg shadow-sm border p-6 animate-pulse">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-gray-200 rounded-lg"></div>
                <div>
                  <div className="h-4 bg-gray-200 rounded w-24 mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-16"></div>
                </div>
              </div>
            </div>
            <div className="space-y-2">
              <div className="h-3 bg-gray-200 rounded w-full"></div>
              <div className="h-3 bg-gray-200 rounded w-3/4"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-600">Erro ao carregar contatos: {error.message}</p>
      </div>
    );
  }

  // Filtrar contatos baseado na busca
  const filteredContacts = contactsToUse.filter(contact => {
    const matchesSearch = contact.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         contact.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         contact.phone?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  if (filteredContacts.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">
          {searchTerm ? "Nenhum contato encontrado para sua busca." : "Nenhum contato cadastrado ainda."}
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredContacts.map((contact) => {
          // Gerar iniciais do nome
          const initials = contact.name ? 
            contact.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) : 
            'SC'; // "Sem Contato"
          
          // Formatar data de criação
          const createdAt = contact.created_at ? 
            new Date(contact.created_at).toLocaleDateString('pt-BR') : 
            'Data não disponível';

          const contactForCard: ContactForCard = {
            id: contact.id.toString(),
            initials,
            name: contact.name || 'Nome não informado',
            email: contact.email || 'Email não informado',
            phone: contact.phone || 'Telefone não informado',
            createdAt,
            tag: undefined // O banco não tem campo tag ainda
          };

          return (
            <ContactCard 
              key={contact.id} 
              contact={contactForCard}
              onEdit={handleEditContact}
              onDelete={handleDeleteContact}
            />
          );
        })}
      </div>

      <EditContactDialog
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        contact={editingContact}
        onContactUpdated={handleContactUpdated}
      />
    </>
  );
};
