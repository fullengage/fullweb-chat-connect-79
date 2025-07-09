// hooks/useChatwootApi.ts
import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { 
  ChatwootConversation, 
  ChatwootMessage, 
  ChatwootApiResponse,
  SendMessagePayload 
} from '@/types/chatwoot';

const PROXY_BASE_URL = 'https://api.chathook.com.br/api/chatwoot-proxy.php';

// Função para fazer requisições via proxy
const proxyRequest = async (endpoint: string, options: RequestInit = {}) => {
  const url = `${PROXY_BASE_URL}?endpoint=${encodeURIComponent(endpoint)}`;
  
  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  return response.json();
};

// Hook para buscar conversas (usando endpoint permitido)
export const useChatwootConversations = () => {
  return useQuery({
    queryKey: ['chatwoot-conversations'],
    queryFn: async (): Promise<ChatwootConversation[]> => {
      // Usar endpoint permitido: 'conversations' em vez de 'accounts/1/conversations'
      const response = await proxyRequest('conversations');
      
      console.log('🔍 Resposta bruta do proxy:', response);
      
      let conversations: any[] = [];
      
      // Baseado na análise: root.data contém os dados
      if (response.data && Array.isArray(response.data)) {
        conversations = response.data;
        console.log('✅ Usando response.data (array direto)');
      } else if (response.data?.payload && Array.isArray(response.data.payload)) {
        conversations = response.data.payload;
        console.log('✅ Usando response.data.payload');
      } else if (Array.isArray(response)) {
        conversations = response;
        console.log('✅ Usando response direto');
      } else {
        console.warn('⚠️ Formato de resposta inesperado:', response);
        console.log('Estrutura completa:', JSON.stringify(response, null, 2));
        return [];
      }

      console.log(`📊 ${conversations.length} conversas encontradas`);
      
      // Processar cada conversa para garantir estrutura correta
      const processedConversations = conversations.map((conv: any) => {
        // Log da estrutura de cada conversa
        console.log('🔍 Estrutura da conversa:', Object.keys(conv));
        
        // Garantir que messages seja sempre um array
        const messages = Array.isArray(conv.messages) ? conv.messages : [];
        
        return {
          id: conv.id,
          messages: messages, // Sempre um array
          account_id: conv.account_id || 1,
          inbox_id: conv.inbox_id,
          status: conv.status || 'open',
          assignee: conv.assignee,
          contact: {
            id: conv.contact?.id || conv.contact_id,
            name: conv.contact?.name || conv.contact_name || conv.meta?.sender?.name,
            email: conv.contact?.email || conv.contact_email || conv.meta?.sender?.email,
            phone_number: conv.contact?.phone_number || conv.contact_phone || conv.meta?.sender?.phone_number,
            avatar: conv.contact?.avatar || conv.meta?.sender?.thumbnail,
            created_at: conv.contact?.created_at || conv.created_at
          },
          meta: conv.meta,
          labels: Array.isArray(conv.labels) ? conv.labels : [], // Sempre um array
          timestamp: conv.timestamp || conv.created_at,
          created_at: conv.created_at,
          updated_at: conv.updated_at,
          last_activity_at: conv.last_activity_at || conv.updated_at || conv.created_at,
          unread_count: conv.unread_count || 0,
          can_reply: conv.can_reply !== false,
          additional_attributes: conv.additional_attributes || {}
        };
      });

      console.log('✅ Conversas processadas:', processedConversations);
      return processedConversations;
    },
    refetchInterval: 10000, // Atualiza a cada 10 segundos
    staleTime: 5000, // Considera dados frescos por 5 segundos
  });
};

