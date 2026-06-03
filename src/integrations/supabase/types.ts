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
      activity_log: {
        Row: {
          action: string
          created_at: string
          description: string | null
          id: string
          metadata: Json | null
          module: string | null
          user_id: string | null
        }
        Insert: {
          action: string
          created_at?: string
          description?: string | null
          id?: string
          metadata?: Json | null
          module?: string | null
          user_id?: string | null
        }
        Update: {
          action?: string
          created_at?: string
          description?: string | null
          id?: string
          metadata?: Json | null
          module?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      classes: {
        Row: {
          created_at: string
          grade: number | null
          id: string
          name: string
          notes: string | null
          school_id: string
          school_year: string | null
          teacher_id: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          grade?: number | null
          id?: string
          name: string
          notes?: string | null
          school_id: string
          school_year?: string | null
          teacher_id?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          grade?: number | null
          id?: string
          name?: string
          notes?: string | null
          school_id?: string
          school_year?: string | null
          teacher_id?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      modules: {
        Row: {
          created_at: string
          description: string | null
          id: string
          name: string
          slug: string
          sort_order: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          name: string
          slug: string
          sort_order?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          slug?: string
          sort_order?: number
          updated_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          email: string | null
          full_name: string | null
          id: string
          last_login_at: string | null
          school_id: string | null
          status: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          email?: string | null
          full_name?: string | null
          id: string
          last_login_at?: string | null
          school_id?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: string
          last_login_at?: string | null
          school_id?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "profiles_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "schools"
            referencedColumns: ["id"]
          },
        ]
      }
      school_requests: {
        Row: {
          city: string | null
          classes_count: number | null
          contact_consent: boolean
          contact_email: string
          contact_name: string
          contact_phone: string | null
          contact_position: string | null
          created_at: string
          dic: string | null
          gdpr_consent: boolean
          ico: string | null
          id: string
          interested_in_testing: boolean
          internal_note: string | null
          name: string
          note: string | null
          processed_at: string | null
          processed_by: string | null
          region: string | null
          school_id: string | null
          status: Database["public"]["Enums"]["school_request_status"]
          street: string | null
          students_count: number | null
          type: Database["public"]["Enums"]["school_type"] | null
          updated_at: string
          website: string | null
          zip: string | null
        }
        Insert: {
          city?: string | null
          classes_count?: number | null
          contact_consent?: boolean
          contact_email: string
          contact_name: string
          contact_phone?: string | null
          contact_position?: string | null
          created_at?: string
          dic?: string | null
          gdpr_consent?: boolean
          ico?: string | null
          id?: string
          interested_in_testing?: boolean
          internal_note?: string | null
          name: string
          note?: string | null
          processed_at?: string | null
          processed_by?: string | null
          region?: string | null
          school_id?: string | null
          status?: Database["public"]["Enums"]["school_request_status"]
          street?: string | null
          students_count?: number | null
          type?: Database["public"]["Enums"]["school_type"] | null
          updated_at?: string
          website?: string | null
          zip?: string | null
        }
        Update: {
          city?: string | null
          classes_count?: number | null
          contact_consent?: boolean
          contact_email?: string
          contact_name?: string
          contact_phone?: string | null
          contact_position?: string | null
          created_at?: string
          dic?: string | null
          gdpr_consent?: boolean
          ico?: string | null
          id?: string
          interested_in_testing?: boolean
          internal_note?: string | null
          name?: string
          note?: string | null
          processed_at?: string | null
          processed_by?: string | null
          region?: string | null
          school_id?: string | null
          status?: Database["public"]["Enums"]["school_request_status"]
          street?: string | null
          students_count?: number | null
          type?: Database["public"]["Enums"]["school_type"] | null
          updated_at?: string
          website?: string | null
          zip?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "school_requests_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "schools"
            referencedColumns: ["id"]
          },
        ]
      }
      schools: {
        Row: {
          city: string | null
          contact_email: string | null
          contact_name: string | null
          contact_phone: string | null
          contact_position: string | null
          created_at: string
          dic: string | null
          ico: string | null
          id: string
          name: string
          notes: string | null
          region: string | null
          status: Database["public"]["Enums"]["school_status"]
          street: string | null
          type: Database["public"]["Enums"]["school_type"] | null
          updated_at: string
          website: string | null
          zip: string | null
        }
        Insert: {
          city?: string | null
          contact_email?: string | null
          contact_name?: string | null
          contact_phone?: string | null
          contact_position?: string | null
          created_at?: string
          dic?: string | null
          ico?: string | null
          id?: string
          name: string
          notes?: string | null
          region?: string | null
          status?: Database["public"]["Enums"]["school_status"]
          street?: string | null
          type?: Database["public"]["Enums"]["school_type"] | null
          updated_at?: string
          website?: string | null
          zip?: string | null
        }
        Update: {
          city?: string | null
          contact_email?: string | null
          contact_name?: string | null
          contact_phone?: string | null
          contact_position?: string | null
          created_at?: string
          dic?: string | null
          ico?: string | null
          id?: string
          name?: string
          notes?: string | null
          region?: string | null
          status?: Database["public"]["Enums"]["school_status"]
          street?: string | null
          type?: Database["public"]["Enums"]["school_type"] | null
          updated_at?: string
          website?: string | null
          zip?: string | null
        }
        Relationships: []
      }
      students: {
        Row: {
          class_id: string
          code: string
          created_at: string
          first_name: string | null
          grade: number | null
          id: string
          last_name: string | null
          pin: string | null
          school_id: string
          status: string
          updated_at: string
        }
        Insert: {
          class_id: string
          code: string
          created_at?: string
          first_name?: string | null
          grade?: number | null
          id?: string
          last_name?: string | null
          pin?: string | null
          school_id: string
          status?: string
          updated_at?: string
        }
        Update: {
          class_id?: string
          code?: string
          created_at?: string
          first_name?: string | null
          grade?: number | null
          id?: string
          last_name?: string | null
          pin?: string | null
          school_id?: string
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "students_class_id_fkey"
            columns: ["class_id"]
            isOneToOne: false
            referencedRelation: "classes"
            referencedColumns: ["id"]
          },
        ]
      }
      test_answers: {
        Row: {
          answer_keys: string[]
          answer_text: string | null
          attempt_id: string
          created_at: string
          id: string
          is_correct: boolean | null
          points_awarded: number
          question_id: string
          updated_at: string
        }
        Insert: {
          answer_keys?: string[]
          answer_text?: string | null
          attempt_id: string
          created_at?: string
          id?: string
          is_correct?: boolean | null
          points_awarded?: number
          question_id: string
          updated_at?: string
        }
        Update: {
          answer_keys?: string[]
          answer_text?: string | null
          attempt_id?: string
          created_at?: string
          id?: string
          is_correct?: boolean | null
          points_awarded?: number
          question_id?: string
          updated_at?: string
        }
        Relationships: []
      }
      test_assignments: {
        Row: {
          class_id: string | null
          created_at: string
          created_by: string | null
          ends_at: string | null
          grade: number | null
          id: string
          module_id: string | null
          school_id: string | null
          scope: string
          starts_at: string | null
          status: string
          test_id: string
          updated_at: string
        }
        Insert: {
          class_id?: string | null
          created_at?: string
          created_by?: string | null
          ends_at?: string | null
          grade?: number | null
          id?: string
          module_id?: string | null
          school_id?: string | null
          scope?: string
          starts_at?: string | null
          status?: string
          test_id: string
          updated_at?: string
        }
        Update: {
          class_id?: string | null
          created_at?: string
          created_by?: string | null
          ends_at?: string | null
          grade?: number | null
          id?: string
          module_id?: string | null
          school_id?: string | null
          scope?: string
          starts_at?: string | null
          status?: string
          test_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "test_assignments_test_id_fkey"
            columns: ["test_id"]
            isOneToOne: false
            referencedRelation: "tests"
            referencedColumns: ["id"]
          },
        ]
      }
      test_attempts: {
        Row: {
          class_id: string | null
          created_at: string
          id: string
          max_score: number
          school_id: string
          score: number
          started_at: string
          status: string
          student_id: string
          submitted_at: string | null
          test_id: string
          updated_at: string
        }
        Insert: {
          class_id?: string | null
          created_at?: string
          id?: string
          max_score?: number
          school_id: string
          score?: number
          started_at?: string
          status?: string
          student_id: string
          submitted_at?: string | null
          test_id: string
          updated_at?: string
        }
        Update: {
          class_id?: string | null
          created_at?: string
          id?: string
          max_score?: number
          school_id?: string
          score?: number
          started_at?: string
          status?: string
          student_id?: string
          submitted_at?: string | null
          test_id?: string
          updated_at?: string
        }
        Relationships: []
      }
      test_questions: {
        Row: {
          competency: string | null
          correct_keys: string[]
          created_at: string
          id: string
          is_required: boolean
          options: Json
          points: number
          position: number
          question_description: string | null
          question_text: string
          question_type: string
          scale_labels: Json | null
          scale_max: number | null
          scale_min: number | null
          scoring_mode: string | null
          test_id: string
          updated_at: string
        }
        Insert: {
          competency?: string | null
          correct_keys?: string[]
          created_at?: string
          id?: string
          is_required?: boolean
          options?: Json
          points?: number
          position: number
          question_description?: string | null
          question_text: string
          question_type?: string
          scale_labels?: Json | null
          scale_max?: number | null
          scale_min?: number | null
          scoring_mode?: string | null
          test_id: string
          updated_at?: string
        }
        Update: {
          competency?: string | null
          correct_keys?: string[]
          created_at?: string
          id?: string
          is_required?: boolean
          options?: Json
          points?: number
          position?: number
          question_description?: string | null
          question_text?: string
          question_type?: string
          scale_labels?: Json | null
          scale_max?: number | null
          scale_min?: number | null
          scoring_mode?: string | null
          test_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "test_questions_test_id_fkey"
            columns: ["test_id"]
            isOneToOne: false
            referencedRelation: "tests"
            referencedColumns: ["id"]
          },
        ]
      }
      test_scoring_rules: {
        Row: {
          competency_area: string | null
          created_at: string
          description: string | null
          id: string
          label: string
          max_percentage: number
          min_percentage: number
          test_id: string
          updated_at: string
        }
        Insert: {
          competency_area?: string | null
          created_at?: string
          description?: string | null
          id?: string
          label: string
          max_percentage: number
          min_percentage: number
          test_id: string
          updated_at?: string
        }
        Update: {
          competency_area?: string | null
          created_at?: string
          description?: string | null
          id?: string
          label?: string
          max_percentage?: number
          min_percentage?: number
          test_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "test_scoring_rules_test_id_fkey"
            columns: ["test_id"]
            isOneToOne: false
            referencedRelation: "tests"
            referencedColumns: ["id"]
          },
        ]
      }
      tests: {
        Row: {
          allow_retake: boolean
          anonymous_allowed: boolean
          completion_text: string | null
          created_at: string
          created_by: string | null
          description: string | null
          duration_min: number | null
          evaluate_by_competency: boolean
          grade_from: number | null
          grade_to: number | null
          id: string
          instructions: string | null
          module_id: string | null
          save_to_school_report: boolean
          show_result_to_student: boolean
          slug: string
          start_button_text: string | null
          status: string
          title: string
          type: string
          updated_at: string
        }
        Insert: {
          allow_retake?: boolean
          anonymous_allowed?: boolean
          completion_text?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          duration_min?: number | null
          evaluate_by_competency?: boolean
          grade_from?: number | null
          grade_to?: number | null
          id?: string
          instructions?: string | null
          module_id?: string | null
          save_to_school_report?: boolean
          show_result_to_student?: boolean
          slug: string
          start_button_text?: string | null
          status?: string
          title: string
          type?: string
          updated_at?: string
        }
        Update: {
          allow_retake?: boolean
          anonymous_allowed?: boolean
          completion_text?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          duration_min?: number | null
          evaluate_by_competency?: boolean
          grade_from?: number | null
          grade_to?: number | null
          id?: string
          instructions?: string | null
          module_id?: string | null
          save_to_school_report?: boolean
          show_result_to_student?: boolean
          slug?: string
          start_button_text?: string | null
          status?: string
          title?: string
          type?: string
          updated_at?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          school_id: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          school_id?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          school_id?: string | null
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      current_user_school_id: { Args: never; Returns: string }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role:
        | "admin"
        | "editor"
        | "koordinator"
        | "viewer"
        | "skola"
        | "ucitel"
      school_request_status:
        | "nova"
        | "v_rieseni"
        | "schvalena"
        | "zamietnuta"
        | "archivovana"
      school_status:
        | "nova"
        | "schvalena"
        | "aktivna"
        | "pozastavena"
        | "ukoncena"
        | "zamietnuta"
      school_type:
        | "zakladna"
        | "stredna"
        | "gymnazium"
        | "sou"
        | "spojena"
        | "ina"
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
      app_role: ["admin", "editor", "koordinator", "viewer", "skola", "ucitel"],
      school_request_status: [
        "nova",
        "v_rieseni",
        "schvalena",
        "zamietnuta",
        "archivovana",
      ],
      school_status: [
        "nova",
        "schvalena",
        "aktivna",
        "pozastavena",
        "ukoncena",
        "zamietnuta",
      ],
      school_type: [
        "zakladna",
        "stredna",
        "gymnazium",
        "sou",
        "spojena",
        "ina",
      ],
    },
  },
} as const
