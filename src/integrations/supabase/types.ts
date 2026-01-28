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
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      analytics_events: {
        Row: {
          article_id: string | null
          created_at: string
          event_type: string
          id: string
          session_id: string
          value: number | null
        }
        Insert: {
          article_id?: string | null
          created_at?: string
          event_type: string
          id?: string
          session_id: string
          value?: number | null
        }
        Update: {
          article_id?: string | null
          created_at?: string
          event_type?: string
          id?: string
          session_id?: string
          value?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "analytics_events_article_id_fkey"
            columns: ["article_id"]
            isOneToOne: false
            referencedRelation: "articles"
            referencedColumns: ["id"]
          },
        ]
      }
      article_views: {
        Row: {
          article_id: string
          id: string
          viewed_at: string
          visitor_hash: string | null
        }
        Insert: {
          article_id: string
          id?: string
          viewed_at?: string
          visitor_hash?: string | null
        }
        Update: {
          article_id?: string
          id?: string
          viewed_at?: string
          visitor_hash?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "article_views_article_id_fkey"
            columns: ["article_id"]
            isOneToOne: false
            referencedRelation: "articles"
            referencedColumns: ["id"]
          },
        ]
      }
      articles: {
        Row: {
          author_bio: string | null
          author_id: string | null
          author_name: string | null
          category: string | null
          category_id: string | null
          content: string | null
          created_at: string
          embedding: string | null
          excerpt: string | null
          featured_image: string | null
          id: string
          is_published: boolean
          preview_token: string | null
          published_at: string | null
          seo_description: string | null
          seo_title: string | null
          slug: string
          title: string
          updated_at: string
          view_count: number | null
        }
        Insert: {
          author_bio?: string | null
          author_id?: string | null
          author_name?: string | null
          category?: string | null
          category_id?: string | null
          content?: string | null
          created_at?: string
          embedding?: string | null
          excerpt?: string | null
          featured_image?: string | null
          id?: string
          is_published?: boolean
          preview_token?: string | null
          published_at?: string | null
          seo_description?: string | null
          seo_title?: string | null
          slug: string
          title: string
          updated_at?: string
          view_count?: number | null
        }
        Update: {
          author_bio?: string | null
          author_id?: string | null
          author_name?: string | null
          category?: string | null
          category_id?: string | null
          content?: string | null
          created_at?: string
          embedding?: string | null
          excerpt?: string | null
          featured_image?: string | null
          id?: string
          is_published?: boolean
          preview_token?: string | null
          published_at?: string | null
          seo_description?: string | null
          seo_title?: string | null
          slug?: string
          title?: string
          updated_at?: string
          view_count?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "articles_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "authors"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "articles_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
        ]
      }
      authors: {
        Row: {
          avatar_url: string | null
          bio: string | null
          created_at: string
          id: string
          name: string
          role: string | null
          slug: string | null
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          id?: string
          name: string
          role?: string | null
          slug?: string | null
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          id?: string
          name?: string
          role?: string | null
          slug?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      categories: {
        Row: {
          created_at: string
          description: string | null
          id: string
          name: string
          slug: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          name: string
          slug: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          slug?: string
          updated_at?: string
        }
        Relationships: []
      }
      financial_tracks: {
        Row: {
          created_at: string
          id: string
          last_updated: string
          last_year_return: number | null
          management_fee: number | null
          name: string
          provider: string
          type: string
          ytd_return: number | null
        }
        Insert: {
          created_at?: string
          id?: string
          last_updated?: string
          last_year_return?: number | null
          management_fee?: number | null
          name: string
          provider: string
          type: string
          ytd_return?: number | null
        }
        Update: {
          created_at?: string
          id?: string
          last_updated?: string
          last_year_return?: number | null
          management_fee?: number | null
          name?: string
          provider?: string
          type?: string
          ytd_return?: number | null
        }
        Relationships: []
      }
      leads: {
        Row: {
          created_at: string
          email: string
          id: string
          name: string
          phone: string | null
          source_url: string | null
          utm_data: Json | null
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          name: string
          phone?: string | null
          source_url?: string | null
          utm_data?: Json | null
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          name?: string
          phone?: string | null
          source_url?: string | null
          utm_data?: Json | null
        }
        Relationships: []
      }
      menus: {
        Row: {
          created_at: string
          id: string
          items_json: Json
          location: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          items_json?: Json
          location: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          items_json?: Json
          location?: string
          updated_at?: string
        }
        Relationships: []
      }
      pages: {
        Row: {
          content: string | null
          created_at: string
          id: string
          is_published: boolean
          seo_description: string | null
          seo_title: string | null
          slug: string
          title: string
          updated_at: string
        }
        Insert: {
          content?: string | null
          created_at?: string
          id?: string
          is_published?: boolean
          seo_description?: string | null
          seo_title?: string | null
          slug: string
          title: string
          updated_at?: string
        }
        Update: {
          content?: string | null
          created_at?: string
          id?: string
          is_published?: boolean
          seo_description?: string | null
          seo_title?: string | null
          slug?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      redirects: {
        Row: {
          created_at: string
          id: string
          is_active: boolean
          new_slug: string
          old_slug: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_active?: boolean
          new_slug: string
          old_slug: string
        }
        Update: {
          created_at?: string
          id?: string
          is_active?: boolean
          new_slug?: string
          old_slug?: string
        }
        Relationships: []
      }
      site_settings: {
        Row: {
          id: string
          key: string
          value: string | null
        }
        Insert: {
          id?: string
          key: string
          value?: string | null
        }
        Update: {
          id?: string
          key?: string
          value?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      generate_preview_token: { Args: never; Returns: string }
      get_trending_articles: {
        Args: { p_exclude_slug?: string; p_limit?: number }
        Returns: {
          category: string
          excerpt: string
          featured_image: string
          id: string
          published_at: string
          slug: string
          title: string
          view_count: number
        }[]
      }
      is_admin_user: { Args: never; Returns: boolean }
      match_articles: {
        Args: {
          exclude_slug?: string
          match_count?: number
          match_threshold?: number
          query_embedding: string
        }
        Returns: {
          category: string
          excerpt: string
          featured_image: string
          id: string
          published_at: string
          similarity: number
          slug: string
          title: string
        }[]
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
