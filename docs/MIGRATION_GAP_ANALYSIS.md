# Matango.ai Migration Gap Analysis
## Lovable Platform — February 2026

### Current State in Lovable
- ✅ Landing page (Hero, PainPoints, OneLoop, Features, Audience, CTA sections)
- ✅ Dark theme design system (tailwind.config.ts + index.css)
- ✅ Dashboard layout with sidebar navigation (5 nav groups)
- ✅ App routing (40+ routes defined in App.tsx)
- ✅ Lovable Cloud enabled (Supabase project connected)
- ✅ Brand assets (matango-icon.png, matango-logo.png)
- ❌ **All app pages are stubs** (StubPage components only)
- ❌ **No database schema** created
- ❌ **No authentication** wired up
- ❌ **No edge functions** created
- ❌ **No Stripe integration**
- ❌ **No file storage** configured
- ❌ **No AI generation** capabilities

---

## MIGRATION TODO — Organized by Priority

### 🔴 P0 — Foundation (Must Have First)

#### 1. Database Schema Migration
Recreate 35+ tables from Drizzle/MySQL → Supabase PostgreSQL.

Tables needed (grouped by domain):

**Core:**
- [ ] `profiles` (id, user_id FK→auth.users, name, email, role, plan, credits, avatar_url, onboarding_completed, account_status, created_at, updated_at)
- [ ] `organizations` (id, owner_id, name, slug, plan, assets_limit, active_brand_id, max_brands, created_at)
- [ ] `memberships` (id, organization_id, user_id, role: owner/admin/marketer/viewer, created_at)

**Brand Brain:**
- [ ] `business_dna` (id, user_id, org_id, brand_name, product_name, website_url, category, tagline, brand_tone, icp_personas JSONB, key_outcomes JSONB, differentiators JSONB, claims_proof JSONB, voice_rules JSONB, forbidden_phrases TEXT[], status, is_active, created_at, updated_at)

**AI Influencers:**
- [ ] `influencers` (id, user_id, org_id, brand_id, name, age, bio, personality, avatar_url, tags TEXT[], stats JSONB, created_at, updated_at)
- [ ] `influencer_content` (id, influencer_id, image_url, prompt, content_type, created_at)
- [ ] `influencer_settings` (id, influencer_id, character_weight, keep_outfit, keep_face, keep_hair, default_style, created_at)
- [ ] `influencer_personas` (id, influencer_id, persona_type, style_guide, vocabulary, hook_patterns, cta_patterns, created_at)
- [ ] `system_influencers` (id, name, persona_description, camera_rules, behavioral_constraints, avatar_url, created_at)

**Campaigns:**
- [ ] `unified_campaigns` (id, user_id, org_id, brand_id, name, angle, rationale, status, target_icp, impressions, clicks, conversions, leads_count, created_at, updated_at)
- [ ] `campaign_assets` (id, campaign_id, asset_type, platform, content, status, utm_tracking JSONB, created_at)
- [ ] `campaigns` (id, influencer_id, total_scenes, status, created_at) — legacy story campaigns
- [ ] `campaign_scenes` (id, campaign_id, scene_number, prompt, caption, image_url, scheduled_for, created_at)

**Social & Publishing:**
- [ ] `social_connections` (id, user_id, org_id, platform, access_token_encrypted, refresh_token_encrypted, platform_username, platform_user_id, expires_at, created_at)
- [ ] `social_posts` (id, user_id, connection_id, platform_post_id, content, status, metrics JSONB, published_at, created_at)
- [ ] `scheduled_posts` (id, user_id, influencer_id, platform, content, image_url, scheduled_for, status, created_at)

**Analytics:**
- [ ] `analytics_data` (id, influencer_id, date, followers, likes, views, comments, shares, engagement_rate, created_at)
- [ ] `analytics_events` (id, user_id, event_type, source, platform, metadata JSONB, created_at)
- [ ] `auto_insights` (id, user_id, org_id, insight_type, title, description, confidence, created_at)