// Hook para buscar mensagens de uma conversa específica
export const useChatwootMessages = (conversationId: number) => {
  return useQuery({
    queryKey: ['chatwoot-messages', conversationId],
    queryFn: async (): Promise<ChatwootMessage[]> => {
      if (!conversationId) return [];
      
      console.log('🔍 Buscando mensagens para conversa:', conversationId);
      const response = await proxyRequest(`conversations/${conversationId}/messages`);
      
      console.log('📦 Resposta de mensagens:', response);
      
      let messages: any[] = [];
      
      // Processar diferentes formatos de resposta para mensagens
      if (Array.isArray(response)) {
        messages = response;
        console.log('✅ Usando response direto (array)');
      } else if (response.data && Array.isArray(response.data)) {
        messages = response.data;
        console.log('✅ Usando response.data');
      } else if (response.payload && Array.isArray(response.payload)) {
        messages = response.payload;
        console.log('✅ Usando response.payload');
      } else {
        console.warn('⚠️ Formato de mensagens inesperado:', response);
        return [];
      }

      console.log(`📊 ${messages.length} mensagens encontradas`);
      
      // Garantir que cada mensagem tem a estrutura correta
      const processedMessages = messages.map((msg: any) => ({
        id: msg.id,
        content: msg.content || '',
        message_type: msg.message_type || 'incoming',
        created_at: msg.created_at,
        sender: msg.sender ? {
          id: msg.sender.id,
          name: msg.sender.name || 'Usuário',
          email: msg.sender.email || '',
          avatar: msg.sender.avatar,
          type: msg.sender.type || 'contact'
        } : null,
        conversation_id: msg.conversation_id || conversationId,
        attachments: Array.isArray(msg.attachments) ? msg.attachments : [],
        content_attributes: msg.content_attributes || {}
      }));

      console.log('✅ Mensagens processadas:', processedMessages);
      return processedMessages;
    },
    enabled: !!conversationId,
    refetchInterval: 5000,
    staleTime: 2000,
  });
};

// Hook para buscar agentes
export const useChatwootAgents = () => {
  return useQuery({
    queryKey: ['chatwoot-agents'],
    queryFn: async () => {
      console.log('🔍 Buscando agentes do Chatwoot');
      const response = await proxyRequest('agents');
      
      console.log('📦 Resposta de agentes:', response);
      
      let agents: any[] = [];
      
      // Processar diferentes formatos de resposta
      if (Array.isArray(response)) {
        agents = response;
        console.log('✅ Usando response direto (array)');
      } else if (response.data && Array.isArray(response.data)) {
        agents = response.data;
        console.log('✅ Usando response.data');
      } else if (response.payload && Array.isArray(response.payload)) {
        agents = response.payload;
        console.log('✅ Usando response.payload');
      } else {
        console.warn('⚠️ Formato de agentes inesperado:', response);
        return [];
      }

      console.log(`📊 ${agents.length} agentes encontrados`);
      
      // Processar cada agente para garantir estrutura correta
      const processedAgents = agents.map((agent: any) => ({
        id: agent.id,
        name: agent.name || '',
        email: agent.email || '',
        phone: agent.phone_number || agent.phone || '',
        role: agent.role || 'agent',
        status: agent.availability_status || agent.status || 'offline',
        avatar: agent.avatar || null,
        teams: Array.isArray(agent.teams) ? agent.teams : [],
        account_id: agent.account_id || 1,
        is_active: agent.active !== false,
        last_activity: agent.last_activity_at || agent.updated_at || agent.created_at,
        created_at: agent.created_at,
        updated_at: agent.updated_at,
        // Estatísticas adicionais que podem vir do Chatwoot
        conversationsToday: agent.conversations_count || 0,
        avgResponseTime: agent.avg_response_time || '0m',
        resolutionRate: agent.resolution_rate || 0,
        stats: {
          rating: agent.rating || 0,
          totalConversations: agent.total_conversations || 0,
          totalMessages: agent.total_messages || 0
        }
      }));

      console.log('✅ Agentes processados:', processedAgents);
      return processedAgents;
    },
    refetchInterval: 30000, // Atualiza a cada 30 segundos
    staleTime: 15000, // Considera dados frescos por 15 segundos
  });
};

