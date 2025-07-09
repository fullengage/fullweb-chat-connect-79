// types/chatwoot.ts
export interface ChatwootContact {
    id: number;
    name?: string;
    email?: string;
    phone_number?: string;
    avatar?: string;
    last_activity_at?: string;
    created_at: string;
  }
  
  export interface ChatwootMessage {
    id: number;
    content: string;
    message_type: 'incoming' | 'outgoing' | 'template';
    created_at: string;
    sender?: {
      id: number;
      name: string;
      email: string;
      avatar?: string;
      type: 'agent_bot' | 'agent' | 'contact';
    };
    conversation_id: number;
    attachments?: Array<{
      id: number;
      file_type: string;
      data_url: string;
      thumb_url?: string;
    }>;
    content_attributes?: {
      deleted?: boolean;
    };
  }
  
  export interface ChatwootConversation {
    id: number;
    messages: ChatwootMessage[];
    account_id: number;
    inbox_id: number;
    status: 'open' | 'resolved' | 'pending';
    assignee?: {
      id: number;
      name: string;
      email: string;
      avatar?: string;
    };
    contact: ChatwootContact;
    meta?: {
      sender?: ChatwootContact;
      assignee?: any;
      team?: any;
    };
    labels?: string[];
    timestamp: string;
    created_at: string;
    updated_at: string;
    last_activity_at: string;
    unread_count: number;
    can_reply: boolean;
    additional_attributes?: Record<string, any>;
  }
  
  export interface ChatwootApiResponse<T> {
    data: {
      meta: {
        count: number;
        current_page: number;
        all_count: number;
        mine_count: number;
        unassigned_count: number;
      };
      payload: T[];
    };
  }
  
  export interface SendMessagePayload {
    content: string;
    message_type: 'outgoing';
    private?: boolean;
  }