**A/B Testing:**
- [ ] `ab_tests` (id, user_id, org_id, campaign_id, test_type, status, target_metric, confidence_level, min_sample_size, auto_optimize, created_at)
- [ ] `ab_test_variants` (id, test_id, name, content, traffic_split, impressions, clicks, conversions, conversion_rate, is_winner, created_at)

**CRM & Leads:**
- [ ] `leads` (id, user_id, org_id, brand_id, email, name, company, role, source, stage, utm_source, utm_medium, utm_campaign, utm_content, notes, created_at, updated_at)
- [ ] `landing_pages` (id, user_id, campaign_id, headline, slug, views, conversions, content JSONB, created_at)
- [ ] `email_sequences` (id, user_id, campaign_id, sequence_type, is_active, created_at)
- [ ] `email_sequence_steps` (id, sequence_id, step_number, subject, body, delay_days, sent, opened, clicked, created_at)

**White-Label & Agency:**
- [ ] `white_label_settings` (id, org_id, brand_name, logo_url, favicon_url, primary_color, secondary_color, accent_color, custom_domain, hide_branding, custom_footer, support_email, created_at)
- [ ] `custom_email_templates` (id, org_id, template_type, subject, html_content, created_at)
- [ ] `client_workspaces` (id, org_id, client_name, access_token, created_at)

**Video & Scripts:**
- [ ] `video_scripts` (id, user_id, script_type, title, scenes JSONB, delivery_notes, duration, platform, created_at)
- [ ] `video_jobs` (id, user_id, org_id, influencer_id, script_id, job_type, status, progress, input_refs JSONB, output_url, lip_sync, provider, error, created_at, updated_at)
- [ ] `video_scenes` (id, video_job_id, scene_number, prompt, duration, aspect_ratio, created_at)

**Asset Management:**
- [ ] `asset_library` (id, org_id, brand_id, type, url, prompt, model, tags TEXT[], metadata JSONB, parent_id, version, created_at, updated_at)
- [ ] `asset_versions` (id, asset_id, version, url, edit_op, prompt, model, diff JSONB, created_at)
- [ ] `edit_sessions` (id, asset_id, user_id, messages JSONB, status, created_at, updated_at)

**Notifications & Collaboration:**
- [ ] `notifications` (id, user_id, type, title, message, is_read, created_at)
- [ ] `collaborators` (id, influencer_id, user_id, email, role, status, invite_token, created_at)

**Content Templates:**
- [ ] `content_templates` (id, user_id, name, description, category, prompt_template, style_preset, character_weight, usage_count, is_custom, created_at)

**Admin:**
- [ ] `admin_audit_log` (id, admin_id, action, target_type, target_id, details JSONB, created_at)
- [ ] `feature_flags` (id, name, description, is_enabled, rules JSONB, created_at)

**K'ah Chat:**
- [ ] `kah_messages` (id, user_id, session_id, role, content, meta JSONB, created_at)
- [ ] `kah_qa_corpus` (id, question_pattern, answer, category, created_at)

#### 2. Authentication System
- [ ] Wire up Lovable Cloud auth (email/password signup + login)
- [ ] Create profiles table trigger (auto-create profile on signup)
- [ ] Protected routes (redirect to /auth if not logged in)
- [ ] Session management with onAuthStateChange
- [ ] Google OAuth via Lovable Cloud managed provider

#### 3. RLS Policies
- [ ] All user-scoped tables: user can only CRUD own data
- [ ] Org-scoped tables: access via membership verification
- [ ] Public tables (system_influencers, kah_qa_corpus): SELECT for all
- [ ] Admin tables: admin role only

#### 4. File Storage
- [ ] Create `avatars` bucket (public)
- [ ] Create `content` bucket (public)
- [ ] Create `videos` bucket (public)
- [ ] Create `training-images` bucket (private)
- [ ] RLS policies for each bucket

---

### 🟠 P1 — Core Features (The One Loop)

