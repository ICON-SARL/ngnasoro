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
      accounts: {
        Row: {
          balance: number | null
          currency: string | null
          id: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          balance?: number | null
          currency?: string | null
          id?: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          balance?: number | null
          currency?: string | null
          id?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      client_activities: {
        Row: {
          activity_type: string
          client_id: string
          description: string | null
          id: string
          performed_at: string | null
          performed_by: string | null
        }
        Insert: {
          activity_type: string
          client_id: string
          description?: string | null
          id?: string
          performed_at?: string | null
          performed_by?: string | null
        }
        Update: {
          activity_type?: string
          client_id?: string
          description?: string | null
          id?: string
          performed_at?: string | null
          performed_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "client_activities_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "sfd_clients"
            referencedColumns: ["id"]
          },
        ]
      }
      client_documents: {
        Row: {
          client_id: string
          document_type: string
          document_url: string
          id: string
          uploaded_at: string | null
          verified: boolean | null
          verified_at: string | null
          verified_by: string | null
        }
        Insert: {
          client_id: string
          document_type: string
          document_url: string
          id?: string
          uploaded_at?: string | null
          verified?: boolean | null
          verified_at?: string | null
          verified_by?: string | null
        }
        Update: {
          client_id?: string
          document_type?: string
          document_url?: string
          id?: string
          uploaded_at?: string | null
          verified?: boolean | null
          verified_at?: string | null
          verified_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "client_documents_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "sfd_clients"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          full_name: string | null
          id: string
          updated_at: string | null
        }
        Insert: {
          avatar_url?: string | null
          full_name?: string | null
          id: string
          updated_at?: string | null
        }
        Update: {
          avatar_url?: string | null
          full_name?: string | null
          id?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      sfd_clients: {
        Row: {
          address: string | null
          created_at: string | null
          email: string | null
          full_name: string
          id: string
          id_number: string | null
          id_type: string | null
          kyc_level: number | null
          notes: string | null
          phone: string | null
          sfd_id: string
          status: string
          user_id: string | null
          validated_at: string | null
          validated_by: string | null
        }
        Insert: {
          address?: string | null
          created_at?: string | null
          email?: string | null
          full_name: string
          id?: string
          id_number?: string | null
          id_type?: string | null
          kyc_level?: number | null
          notes?: string | null
          phone?: string | null
          sfd_id: string
          status?: string
          user_id?: string | null
          validated_at?: string | null
          validated_by?: string | null
        }
        Update: {
          address?: string | null
          created_at?: string | null
          email?: string | null
          full_name?: string
          id?: string
          id_number?: string | null
          id_type?: string | null
          kyc_level?: number | null
          notes?: string | null
          phone?: string | null
          sfd_id?: string
          status?: string
          user_id?: string | null
          validated_at?: string | null
          validated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "sfd_clients_sfd_id_fkey"
            columns: ["sfd_id"]
            isOneToOne: false
            referencedRelation: "sfds"
            referencedColumns: ["id"]
          },
        ]
      }
      sfds: {
        Row: {
          code: string
          created_at: string | null
          id: string
          logo_url: string | null
          name: string
          region: string | null
          updated_at: string | null
        }
        Insert: {
          code: string
          created_at?: string | null
          id?: string
          logo_url?: string | null
          name: string
          region?: string | null
          updated_at?: string | null
        }
        Update: {
          code?: string
          created_at?: string | null
          id?: string
          logo_url?: string | null
          name?: string
          region?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      transactions: {
        Row: {
          amount: number
          avatar_url: string | null
          created_at: string | null
          date: string | null
          id: string
          name: string
          type: string
          user_id: string
        }
        Insert: {
          amount: number
          avatar_url?: string | null
          created_at?: string | null
          date?: string | null
          id?: string
          name: string
          type: string
          user_id: string
        }
        Update: {
          amount?: number
          avatar_url?: string | null
          created_at?: string | null
          date?: string | null
          id?: string
          name?: string
          type?: string
          user_id?: string
        }
        Relationships: []
      }
      user_sfds: {
        Row: {
          created_at: string | null
          id: string
          is_default: boolean | null
          sfd_id: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_default?: boolean | null
          sfd_id: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          is_default?: boolean | null
          sfd_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_sfds_sfd_id_fkey"
            columns: ["sfd_id"]
            isOneToOne: false
            referencedRelation: "sfds"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      create_sample_transactions: {
        Args: Record<PropertyKey, never>
        Returns: undefined
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

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof PublicSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof PublicSchema["CompositeTypes"]
    ? PublicSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never
