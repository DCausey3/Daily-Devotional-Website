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
      devotional_email_deliveries: {
        Row: {
          id: string;
          devotional_id: string;
          subscriber_id: string | null;
          recipient_email: string;
          status: "queued" | "sending" | "sent" | "delivered" | "failed";
          attempt_count: number;
          provider_message_id: string | null;
          error_message: string | null;
          sent_at: string | null;
          delivered_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          devotional_id: string;
          subscriber_id?: string | null;
          recipient_email: string;
          status?: "queued" | "sending" | "sent" | "delivered" | "failed";
          attempt_count?: number;
          provider_message_id?: string | null;
          error_message?: string | null;
          sent_at?: string | null;
          delivered_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["devotional_email_deliveries"]["Insert"]>;
        Relationships: [];
      };
      devotional_email_events: {
        Row: {
          provider_event_id: string;
          delivery_id: string;
          event_type: "delivered" | "failed" | "opened" | "clicked";
          clicked_url: string | null;
          occurred_at: string;
        };
        Insert: {
          provider_event_id: string;
          delivery_id: string;
          event_type: "delivered" | "failed" | "opened" | "clicked";
          clicked_url?: string | null;
          occurred_at: string;
        };
        Update: never;
        Relationships: [];
      };
      subscribers: {
        Row: {
          id: string;
          name: string;
          email: string;
          phone: string | null;
          email_opt_in: boolean;
          email_status: "pending" | "confirmed" | "unsubscribed";
          email_confirmed_at: string | null;
          email_confirmation_token_hash: string | null;
          email_confirmation_expires_at: string | null;
          email_confirmation_error: string | null;
          email_opt_in_at: string | null;
          email_unsubscribed_at: string | null;
          sms_opt_in: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          email: string;
          phone?: string | null;
          email_opt_in?: boolean;
          email_status?: "pending" | "confirmed" | "unsubscribed";
          email_confirmed_at?: string | null;
          email_confirmation_token_hash?: string | null;
          email_confirmation_expires_at?: string | null;
          email_confirmation_error?: string | null;
          email_opt_in_at?: string | null;
          email_unsubscribed_at?: string | null;
          sms_opt_in?: boolean;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["subscribers"]["Insert"]>;
        Relationships: [];
      };
      subscriber_preference_tokens: {
        Row: { token_hash: string; subscriber_id: string; created_at: string };
        Insert: { token_hash: string; subscriber_id: string; created_at?: string };
        Update: never;
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
export type DevotionalEmailDelivery =
  Database["public"]["Tables"]["devotional_email_deliveries"]["Row"];
export type DevotionalEmailEvent = Database["public"]["Tables"]["devotional_email_events"]["Row"];