// Hook para buscar contatos
export const useChatwootContacts = () => {
  return useQuery({
    queryKey: ['chatwoot-contacts'],
    queryFn: async () => {
      console.log('🔍 Buscando contatos do Chatwoot');
      const response = await proxyRequest('contacts');
      
      console.log('📦 Resposta de contatos:', response);
      
      let contacts: any[] = [];
      
      // Processar diferentes formatos de resposta
      if (Array.isArray(response)) {
        contacts = response;
        console.log('✅ Usando response direto (array)');
      } else if (response.data && Array.isArray(response.data)) {
        contacts = response.data;
        console.log('✅ Usando response.data');
      } else if (response.payload && Array.isArray(response.payload)) {
        contacts = response.payload;
        console.log('✅ Usando response.payload');
      } else {
        console.warn('⚠️ Formato de contatos inesperado:', response);
        return [];
      }

      console.log(`📊 ${contacts.length} contatos encontrados`);
      
      // Processar cada contato para garantir estrutura correta
      const processedContacts = contacts.map((contact: any) => ({
        id: contact.id,
        name: contact.name || '',
        email: contact.email || '',
        phone_number: contact.phone_number || contact.phone || '',
        avatar: contact.avatar || null,
        created_at: contact.created_at,
        updated_at: contact.updated_at,
        additional_attributes: contact.additional_attributes || {},
        custom_attributes: contact.custom_attributes || {},
        // Estatísticas derivadas
        totalConversations: contact.conversations_count || 0,
        lastContactedAt: contact.last_activity_at || contact.updated_at,
        // Tags/etiquetas se disponíveis
        labels: Array.isArray(contact.labels) ? contact.labels : [],
        // Status baseado na última atividade
        status: contact.last_activity_at ? 'active' : 'inactive'
      }));

      console.log('✅ Contatos processados:', processedContacts);
      return processedContacts;
    },
    refetchInterval: 30000, // Atualiza a cada 30 segundos
    staleTime: 15000, // Considera dados frescos por 15 segundos
  });
};

// Hook para buscar inboxes
export const useChatwootInboxes = () => {
  return useQuery({
    queryKey: ['chatwoot-inboxes'],
    queryFn: async () => {
      console.log('🔍 Buscando inboxes do Chatwoot');
      const response = await proxyRequest('inboxes');
      
      console.log('📦 Resposta de inboxes:', response);
      
      let inboxes: any[] = [];
      
      // Processar diferentes formatos de resposta
      if (Array.isArray(response)) {
        inboxes = response;
        console.log('✅ Usando response direto (array)');
      } else if (response.data && Array.isArray(response.data)) {
        inboxes = response.data;
        console.log('✅ Usando response.data');
      } else if (response.payload && Array.isArray(response.payload)) {
        inboxes = response.payload;
        console.log('✅ Usando response.payload');
      } else {
        console.warn('⚠️ Formato de inboxes inesperado:', response);
        return [];
      }

      console.log(`📊 ${inboxes.length} inboxes encontrados`);
      
      // Processar cada inbox para garantir estrutura correta
      const processedInboxes = inboxes.map((inbox: any) => ({
        id: inbox.id,
        name: inbox.name || '',
        channel_type: inbox.channel_type || 'Channel::WebWidget',
        phone_number: inbox.phone_number || '',
        widget_color: inbox.widget_color || '#1f93ff',
        website_url: inbox.website_url || '',
        welcome_message: inbox.welcome_message || '',
        welcome_tagline: inbox.welcome_tagline || '',
        greeting_enabled: inbox.greeting_enabled || false,
        greeting_message: inbox.greeting_message || '',
        out_of_office_message: inbox.out_of_office_message || '',
        timezone: inbox.timezone || 'UTC',
        working_hours_enabled: inbox.working_hours_enabled || false,
        account_id: inbox.account_id || 1,
        avatar: inbox.avatar || null,
        created_at: inbox.created_at,
        updated_at: inbox.updated_at,
        // Configurações específicas por tipo de canal
        channel_settings: inbox.channel || inbox.settings || {},
        // Estatísticas se disponíveis
        conversations_count: inbox.conversations_count || 0
      }));

      console.log('✅ Inboxes processados:', processedInboxes);
      return processedInboxes;
    },
    refetchInterval: 60000, // Atualiza a cada 1 minuto
    staleTime: 30000, // Considera dados frescos por 30 segundos
  });
};

