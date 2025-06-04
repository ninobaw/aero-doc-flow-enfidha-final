export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      actions: {
        Row: {
          actual_hours: number | null
          assigned_to: string[]
          created_at: string
          description: string | null
          due_date: string
          estimated_hours: number | null
          id: string
          parent_document_id: string | null
          priority: Database["public"]["Enums"]["priority"]
          progress: number
          status: Database["public"]["Enums"]["action_status"]
          title: string
          updated_at: string
        }
        Insert: {
          actual_hours?: number | null
          assigned_to: string[]
          created_at?: string
          description?: string | null
          due_date: string
          estimated_hours?: number | null
          id?: string
          parent_document_id?: string | null
          priority?: Database["public"]["Enums"]["priority"]
          progress?: number
          status?: Database["public"]["Enums"]["action_status"]
          title: string
          updated_at?: string
        }
        Update: {
          actual_hours?: number | null
          assigned_to?: string[]
          created_at?: string
          description?: string | null
          due_date?: string
          estimated_hours?: number | null
          id?: string
          parent_document_id?: string | null
          priority?: Database["public"]["Enums"]["priority"]
          progress?: number
          status?: Database["public"]["Enums"]["action_status"]
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "actions_parent_document_id_fkey"
            columns: ["parent_document_id"]
            isOneToOne: false
            referencedRelation: "documents"
            referencedColumns: ["id"]
          },
        ]
      }
      activity_logs: {
        Row: {
          action: string
          details: string
          entity_id: string
          entity_type: string
          id: string
          ip_address: unknown | null
          timestamp: string
          user_agent: string | null
          user_id: string
        }
        Insert: {
          action: string
          details: string
          entity_id: string
          entity_type: string
          id?: string
          ip_address?: unknown | null
          timestamp?: string
          user_agent?: string | null
          user_id: string
        }
        Update: {
          action?: string
          details?: string
          entity_id?: string
          entity_type?: string
          id?: string
          ip_address?: unknown | null
          timestamp?: string
          user_agent?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "activity_logs_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      app_settings: {
        Row: {
          auto_archive: boolean
          company_name: string
          created_at: string
          default_airport: Database["public"]["Enums"]["airport_code"]
          document_retention: number
          email_notifications: boolean
          id: string
          language: string
          max_file_size: number
          password_expiry: number
          push_notifications: boolean
          require_two_factor: boolean
          session_timeout: number
          sms_notifications: boolean
          smtp_host: string
          smtp_port: number
          smtp_username: string
          theme: string
          updated_at: string
          use_ssl: boolean
          user_id: string
        }
        Insert: {
          auto_archive?: boolean
          company_name?: string
          created_at?: string
          default_airport?: Database["public"]["Enums"]["airport_code"]
          document_retention?: number
          email_notifications?: boolean
          id?: string
          language?: string
          max_file_size?: number
          password_expiry?: number
          push_notifications?: boolean
          require_two_factor?: boolean
          session_timeout?: number
          sms_notifications?: boolean
          smtp_host?: string
          smtp_port?: number
          smtp_username?: string
          theme?: string
          updated_at?: string
          use_ssl?: boolean
          user_id: string
        }
        Update: {
          auto_archive?: boolean
          company_name?: string
          created_at?: string
          default_airport?: Database["public"]["Enums"]["airport_code"]
          document_retention?: number
          email_notifications?: boolean
          id?: string
          language?: string
          max_file_size?: number
          password_expiry?: number
          push_notifications?: boolean
          require_two_factor?: boolean
          session_timeout?: number
          sms_notifications?: boolean
          smtp_host?: string
          smtp_port?: number
          smtp_username?: string
          theme?: string
          updated_at?: string
          use_ssl?: boolean
          user_id?: string
        }
        Relationships: []
      }
      correspondances: {
        Row: {
          airport: Database["public"]["Enums"]["airport_code"]
          attachments: string[] | null
          content: string
          created_at: string
          document_id: string
          from_address: string
          id: string
          priority: Database["public"]["Enums"]["priority"]
          status: string
          subject: string
          to_address: string
        }
        Insert: {
          airport: Database["public"]["Enums"]["airport_code"]
          attachments?: string[] | null
          content: string
          created_at?: string
          document_id: string
          from_address: string
          id?: string
          priority?: Database["public"]["Enums"]["priority"]
          status?: string
          subject: string
          to_address: string
        }
        Update: {
          airport?: Database["public"]["Enums"]["airport_code"]
          attachments?: string[] | null
          content?: string
          created_at?: string
          document_id?: string
          from_address?: string
          id?: string
          priority?: Database["public"]["Enums"]["priority"]
          status?: string
          subject?: string
          to_address?: string
        }
        Relationships: [
          {
            foreignKeyName: "correspondances_document_id_fkey"
            columns: ["document_id"]
            isOneToOne: false
            referencedRelation: "documents"
            referencedColumns: ["id"]
          },
        ]
      }
      document_history: {
        Row: {
          action: string
          changes: Json | null
          comment: string | null
          document_id: string
          id: string
          timestamp: string
          user_id: string
          version: number
        }
        Insert: {
          action: string
          changes?: Json | null
          comment?: string | null
          document_id: string
          id?: string
          timestamp?: string
          user_id: string
          version: number
        }
        Update: {
          action?: string
          changes?: Json | null
          comment?: string | null
          document_id?: string
          id?: string
          timestamp?: string
          user_id?: string
          version?: number
        }
        Relationships: [
          {
            foreignKeyName: "document_history_document_id_fkey"
            columns: ["document_id"]
            isOneToOne: false
            referencedRelation: "documents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "document_history_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      documents: {
        Row: {
          airport: Database["public"]["Enums"]["airport_code"]
          author_id: string
          content: string | null
          created_at: string
          file_path: string | null
          file_type: string | null
          id: string
          qr_code: string
          status: Database["public"]["Enums"]["document_status"]
          title: string
          type: Database["public"]["Enums"]["document_type"]
          updated_at: string
          version: number
        }
        Insert: {
          airport: Database["public"]["Enums"]["airport_code"]
          author_id: string
          content?: string | null
          created_at?: string
          file_path?: string | null
          file_type?: string | null
          id?: string
          qr_code?: string
          status?: Database["public"]["Enums"]["document_status"]
          title: string
          type: Database["public"]["Enums"]["document_type"]
          updated_at?: string
          version?: number
        }
        Update: {
          airport?: Database["public"]["Enums"]["airport_code"]
          author_id?: string
          content?: string | null
          created_at?: string
          file_path?: string | null
          file_type?: string | null
          id?: string
          qr_code?: string
          status?: Database["public"]["Enums"]["document_status"]
          title?: string
          type?: Database["public"]["Enums"]["document_type"]
          updated_at?: string
          version?: number
        }
        Relationships: [
          {
            foreignKeyName: "documents_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      proces_verbaux: {
        Row: {
          agenda: string
          airport: Database["public"]["Enums"]["airport_code"]
          created_at: string
          decisions: string
          document_id: string
          id: string
          location: string
          meeting_date: string
          meeting_type: string
          next_meeting_date: string | null
          participants: string[]
        }
        Insert: {
          agenda: string
          airport: Database["public"]["Enums"]["airport_code"]
          created_at?: string
          decisions: string
          document_id: string
          id?: string
          location: string
          meeting_date: string
          meeting_type: string
          next_meeting_date?: string | null
          participants: string[]
        }
        Update: {
          agenda?: string
          airport?: Database["public"]["Enums"]["airport_code"]
          created_at?: string
          decisions?: string
          document_id?: string
          id?: string
          location?: string
          meeting_date?: string
          meeting_type?: string
          next_meeting_date?: string | null
          participants?: string[]
        }
        Relationships: [
          {
            foreignKeyName: "proces_verbaux_document_id_fkey"
            columns: ["document_id"]
            isOneToOne: false
            referencedRelation: "documents"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          airport: Database["public"]["Enums"]["airport_code"]
          created_at: string
          department: string | null
          email: string
          first_name: string
          id: string
          is_active: boolean
          last_name: string
          phone: string | null
          profile_photo: string | null
          role: Database["public"]["Enums"]["user_role"]
          updated_at: string
        }
        Insert: {
          airport: Database["public"]["Enums"]["airport_code"]
          created_at?: string
          department?: string | null
          email: string
          first_name: string
          id: string
          is_active?: boolean
          last_name: string
          phone?: string | null
          profile_photo?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          updated_at?: string
        }
        Update: {
          airport?: Database["public"]["Enums"]["airport_code"]
          created_at?: string
          department?: string | null
          email?: string
          first_name?: string
          id?: string
          is_active?: boolean
          last_name?: string
          phone?: string | null
          profile_photo?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _user_id: string
          _role: Database["public"]["Enums"]["user_role"]
        }
        Returns: boolean
      }
    }
    Enums: {
      action_status: "PENDING" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED"
      airport_code: "ENFIDHA" | "MONASTIR"
      document_status: "DRAFT" | "ACTIVE" | "ARCHIVED"
      document_type:
        | "FORMULAIRE_DOC"
        | "CORRESPONDANCE"
        | "PROCES_VERBAL"
        | "QUALITE_DOC"
        | "NOUVEAU_DOC"
        | "GENERAL"
      priority: "LOW" | "MEDIUM" | "HIGH" | "URGENT"
      user_role:
        | "SUPER_ADMIN"
        | "ADMINISTRATOR"
        | "APPROVER"
        | "USER"
        | "VISITOR"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      action_status: ["PENDING", "IN_PROGRESS", "COMPLETED", "CANCELLED"],
      airport_code: ["ENFIDHA", "MONASTIR"],
      document_status: ["DRAFT", "ACTIVE", "ARCHIVED"],
      document_type: [
        "FORMULAIRE_DOC",
        "CORRESPONDANCE",
        "PROCES_VERBAL",
        "QUALITE_DOC",
        "NOUVEAU_DOC",
        "GENERAL",
      ],
      priority: ["LOW", "MEDIUM", "HIGH", "URGENT"],
      user_role: [
        "SUPER_ADMIN",
        "ADMINISTRATOR",
        "APPROVER",
        "USER",
        "VISITOR",
      ],
    },
  },
} as const
