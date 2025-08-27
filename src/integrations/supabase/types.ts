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
      acompanhamento_assistencial: {
        Row: {
          analise_assistencial: string | null
          assistido_id: string
          created_at: string
          id: string
          inicio_recebimento: string | null
          periodicidade: string | null
          tipo_cesta: string | null
          updated_at: string
        }
        Insert: {
          analise_assistencial?: string | null
          assistido_id: string
          created_at?: string
          id?: string
          inicio_recebimento?: string | null
          periodicidade?: string | null
          tipo_cesta?: string | null
          updated_at?: string
        }
        Update: {
          analise_assistencial?: string | null
          assistido_id?: string
          created_at?: string
          id?: string
          inicio_recebimento?: string | null
          periodicidade?: string | null
          tipo_cesta?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "acompanhamento_assistencial_assistido_id_fkey"
            columns: ["assistido_id"]
            isOneToOne: false
            referencedRelation: "assistidos"
            referencedColumns: ["id"]
          },
        ]
      }
      assistidos: {
        Row: {
          bairro: string | null
          celular: string | null
          cep: string | null
          cidade: string | null
          cpf: string
          created_at: string
          created_by: string | null
          data_nascimento: string | null
          encaminhado_por: string | null
          estado: string | null
          estado_civil: string | null
          foto_url: string | null
          genero: string | null
          id: string
          naturalidade: string | null
          nome_completo: string
          numero: string | null
          rg: string | null
          rua: string | null
          situacao_moradia: string | null
          status: string | null
          telefone: string | null
          updated_at: string
        }
        Insert: {
          bairro?: string | null
          celular?: string | null
          cep?: string | null
          cidade?: string | null
          cpf: string
          created_at?: string
          created_by?: string | null
          data_nascimento?: string | null
          encaminhado_por?: string | null
          estado?: string | null
          estado_civil?: string | null
          foto_url?: string | null
          genero?: string | null
          id?: string
          naturalidade?: string | null
          nome_completo: string
          numero?: string | null
          rg?: string | null
          rua?: string | null
          situacao_moradia?: string | null
          status?: string | null
          telefone?: string | null
          updated_at?: string
        }
        Update: {
          bairro?: string | null
          celular?: string | null
          cep?: string | null
          cidade?: string | null
          cpf?: string
          created_at?: string
          created_by?: string | null
          data_nascimento?: string | null
          encaminhado_por?: string | null
          estado?: string | null
          estado_civil?: string | null
          foto_url?: string | null
          genero?: string | null
          id?: string
          naturalidade?: string | null
          nome_completo?: string
          numero?: string | null
          rg?: string | null
          rua?: string | null
          situacao_moradia?: string | null
          status?: string | null
          telefone?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "assistidos_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      documentos: {
        Row: {
          assistido_id: string
          created_at: string
          id: string
          nome_arquivo: string
          tipo_documento: string
          uploaded_by: string | null
          url_arquivo: string
        }
        Insert: {
          assistido_id: string
          created_at?: string
          id?: string
          nome_arquivo: string
          tipo_documento: string
          uploaded_by?: string | null
          url_arquivo: string
        }
        Update: {
          assistido_id?: string
          created_at?: string
          id?: string
          nome_arquivo?: string
          tipo_documento?: string
          uploaded_by?: string | null
          url_arquivo?: string
        }
        Relationships: [
          {
            foreignKeyName: "documentos_assistido_id_fkey"
            columns: ["assistido_id"]
            isOneToOne: false
            referencedRelation: "assistidos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "documentos_uploaded_by_fkey"
            columns: ["uploaded_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      familiares: {
        Row: {
          assistido_id: string
          created_at: string
          data_nascimento: string | null
          deficiencia: boolean | null
          escolaridade: string | null
          id: string
          necessita_fralda: boolean | null
          nome: string
          ocupacao: string | null
          parentesco: string | null
          tamanho_fralda: string | null
          tipo_deficiencia: string | null
        }
        Insert: {
          assistido_id: string
          created_at?: string
          data_nascimento?: string | null
          deficiencia?: boolean | null
          escolaridade?: string | null
          id?: string
          necessita_fralda?: boolean | null
          nome: string
          ocupacao?: string | null
          parentesco?: string | null
          tamanho_fralda?: string | null
          tipo_deficiencia?: string | null
        }
        Update: {
          assistido_id?: string
          created_at?: string
          data_nascimento?: string | null
          deficiencia?: boolean | null
          escolaridade?: string | null
          id?: string
          necessita_fralda?: boolean | null
          nome?: string
          ocupacao?: string | null
          parentesco?: string | null
          tamanho_fralda?: string | null
          tipo_deficiencia?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "familiares_assistido_id_fkey"
            columns: ["assistido_id"]
            isOneToOne: false
            referencedRelation: "assistidos"
            referencedColumns: ["id"]
          },
        ]
      }
      perfil_socioeconomico: {
        Row: {
          assistido_id: string
          beneficios_recebidos: string[] | null
          created_at: string
          id: string
          observacoes: string | null
          renda_familiar: number | null
          situacao_profissional: string | null
          updated_at: string
        }
        Insert: {
          assistido_id: string
          beneficios_recebidos?: string[] | null
          created_at?: string
          id?: string
          observacoes?: string | null
          renda_familiar?: number | null
          situacao_profissional?: string | null
          updated_at?: string
        }
        Update: {
          assistido_id?: string
          beneficios_recebidos?: string[] | null
          created_at?: string
          id?: string
          observacoes?: string | null
          renda_familiar?: number | null
          situacao_profissional?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "perfil_socioeconomico_assistido_id_fkey"
            columns: ["assistido_id"]
            isOneToOne: false
            referencedRelation: "assistidos"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          email: string | null
          id: string
          nome: string
          tipo_usuario: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          email?: string | null
          id?: string
          nome: string
          tipo_usuario?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          email?: string | null
          id?: string
          nome?: string
          tipo_usuario?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      retiradas_cesta: {
        Row: {
          assistido_id: string
          created_at: string
          created_by: string | null
          data_retirada: string
          id: string
          observacao: string | null
        }
        Insert: {
          assistido_id: string
          created_at?: string
          created_by?: string | null
          data_retirada: string
          id?: string
          observacao?: string | null
        }
        Update: {
          assistido_id?: string
          created_at?: string
          created_by?: string | null
          data_retirada?: string
          id?: string
          observacao?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "retiradas_cesta_assistido_id_fkey"
            columns: ["assistido_id"]
            isOneToOne: false
            referencedRelation: "assistidos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "retiradas_cesta_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      visitas_domiciliares: {
        Row: {
          assistido_id: string
          created_at: string
          created_by: string | null
          data_visita: string
          id: string
          nome_visitante: string
          recebido_por: string | null
          relatorio: string | null
        }
        Insert: {
          assistido_id: string
          created_at?: string
          created_by?: string | null
          data_visita: string
          id?: string
          nome_visitante: string
          recebido_por?: string | null
          relatorio?: string | null
        }
        Update: {
          assistido_id?: string
          created_at?: string
          created_by?: string | null
          data_visita?: string
          id?: string
          nome_visitante?: string
          recebido_por?: string | null
          relatorio?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "visitas_domiciliares_assistido_id_fkey"
            columns: ["assistido_id"]
            isOneToOne: false
            referencedRelation: "assistidos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "visitas_domiciliares_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
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
