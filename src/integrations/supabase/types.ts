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
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      activity_events: {
        Row: {
          created_at: string
          duration_ms: number
          id: string
          label: string | null
          metadata: Json
          path: string | null
          session_id: string | null
          session_key: string
          step: string | null
          type: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          duration_ms?: number
          id?: string
          label?: string | null
          metadata?: Json
          path?: string | null
          session_id?: string | null
          session_key: string
          step?: string | null
          type?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          duration_ms?: number
          id?: string
          label?: string | null
          metadata?: Json
          path?: string | null
          session_id?: string | null
          session_key?: string
          step?: string | null
          type?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "activity_events_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "activity_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      activity_sessions: {
        Row: {
          created_at: string
          device: string
          ended_at: string | null
          engaged_ms: number
          entry_label: string | null
          entry_path: string
          exit_label: string | null
          exit_path: string | null
          id: string
          is_bounce: boolean
          last_seen_at: string
          onboarding_done: boolean
          onboarding_step: string | null
          plan: string | null
          referrer: string | null
          screen_count: number
          session_key: string
          started_at: string
          updated_at: string
          user_id: string | null
          utm: Json
        }
        Insert: {
          created_at?: string
          device?: string
          ended_at?: string | null
          engaged_ms?: number
          entry_label?: string | null
          entry_path?: string
          exit_label?: string | null
          exit_path?: string | null
          id?: string
          is_bounce?: boolean
          last_seen_at?: string
          onboarding_done?: boolean
          onboarding_step?: string | null
          plan?: string | null
          referrer?: string | null
          screen_count?: number
          session_key: string
          started_at?: string
          updated_at?: string
          user_id?: string | null
          utm?: Json
        }
        Update: {
          created_at?: string
          device?: string
          ended_at?: string | null
          engaged_ms?: number
          entry_label?: string | null
          entry_path?: string
          exit_label?: string | null
          exit_path?: string | null
          id?: string
          is_bounce?: boolean
          last_seen_at?: string
          onboarding_done?: boolean
          onboarding_step?: string | null
          plan?: string | null
          referrer?: string | null
          screen_count?: number
          session_key?: string
          started_at?: string
          updated_at?: string
          user_id?: string | null
          utm?: Json
        }
        Relationships: []
      }
      ai_config: {
        Row: {
          id: string
          key: string
          updated_at: string
          updated_by: string | null
          value: Json
          version: number
        }
        Insert: {
          id?: string
          key: string
          updated_at?: string
          updated_by?: string | null
          value?: Json
          version?: number
        }
        Update: {
          id?: string
          key?: string
          updated_at?: string
          updated_by?: string | null
          value?: Json
          version?: number
        }
        Relationships: []
      }
      ai_config_history: {
        Row: {
          created_at: string
          id: string
          key: string
          updated_by: string | null
          value: Json
          version: number
        }
        Insert: {
          created_at?: string
          id?: string
          key: string
          updated_by?: string | null
          value: Json
          version: number
        }
        Update: {
          created_at?: string
          id?: string
          key?: string
          updated_by?: string | null
          value?: Json
          version?: number
        }
        Relationships: []
      }
      ai_limits: {
        Row: {
          daily_call_limit: number
          daily_token_limit: number
          id: string
          scope: string
          updated_at: string
          updated_by: string | null
          user_id: string | null
        }
        Insert: {
          daily_call_limit?: number
          daily_token_limit?: number
          id?: string
          scope?: string
          updated_at?: string
          updated_by?: string | null
          user_id?: string | null
        }
        Update: {
          daily_call_limit?: number
          daily_token_limit?: number
          id?: string
          scope?: string
          updated_at?: string
          updated_by?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      ai_usage: {
        Row: {
          created_at: string
          error_message: string | null
          id: string
          latency_ms: number
          materia: string | null
          model: string
          success: boolean
          tokens_in: number
          tokens_out: number
          user_id: string | null
        }
        Insert: {
          created_at?: string
          error_message?: string | null
          id?: string
          latency_ms?: number
          materia?: string | null
          model: string
          success?: boolean
          tokens_in?: number
          tokens_out?: number
          user_id?: string | null
        }
        Update: {
          created_at?: string
          error_message?: string | null
          id?: string
          latency_ms?: number
          materia?: string | null
          model?: string
          success?: boolean
          tokens_in?: number
          tokens_out?: number
          user_id?: string | null
        }
        Relationships: []
      }
      app_state: {
        Row: {
          data: Json
          key: string
          updated_at: string
        }
        Insert: {
          data: Json
          key: string
          updated_at?: string
        }
        Update: {
          data?: Json
          key?: string
          updated_at?: string
        }
        Relationships: []
      }
      billing_audit: {
        Row: {
          created_at: string
          detail: Json
          environment: string
          event: string
          id: string
          message: string | null
          ok: boolean
          source: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          detail?: Json
          environment: string
          event: string
          id?: string
          message?: string | null
          ok?: boolean
          source?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          detail?: Json
          environment?: string
          event?: string
          id?: string
          message?: string | null
          ok?: boolean
          source?: string
          user_id?: string | null
        }
        Relationships: []
      }
      client_errors: {
        Row: {
          created_at: string
          id: string
          ip_hash: string | null
          message: string
          route: string | null
          stack: string | null
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          ip_hash?: string | null
          message: string
          route?: string | null
          stack?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          ip_hash?: string | null
          message?: string
          route?: string | null
          stack?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      content: {
        Row: {
          collection: string
          data: Json
          id: string
          updated_at: string
        }
        Insert: {
          collection: string
          data: Json
          id: string
          updated_at?: string
        }
        Update: {
          collection?: string
          data?: Json
          id?: string
          updated_at?: string
        }
        Relationships: []
      }
      disputes: {
        Row: {
          amount: number | null
          charge_id: string | null
          created_at: string
          currency: string | null
          environment: string
          evidence_due_by: string | null
          id: string
          payment_intent_id: string | null
          reason: string | null
          status: string | null
          stripe_dispute_id: string
          updated_at: string
          user_id: string | null
        }
        Insert: {
          amount?: number | null
          charge_id?: string | null
          created_at?: string
          currency?: string | null
          environment: string
          evidence_due_by?: string | null
          id?: string
          payment_intent_id?: string | null
          reason?: string | null
          status?: string | null
          stripe_dispute_id: string
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          amount?: number | null
          charge_id?: string | null
          created_at?: string
          currency?: string | null
          environment?: string
          evidence_due_by?: string | null
          id?: string
          payment_intent_id?: string | null
          reason?: string | null
          status?: string | null
          stripe_dispute_id?: string
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      evidence_events: {
        Row: {
          created_at: string
          environment: string
          event: string
          id: string
          ip: string | null
          locale: string | null
          metadata: Json
          referer: string | null
          timezone: string | null
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string
          environment?: string
          event: string
          id?: string
          ip?: string | null
          locale?: string | null
          metadata?: Json
          referer?: string | null
          timezone?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string
          environment?: string
          event?: string
          id?: string
          ip?: string | null
          locale?: string | null
          metadata?: Json
          referer?: string | null
          timezone?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          data: Json
          email: string
          id: string
          role: string
          updated_at: string
        }
        Insert: {
          data?: Json
          email: string
          id: string
          role?: string
          updated_at?: string
        }
        Update: {
          data?: Json
          email?: string
          id?: string
          role?: string
          updated_at?: string
        }
        Relationships: []
      }
      rag_chunks: {
        Row: {
          content: string
          created_at: string
          embedding: string
          id: string
          materia: string | null
          metadata: Json
          source_id: string
          source_type: string
        }
        Insert: {
          content: string
          created_at?: string
          embedding: string
          id?: string
          materia?: string | null
          metadata?: Json
          source_id: string
          source_type: string
        }
        Update: {
          content?: string
          created_at?: string
          embedding?: string
          id?: string
          materia?: string | null
          metadata?: Json
          source_id?: string
          source_type?: string
        }
        Relationships: []
      }
      reminder_events: {
        Row: {
          created_at: string
          id: string
          payload: Json
          reminder_id: string
          scheduled_for: string
          sent_at: string | null
          status: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          payload?: Json
          reminder_id: string
          scheduled_for: string
          sent_at?: string | null
          status?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          payload?: Json
          reminder_id?: string
          scheduled_for?: string
          sent_at?: string | null
          status?: string
          user_id?: string
        }
        Relationships: []
      }
      report_admin_notes: {
        Row: {
          notes: string
          report_id: string
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          notes?: string
          report_id: string
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          notes?: string
          report_id?: string
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: []
      }
      reports: {
        Row: {
          data: Json
          id: string
          updated_at: string
          user_id: string | null
        }
        Insert: {
          data: Json
          id: string
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          data?: Json
          id?: string
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      stripe_events: {
        Row: {
          environment: string
          error_message: string | null
          id: string
          payload: Json
          processed_at: string | null
          received_at: string
          status: string
          stripe_customer_id: string | null
          stripe_event_id: string
          stripe_subscription_id: string | null
          type: string
          user_id: string | null
        }
        Insert: {
          environment: string
          error_message?: string | null
          id?: string
          payload?: Json
          processed_at?: string | null
          received_at?: string
          status?: string
          stripe_customer_id?: string | null
          stripe_event_id: string
          stripe_subscription_id?: string | null
          type: string
          user_id?: string | null
        }
        Update: {
          environment?: string
          error_message?: string | null
          id?: string
          payload?: Json
          processed_at?: string | null
          received_at?: string
          status?: string
          stripe_customer_id?: string | null
          stripe_event_id?: string
          stripe_subscription_id?: string | null
          type?: string
          user_id?: string | null
        }
        Relationships: []
      }
      subscriptions: {
        Row: {
          cancel_at_period_end: boolean | null
          created_at: string | null
          current_period_end: string | null
          current_period_start: string | null
          environment: string
          id: string
          price_id: string
          product_id: string
          status: string
          stripe_customer_id: string
          stripe_subscription_id: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          cancel_at_period_end?: boolean | null
          created_at?: string | null
          current_period_end?: string | null
          current_period_start?: string | null
          environment?: string
          id?: string
          price_id: string
          product_id: string
          status?: string
          stripe_customer_id: string
          stripe_subscription_id: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          cancel_at_period_end?: boolean | null
          created_at?: string | null
          current_period_end?: string | null
          current_period_start?: string | null
          environment?: string
          id?: string
          price_id?: string
          product_id?: string
          status?: string
          stripe_customer_id?: string
          stripe_subscription_id?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      user_state: {
        Row: {
          collection: string
          data: Json
          updated_at: string
          user_id: string
        }
        Insert: {
          collection: string
          data: Json
          updated_at?: string
          user_id: string
        }
        Update: {
          collection?: string
          data?: Json
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      yaris_messages: {
        Row: {
          created_at: string
          error_message: string | null
          fuente: string
          id: string
          latency_ms: number
          materia: string | null
          pre_answer: boolean
          pregunta: string
          question_text: string | null
          respuesta: string
          seccion: string | null
          success: boolean
          tokens_in: number
          tokens_out: number
          tono: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string
          error_message?: string | null
          fuente?: string
          id?: string
          latency_ms?: number
          materia?: string | null
          pre_answer?: boolean
          pregunta?: string
          question_text?: string | null
          respuesta?: string
          seccion?: string | null
          success?: boolean
          tokens_in?: number
          tokens_out?: number
          tono?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string
          error_message?: string | null
          fuente?: string
          id?: string
          latency_ms?: number
          materia?: string | null
          pre_answer?: boolean
          pregunta?: string
          question_text?: string | null
          respuesta?: string
          seccion?: string | null
          success?: boolean
          tokens_in?: number
          tokens_out?: number
          tono?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      admin_activity_by_screen: {
        Args: { days_back?: number }
        Returns: {
          avg_ms: number
          bounce_rate: number
          bounces: number
          entries: number
          exits: number
          label: string
          path: string
          views: number
        }[]
      }
      admin_activity_funnel: {
        Args: { days_back?: number }
        Returns: {
          people: number
          sessions: number
          step: string
        }[]
      }
      admin_activity_overview: { Args: { days_back?: number }; Returns: Json }
      admin_activity_user_timeline: {
        Args: { max_rows?: number; target_user: string }
        Returns: {
          created_at: string
          duration_ms: number
          label: string
          metadata: Json
          path: string
          step: string
          type: string
        }[]
      }
      admin_activity_users: {
        Args: { days_back?: number; max_rows?: number }
        Returns: {
          bounces: number
          email: string
          engaged_ms: number
          last_label: string
          last_path: string
          last_seen: string
          nombre: string
          onboarding_done: boolean
          plan: string
          screens: number
          sessions: number
          user_id: string
        }[]
      }
      admin_ai_daily: {
        Args: { days_back?: number }
        Returns: {
          avg_latency_ms: number
          calls: number
          day: string
          errors: number
          tokens_in: number
          tokens_out: number
        }[]
      }
      admin_ai_stats: { Args: { hours_back?: number }; Returns: Json }
      admin_mrr: { Args: { check_env?: string }; Returns: number }
      admin_mrr_daily: {
        Args: { check_env?: string; days_back?: number }
        Returns: {
          active_count: number
          day: string
          mrr: number
        }[]
      }
      admin_plan_drift: {
        Args: { check_env?: string }
        Returns: {
          current_period_end: string
          email: string
          kind: string
          profile_plan: string
          sub_status: string
          user_id: string
        }[]
      }
      admin_platform_stats: { Args: never; Returns: Json }
      admin_pro_stats: { Args: { check_env?: string }; Returns: Json }
      admin_resumen: { Args: never; Returns: Json }
      admin_stripe_event_stats: { Args: { hours_back?: number }; Returns: Json }
      get_bank_counts: {
        Args: never
        Returns: {
          capitulo: number
          fuente: string
          materia: string
          total: number
        }[]
      }
      get_bank_questions: {
        Args: {
          p_caps?: number[]
          p_fuentes?: string[]
          p_ids?: string[]
          p_limit?: number
          p_materias?: string[]
          p_offset?: number
          p_ordered?: boolean
          p_scope?: string
        }
        Returns: Json[]
      }
      has_active_subscription: {
        Args: { check_env?: string; user_uuid: string }
        Returns: boolean
      }
      is_admin: { Args: never; Returns: boolean }
      is_admin_ctx: { Args: never; Returns: boolean }
      match_rag_chunks: {
        Args: {
          match_count?: number
          materia_filter?: string
          query_embedding: string
        }
        Returns: {
          content: string
          id: string
          materia: string
          metadata: Json
          similarity: number
          source_id: string
          source_type: string
        }[]
      }
      plan_mrr_amount: { Args: { p_price_id: string }; Returns: number }
      seed_content: {
        Args: { p_collection: string; p_items: Json }
        Returns: number
      }
      user_data_sync_status: { Args: { check_env?: string }; Returns: Json }
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
