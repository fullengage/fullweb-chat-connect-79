export interface Agent {
  id: string
  name: string
  email: string
}

export interface ConversationForStats {
  id: number
  status: string
  unread_count: number // Made required to match usage
  contact: {
    id: number
    name: string
    email?: string
    phone?: string
    avatar_url?: string
  }
  assignee?: {
    id: string // Changed from number to string to match Supabase UUIDs
    name: string
    avatar_url?: string
  }
  inbox: {
    id: number
    name: string
    channel_type: string
  }
  updated_at: string
  messages: any[]
}

export interface Conversation {
  id: number
  account_id: number
  contact_id: number
  status: string
  assignee_id?: string
  kanban_stage: string
  priority?: 'high' | 'medium' | 'low'
  last_activity_at: string
  created_at: string
  updated_at: string
  first_reply_created_at?: string
  waiting_since?: string
  snoozed_until?: string
  unread_count?: number
  additional_attributes?: any
  custom_attributes?: any
  contact?: {
    id: number
    name: string
    email?: string
    phone?: string
    avatar_url?: string
  }
  assignee?: {
    id: string // Fixed: Changed from number to string to match Supabase UUIDs
    name: string
    avatar_url?: string
  }
  inbox: {
    id: number
    name: string
    channel_type: string
  }
  messages?: any[]
}

export interface User {
  id: string
  account_id: number
  name: string
  email: string
  display_name?: string
  avatar_url?: string
  role: string
  confirmed: boolean
  created_at: string
  updated_at: string
}

export interface Message {
  id: number
  content: string
  message_type: string
  created_at: string
  updated_at: string
  conversation_id: number
  sender_type: string
  sender_id?: string
  content_type: string
  content_attributes?: any
  source_id?: string
  echo_id?: string
  status?: string
  external_source_ids?: any
}

export interface Inbox {
  id: number
  name: string
  channel_type: string
}
