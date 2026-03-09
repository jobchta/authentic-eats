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
    PostgrestVersion: "14.4"
  }
  public: {
    Tables: {
      countries: {
        Row: {
          code: string
          continent: string
          created_at: string | null
          flag_emoji: string
          food_culture_summary: string | null
          food_description: string | null
          id: string
          name: string
          region: string
          signature_ingredient: string | null
        }
        Insert: {
          code: string
          continent: string
          created_at?: string | null
          flag_emoji?: string
          food_culture_summary?: string | null
          food_description?: string | null
          id?: string
          name: string
          region: string
          signature_ingredient?: string | null
        }
        Update: {
          code?: string
          continent?: string
          created_at?: string | null
          flag_emoji?: string
          food_culture_summary?: string | null
          food_description?: string | null
          id?: string
          name?: string
          region?: string
          signature_ingredient?: string | null
        }
        Relationships: []
      }
      dishes: {
        Row: {
          country_id: string
          created_at: string | null
          cuisine_type: string
          description: string | null
          dietary_tags: string[] | null
          id: string
          image_url: string | null
          is_signature: boolean | null
          name: string
          rating: number | null
          reviews_count: number | null
          spice_level: number | null
          tags: string[] | null
        }
        Insert: {
          country_id: string
          created_at?: string | null
          cuisine_type: string
          description?: string | null
          dietary_tags?: string[] | null
          id?: string
          image_url?: string | null
          is_signature?: boolean | null
          name: string
          rating?: number | null
          reviews_count?: number | null
          spice_level?: number | null
          tags?: string[] | null
        }
        Update: {
          country_id?: string
          created_at?: string | null
          cuisine_type?: string
          description?: string | null
          dietary_tags?: string[] | null
          id?: string
          image_url?: string | null
          is_signature?: boolean | null
          name?: string
          rating?: number | null
          reviews_count?: number | null
          spice_level?: number | null
          tags?: string[] | null
        }
        Relationships: [
          {
            foreignKeyName: "dishes_country_id_fkey"
            columns: ["country_id"]
            isOneToOne: false
            referencedRelation: "countries"
            referencedColumns: ["id"]
          },
        ]
      }
      explored_countries: {
        Row: {
          country_id: string
          explored_at: string
          id: string
          notes: string | null
          user_id: string
        }
        Insert: {
          country_id: string
          explored_at?: string
          id?: string
          notes?: string | null
          user_id: string
        }
        Update: {
          country_id?: string
          explored_at?: string
          id?: string
          notes?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "explored_countries_country_id_fkey"
            columns: ["country_id"]
            isOneToOne: false
            referencedRelation: "countries"
            referencedColumns: ["id"]
          },
        ]
      }
      favorite_dishes: {
        Row: {
          dish_id: string
          favorited_at: string
          id: string
          user_id: string
        }
        Insert: {
          dish_id: string
          favorited_at?: string
          id?: string
          user_id: string
        }
        Update: {
          dish_id?: string
          favorited_at?: string
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "favorite_dishes_dish_id_fkey"
            columns: ["dish_id"]
            isOneToOne: false
            referencedRelation: "dishes"
            referencedColumns: ["id"]
          },
        ]
      }
      ingestion_jobs: {
        Row: {
          completed_at: string | null
          country_id: string | null
          deep_research: boolean | null
          dishes_added: number | null
          error_message: string | null
          id: string
          ingredients_added: number | null
          recipes_added: number | null
          started_at: string | null
          status: string
        }
        Insert: {
          completed_at?: string | null
          country_id?: string | null
          deep_research?: boolean | null
          dishes_added?: number | null
          error_message?: string | null
          id?: string
          ingredients_added?: number | null
          recipes_added?: number | null
          started_at?: string | null
          status: string
        }
        Update: {
          completed_at?: string | null
          country_id?: string | null
          deep_research?: boolean | null
          dishes_added?: number | null
          error_message?: string | null
          id?: string
          ingredients_added?: number | null
          recipes_added?: number | null
          started_at?: string | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "ingestion_jobs_country_id_fkey"
            columns: ["country_id"]
            isOneToOne: false
            referencedRelation: "countries"
            referencedColumns: ["id"]
          },
        ]
      }
      ingredients: {
        Row: {
          aliases: string[] | null
          category: string | null
          created_at: string | null
          description: string | null
          id: string
          name: string
          origin_country_id: string | null
        }
        Insert: {
          aliases?: string[] | null
          category?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          name: string
          origin_country_id?: string | null
        }
        Update: {
          aliases?: string[] | null
          category?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          name?: string
          origin_country_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ingredients_origin_country_id_fkey"
            columns: ["origin_country_id"]
            isOneToOne: false
            referencedRelation: "countries"
            referencedColumns: ["id"]
          },
        ]
      }
      newsletter_subscribers: {
        Row: {
          email: string
          id: string
          subscribed_at: string
        }
        Insert: {
          email: string
          id?: string
          subscribed_at?: string
        }
        Update: {
          email?: string
          id?: string
          subscribed_at?: string
        }
        Relationships: []
      }
      osm_restaurant_cache: {
        Row: {
          address: string | null
          city: string
          country: string | null
          cuisine: string | null
          fetched_at: string
          lat: number
          lng: number
          name: string
          opening_hours: string | null
          osm_id: number
          phone: string | null
          website: string | null
        }
        Insert: {
          address?: string | null
          city: string
          country?: string | null
          cuisine?: string | null
          fetched_at?: string
          lat: number
          lng: number
          name: string
          opening_hours?: string | null
          osm_id: number
          phone?: string | null
          website?: string | null
        }
        Update: {
          address?: string | null
          city?: string
          country?: string | null
          cuisine?: string | null
          fetched_at?: string
          lat?: number
          lng?: number
          name?: string
          opening_hours?: string | null
          osm_id?: number
          phone?: string | null
          website?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          bio: string | null
          created_at: string
          display_name: string | null
          id: string
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          display_name?: string | null
          id: string
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          display_name?: string | null
          id?: string
          updated_at?: string
        }
        Relationships: []
      }
      recipe_ingredients: {
        Row: {
          id: string
          ingredient_id: string
          is_optional: boolean | null
          quantity: string | null
          recipe_id: string
        }
        Insert: {
          id?: string
          ingredient_id: string
          is_optional?: boolean | null
          quantity?: string | null
          recipe_id: string
        }
        Update: {
          id?: string
          ingredient_id?: string
          is_optional?: boolean | null
          quantity?: string | null
          recipe_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "recipe_ingredients_ingredient_id_fkey"
            columns: ["ingredient_id"]
            isOneToOne: false
            referencedRelation: "ingredients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "recipe_ingredients_recipe_id_fkey"
            columns: ["recipe_id"]
            isOneToOne: false
            referencedRelation: "recipes"
            referencedColumns: ["id"]
          },
        ]
      }
      recipes: {
        Row: {
          cook_time_minutes: number | null
          created_at: string | null
          difficulty: string | null
          dish_id: string
          id: string
          instructions: Json | null
          prep_time_minutes: number | null
          servings: number | null
        }
        Insert: {
          cook_time_minutes?: number | null
          created_at?: string | null
          difficulty?: string | null
          dish_id: string
          id?: string
          instructions?: Json | null
          prep_time_minutes?: number | null
          servings?: number | null
        }
        Update: {
          cook_time_minutes?: number | null
          created_at?: string | null
          difficulty?: string | null
          dish_id?: string
          id?: string
          instructions?: Json | null
          prep_time_minutes?: number | null
          servings?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "recipes_dish_id_fkey"
            columns: ["dish_id"]
            isOneToOne: true
            referencedRelation: "dishes"
            referencedColumns: ["id"]
          },
        ]
      }
      restaurants: {
        Row: {
          address: string | null
          city: string
          country_id: string
          created_at: string | null
          cuisine_type: string
          description: string | null
          id: string
          is_featured: boolean | null
          michelin_stars: number | null
          name: string
          price_range: string | null
          rating: number | null
          reviews_count: number | null
          speciality: string | null
          tags: string[] | null
          tier: string
          website_url: string | null
          year_established: number | null
        }
        Insert: {
          address?: string | null
          city: string
          country_id: string
          created_at?: string | null
          cuisine_type: string
          description?: string | null
          id?: string
          is_featured?: boolean | null
          michelin_stars?: number | null
          name: string
          price_range?: string | null
          rating?: number | null
          reviews_count?: number | null
          speciality?: string | null
          tags?: string[] | null
          tier?: string
          website_url?: string | null
          year_established?: number | null
        }
        Update: {
          address?: string | null
          city?: string
          country_id?: string
          created_at?: string | null
          cuisine_type?: string
          description?: string | null
          id?: string
          is_featured?: boolean | null
          michelin_stars?: number | null
          name?: string
          price_range?: string | null
          rating?: number | null
          reviews_count?: number | null
          speciality?: string | null
          tags?: string[] | null
          tier?: string
          website_url?: string | null
          year_established?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "restaurants_country_id_fkey"
            columns: ["country_id"]
            isOneToOne: false
            referencedRelation: "countries"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
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
