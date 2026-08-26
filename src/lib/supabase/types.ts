// GENERATED from the Supabase schema. Do not hand-edit.
// Regenerate with: pnpm db:types  (requires `supabase login` once)
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  __InternalSupabase: { PostgrestVersion: "14.17" };
  public: {
    Tables: {
      account_members: {
        Row: {
          account_id: string;
          created_at: string;
          relation: string | null;
          role: Database["public"]["Enums"]["account_role"];
          user_id: string;
        };
        Insert: {
          account_id: string;
          created_at?: string;
          relation?: string | null;
          role: Database["public"]["Enums"]["account_role"];
          user_id: string;
        };
        Update: {
          account_id?: string;
          created_at?: string;
          relation?: string | null;
          role?: Database["public"]["Enums"]["account_role"];
          user_id?: string;
        };
        Relationships: [];
      };
      accounts: {
        Row: { created_at: string; display_name: string; id: string; language: string; timezone: string };
        Insert: { created_at?: string; display_name: string; id?: string; language?: string; timezone?: string };
        Update: { created_at?: string; display_name?: string; id?: string; language?: string; timezone?: string };
        Relationships: [];
      };
      daily_checkins: {
        Row: {
          account_id: string;
          comment: string | null;
          created_at: string;
          id: string;
          local_date: string;
          mood: Database["public"]["Enums"]["mood_level"];
        };
        Insert: {
          account_id: string;
          comment?: string | null;
          created_at?: string;
          id?: string;
          local_date: string;
          mood: Database["public"]["Enums"]["mood_level"];
        };
        Update: {
          account_id?: string;
          comment?: string | null;
          created_at?: string;
          id?: string;
          local_date?: string;
          mood?: Database["public"]["Enums"]["mood_level"];
        };
        Relationships: [];
      };
      health_documents: {
        Row: {
          account_id: string;
          created_at: string;
          doc_date: string | null;
          doc_type: string | null;
          id: string;
          notes: string | null;
          source: string | null;
          storage_path: string;
          title: string;
        };
        Insert: {
          account_id: string;
          created_at?: string;
          doc_date?: string | null;
          doc_type?: string | null;
          id?: string;
          notes?: string | null;
          source?: string | null;
          storage_path: string;
          title: string;
        };
        Update: {
          account_id?: string;
          created_at?: string;
          doc_date?: string | null;
          doc_type?: string | null;
          id?: string;
          notes?: string | null;
          source?: string | null;
          storage_path?: string;
          title?: string;
        };
        Relationships: [];
      };
      health_measurements: {
        Row: {
          account_id: string;
          created_at: string;
          id: string;
          measured_at: string;
          note: string | null;
          type: Database["public"]["Enums"]["measurement_type"];
          unit: string;
          value: number;
          value_secondary: number | null;
        };
        Insert: {
          account_id: string;
          created_at?: string;
          id?: string;
          measured_at?: string;
          note?: string | null;
          type: Database["public"]["Enums"]["measurement_type"];
          unit: string;
          value: number;
          value_secondary?: number | null;
        };
        Update: {
          account_id?: string;
          created_at?: string;
          id?: string;
          measured_at?: string;
          note?: string | null;
          type?: Database["public"]["Enums"]["measurement_type"];
          unit?: string;
          value?: number;
          value_secondary?: number | null;
        };
        Relationships: [];
      };
      medication_logs: {
        Row: {
          account_id: string;
          confirmed_at: string | null;
          created_at: string;
          created_by: string | null;
          id: string;
          local_date: string;
          medication_id: string;
          slot: Database["public"]["Enums"]["time_of_day"];
          status: Database["public"]["Enums"]["medication_status"];
        };
        Insert: {
          account_id: string;
          confirmed_at?: string | null;
          created_at?: string;
          created_by?: string | null;
          id?: string;
          local_date: string;
          medication_id: string;
          slot: Database["public"]["Enums"]["time_of_day"];
          status: Database["public"]["Enums"]["medication_status"];
        };
        Update: {
          account_id?: string;
          confirmed_at?: string | null;
          created_at?: string;
          created_by?: string | null;
          id?: string;
          local_date?: string;
          medication_id?: string;
          slot?: Database["public"]["Enums"]["time_of_day"];
          status?: Database["public"]["Enums"]["medication_status"];
        };
        Relationships: [];
      };
      medications: {
        Row: {
          account_id: string;
          archived_at: string | null;
          condition_tag: string | null;
          created_at: string;
          id: string;
          name: string;
          remarks: string | null;
          times_of_day: Database["public"]["Enums"]["time_of_day"][];
        };
        Insert: {
          account_id: string;
          archived_at?: string | null;
          condition_tag?: string | null;
          created_at?: string;
          id?: string;
          name: string;
          remarks?: string | null;
          times_of_day: Database["public"]["Enums"]["time_of_day"][];
        };
        Update: {
          account_id?: string;
          archived_at?: string | null;
          condition_tag?: string | null;
          created_at?: string;
          id?: string;
          name?: string;
          remarks?: string | null;
          times_of_day?: Database["public"]["Enums"]["time_of_day"][];
        };
        Relationships: [];
      };
      profiles: {
        Row: { created_at: string; full_name: string | null; id: string };
        Insert: { created_at?: string; full_name?: string | null; id: string };
        Update: { created_at?: string; full_name?: string | null; id?: string };
        Relationships: [];
      };
      push_subscriptions: {
        Row: {
          account_id: string;
          auth: string;
          created_at: string;
          endpoint: string;
          id: string;
          p256dh: string;
          user_id: string;
        };
        Insert: {
          account_id: string;
          auth: string;
          created_at?: string;
          endpoint: string;
          id?: string;
          p256dh: string;
          user_id: string;
        };
        Update: {
          account_id?: string;
          auth?: string;
          created_at?: string;
          endpoint?: string;
          id?: string;
          p256dh?: string;
          user_id?: string;
        };
        Relationships: [];
      };
      trusted_contacts: {
        Row: {
          account_id: string;
          created_at: string;
          id: string;
          name: string;
          phone: string;
          relation: string | null;
        };
        Insert: {
          account_id: string;
          created_at?: string;
          id?: string;
          name: string;
          phone: string;
          relation?: string | null;
        };
        Update: {
          account_id?: string;
          created_at?: string;
          id?: string;
          name?: string;
          phone?: string;
          relation?: string | null;
        };
        Relationships: [];
      };
      walk_checkins: {
        Row: {
          account_id: string;
          created_at: string;
          did_walk: boolean;
          duration_minutes: number | null;
          id: string;
          local_date: string;
        };
        Insert: {
          account_id: string;
          created_at?: string;
          did_walk: boolean;
          duration_minutes?: number | null;
          id?: string;
          local_date: string;
        };
        Update: {
          account_id?: string;
          created_at?: string;
          did_walk?: boolean;
          duration_minutes?: number | null;
          id?: string;
          local_date?: string;
        };
        Relationships: [];
      };
    };
    Views: Record<never, never>;
    Functions: {
      create_account: {
        Args: { p_display_name: string; p_language?: string };
        Returns: string;
      };
    };
    Enums: {
      account_role: "owner" | "family";
      measurement_type: "blood_pressure" | "blood_sugar" | "weight";
      medication_status: "confirmed" | "skipped" | "unconfirmed";
      mood_level: "not_good" | "good" | "very_good";
      time_of_day: "morning" | "afternoon" | "evening";
    };
    CompositeTypes: Record<never, never>;
  };
};

type DefaultSchema = Database["public"];

export type Tables<T extends keyof DefaultSchema["Tables"]> =
  DefaultSchema["Tables"][T]["Row"];
export type TablesInsert<T extends keyof DefaultSchema["Tables"]> =
  DefaultSchema["Tables"][T]["Insert"];
export type TablesUpdate<T extends keyof DefaultSchema["Tables"]> =
  DefaultSchema["Tables"][T]["Update"];
export type Enums<T extends keyof DefaultSchema["Enums"]> =
  DefaultSchema["Enums"][T];

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
} as const;
