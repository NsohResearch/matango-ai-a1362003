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
      aao_activity_log: {
        Row: {
          aao_type: string
          action: string
          completed_at: string | null
          created_at: string
          description: string | null
          id: string
          metadata: Json | null
          started_at: string | null
          status: string
          user_id: string
        }
        Insert: {
          aao_type: string
          action: string
          completed_at?: string | null
          created_at?: string
          description?: string | null
          id?: string
          metadata?: Json | null
          started_at?: string | null
          status?: string
          user_id: string
        }
        Update: {
          aao_type?: string
          action?: string
          completed_at?: string | null
          created_at?: string
          description?: string | null
          id?: string
          metadata?: Json | null
          started_at?: string | null
          status?: string
          user_id?: string
        }
        Relationships: []
      }
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
      account_lifecycle_events: {
        Row: {
          action: string
          actor_user_id: string
          created_at: string
          id: string
          metadata: Json | null
          org_id: string
        }
        Insert: {
          action: string
          actor_user_id: string
          created_at?: string
          id?: string
          metadata?: Json | null
          org_id: string
        }
        Update: {
          action?: string
          actor_user_id?: string
          created_at?: string
          id?: string
          metadata?: Json | null
          org_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "account_lifecycle_events_org_id_fkey"
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
          campaign_id: string | null
          created_at: string
          event_type: string
          id: string
          metadata: Json | null
          platform: string | null
          recorded_at: string | null
          source: string | null
          user_id: string
          value: number | null
        }
        Insert: {
          campaign_id?: string | null
          created_at?: string
          event_type: string
          id?: string
          metadata?: Json | null
          platform?: string | null
          recorded_at?: string | null
          source?: string | null
          user_id: string
          value?: number | null
        }
        Update: {
          campaign_id?: string | null
          created_at?: string
          event_type?: string
          id?: string
          metadata?: Json | null
          platform?: string | null
          recorded_at?: string | null
          source?: string | null
          user_id?: string
          value?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "analytics_events_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "unified_campaigns"
            referencedColumns: ["id"]
          },
        ]
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
      credit_ledger: {
        Row: {
          admin_id: string | null
          created_at: string
          delta: number
          id: string
          note: string | null
          reason: string
          user_id: string
        }
        Insert: {
          admin_id?: string | null
          created_at?: string
          delta: number
          id?: string
          note?: string | null
          reason: string
          user_id: string
        }
        Update: {
          admin_id?: string | null
          created_at?: string
          delta?: number
          id?: string
          note?: string | null
          reason?: string
          user_id?: string
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
      customer_reviews: {
        Row: {
          approved: boolean
          approved_at: string | null
          approved_by: string | null
          company: string | null
          created_at: string
          id: string
          ip_hash: string | null
          name: string
          rating: number
          review_text: string
          role: string | null
          updated_at: string
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          approved?: boolean
          approved_at?: string | null
          approved_by?: string | null
          company?: string | null
          created_at?: string
          id?: string
          ip_hash?: string | null
          name: string
          rating: number
          review_text: string
          role?: string | null
          updated_at?: string
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          approved?: boolean
          approved_at?: string | null
          approved_by?: string | null
          company?: string | null
          created_at?: string
          id?: string
          ip_hash?: string | null
          name?: string
          rating?: number
          review_text?: string
          role?: string | null
          updated_at?: string
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      deletion_jobs: {
        Row: {
          completed_at: string | null
          created_at: string
          id: string
          last_error: string | null
          org_id: string
          scheduled_for: string
          status: string
        }
        Insert: {
          completed_at?: string | null
          created_at?: string
          id?: string
          last_error?: string | null
          org_id: string
          scheduled_for: string
          status?: string
        }
        Update: {
          completed_at?: string | null
          created_at?: string
          id?: string
          last_error?: string | null
          org_id?: string
          scheduled_for?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "deletion_jobs_org_id_fkey"
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
      gdpr_requests: {
        Row: {
          admin_id: string | null
          completed_at: string | null
          created_at: string
          id: string
          notes: string | null
          processed_at: string | null
          request_type: string
          result_url: string | null
          status: string
          user_id: string
        }
        Insert: {
          admin_id?: string | null
          completed_at?: string | null
          created_at?: string
          id?: string
          notes?: string | null
          processed_at?: string | null
          request_type: string
          result_url?: string | null
          status?: string
          user_id: string
        }
        Update: {
          admin_id?: string | null
          completed_at?: string | null
          created_at?: string
          id?: string
          notes?: string | null
          processed_at?: string | null
          request_type?: string
          result_url?: string | null
          status?: string
          user_id?: string
        }
        Relationships: []
      }
      inbound_leads: {
        Row: {
          company: string | null
          created_at: string
          email: string
          id: string
          ip_hash: string | null
          lead_type: string
          message: string
          name: string
          source_path: string | null
          user_agent: string | null
          user_id: string | null
          utm_campaign: string | null
          utm_content: string | null
          utm_medium: string | null
          utm_source: string | null
          utm_term: string | null
        }
        Insert: {
          company?: string | null
          created_at?: string
          email: string
          id?: string
          ip_hash?: string | null
          lead_type: string
          message: string
          name: string
          source_path?: string | null
          user_agent?: string | null
          user_id?: string | null
          utm_campaign?: string | null
          utm_content?: string | null
          utm_medium?: string | null
          utm_source?: string | null
          utm_term?: string | null
        }
        Update: {
          company?: string | null
          created_at?: string
          email?: string
          id?: string
          ip_hash?: string | null
          lead_type?: string
          message?: string
          name?: string
          source_path?: string | null
          user_agent?: string | null
          user_id?: string | null
          utm_campaign?: string | null
          utm_content?: string | null
          utm_medium?: string | null
          utm_source?: string | null
          utm_term?: string | null
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
          character_weight: number | null
          created_at: string
          id: string
          keep_outfit: boolean
          model_registry_id: string | null
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
          character_weight?: number | null
          created_at?: string
          id?: string
          keep_outfit?: boolean
          model_registry_id?: string | null
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
          character_weight?: number | null
          created_at?: string
          id?: string
          keep_outfit?: boolean
          model_registry_id?: string | null
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
            foreignKeyName: "influencers_model_registry_id_fkey"
            columns: ["model_registry_id"]
            isOneToOne: false
            referencedRelation: "model_registry"
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
      media_objects: {
        Row: {
          brand_id: string | null
          bucket: string
          content_tags: Json | null
          created_at: string
          duration_ms: number | null
          height: number | null
          id: string
          is_deleted: boolean
          mime_type: string
          object_key: string
          org_id: string | null
          sha256: string | null
          size_bytes: number
          type: string
          updated_at: string
          user_id: string
          width: number | null
        }
        Insert: {
          brand_id?: string | null
          bucket: string
          content_tags?: Json | null
          created_at?: string
          duration_ms?: number | null
          height?: number | null
          id?: string
          is_deleted?: boolean
          mime_type?: string
          object_key: string
          org_id?: string | null
          sha256?: string | null
          size_bytes?: number
          type?: string
          updated_at?: string
          user_id: string
          width?: number | null
        }
        Update: {
          brand_id?: string | null
          bucket?: string
          content_tags?: Json | null
          created_at?: string
          duration_ms?: number | null
          height?: number | null
          id?: string
          is_deleted?: boolean
          mime_type?: string
          object_key?: string
          org_id?: string | null
          sha256?: string | null
          size_bytes?: number
          type?: string
          updated_at?: string
          user_id?: string
          width?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "media_objects_brand_id_fkey"
            columns: ["brand_id"]
            isOneToOne: false
            referencedRelation: "business_dna"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "media_objects_org_id_fkey"
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
      model_registry: {
        Row: {
          brand_id: string | null
          created_at: string
          id: string
          metadata: Json | null
          name: string
          org_id: string | null
          provider: string
          provider_model_id: string
          status: string
          type: string
          updated_at: string
          user_id: string
        }
        Insert: {
          brand_id?: string | null
          created_at?: string
          id?: string
          metadata?: Json | null
          name: string
          org_id?: string | null
          provider?: string
          provider_model_id?: string
          status?: string
          type?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          brand_id?: string | null
          created_at?: string
          id?: string
          metadata?: Json | null
          name?: string
          org_id?: string | null
          provider?: string
          provider_model_id?: string
          status?: string
          type?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "model_registry_brand_id_fkey"
            columns: ["brand_id"]
            isOneToOne: false
            referencedRelation: "business_dna"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "model_registry_org_id_fkey"
            columns: ["org_id"]
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
          account_status: string
          active_brand_id: string | null
          address_line1: string | null
          assets_limit: number
          billing_status: string
          city: string | null
          company_email: string | null
          company_phone: string | null
          country: string | null
          created_at: string
          deleted_by_user_id: string | null
          favicon_url: string | null
          hard_delete_at: string | null
          id: string
          industry: string | null
          legal_name: string | null
          logo_url: string | null
          max_brands: number
          name: string
          owner_id: string
          paused_at: string | null
          paused_reason: string | null
          plan: string
          postal_code: string | null
          restored_at: string | null
          slug: string
          soft_deleted_at: string | null
          state: string | null
          updated_at: string
          website: string | null
        }
        Insert: {
          account_status?: string
          active_brand_id?: string | null
          address_line1?: string | null
          assets_limit?: number
          billing_status?: string
          city?: string | null
          company_email?: string | null
          company_phone?: string | null
          country?: string | null
          created_at?: string
          deleted_by_user_id?: string | null
          favicon_url?: string | null
          hard_delete_at?: string | null
          id?: string
          industry?: string | null
          legal_name?: string | null
          logo_url?: string | null
          max_brands?: number
          name: string
          owner_id: string
          paused_at?: string | null
          paused_reason?: string | null
          plan?: string
          postal_code?: string | null
          restored_at?: string | null
          slug: string
          soft_deleted_at?: string | null
          state?: string | null
          updated_at?: string
          website?: string | null
        }
        Update: {
          account_status?: string
          active_brand_id?: string | null
          address_line1?: string | null
          assets_limit?: number
          billing_status?: string
          city?: string | null
          company_email?: string | null
          company_phone?: string | null
          country?: string | null
          created_at?: string
          deleted_by_user_id?: string | null
          favicon_url?: string | null
          hard_delete_at?: string | null
          id?: string
          industry?: string | null
          legal_name?: string | null
          logo_url?: string | null
          max_brands?: number
          name?: string
          owner_id?: string
          paused_at?: string | null
          paused_reason?: string | null
          plan?: string
          postal_code?: string | null
          restored_at?: string | null
          slug?: string
          soft_deleted_at?: string | null
          state?: string | null
          updated_at?: string
          website?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          account_status: string
          account_type: string
          avatar_url: string | null
          bio: string | null
          city: string | null
          country: string | null
          created_at: string
          credits: number
          display_name: string | null
          email: string | null
          id: string
          linkedin_url: string | null
          name: string | null
          onboarding_completed: boolean
          personal_logo_url: string | null
          phone: string | null
          plan: string
          primary_color: string | null
          role: string
          role_title: string | null
          timezone: string | null
          typography_style: string | null
          updated_at: string
          user_id: string
          website: string | null
        }
        Insert: {
          account_status?: string
          account_type?: string
          avatar_url?: string | null
          bio?: string | null
          city?: string | null
          country?: string | null
          created_at?: string
          credits?: number
          display_name?: string | null
          email?: string | null
          id?: string
          linkedin_url?: string | null
          name?: string | null
          onboarding_completed?: boolean
          personal_logo_url?: string | null
          phone?: string | null
          plan?: string
          primary_color?: string | null
          role?: string
          role_title?: string | null
          timezone?: string | null
          typography_style?: string | null
          updated_at?: string
          user_id: string
          website?: string | null
        }
        Update: {
          account_status?: string
          account_type?: string
          avatar_url?: string | null
          bio?: string | null
          city?: string | null
          country?: string | null
          created_at?: string
          credits?: number
          display_name?: string | null
          email?: string | null
          id?: string
          linkedin_url?: string | null
          name?: string | null
          onboarding_completed?: boolean
          personal_logo_url?: string | null
          phone?: string | null
          plan?: string
          primary_color?: string | null
          role?: string
          role_title?: string | null
          timezone?: string | null
          typography_style?: string | null
          updated_at?: string
          user_id?: string
          website?: string | null
        }
        Relationships: []
      }
      render_jobs: {
        Row: {
          actual_duration_ms: number | null
          brand_id: string | null
          completed_at: string | null
          created_at: string
          error_message: string | null
          estimated_duration_ms: number | null
          id: string
          logs: Json | null
          max_retries: number
          org_id: string | null
          output_id: string | null
          params: Json | null
          progress: number
          provider_job_id: string | null
          retry_count: number
          started_at: string | null
          status: string
          type: string
          updated_at: string
          user_id: string
          video_job_id: string | null
        }
        Insert: {
          actual_duration_ms?: number | null
          brand_id?: string | null
          completed_at?: string | null
          created_at?: string
          error_message?: string | null
          estimated_duration_ms?: number | null
          id?: string
          logs?: Json | null
          max_retries?: number
          org_id?: string | null
          output_id?: string | null
          params?: Json | null
          progress?: number
          provider_job_id?: string | null
          retry_count?: number
          started_at?: string | null
          status?: string
          type?: string
          updated_at?: string
          user_id: string
          video_job_id?: string | null
        }
        Update: {
          actual_duration_ms?: number | null
          brand_id?: string | null
          completed_at?: string | null
          created_at?: string
          error_message?: string | null
          estimated_duration_ms?: number | null
          id?: string
          logs?: Json | null
          max_retries?: number
          org_id?: string | null
          output_id?: string | null
          params?: Json | null
          progress?: number
          provider_job_id?: string | null
          retry_count?: number
          started_at?: string | null
          status?: string
          type?: string
          updated_at?: string
          user_id?: string
          video_job_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "render_jobs_brand_id_fkey"
            columns: ["brand_id"]
            isOneToOne: false
            referencedRelation: "business_dna"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "render_jobs_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "render_jobs_output_id_fkey"
            columns: ["output_id"]
            isOneToOne: false
            referencedRelation: "video_outputs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "render_jobs_video_job_id_fkey"
            columns: ["video_job_id"]
            isOneToOne: false
            referencedRelation: "video_jobs"
            referencedColumns: ["id"]
          },
        ]
      }
      scheduled_posts: {
        Row: {
          anomaly_flag: Json | null
          asset_id: string | null
          campaign_id: string | null
          content: string | null
          created_at: string
          hashtags: string[] | null
          id: string
          image_url: string | null
          influencer_id: string | null
          platform: string
          platforms: string[] | null
          scheduled_for: string
          status: string
          timezone: string | null
          user_id: string
          video_output_id: string | null
        }
        Insert: {
          anomaly_flag?: Json | null
          asset_id?: string | null
          campaign_id?: string | null
          content?: string | null
          created_at?: string
          hashtags?: string[] | null
          id?: string
          image_url?: string | null
          influencer_id?: string | null
          platform: string
          platforms?: string[] | null
          scheduled_for: string
          status?: string
          timezone?: string | null
          user_id: string
          video_output_id?: string | null
        }
        Update: {
          anomaly_flag?: Json | null
          asset_id?: string | null
          campaign_id?: string | null
          content?: string | null
          created_at?: string
          hashtags?: string[] | null
          id?: string
          image_url?: string | null
          influencer_id?: string | null
          platform?: string
          platforms?: string[] | null
          scheduled_for?: string
          status?: string
          timezone?: string | null
          user_id?: string
          video_output_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "scheduled_posts_asset_id_fkey"
            columns: ["asset_id"]
            isOneToOne: false
            referencedRelation: "asset_library"
            referencedColumns: ["id"]
          },
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
          {
            foreignKeyName: "scheduled_posts_video_output_id_fkey"
            columns: ["video_output_id"]
            isOneToOne: false
            referencedRelation: "video_outputs"
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
          error_message: string | null
          id: string
          image_url: string | null
          metrics: Json | null
          platform_post_id: string | null
          published_at: string | null
          retry_count: number | null
          scheduled_post_id: string | null
          status: string
          user_id: string
        }
        Insert: {
          connection_id?: string | null
          content?: string | null
          created_at?: string
          error_message?: string | null
          id?: string
          image_url?: string | null
          metrics?: Json | null
          platform_post_id?: string | null
          published_at?: string | null
          retry_count?: number | null
          scheduled_post_id?: string | null
          status?: string
          user_id: string
        }
        Update: {
          connection_id?: string | null
          content?: string | null
          created_at?: string
          error_message?: string | null
          id?: string
          image_url?: string | null
          metrics?: Json | null
          platform_post_id?: string | null
          published_at?: string | null
          retry_count?: number | null
          scheduled_post_id?: string | null
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
          {
            foreignKeyName: "social_posts_scheduled_post_id_fkey"
            columns: ["scheduled_post_id"]
            isOneToOne: false
            referencedRelation: "scheduled_posts"
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
      training_jobs: {
        Row: {
          brand_id: string | null
          completed_at: string | null
          created_at: string
          credit_cost: number
          error_message: string | null
          id: string
          influencer_id: string | null
          input_media_object_ids: Json
          logs: Json | null
          max_retries: number
          org_id: string | null
          output_model_registry_id: string | null
          progress: number
          provider_job_id: string | null
          retry_count: number
          started_at: string | null
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          brand_id?: string | null
          completed_at?: string | null
          created_at?: string
          credit_cost?: number
          error_message?: string | null
          id?: string
          influencer_id?: string | null
          input_media_object_ids?: Json
          logs?: Json | null
          max_retries?: number
          org_id?: string | null
          output_model_registry_id?: string | null
          progress?: number
          provider_job_id?: string | null
          retry_count?: number
          started_at?: string | null
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          brand_id?: string | null
          completed_at?: string | null
          created_at?: string
          credit_cost?: number
          error_message?: string | null
          id?: string
          influencer_id?: string | null
          input_media_object_ids?: Json
          logs?: Json | null
          max_retries?: number
          org_id?: string | null
          output_model_registry_id?: string | null
          progress?: number
          provider_job_id?: string | null
          retry_count?: number
          started_at?: string | null
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "training_jobs_brand_id_fkey"
            columns: ["brand_id"]
            isOneToOne: false
            referencedRelation: "business_dna"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "training_jobs_influencer_id_fkey"
            columns: ["influencer_id"]
            isOneToOne: false
            referencedRelation: "influencers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "training_jobs_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "training_jobs_output_model_registry_id_fkey"
            columns: ["output_model_registry_id"]
            isOneToOne: false
            referencedRelation: "model_registry"
            referencedColumns: ["id"]
          },
        ]
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
      usage_events: {
        Row: {
          created_at: string
          credits_used: number
          event_type: string
          id: string
          metadata: Json | null
          user_id: string
        }
        Insert: {
          created_at?: string
          credits_used?: number
          event_type: string
          id?: string
          metadata?: Json | null
          user_id: string
        }
        Update: {
          created_at?: string
          credits_used?: number
          event_type?: string
          id?: string
          metadata?: Json | null
          user_id?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
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
      video_outputs: {
        Row: {
          aspect_ratio: string
          brand_id: string | null
          created_at: string
          credit_cost: number
          format_preset: string
          height: number
          id: string
          is_preview: boolean
          org_id: string | null
          output_url: string | null
          quality: string
          status: string
          thumb_url: string | null
          updated_at: string
          user_id: string
          video_job_id: string | null
          width: number
        }
        Insert: {
          aspect_ratio?: string
          brand_id?: string | null
          created_at?: string
          credit_cost?: number
          format_preset?: string
          height?: number
          id?: string
          is_preview?: boolean
          org_id?: string | null
          output_url?: string | null
          quality?: string
          status?: string
          thumb_url?: string | null
          updated_at?: string
          user_id: string
          video_job_id?: string | null
          width?: number
        }
        Update: {
          aspect_ratio?: string
          brand_id?: string | null
          created_at?: string
          credit_cost?: number
          format_preset?: string
          height?: number
          id?: string
          is_preview?: boolean
          org_id?: string | null
          output_url?: string | null
          quality?: string
          status?: string
          thumb_url?: string | null
          updated_at?: string
          user_id?: string
          video_job_id?: string | null
          width?: number
        }
        Relationships: [
          {
            foreignKeyName: "video_outputs_brand_id_fkey"
            columns: ["brand_id"]
            isOneToOne: false
            referencedRelation: "business_dna"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "video_outputs_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "video_outputs_video_job_id_fkey"
            columns: ["video_job_id"]
            isOneToOne: false
            referencedRelation: "video_jobs"
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
          brand_font: string | null
          brand_name: string | null
          client_portal_mode: string | null
          created_at: string
          custom_domain: string | null
          custom_footer: string | null
          custom_login_url: string | null
          domain_verification_token: string | null
          domain_verified: boolean | null
          email_header_logo_url: string | null
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
          brand_font?: string | null
          brand_name?: string | null
          client_portal_mode?: string | null
          created_at?: string
          custom_domain?: string | null
          custom_footer?: string | null
          custom_login_url?: string | null
          domain_verification_token?: string | null
          domain_verified?: boolean | null
          email_header_logo_url?: string | null
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
          brand_font?: string | null
          brand_name?: string | null
          client_portal_mode?: string | null
          created_at?: string
          custom_domain?: string | null
          custom_footer?: string | null
          custom_login_url?: string | null
          domain_verification_token?: string | null
          domain_verified?: boolean | null
          email_header_logo_url?: string | null
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
      can_submit_review: { Args: { p_user: string }; Returns: boolean }
      get_credits_remaining: { Args: { p_user_id: string }; Returns: number }
      get_user_role: { Args: { p_user_id: string }; Returns: string }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_admin: { Args: { p_user_id: string }; Returns: boolean }
      is_org_member: {
        Args: { p_org_id: string; p_user_id: string }
        Returns: boolean
      }
    }
    Enums: {
      account_status: "active" | "paused" | "soft_deleted"
      app_role: "super_admin" | "admin" | "user" | "team_member" | "read_only"
      billing_status: "active" | "billing_stopped"
      lifecycle_action:
        | "pause"
        | "unpause"
        | "stop_billing"
        | "downgrade"
        | "soft_delete"
        | "restore"
        | "hard_delete"
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
      account_status: ["active", "paused", "soft_deleted"],
      app_role: ["super_admin", "admin", "user", "team_member", "read_only"],
      billing_status: ["active", "billing_stopped"],
      lifecycle_action: [
        "pause",
        "unpause",
        "stop_billing",
        "downgrade",
        "soft_delete",
        "restore",
        "hard_delete",
      ],
    },
  },
} as const