#### 5. Brand Brain Page
- [ ] Multi-step form: Basics → ICP Personas → Value Prop → Claims & Proof → Brand Voice
- [ ] URL validation with favicon display
- [ ] Auto-enrich from website URL (edge function + AI)
- [ ] LinkedIn import
- [ ] Brand Brain templates (SaaS, E-commerce, Agency, Coaching, + 8 more)
- [ ] AI suggestion buttons per section
- [ ] Completion score (0-100%)
- [ ] Success modal with next steps
- [ ] Multi-brand support (Agency tier)

#### 6. AI Influencer Studio
- [ ] Create influencer (name, image upload, text prompt)
- [ ] Dual-path creation (upload reference images vs prompt-only)
- [ ] Character consistency controls (weight slider, keep outfit/face/hair)
- [ ] Persona types (Founder, Practitioner, Analyst, Custom)
- [ ] Generation workspace (prompt box, style presets, aspect ratio, negative prompt)
- [ ] Gallery with like/save/download/delete
- [ ] Brand Brain binding
- [ ] System influencers (K'ah)

#### 7. Campaign Factory
- [ ] Create campaign from angle + Brand Brain context
- [ ] Multi-channel asset generation (LinkedIn, X, TikTok, Instagram, Email, Ads, Landing Pages)
- [ ] Campaign status workflow (draft → generating → review → approved → scheduled → live)
- [ ] UTM tracking per asset
- [ ] Performance tracking (impressions, clicks, conversions)

#### 8. Video Studio
- [ ] Script-to-video workflow
- [ ] Scene builder with storyboard
- [ ] Lip sync generation
- [ ] Motion sync
- [ ] Video upscale
- [ ] Preview before full render
- [ ] Export presets
- [ ] Batch generation
- [ ] Influencer selection

#### 9. Scheduler
- [ ] Calendar view for scheduled content
- [ ] Multi-platform scheduling (Instagram, TikTok, YouTube, LinkedIn, Facebook)
- [ ] Auto-publish from schedule
- [ ] Status tracking (pending → publishing → published/failed)

#### 10. Analytics Hub
- [ ] Unified dashboard (reach, engagement, followers, content performance)
- [ ] Auto-insights with AI recommendations
- [ ] Per-campaign ROI tracking
- [ ] Channel comparison
- [ ] Time-range filters

---

### 🟡 P2 — Extended Features

#### 11. A/B Testing
- [ ] Create test variants
- [ ] Traffic splitting
- [ ] Performance comparison dashboard
- [ ] Statistical significance calculation
- [ ] Auto-optimization
- [ ] Winner declaration

#### 12. Leads CRM
- [ ] Lead capture and management
- [ ] Pipeline stages (new → contacted → qualified → proposal → won/lost)
- [ ] UTM attribution tracking
- [ ] Lead export

#### 13. Social Connections
- [ ] OAuth flows for each platform (Instagram, Facebook, YouTube, TikTok, LinkedIn)
- [ ] Connection status indicators
- [ ] Token refresh mechanism
- [ ] Auto-posting integration

#### 14. Templates System
- [ ] Pre-built content templates by category
- [ ] Custom template creation
- [ ] Template marketplace (browse, search, categories)
- [ ] Usage tracking

#### 15. Team Collaboration
- [ ] Email invitations with unique tokens
- [ ] Role-based permissions (owner, editor, viewer)
- [ ] Shared influencer management

#### 16. Notifications
- [ ] In-app notification center
- [ ] Unread count badge
- [ ] Email notification preferences
- [ ] Event types (post published, milestone, team invite, weekly report)

#### 17. Content Chat
- [ ] Chat with AI influencer
- [ ] Conversation history
- [ ] Personality-based responses

#### 18. K'ah Chat Widget
- [ ] Floating chat widget on all pages
- [ ] Q&A corpus integration
- [ ] Suggested questions
- [ ] No auth required for public chat

---

### 🟢 P3 — Agency & Enterprise

#### 19. Multi-Brand Support
- [ ] Multiple Brand Brains per organization
- [ ] Brand switcher in navbar
- [ ] Brand-scoped campaigns, influencers, leads, analytics
- [ ] Plan-based brand limits (Free: 1, Basic: 3, Agency: unlimited)

#### 20. White-Label
- [ ] Custom branding (logo, colors, favicon)
- [ ] Custom domain support
- [ ] Remove Matango branding option
- [ ] Client workspaces

#### 21. Stripe Billing
- [ ] Enable Stripe integration
- [ ] 4 tiers: Free ($0), Basic ($199/mo), Agency ($399/mo), Agency++ (custom)
- [ ] Yearly pricing (Basic $1,990, Agency $3,990)
- [ ] Credits metering
- [ ] Plan enforcement middleware
- [ ] Subscription management (pause, resume, cancel, downgrade)
- [ ] Webhook handling

#### 22. Admin Panel
- [ ] Admin overview dashboard
- [ ] Tenant management (list, detail, suspend/unsuspend)
- [ ] Billing management
- [ ] Feature flags
- [ ] Audit log viewer
- [ ] GDPR request processing
- [ ] System health monitoring
- [ ] Content moderation queue

---

### 🔵 P4 — Advanced / Polish

#### 23. Onboarding Wizard (AAO)
- [ ] Multi-step wizard for new users
- [ ] 5-Step Growth Loop (Plan → Brand Brain → Campaign → Publish → Optimize)
- [ ] Plan selection drawer
- [ ] Onboarding gate on dashboard

#### 24. Story Studio
- [ ] Story templates (Explainer, Character vlog, Music montage, Product demo)
- [ ] Storyboard builder with scene cards
- [ ] Multi-scene stories

#### 25. Asset Library
- [ ] Unified asset management (images, videos)
- [ ] Version history
- [ ] Tags and folders
- [ ] Bulk operations

#### 26. Bulk Create
- [ ] CSV/JSON prompt upload
- [ ] Generate at scale (N prompts × M variants)
- [ ] Queue + progress display

#### 27. AI Provider Selection (BYOK)
- [ ] Provider management page
- [ ] API key storage (encrypted)
- [ ] Usage analytics per provider
- [ ] Provider routing for generation jobs

#### 28. Account Lifecycle
- [ ] Account settings page
- [ ] Account deletion wizard (pause → deactivate → delete)
- [ ] 90-day soft delete + 12-month retention
- [ ] GDPR export/delete

#### 29. AAO Glossary & About Page
- [ ] AAO terminology and taxonomy
- [ ] Comparison table (AAO vs Tools vs Human Teams)
- [ ] About page with company narrative

#### 30. Workflow Navigation
- [ ] Pipeline navigation component (Brand Brain → Campaign → Scripts → Video → Publish)
- [ ] Forward/back navigation between stages
- [ ] Stage completion indicators

---

### Edge Functions Needed
- [ ] `ai-generate` — LLM text generation (brand enrichment, campaign assets, suggestions)
- [ ] `ai-image` — Image generation proxy (influencer avatars, content)
- [ ] `ai-video` — Video generation proxy (lip-sync, motion-sync)
- [ ] `stripe-webhook` — Handle Stripe events
- [ ] `social-oauth` — Social media OAuth callback handler
- [ ] `social-publish` — Auto-publish scheduled content
- [ ] `kah-chat` — K'ah public chat endpoint

---

### Secrets Required
- [ ] STRIPE_SECRET_KEY
- [ ] STRIPE_WEBHOOK_SECRET
- [ ] (Social media OAuth keys — Instagram, YouTube, TikTok, LinkedIn)
- [ ] (BYOK AI provider keys — user-managed)

---

## Recommended Implementation Order

1. **Database schema** (P0.1) — Create all tables + RLS
2. **Auth** (P0.2) — Wire up signup/login + protected routes
3. **Brand Brain** (P1.5) — First real feature, foundation for all content
4. **Influencer Studio** (P1.6) — Core content creation
5. **Campaign Factory** (P1.7) — Asset generation
6. **Video Studio** (P1.8) — Video creation
7. **Scheduler + Social** (P1.9, P2.13) — Publishing
8. **Analytics** (P1.10) — Performance tracking
9. **Stripe Billing** (P3.21) — Monetization
10. **Admin + Agency** (P3.19-22) — Scale features

Each step should be requested individually to keep changes manageable.
