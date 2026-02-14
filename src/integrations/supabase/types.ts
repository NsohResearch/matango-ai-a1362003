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
      ab_test_variants: {
        Row: {
          clicks: number | null
          content: string | null
          conversion_rate: number | null
          conversions: number | null
          created_at: string
          id: string
          impressions: number | null
          is_winner: boolean | null
          name: string
          test_id: string
          traffic_split: number | null
        }
        Insert: {
          clicks?: number | null
          content?: string | null
          conversion_rate?: number | null
          conversions?: number | null
          created_at?: string
          id?: string
          impressions?: number | null
          is_winner?: boolean | null
          name: string
          test_id: string
          traffic_split?: number | null
        }
        Update: {
          clicks?: number | null
          content?: string | null
          conversion_rate?: number | null
          conversions?: number | null
          created_at?: string
          id?: string
          impressions?: number | null
          is_winner?: boolean | null
          name?: string
          test_id?: string
          traffic_split?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "ab_test_variants_test_id_fkey"
            columns: ["test_id"]
            isOneToOne: false
            referencedRelation: "ab_tests"
            referencedColumns: ["id"]
          },
        ]
      }
      ab_tests: {
        Row: {
          auto_optimize: boolean | null
          campaign_id: string | null
          confidence_level: number | null
          created_at: string
          id: string
          min_sample_size: number | null
          org_id: string | null
          status: string
          target_metric: string | null
          test_type: string
          updated_at: string
          user_id: string
        }
        Insert: {
          auto_optimize?: boolean | null
          campaign_id?: string | null
          confidence_level?: number | null
          created_at?: string
          id?: string
          min_sample_size?: number | null
          org_id?: string | null
          status?: string
          target_metric?: string | null
          test_type?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          auto_optimize?: boolean | null
          campaign_id?: string | null
          confidence_level?: number | null
          created_at?: string
          id?: string
          min_sample_size?: number | null
          org_id?: string | null
          status?: string
          target_metric?: string | null
          test_type?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "ab_tests_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "unified_campaigns"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ab_tests_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      admin_audit_log: {
        Row: {
          action: string
          admin_id: string
          created_at: string
          details: Json | null
          id: string
          target_id: string | null
          target_type: string | null
        }
        Insert: {
          action: string
          admin_id: string
          created_at?: string
          details?: Json | null
          id?: string
          target_id?: string | null
          target_type?: string | null
        }
        Update: {
          action?: string
          admin_id?: string
          created_at?: string
          details?: Json | null
          id?: string
          target_id?: string | null
          target_type?: string | null
        }
        Relationships: []
      }
      analytics_data: {
        Row: {
          comments: number | null
          created_at: string
          date: string
          engagement_rate: number | null
          followers: number | null
          id: string
          influencer_id: string | null
          likes: number | null
          shares: number | null
          user_id: string
          views: number | null
        }
        Insert: {
          comments?: number | null
          created_at?: string
          date?: string
          engagement_rate?: number | null
          followers?: number | null
          id?: string
          influencer_id?: string | null
          likes?: number | null
          shares?: number | null
          user_id: string
          views?: number | null
        }
        Update: {
          comments?: number | null
          created_at?: string
          date?: string
          engagement_rate?: number | null
          followers?: number | null
          id?: string
          influencer_id?: string | null
          likes?: number | null
          shares?: number | null
          user_id?: string
          views?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "analytics_data_influencer_id_fkey"
            columns: ["influencer_id"]
            isOneToOne: false
            referencedRelation: "influencers"
            referencedColumns: ["id"]
          },
        ]
      }
      analytics_events: {
        Row: {
          created_at: string
          event_type: string
          id: string
          metadata: Json | null
          platform: string | null
          source: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          event_type: string
          id?: string
          metadata?: Json | null
          platform?: string | null
          source?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          event_type?: string
          id?: string
          metadata?: Json | null
          platform?: string | null
          source?: string | null
          user_id?: string
        }
        Relationships: []
      }
      asset_library: {
        Row: {
          brand_id: string | null
          created_at: string
          id: string
          metadata: Json | null
          model: string | null
          org_id: string | null
          parent_id: string | null
          prompt: string | null
          tags: string[] | null
          type: string
          updated_at: string
          url: string | null
          user_id: string
          version: number | null
        }
        Insert: {
          brand_id?: string | null
          created_at?: string
          id?: string
          metadata?: Json | null
          model?: string | null
          org_id?: string | null
          parent_id?: string | null
          prompt?: string | null
          tags?: string[] | null
          type?: string
          updated_at?: string
          url?: string | null
          user_id: string
          version?: number | null
        }
        Update: {
          brand_id?: string | null
          created_at?: string
          id?: string
          metadata?: Json | null
          model?: string | null
          org_id?: string | null
          parent_id?: string | null
          prompt?: string | null
          tags?: string[] | null
          type?: string
          updated_at?: string
          url?: string | null
          user_id?: string
          version?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "asset_library_brand_id_fkey"
            columns: ["brand_id"]
            isOneToOne: false
            referencedRelation: "business_dna"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "asset_library_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "asset_library_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "asset_library"
            referencedColumns: ["id"]
          },
        ]
      }
      asset_versions: {
        Row: {
          asset_id: string
          created_at: string
          diff: Json | null
          edit_op: string | null
          id: string
          model: string | null
          prompt: string | null
          url: string | null
          version: number
        }
        Insert: {
          asset_id: string
          created_at?: string
          diff?: Json | null
          edit_op?: string | null
          id?: string
          model?: string | null
          prompt?: string | null
          url?: string | null
          version?: number
        }
        Update: {
          asset_id?: string
          created_at?: string
          diff?: Json | null
          edit_op?: string | null
          id?: string
          model?: string | null
          prompt?: string | null
          url?: string | null
          version?: number
        }
        Relationships: [
          {
            foreignKeyName: "asset_versions_asset_id_fkey"
            columns: ["asset_id"]
            isOneToOne: false
            referencedRelation: "asset_library"
            referencedColumns: ["id"]
          },
        ]
      }
      auto_insights: {
        Row: {
          confidence: number | null
          created_at: string
          description: string | null
          id: string
          insight_type: string
          org_id: string | null
          title: string
          user_id: string
        }
        Insert: {
          confidence?: number | null
          created_at?: string
          description?: string | null
          id?: string
          insight_type: string
          org_id?: string | null
          title: string
          user_id: string
        }
        Update: {
          confidence?: number | null
          created_at?: string
          description?: string | null
          id?: string
          insight_type?: string
          org_id?: string | null
          title?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "auto_insights_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      business_dna: {
        Row: {
          brand_name: string | null
          brand_tone: string | null
          category: string | null
          claims_proof: Json | null
          created_at: string
          differentiators: Json | null
          forbidden_phrases: string[] | null
          icp_personas: Json | null
          id: string
          is_active: boolean
          key_outcomes: Json | null
          org_id: string | null
          product_name: string | null
          status: string
          tagline: string | null
          updated_at: string
          user_id: string
          voice_rules: Json | null
          website_url: string | null
        }
        Insert: {
          brand_name?: string | null
          brand_tone?: string | null
          category?: string | null
          claims_proof?: Json | null
          created_at?: string
          differentiators?: Json | null
          forbidden_phrases?: string[] | null
          icp_personas?: Json | null
          id?: string
          is_active?: boolean
          key_outcomes?: Json | null
          org_id?: string | null
          product_name?: string | null
          status?: string
          tagline?: string | null
          updated_at?: string
          user_id: string
          voice_rules?: Json | null
          website_url?: string | null
        }
        Update: {
          brand_name?: string | null
          brand_tone?: string | null
          category?: string | null
          claims_proof?: Json | null
          created_at?: string
          differentiators?: Json | null
          forbidden_phrases?: string[] | null
          icp_personas?: Json | null
          id?: string
          is_active?: boolean
          key_outcomes?: Json | null
          org_id?: string | null
          product_name?: string | null
          status?: string
          tagline?: string | null
          updated_at?: string
          user_id?: string
          voice_rules?: Json | null
          website_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "business_dna_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      campaign_assets: {
        Row: {
          asset_type: string
          campaign_id: string
          content: string | null
          created_at: string
          id: string
          platform: string | null
          status: string
          utm_tracking: Json | null
        }
        Insert: {
          asset_type: string
          campaign_id: string
          content?: string | null
          created_at?: string
          id?: string
          platform?: string | null
          status?: string
          utm_tracking?: Json | null
        }
        Update: {
          asset_type?: string
          campaign_id?: string
          content?: string | null
          created_at?: string
          id?: string
          platform?: string | null
          status?: string
          utm_tracking?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "campaign_assets_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "unified_campaigns"
            referencedColumns: ["id"]
          },
        ]
      }
      campaign_scenes: {
        Row: {
          campaign_id: string
          caption: string | null
          created_at: string
          id: string
          image_url: string | null
          prompt: string | null
          scene_number: number
          scheduled_for: string | null
        }
        Insert: {
          campaign_id: string
          caption?: string | null
          created_at?: string
          id?: string
          image_url?: string | null
          prompt?: string | null
          scene_number?: number
          scheduled_for?: string | null
        }
        Update: {
          campaign_id?: string
          caption?: string | null
          created_at?: string
          id?: string
          image_url?: string | null
          prompt?: string | null
          scene_number?: number
          scheduled_for?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "campaign_scenes_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "campaigns"
            referencedColumns: ["id"]
          },
        ]
      }
      campaigns: {
        Row: {
          created_at: string
          id: string
          influencer_id: string | null
          status: string
          title: string | null
          total_scenes: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          influencer_id?: string | null
          status?: string
          title?: string | null
          total_scenes?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          influencer_id?: string | null
          status?: string
          title?: string | null
          total_scenes?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "campaigns_influencer_id_fkey"
            columns: ["influencer_id"]
            isOneToOne: false
            referencedRelation: "influencers"
            referencedColumns: ["id"]
          },
        ]
      }
      client_workspaces: {
        Row: {
          access_token: string | null
          client_name: string
          created_at: string
          id: string
          org_id: string
        }
        Insert: {
          access_token?: string | null
          client_name: string
          created_at?: string
          id?: string
          org_id: string
        }
        Update: {
          access_token?: string | null
          client_name?: string
          created_at?: string
          id?: string
          org_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "client_workspaces_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      collaborators: {
        Row: {
          created_at: string
          email: string
          id: string
          influencer_id: string
          invite_token: string | null
          role: string
          status: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          influencer_id: string
          invite_token?: string | null
          role?: string
          status?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          influencer_id?: string
          invite_token?: string | null
          role?: string
          status?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "collaborators_influencer_id_fkey"
            columns: ["influencer_id"]
            isOneToOne: false
            referencedRelation: "influencers"
            referencedColumns: ["id"]
          },
        ]
      }
      content_templates: {
        Row: {
          category: string | null
          character_weight: number | null
          created_at: string
          description: string | null
          id: string
          is_custom: boolean | null
          name: string
          prompt_template: string | null
          style_preset: string | null
          usage_count: number | null
          user_id: string | null
        }
        Insert: {
          category?: string | null
          character_weight?: number | null
          created_at?: string
          description?: string | null
          id?: string
          is_custom?: boolean | null
          name: string
          prompt_template?: string | null
          style_preset?: string | null
          usage_count?: number | null
          user_id?: string | null
        }
        Update: {
          category?: string | null
          character_weight?: number | null
          created_at?: string
          description?: string | null
          id?: string
          is_custom?: boolean | null
          name?: string
          prompt_template?: string | null
          style_preset?: string | null
          usage_count?: number | null
          user_id?: string | null
        }
        Relationships: []
      }
      custom_email_templates: {
        Row: {
          created_at: string
          html_content: string | null
          id: string
          org_id: string
          subject: string | null
          template_type: string
        }
        Insert: {
          created_at?: string
          html_content?: string | null
          id?: string
          org_id: string
          subject?: string | null
          template_type: string
        }
        Update: {
          created_at?: string
          html_content?: string | null
          id?: string
          org_id?: string
          subject?: string | null
          template_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "custom_email_templates_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      edit_sessions: {
        Row: {
          asset_id: string
          created_at: string
          id: string
          messages: Json | null
          status: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          asset_id: string
          created_at?: string
          id?: string
          messages?: Json | null
          status?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          asset_id?: string
          created_at?: string
          id?: string
          messages?: Json | null
          status?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "edit_sessions_asset_id_fkey"
            columns: ["asset_id"]
            isOneToOne: false
            referencedRelation: "asset_library"
            referencedColumns: ["id"]
          },
        ]
      }
      email_sequence_steps: {
        Row: {
          body: string | null
          clicked: number | null
          created_at: string
          delay_days: number | null
          id: string
          opened: number | null
          sent: number | null
          sequence_id: string
          step_number: number
          subject: string | null
        }
        Insert: {
          body?: string | null
          clicked?: number | null
          created_at?: string
          delay_days?: number | null
          id?: string
          opened?: number | null
          sent?: number | null
          sequence_id: string
          step_number?: number
          subject?: string | null
        }
        Update: {
          body?: string | null
          clicked?: number | null
          created_at?: string
          delay_days?: number | null
          id?: string
          opened?: number | null
          sent?: number | null
          sequence_id?: string
          step_number?: number
          subject?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "email_sequence_steps_sequence_id_fkey"
            columns: ["sequence_id"]
            isOneToOne: false
            referencedRelation: "email_sequences"
            referencedColumns: ["id"]
          },
        ]
      }
      email_sequences: {
        Row: {
          campaign_id: string | null
          created_at: string
          id: string
          is_active: boolean | null
          name: string | null
          sequence_type: string | null
          user_id: string
        }
        Insert: {
          campaign_id?: string | null
          created_at?: string
          id?: string
          is_active?: boolean | null
          name?: string | null
          sequence_type?: string | null
          user_id: string
        }
        Update: {
          campaign_id?: string | null
          created_at?: string
          id?: string
          is_active?: boolean | null
          name?: string | null
          sequence_type?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "email_sequences_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "unified_campaigns"
            referencedColumns: ["id"]
          },
        ]
      }
      feature_flags: {
        Row: {
          created_at: string
          description: string | null
          id: string
          is_enabled: boolean
          name: string
          rules: Json | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          is_enabled?: boolean
          name: string
          rules?: Json | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          is_enabled?: boolean
          name?: string
          rules?: Json | null
          updated_at?: string
        }
        Relationships: []
      }
      influencer_content: {
        Row: {
          content_type: string | null
          created_at: string
          id: string
          image_url: string | null
          influencer_id: string
          metadata: Json | null
          prompt: string | null
        }
        Insert: {
          content_type?: string | null
          created_at?: string
          id?: string
          image_url?: string | null
          influencer_id: string
          metadata?: Json | null
          prompt?: string | null
        }
        Update: {
          content_type?: string | null
          created_at?: string
          id?: string
          image_url?: string | null
          influencer_id?: string
          metadata?: Json | null
          prompt?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "influencer_content_influencer_id_fkey"
            columns: ["influencer_id"]
            isOneToOne: false
            referencedRelation: "influencers"
            referencedColumns: ["id"]
          },
        ]
      }
      influencer_personas: {
        Row: {
          created_at: string
          cta_patterns: string[] | null
          hook_patterns: string[] | null
          id: string
          influencer_id: string
          persona_type: string
          style_guide: string | null
          vocabulary: string | null
        }
        Insert: {
          created_at?: string
          cta_patterns?: string[] | null
          hook_patterns?: string[] | null
          id?: string
          influencer_id: string
          persona_type?: string
          style_guide?: string | null
          vocabulary?: string | null
        }
        Update: {
          created_at?: string
          cta_patterns?: string[] | null
          hook_patterns?: string[] | null
          id?: string
          influencer_id?: string
          persona_type?: string
          style_guide?: string | null
          vocabulary?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "influencer_personas_influencer_id_fkey"
            columns: ["influencer_id"]
            isOneToOne: false
            referencedRelation: "influencers"
            referencedColumns: ["id"]
          },
        ]
      }
      influencer_settings: {
        Row: {
          camera_angle: string | null
          camera_framing: string | null
          character_weight: number | null
          created_at: string
          default_style: string | null
          id: string
          influencer_id: string
          keep_face: boolean | null
          keep_hair: boolean | null
          keep_outfit: boolean | null
          updated_at: string
        }
        Insert: {
          camera_angle?: string | null
          camera_framing?: string | null
          character_weight?: number | null
          created_at?: string
          default_style?: string | null
          id?: string
          influencer_id: string
          keep_face?: boolean | null
          keep_hair?: boolean | null
          keep_outfit?: boolean | null
          updated_at?: string
        }
        Update: {
          camera_angle?: string | null
          camera_framing?: string | null
          character_weight?: number | null
          created_at?: string
          default_style?: string | null
          id?: string
          influencer_id?: string
          keep_face?: boolean | null
          keep_hair?: boolean | null
          keep_outfit?: boolean | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "influencer_settings_influencer_id_fkey"
            columns: ["influencer_id"]
            isOneToOne: true
            referencedRelation: "influencers"
            referencedColumns: ["id"]
          },
        ]
      }
      influencers: {
        Row: {
          age: number | null
          avatar_url: string | null
          bio: string | null
          brand_id: string | null
          created_at: string
          id: string
          name: string
          org_id: string | null
          persona_type: string | null
          personality: string | null
          stats: Json | null
          status: string
          tags: string[] | null
          updated_at: string
          user_id: string
        }
        Insert: {
          age?: number | null
          avatar_url?: string | null
          bio?: string | null
          brand_id?: string | null
          created_at?: string
          id?: string
          name: string
          org_id?: string | null
          persona_type?: string | null
          personality?: string | null
          stats?: Json | null
          status?: string
          tags?: string[] | null
          updated_at?: string
          user_id: string
        }
        Update: {
          age?: number | null
          avatar_url?: string | null
          bio?: string | null
          brand_id?: string | null
          created_at?: string
          id?: string
          name?: string
          org_id?: string | null
          persona_type?: string | null
          personality?: string | null
          stats?: Json | null
          status?: string
          tags?: string[] | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "influencers_brand_id_fkey"
            columns: ["brand_id"]
            isOneToOne: false
            referencedRelation: "business_dna"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "influencers_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      kah_messages: {
        Row: {
          content: string
          created_at: string
          id: string
          meta: Json | null
          role: string
          session_id: string | null
          user_id: string | null
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          meta?: Json | null
          role?: string
          session_id?: string | null
          user_id?: string | null
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          meta?: Json | null
          role?: string
          session_id?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      kah_qa_corpus: {
        Row: {
          answer: string
          category: string | null
          created_at: string
          id: string
          question_pattern: string
        }
        Insert: {
          answer: string
          category?: string | null
          created_at?: string
          id?: string
          question_pattern: string
        }
        Update: {
          answer?: string
          category?: string | null
          created_at?: string
          id?: string
          question_pattern?: string
        }
        Relationships: []
      }
      landing_pages: {
        Row: {
          campaign_id: string | null
          content: Json | null
          conversions: number | null
          created_at: string
          headline: string | null
          id: string
          slug: string | null
          user_id: string
          views: number | null
        }
        Insert: {
          campaign_id?: string | null
          content?: Json | null
          conversions?: number | null
          created_at?: string
          headline?: string | null
          id?: string
          slug?: string | null
          user_id: string
          views?: number | null
        }
        Update: {
          campaign_id?: string | null
          content?: Json | null
          conversions?: number | null
          created_at?: string
          headline?: string | null
          id?: string
          slug?: string | null
          user_id?: string
          views?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "landing_pages_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "unified_campaigns"
            referencedColumns: ["id"]
          },
        ]
      }
      leads: {
        Row: {
          brand_id: string | null
          company: string | null
          created_at: string
          email: string | null
          id: string
          name: string | null
          notes: string | null
          org_id: string | null
          role: string | null
          source: string | null
          stage: string
          updated_at: string
          user_id: string
          utm_campaign: string | null
          utm_content: string | null
          utm_medium: string | null
          utm_source: string | null
        }
        Insert: {
          brand_id?: string | null
          company?: string | null
          created_at?: string
          email?: string | null
          id?: string
          name?: string | null
          notes?: string | null
          org_id?: string | null
          role?: string | null
          source?: string | null
          stage?: string
          updated_at?: string
          user_id: string
          utm_campaign?: string | null
          utm_content?: string | null
          utm_medium?: string | null
          utm_source?: string | null
        }
        Update: {
          brand_id?: string | null
          company?: string | null
          created_at?: string
          email?: string | null
          id?: string
          name?: string | null
          notes?: string | null
          org_id?: string | null
          role?: string | null
          source?: string | null
          stage?: string
          updated_at?: string
          user_id?: string
          utm_campaign?: string | null
          utm_content?: string | null
          utm_medium?: string | null
          utm_source?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "leads_brand_id_fkey"
            columns: ["brand_id"]
            isOneToOne: false
            referencedRelation: "business_dna"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "leads_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      memberships: {
        Row: {
          created_at: string
          id: string
          organization_id: string
          role: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          organization_id: string
          role?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          organization_id?: string
          role?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "memberships_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          created_at: string
          id: string
          is_read: boolean
          message: string | null
          title: string
          type: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_read?: boolean
          message?: string | null
          title: string
          type: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          is_read?: boolean
          message?: string | null
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: []
      }
      organizations: {
        Row: {
          active_brand_id: string | null
          assets_limit: number
          created_at: string
          id: string
          max_brands: number
          name: string
          owner_id: string
          plan: string
          slug: string
          updated_at: string
        }
        Insert: {
          active_brand_id?: string | null
          assets_limit?: number
          created_at?: string
          id?: string
          max_brands?: number
          name: string
          owner_id: string
          plan?: string
          slug: string
          updated_at?: string
        }
        Update: {
          active_brand_id?: string | null
          assets_limit?: number
          created_at?: string
          id?: string
          max_brands?: number
          name?: string
          owner_id?: string
          plan?: string
          slug?: string
          updated_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          account_status: string
          avatar_url: string | null
          created_at: string
          credits: number
          email: string | null
          id: string
          name: string | null
          onboarding_completed: boolean
          plan: string
          role: string
          updated_at: string
          user_id: string
        }
        Insert: {
          account_status?: string
          avatar_url?: string | null
          created_at?: string
          credits?: number
          email?: string | null
          id?: string
          name?: string | null
          onboarding_completed?: boolean
          plan?: string
          role?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          account_status?: string
          avatar_url?: string | null
          created_at?: string
          credits?: number
          email?: string | null
          id?: string
          name?: string | null
          onboarding_completed?: boolean
          plan?: string
          role?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      scheduled_posts: {
        Row: {
          campaign_id: string | null
          content: string | null
          created_at: string
          id: string
          image_url: string | null
          influencer_id: string | null
          platform: string
          scheduled_for: string
          status: string
          user_id: string
        }
        Insert: {
          campaign_id?: string | null
          content?: string | null
          created_at?: string
          id?: string
          image_url?: string | null
          influencer_id?: string | null
          platform: string
          scheduled_for: string
          status?: string
          user_id: string
        }
        Update: {
          campaign_id?: string | null
          content?: string | null
          created_at?: string
          id?: string
          image_url?: string | null
          influencer_id?: string | null
          platform?: string
          scheduled_for?: string
          status?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "scheduled_posts_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "unified_campaigns"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "scheduled_posts_influencer_id_fkey"
            columns: ["influencer_id"]
            isOneToOne: false
            referencedRelation: "influencers"
            referencedColumns: ["id"]
          },
        ]
      }
      social_connections: {
        Row: {
          access_token_encrypted: string | null
          created_at: string
          expires_at: string | null
          id: string
          org_id: string | null
          platform: string
          platform_user_id: string | null
          platform_username: string | null
          refresh_token_encrypted: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          access_token_encrypted?: string | null
          created_at?: string
          expires_at?: string | null
          id?: string
          org_id?: string | null
          platform: string
          platform_user_id?: string | null
          platform_username?: string | null
          refresh_token_encrypted?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          access_token_encrypted?: string | null
          created_at?: string
          expires_at?: string | null
          id?: string
          org_id?: string | null
          platform?: string
          platform_user_id?: string | null
          platform_username?: string | null
          refresh_token_encrypted?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "social_connections_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      social_posts: {
        Row: {
          connection_id: string | null
          content: string | null
          created_at: string
          id: string
          image_url: string | null
          metrics: Json | null
          platform_post_id: string | null
          published_at: string | null
          status: string
          user_id: string
        }
        Insert: {
          connection_id?: string | null
          content?: string | null
          created_at?: string
          id?: string
          image_url?: string | null
          metrics?: Json | null
          platform_post_id?: string | null
          published_at?: string | null
          status?: string
          user_id: string
        }
        Update: {
          connection_id?: string | null
          content?: string | null
          created_at?: string
          id?: string
          image_url?: string | null
          metrics?: Json | null
          platform_post_id?: string | null
          published_at?: string | null
          status?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "social_posts_connection_id_fkey"
            columns: ["connection_id"]
            isOneToOne: false
            referencedRelation: "social_connections"
            referencedColumns: ["id"]
          },
        ]
      }
      system_influencers: {
        Row: {
          avatar_url: string | null
          behavioral_constraints: string | null
          camera_rules: string | null
          created_at: string
          id: string
          name: string
          persona_description: string | null
        }
        Insert: {
          avatar_url?: string | null
          behavioral_constraints?: string | null
          camera_rules?: string | null
          created_at?: string
          id?: string
          name: string
          persona_description?: string | null
        }
        Update: {
          avatar_url?: string | null
          behavioral_constraints?: string | null
          camera_rules?: string | null
          created_at?: string
          id?: string
          name?: string
          persona_description?: string | null
        }
        Relationships: []
      }
      unified_campaigns: {
        Row: {
          angle: string | null
          brand_id: string | null
          clicks: number | null
          conversions: number | null
          created_at: string
          id: string
          impressions: number | null
          leads_count: number | null
          name: string
          org_id: string | null
          rationale: string | null
          status: string
          target_icp: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          angle?: string | null
          brand_id?: string | null
          clicks?: number | null
          conversions?: number | null
          created_at?: string
          id?: string
          impressions?: number | null
          leads_count?: number | null
          name: string
          org_id?: string | null
          rationale?: string | null
          status?: string
          target_icp?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          angle?: string | null
          brand_id?: string | null
          clicks?: number | null
          conversions?: number | null
          created_at?: string
          id?: string
          impressions?: number | null
          leads_count?: number | null
          name?: string
          org_id?: string | null
          rationale?: string | null
          status?: string
          target_icp?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "unified_campaigns_brand_id_fkey"
            columns: ["brand_id"]
            isOneToOne: false
            referencedRelation: "business_dna"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "unified_campaigns_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      video_jobs: {
        Row: {
          created_at: string
          error: string | null
          id: string
          influencer_id: string | null
          input_refs: Json | null
          job_type: string | null
          lip_sync: boolean | null
          org_id: string | null
          output_url: string | null
          progress: number | null
          provider: string | null
          script_id: string | null
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          error?: string | null
          id?: string
          influencer_id?: string | null
          input_refs?: Json | null
          job_type?: string | null
          lip_sync?: boolean | null
          org_id?: string | null
          output_url?: string | null
          progress?: number | null
          provider?: string | null
          script_id?: string | null
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          error?: string | null
          id?: string
          influencer_id?: string | null
          input_refs?: Json | null
          job_type?: string | null
          lip_sync?: boolean | null
          org_id?: string | null
          output_url?: string | null
          progress?: number | null
          provider?: string | null
          script_id?: string | null
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "video_jobs_influencer_id_fkey"
            columns: ["influencer_id"]
            isOneToOne: false
            referencedRelation: "influencers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "video_jobs_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "video_jobs_script_id_fkey"
            columns: ["script_id"]
            isOneToOne: false
            referencedRelation: "video_scripts"
            referencedColumns: ["id"]
          },
        ]
      }
      video_scenes: {
        Row: {
          aspect_ratio: string | null
          created_at: string
          duration: number | null
          id: string
          prompt: string | null
          scene_number: number
          video_job_id: string
        }
        Insert: {
          aspect_ratio?: string | null
          created_at?: string
          duration?: number | null
          id?: string
          prompt?: string | null
          scene_number?: number
          video_job_id: string
        }
        Update: {
          aspect_ratio?: string | null
          created_at?: string
          duration?: number | null
          id?: string
          prompt?: string | null
          scene_number?: number
          video_job_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "video_scenes_video_job_id_fkey"
            columns: ["video_job_id"]
            isOneToOne: false
            referencedRelation: "video_jobs"
            referencedColumns: ["id"]
          },
        ]
      }
      video_scripts: {
        Row: {
          created_at: string
          delivery_notes: string | null
          duration: number | null
          id: string
          platform: string | null
          scenes: Json | null
          script_type: string | null
          title: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          delivery_notes?: string | null
          duration?: number | null
          id?: string
          platform?: string | null
          scenes?: Json | null
          script_type?: string | null
          title?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          delivery_notes?: string | null
          duration?: number | null
          id?: string
          platform?: string | null
          scenes?: Json | null
          script_type?: string | null
          title?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      white_label_settings: {
        Row: {
          accent_color: string | null
          brand_name: string | null
          created_at: string
          custom_domain: string | null
          custom_footer: string | null
          favicon_url: string | null
          hide_branding: boolean | null
          id: string
          logo_url: string | null
          org_id: string
          primary_color: string | null
          secondary_color: string | null
          support_email: string | null
          updated_at: string
        }
        Insert: {
          accent_color?: string | null
          brand_name?: string | null
          created_at?: string
          custom_domain?: string | null
          custom_footer?: string | null
          favicon_url?: string | null
          hide_branding?: boolean | null
          id?: string
          logo_url?: string | null
          org_id: string
          primary_color?: string | null
          secondary_color?: string | null
          support_email?: string | null
          updated_at?: string
        }
        Update: {
          accent_color?: string | null
          brand_name?: string | null
          created_at?: string
          custom_domain?: string | null
          custom_footer?: string | null
          favicon_url?: string | null
          hide_branding?: boolean | null
          id?: string
          logo_url?: string | null
          org_id?: string
          primary_color?: string | null
          secondary_color?: string | null
          support_email?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "white_label_settings_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: true
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_user_role: { Args: { p_user_id: string }; Returns: string }
      is_admin: { Args: { p_user_id: string }; Returns: boolean }
      is_org_member: {
        Args: { p_org_id: string; p_user_id: string }
        Returns: boolean
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
