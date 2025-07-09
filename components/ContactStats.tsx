
import { Card, CardContent } from "@/components/ui/card";
import { Users, Mail, Phone, Calendar } from "lucide-react";
import { useContacts } from "@/hooks/useSupabaseData";
import { useAuth } from "@/contexts/AuthContext";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export const ContactStats = () => {
  const { user: authUser } = useAuth();
  const [currentUserAccountId, setCurrentUserAccountId] = useState<number>(0);
  
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
  
  const { data: contacts = [], isLoading } = useContacts(currentUserAccountId);

  // Calcular estatísticas baseadas nos dados reais
  const totalContacts = contacts.length;
  const contactsWithEmail = contacts.filter(contact => contact.email).length;
  const contactsWithPhone = contacts.filter(contact => contact.phone).length;
  
  // Contatos adicionados hoje
  const today = new Date().toDateString();
  const contactsAddedToday = contacts.filter(contact => {
    if (!contact.created_at) return false;
    return new Date(contact.created_at).toDateString() === today;
  }).length;

  const stats = [
    {
      title: "Total de Contatos",
      value: isLoading ? "..." : totalContacts.toString(),
      icon: Users,
      color: "text-blue-600",
      bgColor: "bg-blue-50"
    },
    {
      title: "Com Email",
      value: isLoading ? "..." : contactsWithEmail.toString(),
      icon: Mail,
      color: "text-green-600",
      bgColor: "bg-green-50"
    },
    {
      title: "Com Telefone",
      value: isLoading ? "..." : contactsWithPhone.toString(),
      icon: Phone,
      color: "text-purple-600",
      bgColor: "bg-purple-50"
    },
    {
      title: "Adicionados Hoje",
      value: isLoading ? "..." : contactsAddedToday.toString(),
      icon: Calendar,
      color: "text-orange-600",
      bgColor: "bg-orange-50"
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {stats.map((stat) => {
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
