// GENERATED from the Supabase schema. Do not hand-edit.
// Regenerate with: pnpm db:types  (needs SUPABASE_ACCESS_TOKEN in the env)

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
    PostgrestVersion: "14.17"
  }
  public: {
    Tables: {
      account_members: {
        Row: {
          account_id: string
          created_at: string
          relation: string | null
          role: Database["public"]["Enums"]["account_role"]
          user_id: string
        }
        Insert: {
          account_id: string
          created_at?: string
          relation?: string | null
          role: Database["public"]["Enums"]["account_role"]
          user_id: string
        }
        Update: {
          account_id?: string
          created_at?: string
          relation?: string | null
          role?: Database["public"]["Enums"]["account_role"]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "account_members_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "account_members_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      accounts: {
        Row: {
          avatar_path: string | null
          created_at: string
          display_name: string
          id: string
          language: string
          timezone: string
        }
        Insert: {
          avatar_path?: string | null
          created_at?: string
          display_name: string
          id?: string
          language?: string
          timezone?: string
        }
        Update: {
          avatar_path?: string | null
          created_at?: string
          display_name?: string
          id?: string
          language?: string
          timezone?: string
        }
        Relationships: []
      }
      daily_checkins: {
        Row: {
          account_id: string
          comment: string | null
          created_at: string
          id: string
          local_date: string
          mood: Database["public"]["Enums"]["mood_level"]
        }
        Insert: {
          account_id: string
          comment?: string | null
          created_at?: string
          id?: string
          local_date: string
          mood: Database["public"]["Enums"]["mood_level"]
        }
        Update: {
          account_id?: string
          comment?: string | null
          created_at?: string
          id?: string
          local_date?: string
          mood?: Database["public"]["Enums"]["mood_level"]
        }
        Relationships: [
          {
            foreignKeyName: "daily_checkins_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "accounts"
            referencedColumns: ["id"]
          },
        ]
      }
      health_documents: {
        Row: {
          account_id: string
          created_at: string
          doc_date: string | null
          doc_type: string | null
          id: string
          notes: string | null
          source: string | null
          storage_path: string
          title: string
        }
        Insert: {
          account_id: string
          created_at?: string
          doc_date?: string | null
          doc_type?: string | null
          id?: string
          notes?: string | null
          source?: string | null
          storage_path: string
          title: string
        }
        Update: {
          account_id?: string
          created_at?: string
          doc_date?: string | null
          doc_type?: string | null
          id?: string
          notes?: string | null
          source?: string | null
          storage_path?: string
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "health_documents_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "accounts"
            referencedColumns: ["id"]
          },
        ]
      }
      health_measurements: {
        Row: {
          account_id: string
          created_at: string
          id: string
          measured_at: string
          note: string | null
          type: Database["public"]["Enums"]["measurement_type"]
          unit: string
          value: number
          value_secondary: number | null
        }
        Insert: {
          account_id: string
          created_at?: string
          id?: string
          measured_at?: string
          note?: string | null
          type: Database["public"]["Enums"]["measurement_type"]
          unit: string
          value: number
          value_secondary?: number | null
        }
        Update: {
          account_id?: string
          created_at?: string
          id?: string
          measured_at?: string
          note?: string | null
          type?: Database["public"]["Enums"]["measurement_type"]
          unit?: string
          value?: number
          value_secondary?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "health_measurements_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "accounts"
            referencedColumns: ["id"]
          },
        ]
      }
      medication_logs: {
        Row: {
          account_id: string
          confirmed_at: string | null
          created_at: string
          created_by: string | null
          id: string
          local_date: string
          medication_id: string
          slot: Database["public"]["Enums"]["time_of_day"]
          status: Database["public"]["Enums"]["medication_status"]
        }
        Insert: {
          account_id: string
          confirmed_at?: string | null
          created_at?: string
          created_by?: string | null
          id?: string
          local_date: string
          medication_id: string
          slot: Database["public"]["Enums"]["time_of_day"]
          status: Database["public"]["Enums"]["medication_status"]
        }
        Update: {
          account_id?: string
          confirmed_at?: string | null
          created_at?: string
          created_by?: string | null
          id?: string
          local_date?: string
          medication_id?: string
          slot?: Database["public"]["Enums"]["time_of_day"]
          status?: Database["public"]["Enums"]["medication_status"]
        }
        Relationships: [
          {
            foreignKeyName: "medication_logs_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "medication_logs_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "medication_logs_medication_id_fkey"
            columns: ["medication_id"]
            isOneToOne: false
            referencedRelation: "medications"
            referencedColumns: ["id"]
          },
        ]
      }
      medications: {
        Row: {
          account_id: string
          archived_at: string | null
          condition_tag: string | null
          created_at: string
          id: string
          name: string
          remarks: string | null
          times_of_day: Database["public"]["Enums"]["time_of_day"][]
        }
        Insert: {
          account_id: string
          archived_at?: string | null
          condition_tag?: string | null
          created_at?: string
          id?: string
          name: string
          remarks?: string | null
          times_of_day: Database["public"]["Enums"]["time_of_day"][]
        }
        Update: {
          account_id?: string
          archived_at?: string | null
          condition_tag?: string | null
          created_at?: string
          id?: string
          name?: string
          remarks?: string | null
          times_of_day?: Database["public"]["Enums"]["time_of_day"][]
        }
        Relationships: [
          {
            foreignKeyName: "medications_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "accounts"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          full_name: string | null
          id: string
        }
        Insert: {
          created_at?: string
          full_name?: string | null
          id: string
        }
        Update: {
          created_at?: string
          full_name?: string | null
          id?: string
        }
        Relationships: []
      }
      push_subscriptions: {
        Row: {
          account_id: string
          auth: string
          created_at: string
          endpoint: string
          id: string
          p256dh: string
          user_id: string
        }
        Insert: {
          account_id: string
          auth: string
          created_at?: string
          endpoint: string
          id?: string
          p256dh: string
          user_id: string
        }
        Update: {
          account_id?: string
          auth?: string
          created_at?: string
          endpoint?: string
          id?: string
          p256dh?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "push_subscriptions_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "push_subscriptions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      walk_checkins: {
        Row: {
          account_id: string
          created_at: string
          did_walk: boolean
          duration_minutes: number | null
          id: string
          local_date: string
        }
        Insert: {
          account_id: string
          created_at?: string
          did_walk: boolean
          duration_minutes?: number | null
          id?: string
          local_date: string
        }
        Update: {
          account_id?: string
          created_at?: string
          did_walk?: boolean
          duration_minutes?: number | null
          id?: string
          local_date?: string
        }
        Relationships: [
          {
            foreignKeyName: "walk_checkins_account_id_fkey"
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
      create_account: {
        Args: { p_display_name: string; p_language?: string }
        Returns: string
      }
    }
    Enums: {
      account_role: "owner" | "family"
      measurement_type: "blood_pressure" | "blood_sugar" | "weight"
      medication_status: "confirmed" | "skipped" | "unconfirmed"
      mood_level: "not_good" | "good" | "very_good"
      time_of_day: "morning" | "afternoon" | "evening"
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
      account_role: ["owner", "family"],
      measurement_type: ["blood_pressure", "blood_sugar", "weight"],
      medication_status: ["confirmed", "skipped", "unconfirmed"],
      mood_level: ["not_good", "good", "very_good"],
      time_of_day: ["morning", "afternoon", "evening"],
    },
  },
} as const
