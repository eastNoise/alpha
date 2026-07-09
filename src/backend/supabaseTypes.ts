export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          provider: string | null;
          email: string | null;
          display_name: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          provider?: string | null;
          email?: string | null;
          display_name?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          provider?: string | null;
          email?: string | null;
          display_name?: string | null;
          updated_at?: string;
        };
        Relationships: [];
      };
      alpha_state_snapshots: {
        Row: {
          user_id: string;
          schema_version: number;
          state: Json;
          device_id: string | null;
          updated_at: string;
        };
        Insert: {
          user_id: string;
          schema_version: number;
          state: Json;
          device_id?: string | null;
          updated_at?: string;
        };
        Update: {
          schema_version?: number;
          state?: Json;
          device_id?: string | null;
          updated_at?: string;
        };
        Relationships: [];
      };
      push_tokens: {
        Row: {
          id: string;
          user_id: string;
          token: string;
          platform: string;
          enabled: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          token: string;
          platform: string;
          enabled?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          token?: string;
          platform?: string;
          enabled?: boolean;
          updated_at?: string;
        };
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
}