// Hook para estatísticas/analytics
export const useChatwootAnalytics = () => {
  return useQuery({
    queryKey: ['chatwoot-analytics'],
    queryFn: async () => {
      console.log('🔍 Buscando analytics do Chatwoot');
      
      // O Chatwoot pode não ter um endpoint específico de analytics,
      // então vamos derivar estatísticas dos dados das conversas
      const conversationsResponse = await proxyRequest('conversations');
      const agentsResponse = await proxyRequest('agents');
      
      let conversations: any[] = [];
      let agents: any[] = [];
      
      // Processar conversas
      if (conversationsResponse.data && Array.isArray(conversationsResponse.data)) {
        conversations = conversationsResponse.data;
      } else if (Array.isArray(conversationsResponse)) {
        conversations = conversationsResponse;
      }
      
      // Processar agentes
      if (agentsResponse.data && Array.isArray(agentsResponse.data)) {
        agents = agentsResponse.data;
      } else if (Array.isArray(agentsResponse)) {
        agents = agentsResponse;
      }
      
      // Calcular estatísticas baseadas nos dados
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000);
      const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
      
      // Conversas de hoje
      const todayConversations = conversations.filter(conv => 
        new Date(conv.created_at) >= today
      );
      
      // Conversas de ontem
      const yesterdayConversations = conversations.filter(conv => {
        const convDate = new Date(conv.created_at);
        return convDate >= yesterday && convDate < today;
      });
      
      // Conversas da semana
      const weekConversations = conversations.filter(conv => 
        new Date(conv.created_at) >= weekAgo
      );
      
      const analytics = {
        // Métricas gerais
        totalConversations: conversations.length,
        totalAgents: agents.filter(a => a.active !== false).length,
        totalContacts: new Set(conversations.map(c => c.contact_id || c.contact?.id)).size,
        
        // Métricas de período
        todayConversations: todayConversations.length,
        yesterdayConversations: yesterdayConversations.length,
        weekConversations: weekConversations.length,
        
        // Status das conversas
        openConversations: conversations.filter(c => c.status === 'open').length,
        pendingConversations: conversations.filter(c => c.status === 'pending').length,
        resolvedConversations: conversations.filter(c => c.status === 'resolved').length,
        
        // Crescimento
        conversationGrowth: todayConversations.length - yesterdayConversations.length,
        
        // Agentes online
        onlineAgents: agents.filter(a => 
          a.availability_status === 'online' || a.status === 'online'
        ).length,
        
        // Taxa de resposta (simplificada)
        responseRate: conversations.length > 0 
          ? Math.round((conversations.filter(c => c.messages?.length > 1).length / conversations.length) * 100)
          : 0,
        
        // Tempo médio de resposta (mockado por enquanto)
        avgResponseTime: '2.5m',
        
        // Satisfação (mockado por enquanto)
        customerSatisfaction: 4.2
      };
      
      console.log('✅ Analytics calculado:', analytics);
      return analytics;
    },
    refetchInterval: 60000, // Atualiza a cada 1 minuto
    staleTime: 30000, // Considera dados frescos por 30 segundos
  });
};

// Hook para enviar mensagem
export const useSendChatwootMessage = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ 
      conversationId, 
      payload 
    }: { 
      conversationId: number; 
      payload: SendMessagePayload 
    }) => {
      return proxyRequest(`conversations/${conversationId}/messages`, {
        method: 'POST',
        body: JSON.stringify(payload),
      });
    },
    onSuccess: (_, variables) => {
      // Invalida cache para atualizar conversas e mensagens
      queryClient.invalidateQueries({ 
        queryKey: ['chatwoot-conversations'] 
      });
      queryClient.invalidateQueries({ 
        queryKey: ['chatwoot-messages', variables.conversationId] 
      });
    },
  });
};

