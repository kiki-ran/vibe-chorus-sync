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
      cluster_assignments: {
        Row: {
          cluster_id: number
          cluster_label: string | null
          coordinates_2d: Json | null
          created_at: string | null
          features_used: Json | null
          id: string
          item_id: string
          item_type: string
          model_version: string | null
        }
        Insert: {
          cluster_id: number
          cluster_label?: string | null
          coordinates_2d?: Json | null
          created_at?: string | null
          features_used?: Json | null
          id?: string
          item_id: string
          item_type: string
          model_version?: string | null
        }
        Update: {
          cluster_id?: number
          cluster_label?: string | null
          coordinates_2d?: Json | null
          created_at?: string | null
          features_used?: Json | null
          id?: string
          item_id?: string
          item_type?: string
          model_version?: string | null
        }
        Relationships: []
      }
      ml_models: {
        Row: {
          created_at: string | null
          hyperparameters: Json | null
          id: string
          metrics: Json | null
          model_name: string
          model_type: string
          status: string | null
          training_date: string | null
          updated_at: string | null
          version: string
        }
        Insert: {
          created_at?: string | null
          hyperparameters?: Json | null
          id?: string
          metrics?: Json | null
          model_name: string
          model_type: string
          status?: string | null
          training_date?: string | null
          updated_at?: string | null
          version: string
        }
        Update: {
          created_at?: string | null
          hyperparameters?: Json | null
          id?: string
          metrics?: Json | null
          model_name?: string
          model_type?: string
          status?: string | null
          training_date?: string | null
          updated_at?: string | null
          version?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          age_group: string | null
          country: string | null
          created_at: string | null
          email: string | null
          id: string
          region: string | null
          updated_at: string | null
        }
        Insert: {
          age_group?: string | null
          country?: string | null
          created_at?: string | null
          email?: string | null
          id: string
          region?: string | null
          updated_at?: string | null
        }
        Update: {
          age_group?: string | null
          country?: string | null
          created_at?: string | null
          email?: string | null
          id?: string
          region?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      songs: {
        Row: {
          artist: string
          community_age_group: string | null
          community_country: string | null
          community_region: string | null
          created_at: string | null
          danceability: number | null
          energy: number | null
          genre: string
          id: string
          likes: number | null
          plays: number | null
          popularity: number | null
          release_date: string | null
          shares: number | null
          social_ranking: number | null
          tempo: number | null
          title: string
          track_id: string | null
          valence: number | null
        }
        Insert: {
          artist: string
          community_age_group?: string | null
          community_country?: string | null
          community_region?: string | null
          created_at?: string | null
          danceability?: number | null
          energy?: number | null
          genre: string
          id?: string
          likes?: number | null
          plays?: number | null
          popularity?: number | null
          release_date?: string | null
          shares?: number | null
          social_ranking?: number | null
          tempo?: number | null
          title: string
          track_id?: string | null
          valence?: number | null
        }
        Update: {
          artist?: string
          community_age_group?: string | null
          community_country?: string | null
          community_region?: string | null
          created_at?: string | null
          danceability?: number | null
          energy?: number | null
          genre?: string
          id?: string
          likes?: number | null
          plays?: number | null
          popularity?: number | null
          release_date?: string | null
          shares?: number | null
          social_ranking?: number | null
          tempo?: number | null
          title?: string
          track_id?: string | null
          valence?: number | null
        }
        Relationships: []
      }
      user_favorites: {
        Row: {
          created_at: string | null
          id: string
          song_id: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          song_id: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          song_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_favorites_song_id_fkey"
            columns: ["song_id"]
            isOneToOne: false
            referencedRelation: "songs"
            referencedColumns: ["id"]
          },
        ]
      }
      user_listening_history: {
        Row: {
          created_at: string | null
          duration_seconds: number | null
          id: string
          played_at: string | null
          song_id: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          duration_seconds?: number | null
          id?: string
          played_at?: string | null
          song_id: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          duration_seconds?: number | null
          id?: string
          played_at?: string | null
          song_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_listening_history_song_id_fkey"
            columns: ["song_id"]
            isOneToOne: false
            referencedRelation: "songs"
            referencedColumns: ["id"]
          },
        ]
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
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "moderator" | "user"
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
      app_role: ["admin", "moderator", "user"],
    },
  },
} as const
