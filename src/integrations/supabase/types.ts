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
          last_updated: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          balance?: number | null
          currency?: string | null
          id?: string
          last_updated?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          balance?: number | null
          currency?: string | null
          id?: string
          last_updated?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      admin_notifications: {
        Row: {
          action_link: string | null
          created_at: string
          id: string
          message: string
          read: boolean | null
          recipient_id: string | null
          recipient_role: string | null
          sender_id: string
          title: string
          type: string
        }
        Insert: {
          action_link?: string | null
          created_at?: string
          id?: string
          message: string
          read?: boolean | null
          recipient_id?: string | null
          recipient_role?: string | null
          sender_id: string
          title: string
          type: string
        }
        Update: {
          action_link?: string | null
          created_at?: string
          id?: string
          message?: string
          read?: boolean | null
          recipient_id?: string | null
          recipient_role?: string | null
          sender_id?: string
          title?: string
          type?: string
        }
        Relationships: []
      }
      admin_roles: {
        Row: {
          created_at: string
          description: string | null
          id: string
          name: string
          permissions: string[]
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          name: string
          permissions?: string[]
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          permissions?: string[]
        }
        Relationships: []
      }
      admin_users: {
        Row: {
          created_at: string
          email: string
          full_name: string
          has_2fa: boolean | null
          id: string
          last_sign_in_at: string | null
          role: string
        }
        Insert: {
          created_at?: string
          email: string
          full_name: string
          has_2fa?: boolean | null
          id: string
          last_sign_in_at?: string | null
          role: string
        }
        Update: {
          created_at?: string
          email?: string
          full_name?: string
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
          created_at: string
          details: Json | null
          device_info: string | null
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
          created_at?: string
          details?: Json | null
          device_info?: string | null
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
          created_at?: string
          details?: Json | null
          device_info?: string | null
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
      client_adhesion_requests: {
        Row: {
          address: string | null
          created_at: string | null
          email: string | null
          full_name: string
          id: string
          id_number: string | null
          id_type: string | null
          notes: string | null
          phone: string | null
          processed_at: string | null
          processed_by: string | null
          sfd_id: string
          status: string
          user_id: string | null
        }
        Insert: {
          address?: string | null
          created_at?: string | null
          email?: string | null
          full_name: string
          id?: string
          id_number?: string | null
          id_type?: string | null
          notes?: string | null
          phone?: string | null
          processed_at?: string | null
          processed_by?: string | null
          sfd_id: string
          status?: string
          user_id?: string | null
        }
        Update: {
          address?: string | null
          created_at?: string | null
          email?: string | null
          full_name?: string
          id?: string
          id_number?: string | null
          id_type?: string | null
          notes?: string | null
          phone?: string | null
          processed_at?: string | null
          processed_by?: string | null
          sfd_id?: string
          status?: string
          user_id?: string | null
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
      loan_activities: {
        Row: {
          activity_type: string
          description: string | null
          id: string
          loan_id: string
          performed_at: string
          performed_by: string | null
        }
        Insert: {
          activity_type: string
          description?: string | null
          id?: string
          loan_id: string
          performed_at?: string
          performed_by?: string | null
        }
        Update: {
          activity_type?: string
          description?: string | null
          id?: string
          loan_id?: string
          performed_at?: string
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
          created_at: string
          id: string
          loan_id: string
          payment_date: string
          payment_method: string
          status: string
          transaction_id: string | null
        }
        Insert: {
          amount: number
          created_at?: string
          id?: string
          loan_id: string
          payment_date?: string
          payment_method: string
          status?: string
          transaction_id?: string | null
        }
        Update: {
          amount?: number
          created_at?: string
          id?: string
          loan_id?: string
          payment_date?: string
          payment_method?: string
          status?: string
          transaction_id?: string | null
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
          approved_at: string | null
          approved_by: string | null
          client_id: string
          created_at: string
          created_by: string
          documents: Json | null
          duration_months: number
          guarantees: string | null
          id: string
          loan_id: string | null
          meref_decided_at: string | null
          meref_feedback: string | null
          meref_reference: string | null
          meref_status: string | null
          meref_submitted_at: string | null
          monthly_income: number | null
          purpose: string
          rejection_reason: string | null
          risk_score: number | null
          sfd_id: string
          status: string
          submitted_at: string | null
          updated_at: string
        }
        Insert: {
          amount: number
          approved_at?: string | null
          approved_by?: string | null
          client_id: string
          created_at?: string
          created_by: string
          documents?: Json | null
          duration_months: number
          guarantees?: string | null
          id?: string
          loan_id?: string | null
          meref_decided_at?: string | null
          meref_feedback?: string | null
          meref_reference?: string | null
          meref_status?: string | null
          meref_submitted_at?: string | null
          monthly_income?: number | null
          purpose: string
          rejection_reason?: string | null
          risk_score?: number | null
          sfd_id: string
          status?: string
          submitted_at?: string | null
          updated_at?: string
        }
        Update: {
          amount?: number
          approved_at?: string | null
          approved_by?: string | null
          client_id?: string
          created_at?: string
          created_by?: string
          documents?: Json | null
          duration_months?: number
          guarantees?: string | null
          id?: string
          loan_id?: string | null
          meref_decided_at?: string | null
          meref_feedback?: string | null
          meref_reference?: string | null
          meref_status?: string | null
          meref_submitted_at?: string | null
          monthly_income?: number | null
          purpose?: string
          rejection_reason?: string | null
          risk_score?: number | null
          sfd_id?: string
          status?: string
          submitted_at?: string | null
          updated_at?: string
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
            foreignKeyName: "meref_loan_requests_loan_id_fkey"
            columns: ["loan_id"]
            isOneToOne: false
            referencedRelation: "sfd_loans"
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
          description: string
          details: Json | null
          id: string
          performed_at: string
          performed_by: string | null
          request_id: string
        }
        Insert: {
          activity_type: string
          description: string
          details?: Json | null
          id?: string
          performed_at?: string
          performed_by?: string | null
          request_id: string
        }
        Update: {
          activity_type?: string
          description?: string
          details?: Json | null
          id?: string
          performed_at?: string
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
          document_type: string
          document_url: string
          filename: string
          id: string
          request_id: string
          uploaded_at: string
          uploaded_by: string
          verified: boolean | null
          verified_at: string | null
          verified_by: string | null
        }
        Insert: {
          document_type: string
          document_url: string
          filename: string
          id?: string
          request_id: string
          uploaded_at?: string
          uploaded_by: string
          verified?: boolean | null
          verified_at?: string | null
          verified_by?: string | null
        }
        Update: {
          document_type?: string
          document_url?: string
          filename?: string
          id?: string
          request_id?: string
          uploaded_at?: string
          uploaded_by?: string
          verified?: boolean | null
          verified_at?: string | null
          verified_by?: string | null
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
          api_endpoint: string | null
          api_key: string | null
          debt_income_ratio_max: number | null
          id: string
          max_loan_amount: number | null
          max_loan_duration: number | null
          min_credit_score: number | null
          updated_at: string
          updated_by: string | null
          webhook_secret: string | null
        }
        Insert: {
          api_endpoint?: string | null
          api_key?: string | null
          debt_income_ratio_max?: number | null
          id?: string
          max_loan_amount?: number | null
          max_loan_duration?: number | null
          min_credit_score?: number | null
          updated_at?: string
          updated_by?: string | null
          webhook_secret?: string | null
        }
        Update: {
          api_endpoint?: string | null
          api_key?: string | null
          debt_income_ratio_max?: number | null
          id?: string
          max_loan_amount?: number | null
          max_loan_duration?: number | null
          min_credit_score?: number | null
          updated_at?: string
          updated_by?: string | null
          webhook_secret?: string | null
        }
        Relationships: []
      }
      mobile_money_settings: {
        Row: {
          api_key: string | null
          api_url: string | null
          created_at: string | null
          id: string
          is_active: boolean | null
          provider: string
          updated_at: string | null
          webhook_secret: string
        }
        Insert: {
          api_key?: string | null
          api_url?: string | null
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          provider: string
          updated_at?: string | null
          webhook_secret: string
        }
        Update: {
          api_key?: string | null
          api_url?: string | null
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          provider?: string
          updated_at?: string | null
          webhook_secret?: string
        }
        Relationships: []
      }
      mobile_money_webhooks: {
        Row: {
          account_id: string | null
          amount: number
          created_at: string | null
          id: string
          is_verified: boolean | null
          phone_number: string
          processed_at: string | null
          provider: string
          raw_payload: Json | null
          reference_id: string
          signature: string | null
          status: string
          transaction_type: string
          user_id: string | null
        }
        Insert: {
          account_id?: string | null
          amount: number
          created_at?: string | null
          id?: string
          is_verified?: boolean | null
          phone_number: string
          processed_at?: string | null
          provider: string
          raw_payload?: Json | null
          reference_id: string
          signature?: string | null
          status?: string
          transaction_type: string
          user_id?: string | null
        }
        Update: {
          account_id?: string | null
          amount?: number
          created_at?: string | null
          id?: string
          is_verified?: boolean | null
          phone_number?: string
          processed_at?: string | null
          provider?: string
          raw_payload?: Json | null
          reference_id?: string
          signature?: string | null
          status?: string
          transaction_type?: string
          user_id?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          email: string | null
          full_name: string | null
          id: string
          updated_at: string | null
        }
        Insert: {
          avatar_url?: string | null
          email?: string | null
          full_name?: string | null
          id: string
          updated_at?: string | null
        }
        Update: {
          avatar_url?: string | null
          email?: string | null
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
      sfd_loan_plans: {
        Row: {
          created_at: string | null
          description: string | null
          fees: number
          id: string
          interest_rate: number
          is_active: boolean | null
          max_amount: number
          max_duration: number
          min_amount: number
          min_duration: number
          name: string
          requirements: string[] | null
          sfd_id: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          fees?: number
          id?: string
          interest_rate?: number
          is_active?: boolean | null
          max_amount?: number
          max_duration?: number
          min_amount?: number
          min_duration?: number
          name: string
          requirements?: string[] | null
          sfd_id?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          fees?: number
          id?: string
          interest_rate?: number
          is_active?: boolean | null
          max_amount?: number
          max_duration?: number
          min_amount?: number
          min_duration?: number
          name?: string
          requirements?: string[] | null
          sfd_id?: string | null
          updated_at?: string | null
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
          created_at: string
          disbursed_at: string | null
          duration_months: number
          id: string
          interest_rate: number
          last_payment_date: string | null
          monthly_payment: number
          next_payment_date: string | null
          purpose: string
          sfd_id: string
          status: string
          subsidy_amount: number | null
          subsidy_rate: number | null
        }
        Insert: {
          amount: number
          approved_at?: string | null
          approved_by?: string | null
          client_id: string
          created_at?: string
          disbursed_at?: string | null
          duration_months: number
          id?: string
          interest_rate: number
          last_payment_date?: string | null
          monthly_payment: number
          next_payment_date?: string | null
          purpose: string
          sfd_id: string
          status?: string
          subsidy_amount?: number | null
          subsidy_rate?: number | null
        }
        Update: {
          amount?: number
          approved_at?: string | null
          approved_by?: string | null
          client_id?: string
          created_at?: string
          disbursed_at?: string | null
          duration_months?: number
          id?: string
          interest_rate?: number
          last_payment_date?: string | null
          monthly_payment?: number
          next_payment_date?: string | null
          purpose?: string
          sfd_id?: string
          status?: string
          subsidy_amount?: number | null
          subsidy_rate?: number | null
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
          id: string
          last_updated: string
          repayment_rate: number
          sfd_id: string
          total_clients: number
          total_loans: number
        }
        Insert: {
          id?: string
          last_updated?: string
          repayment_rate?: number
          sfd_id: string
          total_clients?: number
          total_loans?: number
        }
        Update: {
          id?: string
          last_updated?: string
          repayment_rate?: number
          sfd_id?: string
          total_clients?: number
          total_loans?: number
        }
        Relationships: [
          {
            foreignKeyName: "sfd_stats_sfd_id_fkey"
            columns: ["sfd_id"]
            isOneToOne: false
            referencedRelation: "sfds"
            referencedColumns: ["id"]
          },
        ]
      }
      sfd_subsidies: {
        Row: {
          allocated_at: string
          allocated_by: string
          amount: number
          description: string | null
          end_date: string | null
          id: string
          remaining_amount: number
          sfd_id: string
          status: string
          used_amount: number
        }
        Insert: {
          allocated_at?: string
          allocated_by: string
          amount: number
          description?: string | null
          end_date?: string | null
          id?: string
          remaining_amount: number
          sfd_id: string
          status?: string
          used_amount?: number
        }
        Update: {
          allocated_at?: string
          allocated_by?: string
          amount?: number
          description?: string | null
          end_date?: string | null
          id?: string
          remaining_amount?: number
          sfd_id?: string
          status?: string
          used_amount?: number
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
          status: string | null
          updated_at: string | null
        }
        Insert: {
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
          status?: string | null
          updated_at?: string | null
        }
        Update: {
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
          status?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      subsidy_activities: {
        Row: {
          activity_type: string
          description: string | null
          id: string
          performed_at: string
          performed_by: string | null
          subsidy_id: string
        }
        Insert: {
          activity_type: string
          description?: string | null
          id?: string
          performed_at?: string
          performed_by?: string | null
          subsidy_id: string
        }
        Update: {
          activity_type?: string
          description?: string | null
          id?: string
          performed_at?: string
          performed_by?: string | null
          subsidy_id?: string
        }
        Relationships: [
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
          created_at: string
          created_by: string | null
          id: string
          is_active: boolean | null
          notification_emails: string[] | null
          threshold_amount: number
          threshold_name: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          id?: string
          is_active?: boolean | null
          notification_emails?: string[] | null
          threshold_amount: number
          threshold_name: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          id?: string
          is_active?: boolean | null
          notification_emails?: string[] | null
          threshold_amount?: number
          threshold_name?: string
        }
        Relationships: []
      }
      subsidy_request_activities: {
        Row: {
          activity_type: string
          description: string | null
          details: Json | null
          id: string
          performed_at: string
          performed_by: string
          request_id: string
        }
        Insert: {
          activity_type: string
          description?: string | null
          details?: Json | null
          id?: string
          performed_at?: string
          performed_by: string
          request_id: string
        }
        Update: {
          activity_type?: string
          description?: string | null
          details?: Json | null
          id?: string
          performed_at?: string
          performed_by?: string
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
          created_at: string
          decision_comments: string | null
          expected_impact: string | null
          id: string
          justification: string | null
          priority: string
          purpose: string
          region: string | null
          requested_by: string
          reviewed_at: string | null
          reviewed_by: string | null
          sfd_id: string
          status: string
          supporting_documents: string[] | null
        }
        Insert: {
          alert_triggered?: boolean | null
          amount: number
          created_at?: string
          decision_comments?: string | null
          expected_impact?: string | null
          id?: string
          justification?: string | null
          priority?: string
          purpose: string
          region?: string | null
          requested_by: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          sfd_id: string
          status?: string
          supporting_documents?: string[] | null
        }
        Update: {
          alert_triggered?: boolean | null
          amount?: number
          created_at?: string
          decision_comments?: string | null
          expected_impact?: string | null
          id?: string
          justification?: string | null
          priority?: string
          purpose?: string
          region?: string | null
          requested_by?: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          sfd_id?: string
          status?: string
          supporting_documents?: string[] | null
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
          amount: number
          avatar_url: string | null
          created_at: string | null
          date: string | null
          description: string | null
          id: string
          name: string
          payment_method: string | null
          reference_id: string | null
          sfd_id: string | null
          status: string | null
          type: string
          user_id: string
        }
        Insert: {
          amount: number
          avatar_url?: string | null
          created_at?: string | null
          date?: string | null
          description?: string | null
          id?: string
          name: string
          payment_method?: string | null
          reference_id?: string | null
          sfd_id?: string | null
          status?: string | null
          type: string
          user_id: string
        }
        Update: {
          amount?: number
          avatar_url?: string | null
          created_at?: string | null
          date?: string | null
          description?: string | null
          id?: string
          name?: string
          payment_method?: string | null
          reference_id?: string | null
          sfd_id?: string | null
          status?: string | null
          type?: string
          user_id?: string
        }
        Relationships: []
      }
      user_2fa: {
        Row: {
          created_at: string
          id: string
          secret_key: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          secret_key: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          secret_key?: string
          user_id?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          updated_at?: string
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
      assign_role: {
        Args: { user_id: string; role: Database["public"]["Enums"]["app_role"] }
        Returns: undefined
      }
      create_admin_user: {
        Args: {
          admin_id: string
          admin_email: string
          admin_full_name: string
          admin_role: string
        }
        Returns: undefined
      }
      create_sample_transactions: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      create_sfd_with_admin: {
        Args: { sfd_data: Json; admin_data?: Json }
        Returns: Json
      }
      get_sfd_admins: {
        Args: { sfd_id_param: string }
        Returns: {
          user_id: string
          role: string
          admin_users: Json
        }[]
      }
      has_role: {
        Args: {
          _user_id: string
          _role: Database["public"]["Enums"]["app_role"]
        }
        Returns: boolean
      }
      is_admin: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      is_same_user: {
        Args: { user_id: string }
        Returns: boolean
      }
      is_sfd_admin: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      is_sfd_admin_auth: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      is_super_admin_auth: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      propagate_client_transaction: {
        Args: { p_transaction_id: string }
        Returns: boolean
      }
      sync_client_accounts: {
        Args: { p_sfd_id: string; p_client_id?: string }
        Returns: boolean
      }
      update_subsidy_usage: {
        Args: { p_sfd_id: string; p_amount: number }
        Returns: undefined
      }
    }
    Enums: {
      app_role: "admin" | "sfd_admin" | "user" | "meref_admin"
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
      app_role: ["admin", "sfd_admin", "user", "meref_admin"],
    },
  },
} as const
