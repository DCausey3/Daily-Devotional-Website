export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export interface Database {
  public: {
    Tables: {
      admin_users: {
        Row: { user_id: string; email: string; created_at: string };
        Insert: { user_id: string; email: string; created_at?: string };
        Update: never;
        Relationships: [];
      };
      devotionals: {
        Row: {
          id: string;
          title: string;
          scripture_reference: string;
          topic: string;
          excerpt: string;
          body: string;
          prayer: string | null;
          status: "draft" | "published";
          created_at: string;
          published_at: string | null;
        };
        Insert: {
          id?: string;
          title: string;
          scripture_reference: string;
          topic: string;
          excerpt: string;
          body: string;
          prayer?: string | null;
          status?: "draft" | "published";
          created_at?: string;
          published_at?: string | null;
        };
        Update: Partial<Database["public"]["Tables"]["devotionals"]["Insert"]>;
        Relationships: [];
      };
      subscribers: {
        Row: {
          id: string;
          name: string;
          email: string;
          phone: string | null;
          sms_opt_in: boolean;
          status: "active" | "unsubscribed";
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          email: string;
          phone?: string | null;
          sms_opt_in?: boolean;
          status?: "active" | "unsubscribed";
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["subscribers"]["Insert"]>;
        Relationships: [];
      };
      contact_messages: {
        Row: {
          id: string;
          name: string;
          email: string;
          message: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          email: string;
          message: string;
          created_at?: string;
        };
        Update: never;
        Relationships: [];
      };
      prayer_requests: {
        Row: {
          id: string;
          name: string | null;
          email: string | null;
          message: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          name?: string | null;
          email?: string | null;
          message: string;
          created_at?: string;
        };
        Update: never;
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: {
      is_admin: { Args: Record<PropertyKey, never>; Returns: boolean };
    };
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
}

export type Devotional = Database["public"]["Tables"]["devotionals"]["Row"];
export type Subscriber = Database["public"]["Tables"]["subscribers"]["Row"];