// Hook para atualizar status da conversa
export const useUpdateConversationStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ 
      conversationId, 
      status 
    }: { 
      conversationId: number; 
      status: 'open' | 'resolved' | 'pending' 
    }) => {
      return proxyRequest(`conversations/${conversationId}`, {
        method: 'PATCH',
        body: JSON.stringify({ status }),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ 
        queryKey: ['chatwoot-conversations'] 
      });
    },
  });
};

// Hook para atribuir conversa a um agente
export const useAssignConversation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ 
      conversationId, 
      assigneeId 
    }: { 
      conversationId: number; 
      assigneeId: number | null 
    }) => {
      return proxyRequest(`conversations/${conversationId}/assignments`, {
        method: 'POST',
        body: JSON.stringify({ assignee_id: assigneeId }),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ 
        queryKey: ['chatwoot-conversations'] 
      });
    },
  });
};

// Hook para criar novo agente
export const useCreateChatwootAgent = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (agentData: {
      name: string;
      email: string;
      password?: string;
      role?: 'agent' | 'administrator';
    }) => {
      return proxyRequest('agents', {
        method: 'POST',
        body: JSON.stringify(agentData),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ 
        queryKey: ['chatwoot-agents'] 
      });
    },
  });
};

// Hook para atualizar agente
export const useUpdateChatwootAgent = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      agentId,
      agentData
    }: {
      agentId: number;
      agentData: Partial<{
        name: string;
        email: string;
        role: 'agent' | 'administrator';
      }>;
    }) => {
      return proxyRequest(`agents/${agentId}`, {
        method: 'PATCH',
        body: JSON.stringify(agentData),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ 
        queryKey: ['chatwoot-agents'] 
      });
    },
  });
};

// Hook para criar novo contato
export const useCreateChatwootContact = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (contactData: {
      name: string;
      email?: string;
      phone_number?: string;
      additional_attributes?: any;
    }) => {
      return proxyRequest('contacts', {
        method: 'POST',
        body: JSON.stringify(contactData),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ 
        queryKey: ['chatwoot-contacts'] 
      });
    },
  });
};

// Hook para atualizar contato
export const useUpdateChatwootContact = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      contactId,
      contactData
    }: {
      contactId: number;
      contactData: Partial<{
        name: string;
        email: string;
        phone_number: string;
        additional_attributes: any;
      }>;
    }) => {
      return proxyRequest(`contacts/${contactId}`, {
        method: 'PATCH',
        body: JSON.stringify(contactData),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ 
        queryKey: ['chatwoot-contacts'] 
      });
    },
  });
};

// Hook personalizado para gerenciar conversa selecionada
export const useSelectedConversation = () => {
  const [selectedConversation, setSelectedConversation] = 
    useState<ChatwootConversation | null>(null);

  const { data: messages, isLoading: messagesLoading } = useChatwootMessages(
    selectedConversation?.id || 0
  );

  // Atualiza as mensagens da conversa selecionada quando chegam novos dados
  useEffect(() => {
    if (selectedConversation && messages) {
      console.log('🔄 Atualizando mensagens da conversa:', selectedConversation.id);
      console.log('📋 Mensagens recebidas:', messages);
      
      // Garantir que messages seja sempre um array
      const safeMessages = Array.isArray(messages) ? messages : [];
      
      setSelectedConversation(prev => 
        prev ? { 
          ...prev, 
          messages: safeMessages 
        } : null
      );
    }
  }, [messages, selectedConversation?.id]);

  return {
    selectedConversation,
    setSelectedConversation: (conversation: ChatwootConversation | null) => {
      console.log('🎯 Selecionando conversa:', conversation?.id);
      
      if (conversation) {
        // Garantir que a conversa sempre tenha um array de mensagens
        const conversationWithSafeMessages = {
          ...conversation,
          messages: Array.isArray(conversation.messages) ? conversation.messages : []
        };
        setSelectedConversation(conversationWithSafeMessages);
      } else {
        setSelectedConversation(null);
      }
    },
    messages: Array.isArray(messages) ? messages : [],
    messagesLoading,
  };
};