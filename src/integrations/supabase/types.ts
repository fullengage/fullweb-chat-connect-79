export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instanciate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      accounts: {
        Row: {
          city: string | null
          cnpj: string | null
          created_at: string
          current_conversations: number | null
          current_users: number | null
          description: string | null
          email: string
          id: number
          industry: string | null
          is_active: boolean | null
          name: string
          phone: string | null
          plan_id: number | null
          state: string | null
          subscription_expires_at: string | null
          updated_at: string
        }
        Insert: {
          city?: string | null
          cnpj?: string | null
          created_at?: string
          current_conversations?: number | null
          current_users?: number | null
          description?: string | null
          email: string
          id?: number
          industry?: string | null
          is_active?: boolean | null
          name: string
          phone?: string | null
          plan_id?: number | null
          state?: string | null
          subscription_expires_at?: string | null
          updated_at?: string
        }
        Update: {
          city?: string | null
          cnpj?: string | null
          created_at?: string
          current_conversations?: number | null
          current_users?: number | null
          description?: string | null
          email?: string
          id?: number
          industry?: string | null
          is_active?: boolean | null
          name?: string
          phone?: string | null
          plan_id?: number | null
          state?: string | null
          subscription_expires_at?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "accounts_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "plans"
            referencedColumns: ["id"]
          },
        ]
      }
      agent_stats: {
        Row: {
          agent_id: string
          attendances: number | null
          avg_response_time_seconds: number | null
          conversations_today: number | null
          created_at: string
          date: string | null
          id: string
          rating: number | null
          resolution_rate: number | null
          updated_at: string
        }
        Insert: {
          agent_id: string
          attendances?: number | null
          avg_response_time_seconds?: number | null
          conversations_today?: number | null
          created_at?: string
          date?: string | null
          id?: string
          rating?: number | null
          resolution_rate?: number | null
          updated_at?: string
        }
        Update: {
          agent_id?: string
          attendances?: number | null
          avg_response_time_seconds?: number | null
          conversations_today?: number | null
          created_at?: string
          date?: string | null
          id?: string
          rating?: number | null
          resolution_rate?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "agent_stats_agent_id_fkey"
            columns: ["agent_id"]
            isOneToOne: false
            referencedRelation: "agents"
            referencedColumns: ["id"]
          },
        ]
      }
      agents: {
        Row: {
          account_id: number
          avatar_url: string | null
          created_at: string
          email: string
          id: string
          is_active: boolean | null
          last_activity: string | null
          name: string
          phone: string | null
          role: string
          status: string
          teams: string[] | null
          updated_at: string
        }
        Insert: {
          account_id: number
          avatar_url?: string | null
          created_at?: string
          email: string
          id?: string
          is_active?: boolean | null
          last_activity?: string | null
          name: string
          phone?: string | null
          role: string
          status?: string
          teams?: string[] | null
          updated_at?: string
        }
        Update: {
          account_id?: number
          avatar_url?: string | null
          created_at?: string
          email?: string
          id?: string
          is_active?: boolean | null
          last_activity?: string | null
          name?: string
          phone?: string | null
          role?: string
          status?: string
          teams?: string[] | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "agents_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "accounts"
            referencedColumns: ["id"]
          },
        ]
      }
      contacts: {
        Row: {
          account_id: number
          avatar_url: string | null
          created_at: string
          custom_fields: Json | null
          email: string | null
          id: number
          last_seen: string | null
          name: string | null
          phone: string | null
          updated_at: string
        }
        Insert: {
          account_id: number
          avatar_url?: string | null
          created_at?: string
          custom_fields?: Json | null
          email?: string | null
          id?: number
          last_seen?: string | null
          name?: string | null
          phone?: string | null
          updated_at?: string
        }
        Update: {
          account_id?: number
          avatar_url?: string | null
          created_at?: string
          custom_fields?: Json | null
          email?: string | null
          id?: number
          last_seen?: string | null
          name?: string | null
          phone?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "contacts_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "accounts"
            referencedColumns: ["id"]
          },
        ]
      }
      conversation_kanban: {
        Row: {
          account_id: number
          board_id: number
          column_id: number
          conversation_id: number
          id: number
          moved_at: string | null
          moved_by: string | null
          position: number
        }
        Insert: {
          account_id: number
          board_id: number
          column_id: number
          conversation_id: number
          id?: number
          moved_at?: string | null
          moved_by?: string | null
          position: number
        }
        Update: {
          account_id?: number
          board_id?: number
          column_id?: number
          conversation_id?: number
          id?: number
          moved_at?: string | null
          moved_by?: string | null
          position?: number
        }
        Relationships: [
          {
            foreignKeyName: "conversation_kanban_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "conversation_kanban_board_id_fkey"
            columns: ["board_id"]
            isOneToOne: false
            referencedRelation: "kanban_boards"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "conversation_kanban_column_id_fkey"
            columns: ["column_id"]
            isOneToOne: false
            referencedRelation: "kanban_columns"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "conversation_kanban_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "conversation_kanban_moved_by_fkey"
            columns: ["moved_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      conversation_labels: {
        Row: {
          account_id: number
          added_at: string | null
          added_by: string | null
          conversation_id: number
          label_id: number
        }
        Insert: {
          account_id: number
          added_at?: string | null
          added_by?: string | null
          conversation_id: number
          label_id: number
        }
        Update: {
          account_id?: number
          added_at?: string | null
          added_by?: string | null
          conversation_id?: number
          label_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "conversation_labels_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "conversation_labels_added_by_fkey"
            columns: ["added_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "conversation_labels_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "conversation_labels_label_id_fkey"
            columns: ["label_id"]
            isOneToOne: false
            referencedRelation: "kanban_labels"
            referencedColumns: ["id"]
          },
        ]
      }
      conversations: {
        Row: {
          account_id: number
          additional_attributes: Json | null
          assignee_id: string | null
          complexity: string | null
          contact_id: number
          created_at: string
          custom_attributes: Json | null
          due_date: string | null
          estimated_time: number | null
          first_reply_created_at: string | null
          id: number
          kanban_stage: string | null
          last_activity_at: string | null
          priority: string | null
          snoozed_until: string | null
          status: string
          unread_count: number | null
          updated_at: string
          waiting_since: string | null
        }
        Insert: {
          account_id: number
          additional_attributes?: Json | null
          assignee_id?: string | null
          complexity?: string | null
          contact_id: number
          created_at?: string
          custom_attributes?: Json | null
          due_date?: string | null
          estimated_time?: number | null
          first_reply_created_at?: string | null
          id?: number
          kanban_stage?: string | null
          last_activity_at?: string | null
          priority?: string | null
          snoozed_until?: string | null
          status?: string
          unread_count?: number | null
          updated_at?: string
          waiting_since?: string | null
        }
        Update: {
          account_id?: number
          additional_attributes?: Json | null
          assignee_id?: string | null
          complexity?: string | null
          contact_id?: number
          created_at?: string
          custom_attributes?: Json | null
          due_date?: string | null
          estimated_time?: number | null
          first_reply_created_at?: string | null
          id?: number
          kanban_stage?: string | null
          last_activity_at?: string | null
          priority?: string | null
          snoozed_until?: string | null
          status?: string
          unread_count?: number | null
          updated_at?: string
          waiting_since?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "conversations_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "conversations_assignee_id_fkey"
            columns: ["assignee_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "conversations_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "contacts"
            referencedColumns: ["id"]
          },
        ]
      }
      kanban_boards: {
        Row: {
          account_id: number
          background_color: string | null
          created_at: string
          created_by: string | null
          description: string | null
          id: number
          is_active: boolean | null
          is_default: boolean | null
          name: string
          updated_at: string
          visibility: string | null
        }
        Insert: {
          account_id: number
          background_color?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: number
          is_active?: boolean | null
          is_default?: boolean | null
          name: string
          updated_at?: string
          visibility?: string | null
        }
        Update: {
          account_id?: number
          background_color?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: number
          is_active?: boolean | null
          is_default?: boolean | null
          name?: string
          updated_at?: string
          visibility?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "kanban_boards_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "kanban_boards_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      kanban_columns: {
        Row: {
          account_id: number
          auto_assign_agent: boolean | null
          board_id: number
          color: string | null
          created_at: string
          description: string | null
          id: number
          is_final_stage: boolean | null
          max_cards: number | null
          name: string
          position: number
          updated_at: string
        }
        Insert: {
          account_id: number
          auto_assign_agent?: boolean | null
          board_id: number
          color?: string | null
          created_at?: string
          description?: string | null
          id?: number
          is_final_stage?: boolean | null
          max_cards?: number | null
          name: string
          position: number
          updated_at?: string
        }
        Update: {
          account_id?: number
          auto_assign_agent?: boolean | null
          board_id?: number
          color?: string | null
          created_at?: string
          description?: string | null
          id?: number
          is_final_stage?: boolean | null
          max_cards?: number | null
          name?: string
          position?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "kanban_columns_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "kanban_columns_board_id_fkey"
            columns: ["board_id"]
            isOneToOne: false
            referencedRelation: "kanban_boards"
            referencedColumns: ["id"]
          },
        ]
      }
      kanban_labels: {
        Row: {
          account_id: number
          board_id: number | null
          color: string
          created_at: string
          id: number
          name: string
        }
        Insert: {
          account_id: number
          board_id?: number | null
          color: string
          created_at?: string
          id?: number
          name: string
        }
        Update: {
          account_id?: number
          board_id?: number | null
          color?: string
          created_at?: string
          id?: number
          name?: string
        }
        Relationships: [
          {
            foreignKeyName: "kanban_labels_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "kanban_labels_board_id_fkey"
            columns: ["board_id"]
            isOneToOne: false
            referencedRelation: "kanban_boards"
            referencedColumns: ["id"]
          },
        ]
      }
      messages: {
        Row: {
          attachments: Json | null
          content: string | null
          conversation_id: number
          created_at: string
          id: number
          read_at: string | null
          sender_id: string | null
          sender_type: string
        }
        Insert: {
          attachments?: Json | null
          content?: string | null
          conversation_id: number
          created_at?: string
          id?: number
          read_at?: string | null
          sender_id?: string | null
          sender_type: string
        }
        Update: {
          attachments?: Json | null
          content?: string | null
          conversation_id?: number
          created_at?: string
          id?: number
          read_at?: string | null
          sender_id?: string | null
          sender_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      plans: {
        Row: {
          created_at: string
          description: string | null
          features: Json | null
          id: number
          is_active: boolean | null
          max_conversations: number | null
          max_users: number | null
          name: string
          price: number | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          features?: Json | null
          id?: number
          is_active?: boolean | null
          max_conversations?: number | null
          max_users?: number | null
          name: string
          price?: number | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          features?: Json | null
          id?: number
          is_active?: boolean | null
          max_conversations?: number | null
          max_users?: number | null
          name?: string
          price?: number | null
          updated_at?: string
        }
        Relationships: []
      }
      users: {
        Row: {
          account_id: number
          auth_user_id: string | null
          avatar_url: string | null
          confirmed: boolean | null
          created_at: string
          display_name: string | null
          email: string
          id: string
          name: string
          role: string
          updated_at: string
        }
        Insert: {
          account_id: number
          auth_user_id?: string | null
          avatar_url?: string | null
          confirmed?: boolean | null
          created_at?: string
          display_name?: string | null
          email: string
          id?: string
          name: string
          role?: string
          updated_at?: string
        }
        Update: {
          account_id?: number
          auth_user_id?: string | null
          avatar_url?: string | null
          confirmed?: boolean | null
          created_at?: string
          display_name?: string | null
          email?: string
          id?: string
          name?: string
          role?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "users_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "accounts"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_current_user_account: {
        Args: Record<PropertyKey, never>
        Returns: number
      }
      get_current_user_role: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      get_user_account_id: {
        Args: { user_id: string }
        Returns: number
      }
      get_user_role: {
        Args: { user_id: string }
        Returns: string
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
