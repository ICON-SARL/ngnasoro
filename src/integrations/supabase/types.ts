export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      accounts: {
        Row: {
          balance: number | null
          created_at: string | null
          currency: string | null
          id: string
          sfd_id: string
          status: Database["public"]["Enums"]["account_status"] | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          balance?: number | null
          created_at?: string | null
          currency?: string | null
          id?: string
          sfd_id: string
          status?: Database["public"]["Enums"]["account_status"] | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          balance?: number | null
          created_at?: string | null
          currency?: string | null
          id?: string
          sfd_id?: string
          status?: Database["public"]["Enums"]["account_status"] | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "accounts_sfd_id_fkey"
            columns: ["sfd_id"]
            isOneToOne: false
            referencedRelation: "sfds"
            referencedColumns: ["id"]
          },
        ]
      }
      admin_notifications: {
        Row: {
          action_url: string | null
          created_at: string | null
          id: string
          is_read: boolean | null
          message: string
          title: string
          type: string
          user_id: string | null
        }
        Insert: {
          action_url?: string | null
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          message: string
          title: string
          type: string
          user_id?: string | null
        }
        Update: {
          action_url?: string | null
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          message?: string
          title?: string
          type?: string
          user_id?: string | null
        }
        Relationships: []
      }
      admin_roles: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          name: string
          permissions: Json | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          name: string
          permissions?: Json | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          name?: string
          permissions?: Json | null
        }
        Relationships: []
      }
      admin_users: {
        Row: {
          created_at: string | null
          email: string
          full_name: string | null
          has_2fa: boolean | null
          id: string
          last_sign_in_at: string | null
          role: string
        }
        Insert: {
          created_at?: string | null
          email: string
          full_name?: string | null
          has_2fa?: boolean | null
          id: string
          last_sign_in_at?: string | null
          role: string
        }
        Update: {
          created_at?: string | null
          email?: string
          full_name?: string | null
          has_2fa?: boolean | null
          id?: string
          last_sign_in_at?: string | null
          role?: string
        }
        Relationships: []
      }
      audit_logs: {
        Row: {
          action: string
          category: string
          created_at: string | null
          details: Json | null
          device_info: Json | null
          error_message: string | null
          id: string
          ip_address: string | null
          severity: string
          status: string
          target_resource: string | null
          user_id: string | null
        }
        Insert: {
          action: string
          category: string
          created_at?: string | null
          details?: Json | null
          device_info?: Json | null
          error_message?: string | null
          id?: string
          ip_address?: string | null
          severity: string
          status: string
          target_resource?: string | null
          user_id?: string | null
        }
        Update: {
          action?: string
          category?: string
          created_at?: string | null
          details?: Json | null
          device_info?: Json | null
          error_message?: string | null
          id?: string
          ip_address?: string | null
          severity?: string
          status?: string
          target_resource?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      client_activities: {
        Row: {
          activity_type: string
          client_id: string
          created_at: string | null
          description: string | null
          id: string
          performed_at: string | null
          performed_by: string | null
        }
        Insert: {
          activity_type: string
          client_id: string
          created_at?: string | null
          description?: string | null
          id?: string
          performed_at?: string | null
          performed_by?: string | null
        }
        Update: {
          activity_type?: string
          client_id?: string
          created_at?: string | null
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
      client_adhesion_requests: {
        Row: {
          address: string | null
          created_at: string | null
          email: string | null
          full_name: string
          id: string
          phone: string | null
          rejection_reason: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          sfd_id: string
          status: string | null
          user_id: string
        }
        Insert: {
          address?: string | null
          created_at?: string | null
          email?: string | null
          full_name: string
          id?: string
          phone?: string | null
          rejection_reason?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          sfd_id: string
          status?: string | null
          user_id: string
        }
        Update: {
          address?: string | null
          created_at?: string | null
          email?: string | null
          full_name?: string
          id?: string
          phone?: string | null
          rejection_reason?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          sfd_id?: string
          status?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "client_adhesion_requests_sfd_id_fkey"
            columns: ["sfd_id"]
            isOneToOne: false
            referencedRelation: "sfds"
            referencedColumns: ["id"]
          },
        ]
      }
      client_documents: {
        Row: {
          client_id: string
          created_at: string | null
          document_type: Database["public"]["Enums"]["document_type"]
          document_url: string
          id: string
          status: string | null
          uploaded_at: string | null
          uploaded_by: string | null
          verified: boolean | null
          verified_at: string | null
          verified_by: string | null
        }
        Insert: {
          client_id: string
          created_at?: string | null
          document_type: Database["public"]["Enums"]["document_type"]
          document_url: string
          id?: string
          status?: string | null
          uploaded_at?: string | null
          uploaded_by?: string | null
          verified?: boolean | null
          verified_at?: string | null
          verified_by?: string | null
        }
        Update: {
          client_id?: string
          created_at?: string | null
          document_type?: Database["public"]["Enums"]["document_type"]
          document_url?: string
          id?: string
          status?: string | null
          uploaded_at?: string | null
          uploaded_by?: string | null
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
      generated_reports: {
        Row: {
          completed_at: string | null
          created_at: string | null
          definition_id: string
          error: string | null
          format: string
          id: string
          parameters: Json
          result_url: string | null
          status: string | null
          user_id: string
        }
        Insert: {
          completed_at?: string | null
          created_at?: string | null
          definition_id: string
          error?: string | null
          format: string
          id?: string
          parameters: Json
          result_url?: string | null
          status?: string | null
          user_id: string
        }
        Update: {
          completed_at?: string | null
          created_at?: string | null
          definition_id?: string
          error?: string | null
          format?: string
          id?: string
          parameters?: Json
          result_url?: string | null
          status?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "generated_reports_definition_id_fkey"
            columns: ["definition_id"]
            isOneToOne: false
            referencedRelation: "report_definitions"
            referencedColumns: ["id"]
          },
        ]
      }
      loan_activities: {
        Row: {
          activity_type: string
          created_at: string | null
          description: string | null
          id: string
          loan_id: string
          performed_by: string | null
        }
        Insert: {
          activity_type: string
          created_at?: string | null
          description?: string | null
          id?: string
          loan_id: string
          performed_by?: string | null
        }
        Update: {
          activity_type?: string
          created_at?: string | null
          description?: string | null
          id?: string
          loan_id?: string
          performed_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "loan_activities_loan_id_fkey"
            columns: ["loan_id"]
            isOneToOne: false
            referencedRelation: "sfd_loans"
            referencedColumns: ["id"]
          },
        ]
      }
      loan_payments: {
        Row: {
          amount: number
          created_at: string | null
          id: string
          loan_id: string
          payment_method: Database["public"]["Enums"]["payment_method"]
          reference: string | null
          status: string | null
        }
        Insert: {
          amount: number
          created_at?: string | null
          id?: string
          loan_id: string
          payment_method: Database["public"]["Enums"]["payment_method"]
          reference?: string | null
          status?: string | null
        }
        Update: {
          amount?: number
          created_at?: string | null
          id?: string
          loan_id?: string
          payment_method?: Database["public"]["Enums"]["payment_method"]
          reference?: string | null
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "loan_payments_loan_id_fkey"
            columns: ["loan_id"]
            isOneToOne: false
            referencedRelation: "sfd_loans"
            referencedColumns: ["id"]
          },
        ]
      }
      meref_loan_requests: {
        Row: {
          amount: number
          client_id: string
          created_at: string | null
          id: string
          purpose: string
          rejection_reason: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          sfd_id: string
          status: string | null
        }
        Insert: {
          amount: number
          client_id: string
          created_at?: string | null
          id?: string
          purpose: string
          rejection_reason?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          sfd_id: string
          status?: string | null
        }
        Update: {
          amount?: number
          client_id?: string
          created_at?: string | null
          id?: string
          purpose?: string
          rejection_reason?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          sfd_id?: string
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "meref_loan_requests_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "sfd_clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "meref_loan_requests_sfd_id_fkey"
            columns: ["sfd_id"]
            isOneToOne: false
            referencedRelation: "sfds"
            referencedColumns: ["id"]
          },
        ]
      }
      meref_request_activities: {
        Row: {
          activity_type: string
          created_at: string | null
          description: string | null
          id: string
          performed_by: string | null
          request_id: string
        }
        Insert: {
          activity_type: string
          created_at?: string | null
          description?: string | null
          id?: string
          performed_by?: string | null
          request_id: string
        }
        Update: {
          activity_type?: string
          created_at?: string | null
          description?: string | null
          id?: string
          performed_by?: string | null
          request_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "meref_request_activities_request_id_fkey"
            columns: ["request_id"]
            isOneToOne: false
            referencedRelation: "meref_loan_requests"
            referencedColumns: ["id"]
          },
        ]
      }
      meref_request_documents: {
        Row: {
          created_at: string | null
          document_type: string
          document_url: string
          id: string
          request_id: string
          uploaded_by: string | null
        }
        Insert: {
          created_at?: string | null
          document_type: string
          document_url: string
          id?: string
          request_id: string
          uploaded_by?: string | null
        }
        Update: {
          created_at?: string | null
          document_type?: string
          document_url?: string
          id?: string
          request_id?: string
          uploaded_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "meref_request_documents_request_id_fkey"
            columns: ["request_id"]
            isOneToOne: false
            referencedRelation: "meref_loan_requests"
            referencedColumns: ["id"]
          },
        ]
      }
      meref_settings: {
        Row: {
          description: string | null
          id: string
          key: string
          updated_at: string | null
          value: string | null
        }
        Insert: {
          description?: string | null
          id?: string
          key: string
          updated_at?: string | null
          value?: string | null
        }
        Update: {
          description?: string | null
          id?: string
          key?: string
          updated_at?: string | null
          value?: string | null
        }
        Relationships: []
      }
      mobile_money_settings: {
        Row: {
          api_key: string | null
          api_secret: string | null
          created_at: string | null
          id: string
          is_active: boolean | null
          operator: string
          updated_at: string | null
          webhook_url: string | null
        }
        Insert: {
          api_key?: string | null
          api_secret?: string | null
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          operator: string
          updated_at?: string | null
          webhook_url?: string | null
        }
        Update: {
          api_key?: string | null
          api_secret?: string | null
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          operator?: string
          updated_at?: string | null
          webhook_url?: string | null
        }
        Relationships: []
      }
      mobile_money_webhooks: {
        Row: {
          created_at: string | null
          event_type: string
          id: string
          operator: string
          payload: Json
          processed: boolean | null
        }
        Insert: {
          created_at?: string | null
          event_type: string
          id?: string
          operator: string
          payload: Json
          processed?: boolean | null
        }
        Update: {
          created_at?: string | null
          event_type?: string
          id?: string
          operator?: string
          payload?: Json
          processed?: boolean | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          client_code: string | null
          created_at: string | null
          full_name: string | null
          id: string
          kyc_level: number | null
          phone: string | null
          updated_at: string | null
        }
        Insert: {
          avatar_url?: string | null
          client_code?: string | null
          created_at?: string | null
          full_name?: string | null
          id: string
          kyc_level?: number | null
          phone?: string | null
          updated_at?: string | null
        }
        Update: {
          avatar_url?: string | null
          client_code?: string | null
          created_at?: string | null
          full_name?: string | null
          id?: string
          kyc_level?: number | null
          phone?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      report_definitions: {
        Row: {
          created_at: string | null
          created_by: string | null
          description: string | null
          id: string
          name: string
          permissions: string[] | null
          schema: Json
          type: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          id?: string
          name: string
          permissions?: string[] | null
          schema: Json
          type: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          id?: string
          name?: string
          permissions?: string[] | null
          schema?: Json
          type?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      sfd_accounts: {
        Row: {
          account_type: string
          balance: number | null
          created_at: string | null
          currency: string | null
          id: string
          sfd_id: string
          status: string | null
          updated_at: string | null
        }
        Insert: {
          account_type: string
          balance?: number | null
          created_at?: string | null
          currency?: string | null
          id?: string
          sfd_id: string
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          account_type?: string
          balance?: number | null
          created_at?: string | null
          currency?: string | null
          id?: string
          sfd_id?: string
          status?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "sfd_accounts_sfd_id_fkey"
            columns: ["sfd_id"]
            isOneToOne: false
            referencedRelation: "sfds"
            referencedColumns: ["id"]
          },
        ]
      }
      sfd_clients: {
        Row: {
          address: string | null
          client_code: string | null
          created_at: string | null
          email: string | null
          full_name: string
          id: string
          kyc_level: number | null
          phone: string | null
          sfd_id: string
          status: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          address?: string | null
          client_code?: string | null
          created_at?: string | null
          email?: string | null
          full_name: string
          id?: string
          kyc_level?: number | null
          phone?: string | null
          sfd_id: string
          status?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          address?: string | null
          client_code?: string | null
          created_at?: string | null
          email?: string | null
          full_name?: string
          id?: string
          kyc_level?: number | null
          phone?: string | null
          sfd_id?: string
          status?: string | null
          updated_at?: string | null
          user_id?: string | null
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
      sfd_loan_plans: {
        Row: {
          created_at: string | null
          description: string | null
          duration_months: number
          id: string
          interest_rate: number
          is_active: boolean | null
          max_amount: number
          min_amount: number
          name: string
          sfd_id: string
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          duration_months: number
          id?: string
          interest_rate: number
          is_active?: boolean | null
          max_amount: number
          min_amount: number
          name: string
          sfd_id: string
        }
        Update: {
          created_at?: string | null
          description?: string | null
          duration_months?: number
          id?: string
          interest_rate?: number
          is_active?: boolean | null
          max_amount?: number
          min_amount?: number
          name?: string
          sfd_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "sfd_loan_plans_sfd_id_fkey"
            columns: ["sfd_id"]
            isOneToOne: false
            referencedRelation: "sfds"
            referencedColumns: ["id"]
          },
        ]
      }
      sfd_loans: {
        Row: {
          amount: number
          approved_at: string | null
          approved_by: string | null
          client_id: string
          created_at: string | null
          disbursed_at: string | null
          duration_months: number
          id: string
          interest_rate: number
          loan_plan_id: string | null
          monthly_payment: number
          next_payment_date: string | null
          purpose: string | null
          rejection_reason: string | null
          remaining_amount: number
          sfd_id: string
          status: Database["public"]["Enums"]["loan_status"] | null
          total_amount: number
          updated_at: string | null
        }
        Insert: {
          amount: number
          approved_at?: string | null
          approved_by?: string | null
          client_id: string
          created_at?: string | null
          disbursed_at?: string | null
          duration_months: number
          id?: string
          interest_rate: number
          loan_plan_id?: string | null
          monthly_payment: number
          next_payment_date?: string | null
          purpose?: string | null
          rejection_reason?: string | null
          remaining_amount: number
          sfd_id: string
          status?: Database["public"]["Enums"]["loan_status"] | null
          total_amount: number
          updated_at?: string | null
        }
        Update: {
          amount?: number
          approved_at?: string | null
          approved_by?: string | null
          client_id?: string
          created_at?: string | null
          disbursed_at?: string | null
          duration_months?: number
          id?: string
          interest_rate?: number
          loan_plan_id?: string | null
          monthly_payment?: number
          next_payment_date?: string | null
          purpose?: string | null
          rejection_reason?: string | null
          remaining_amount?: number
          sfd_id?: string
          status?: Database["public"]["Enums"]["loan_status"] | null
          total_amount?: number
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "sfd_loans_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "sfd_clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sfd_loans_loan_plan_id_fkey"
            columns: ["loan_plan_id"]
            isOneToOne: false
            referencedRelation: "sfd_loan_plans"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sfd_loans_sfd_id_fkey"
            columns: ["sfd_id"]
            isOneToOne: false
            referencedRelation: "sfds"
            referencedColumns: ["id"]
          },
        ]
      }
      sfd_stats: {
        Row: {
          active_loans: number | null
          defaulted_loans: number | null
          id: string
          sfd_id: string
          total_clients: number | null
          total_disbursed: number | null
          total_loans: number | null
          total_repaid: number | null
          updated_at: string | null
        }
        Insert: {
          active_loans?: number | null
          defaulted_loans?: number | null
          id?: string
          sfd_id: string
          total_clients?: number | null
          total_disbursed?: number | null
          total_loans?: number | null
          total_repaid?: number | null
          updated_at?: string | null
        }
        Update: {
          active_loans?: number | null
          defaulted_loans?: number | null
          id?: string
          sfd_id?: string
          total_clients?: number | null
          total_disbursed?: number | null
          total_loans?: number | null
          total_repaid?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "sfd_stats_sfd_id_fkey"
            columns: ["sfd_id"]
            isOneToOne: true
            referencedRelation: "sfds"
            referencedColumns: ["id"]
          },
        ]
      }
      sfd_subsidies: {
        Row: {
          amount: number
          approved_at: string | null
          approved_by: string | null
          created_at: string | null
          description: string | null
          end_date: string | null
          id: string
          name: string | null
          sfd_id: string
          sponsor_id: string | null
          start_date: string | null
          status: string | null
          used_amount: number | null
        }
        Insert: {
          amount: number
          approved_at?: string | null
          approved_by?: string | null
          created_at?: string | null
          description?: string | null
          end_date?: string | null
          id?: string
          name?: string | null
          sfd_id: string
          sponsor_id?: string | null
          start_date?: string | null
          status?: string | null
          used_amount?: number | null
        }
        Update: {
          amount?: number
          approved_at?: string | null
          approved_by?: string | null
          created_at?: string | null
          description?: string | null
          end_date?: string | null
          id?: string
          name?: string | null
          sfd_id?: string
          sponsor_id?: string | null
          start_date?: string | null
          status?: string | null
          used_amount?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "sfd_subsidies_sfd_id_fkey"
            columns: ["sfd_id"]
            isOneToOne: false
            referencedRelation: "sfds"
            referencedColumns: ["id"]
          },
        ]
      }
      sfds: {
        Row: {
          address: string | null
          code: string
          contact_email: string | null
          created_at: string | null
          description: string | null
          id: string
          legal_document_url: string | null
          logo_url: string | null
          name: string
          phone: string | null
          region: string | null
          status: Database["public"]["Enums"]["sfd_status"] | null
          subsidy_balance: number | null
          suspended_at: string | null
          suspension_reason: string | null
          updated_at: string | null
        }
        Insert: {
          address?: string | null
          code: string
          contact_email?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          legal_document_url?: string | null
          logo_url?: string | null
          name: string
          phone?: string | null
          region?: string | null
          status?: Database["public"]["Enums"]["sfd_status"] | null
          subsidy_balance?: number | null
          suspended_at?: string | null
          suspension_reason?: string | null
          updated_at?: string | null
        }
        Update: {
          address?: string | null
          code?: string
          contact_email?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          legal_document_url?: string | null
          logo_url?: string | null
          name?: string
          phone?: string | null
          region?: string | null
          status?: Database["public"]["Enums"]["sfd_status"] | null
          subsidy_balance?: number | null
          suspended_at?: string | null
          suspension_reason?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      subsidy_activities: {
        Row: {
          activity_type: string
          created_at: string | null
          description: string | null
          id: string
          performed_by: string | null
          request_id: string
          subsidy_id: string | null
        }
        Insert: {
          activity_type: string
          created_at?: string | null
          description?: string | null
          id?: string
          performed_by?: string | null
          request_id: string
          subsidy_id?: string | null
        }
        Update: {
          activity_type?: string
          created_at?: string | null
          description?: string | null
          id?: string
          performed_by?: string | null
          request_id?: string
          subsidy_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "subsidy_activities_request_id_fkey"
            columns: ["request_id"]
            isOneToOne: false
            referencedRelation: "subsidy_requests"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "subsidy_activities_subsidy_id_fkey"
            columns: ["subsidy_id"]
            isOneToOne: false
            referencedRelation: "sfd_subsidies"
            referencedColumns: ["id"]
          },
        ]
      }
      subsidy_alert_thresholds: {
        Row: {
          created_at: string | null
          critical_threshold: number | null
          id: string
          low_threshold: number | null
          sfd_id: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          critical_threshold?: number | null
          id?: string
          low_threshold?: number | null
          sfd_id: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          critical_threshold?: number | null
          id?: string
          low_threshold?: number | null
          sfd_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "subsidy_alert_thresholds_sfd_id_fkey"
            columns: ["sfd_id"]
            isOneToOne: true
            referencedRelation: "sfds"
            referencedColumns: ["id"]
          },
        ]
      }
      subsidy_request_activities: {
        Row: {
          activity_type: string
          created_at: string | null
          description: string | null
          id: string
          performed_by: string | null
          request_id: string
        }
        Insert: {
          activity_type: string
          created_at?: string | null
          description?: string | null
          id?: string
          performed_by?: string | null
          request_id: string
        }
        Update: {
          activity_type?: string
          created_at?: string | null
          description?: string | null
          id?: string
          performed_by?: string | null
          request_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "subsidy_request_activities_request_id_fkey"
            columns: ["request_id"]
            isOneToOne: false
            referencedRelation: "subsidy_requests"
            referencedColumns: ["id"]
          },
        ]
      }
      subsidy_requests: {
        Row: {
          alert_triggered: boolean | null
          amount: number
          created_at: string | null
          expected_impact: string | null
          id: string
          justification: string
          priority: string | null
          region: string | null
          rejection_reason: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          sfd_id: string
          status: string | null
        }
        Insert: {
          alert_triggered?: boolean | null
          amount: number
          created_at?: string | null
          expected_impact?: string | null
          id?: string
          justification: string
          priority?: string | null
          region?: string | null
          rejection_reason?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          sfd_id: string
          status?: string | null
        }
        Update: {
          alert_triggered?: boolean | null
          amount?: number
          created_at?: string | null
          expected_impact?: string | null
          id?: string
          justification?: string
          priority?: string | null
          region?: string | null
          rejection_reason?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          sfd_id?: string
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "subsidy_requests_sfd_id_fkey"
            columns: ["sfd_id"]
            isOneToOne: false
            referencedRelation: "sfds"
            referencedColumns: ["id"]
          },
        ]
      }
      subsidy_usage: {
        Row: {
          amount: number
          id: string
          loan_id: string
          notes: string | null
          subsidy_id: string
          used_at: string | null
        }
        Insert: {
          amount: number
          id?: string
          loan_id: string
          notes?: string | null
          subsidy_id: string
          used_at?: string | null
        }
        Update: {
          amount?: number
          id?: string
          loan_id?: string
          notes?: string | null
          subsidy_id?: string
          used_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "subsidy_usage_loan_id_fkey"
            columns: ["loan_id"]
            isOneToOne: false
            referencedRelation: "sfd_loans"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "subsidy_usage_subsidy_id_fkey"
            columns: ["subsidy_id"]
            isOneToOne: false
            referencedRelation: "sfd_subsidies"
            referencedColumns: ["id"]
          },
        ]
      }
      transaction_types: {
        Row: {
          code: string
          created_at: string | null
          description: string | null
          id: string
          name: string
        }
        Insert: {
          code: string
          created_at?: string | null
          description?: string | null
          id?: string
          name: string
        }
        Update: {
          code?: string
          created_at?: string | null
          description?: string | null
          id?: string
          name?: string
        }
        Relationships: []
      }
      transactions: {
        Row: {
          account_id: string | null
          amount: number
          created_at: string | null
          created_by: string | null
          description: string | null
          id: string
          payment_method: Database["public"]["Enums"]["payment_method"] | null
          reference: string | null
          sfd_id: string
          status: Database["public"]["Enums"]["transaction_status"] | null
          type: string
          user_id: string
        }
        Insert: {
          account_id?: string | null
          amount: number
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          id?: string
          payment_method?: Database["public"]["Enums"]["payment_method"] | null
          reference?: string | null
          sfd_id: string
          status?: Database["public"]["Enums"]["transaction_status"] | null
          type: string
          user_id: string
        }
        Update: {
          account_id?: string | null
          amount?: number
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          id?: string
          payment_method?: Database["public"]["Enums"]["payment_method"] | null
          reference?: string | null
          sfd_id?: string
          status?: Database["public"]["Enums"]["transaction_status"] | null
          type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "transactions_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transactions_sfd_id_fkey"
            columns: ["sfd_id"]
            isOneToOne: false
            referencedRelation: "sfds"
            referencedColumns: ["id"]
          },
        ]
      }
      user_2fa: {
        Row: {
          backup_codes: string[] | null
          created_at: string | null
          enabled: boolean | null
          id: string
          secret: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          backup_codes?: string[] | null
          created_at?: string | null
          enabled?: boolean | null
          id?: string
          secret: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          backup_codes?: string[] | null
          created_at?: string | null
          enabled?: boolean | null
          id?: string
          secret?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string | null
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
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
      generate_client_code: {
        Args: { sfd_code: string }
        Returns: string
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      account_status: "active" | "inactive" | "frozen" | "closed"
      app_role: "admin" | "sfd_admin" | "client" | "user"
      document_type:
        | "identity"
        | "proof_of_address"
        | "bank_statement"
        | "other"
      loan_status:
        | "pending"
        | "approved"
        | "active"
        | "completed"
        | "defaulted"
        | "rejected"
      payment_method: "cash" | "bank_transfer" | "mobile_money" | "check"
      sfd_status: "active" | "suspended" | "pending" | "inactive"
      transaction_status: "completed" | "pending" | "failed" | "cancelled"
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
    Enums: {
      account_status: ["active", "inactive", "frozen", "closed"],
      app_role: ["admin", "sfd_admin", "client", "user"],
      document_type: [
        "identity",
        "proof_of_address",
        "bank_statement",
        "other",
      ],
      loan_status: [
        "pending",
        "approved",
        "active",
        "completed",
        "defaulted",
        "rejected",
      ],
      payment_method: ["cash", "bank_transfer", "mobile_money", "check"],
      sfd_status: ["active", "suspended", "pending", "inactive"],
      transaction_status: ["completed", "pending", "failed", "cancelled"],
    },
  },
} as const
