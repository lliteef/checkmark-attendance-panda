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
    PostgrestVersion: "13.0.4"
  }
  public: {
    Tables: {
      attendance_records: {
        Row: {
          absence_reason: string | null
          created_at: string
          date: string
          id: string
          is_present: boolean | null
          student_id: string | null
        }
        Insert: {
          absence_reason?: string | null
          created_at?: string
          date: string
          id?: string
          is_present?: boolean | null
          student_id?: string | null
        }
        Update: {
          absence_reason?: string | null
          created_at?: string
          date?: string
          id?: string
          is_present?: boolean | null
          student_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "attendance_records_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_attendance_records_student_id"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
        ]
      }
      internships: {
        Row: {
          created_at: string
          end_date: string | null
          hours: number
          id: string
          location: string | null
          name: string
          notes: string | null
          start_date: string | null
          supervisor: string | null
          type: string
        }
        Insert: {
          created_at?: string
          end_date?: string | null
          hours: number
          id?: string
          location?: string | null
          name: string
          notes?: string | null
          start_date?: string | null
          supervisor?: string | null
          type: string
        }
        Update: {
          created_at?: string
          end_date?: string | null
          hours?: number
          id?: string
          location?: string | null
          name?: string
          notes?: string | null
          start_date?: string | null
          supervisor?: string | null
          type?: string
        }
        Relationships: []
      }
      late_students: {
        Row: {
          created_at: string | null
          date: string
          id: string
          student_id: string
        }
        Insert: {
          created_at?: string | null
          date: string
          id?: string
          student_id: string
        }
        Update: {
          created_at?: string | null
          date?: string
          id?: string
          student_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_late_students_student_id"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "late_students_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
        ]
      }
      lesson_times: {
        Row: {
          created_at: string | null
          date: string
          id: string
          start_time: string
        }
        Insert: {
          created_at?: string | null
          date: string
          id?: string
          start_time: string
        }
        Update: {
          created_at?: string | null
          date?: string
          id?: string
          start_time?: string
        }
        Relationships: []
      }
      schedule_groups: {
        Row: {
          created_at: string
          id: string
          name: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
        }
        Relationships: []
      }
      schedule_items: {
        Row: {
          created_at: string
          day_of_week: number
          group_id: string
          id: string
          lesson_id: string
          lesson_number: number
          week_type: string | null
        }
        Insert: {
          created_at?: string
          day_of_week: number
          group_id: string
          id?: string
          lesson_id: string
          lesson_number: number
          week_type?: string | null
        }
        Update: {
          created_at?: string
          day_of_week?: number
          group_id?: string
          id?: string
          lesson_id?: string
          lesson_number?: number
          week_type?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_schedule_items_group_id"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "schedule_groups"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_schedule_items_lesson_id"
            columns: ["lesson_id"]
            isOneToOne: false
            referencedRelation: "schedule_lessons"
            referencedColumns: ["id"]
          },
        ]
      }
      schedule_lessons: {
        Row: {
          created_at: string
          id: string
          name: string
          room: string
          teacher: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          room: string
          teacher: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          room?: string
          teacher?: string
        }
        Relationships: []
      }
      session_items: {
        Row: {
          created_at: string
          date: string | null
          form_type: string
          id: string
          notes: string | null
          room: string | null
          subject_name: string
          teacher: string
          time: string | null
        }
        Insert: {
          created_at?: string
          date?: string | null
          form_type: string
          id?: string
          notes?: string | null
          room?: string | null
          subject_name: string
          teacher: string
          time?: string | null
        }
        Update: {
          created_at?: string
          date?: string | null
          form_type?: string
          id?: string
          notes?: string | null
          room?: string | null
          subject_name?: string
          teacher?: string
          time?: string | null
        }
        Relationships: []
      }
      students: {
        Row: {
          created_at: string
          id: string
          name: string
          position: number | null
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          position?: number | null
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          position?: number | null
        }
        Relationships: []
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
