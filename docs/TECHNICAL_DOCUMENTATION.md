# Matango.ai Technical Documentation

**Version:** 2.0  
**Last Updated:** February 28, 2026  
**Platform:** Lovable Cloud (Supabase)

---

## Table of Contents

1. [Tech Stack Overview](#tech-stack-overview)
2. [Architecture](#architecture)
3. [Database Schema](#database-schema)
4. [Authentication & Authorization](#authentication--authorization)
5. [Edge Functions](#edge-functions)
6. [Implemented Features](#implemented-features)
7. [Third-Party Integrations](#third-party-integrations)
8. [Security](#security)
9. [Testing](#testing)
10. [Production Readiness](#production-readiness)

---

## Tech Stack Overview

### Frontend

| Technology | Version | Purpose |
|------------|---------|---------|
| React | 18.3.1 | UI framework |
| TypeScript | 5.8.3 | Type-safe JavaScript |
| Vite | 5.4.19 | Build tool and dev server |
| TailwindCSS | 3.4.17 | Utility-first CSS framework |
| Framer Motion | 12.34.0 | Animation library |
| React Router DOM | 6.30.1 | Client-side routing |
| TanStack React Query | 5.83.0 | Server state management & caching |
| Radix UI | Various | Accessible component primitives (shadcn/ui) |
| Recharts | 2.15.4 | Data visualization |
| Sonner | 1.7.4 | Toast notifications |
| React Hook Form | 7.61.1 | Form state management |
| Zod | 3.25.76 | Schema validation |
| Lucide React | 0.462.0 | Icon library |
| date-fns | 3.6.0 | Date utilities |

### Backend (Lovable Cloud / Supabase)

| Technology | Purpose |
|------------|---------|
| Supabase PostgreSQL | Primary database (35+ tables with RLS) |
| Supabase Auth | Authentication (email/password + Google OAuth) |
| Supabase Edge Functions (Deno) | Serverless backend logic |
| Supabase Storage | File storage (avatars, content, videos, training images, brand assets) |
| Supabase Realtime | Live data subscriptions |

### External Services

| Service | Purpose |
|---------|---------|
| Stripe | Payment processing & subscription billing |
| OpenAI | AI text generation (GPT) |
| Google Veo | Video generation |
| LTX | Video generation (fallback) |
| Lovable AI | Built-in AI models for content generation |

### Development & Testing

| Tool | Purpose |
|------|---------|
| Vitest | Unit & integration testing |
| Playwright | E2E browser testing (CI/CD) |
| ESLint | Code linting |
| PostCSS + Autoprefixer | CSS processing |

---

## Architecture

### System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         Client (Browser)                         │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │                   React 18 + Vite + TypeScript           │    │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐│    │
│  │  │ 40+ Pages│  │Components│  │  Hooks   │  │   Lib    ││    │
│  │  └──────────┘  └──────────┘  └──────────┘  └──────────┘│    │
│  │                      │                                   │    │
│  │        ┌─────────────┴──────────────┐                   │    │
│  │        │   Supabase JS Client SDK   │                   │    │
│  │        │  + TanStack React Query    │                   │    │
│  └────────┴────────────────────────────┴───────────────────┘    │
└─────────────────────────────────────────────────────────────────┘
                              │
                              │ HTTPS (REST / Realtime WebSocket)
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    Lovable Cloud (Supabase)                       │
│                                                                   │
│  ┌──────────────────┐  ┌──────────────────┐  ┌────────────────┐ │
│  │   Supabase Auth   │  │  Edge Functions   │  │    Storage     │ │
│  │  Email + Google   │  │  (Deno Runtime)   │  │  5 buckets    │ │
│  │  OAuth, JWT       │  │  14 functions     │  │  avatars,     │ │
│  └──────────────────┘  └──────────────────┘  │  content,      │ │
│                                               │  videos, etc.  │ │
│  ┌──────────────────────────────────────────┐ └────────────────┘ │
│  │             PostgreSQL Database            │                   │
│  │  35+ tables with Row-Level Security (RLS)  │                   │
│  │  DB functions, triggers, enums             │                   │
│  └──────────────────────────────────────────┘                   │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                      External Services                           │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐       │
│  │  Stripe  │  │  OpenAI  │  │Google Veo│  │   LTX    │       │
│  │ Payments │  │   GPT    │  │  Video   │  │  Video   │       │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘       │
└─────────────────────────────────────────────────────────────────┘
```

### Directory Structure

```
matango-ai/
├── src/
│   ├── assets/                # Static assets (images, logos)
│   ├── components/
│   │   ├── ui/               # shadcn/ui primitives (50+ components)
│   │   ├── landing/          # Landing page sections
│   │   ├── marketing/        # About, Investors, Pricing sections
│   │   ├── branding/         # Brand management components
│   │   ├── video/            # Video studio components
│   │   ├── system/           # The System progress/transitions
│   │   ├── DashboardLayout   # Sidebar navigation with RBAC
│   │   ├── MobileNav         # Mobile hamburger menu
│   │   ├── Navbar            # Public page top navigation
│   │   └── ...               # 40+ shared components
│   ├── hooks/
│   │   ├── useAuth.tsx       # Auth context provider
│   │   ├── useData.ts        # TanStack Query data hooks (30+ queries)
│   │   ├── useTheme.tsx      # Theme (light/dark) management
│   │   ├── useIdleTimeout.ts # 5-hour idle auto-logout
│   │   └── ...
│   ├── lib/
│   │   ├── rbac.ts           # Role-based access control
│   │   ├── system-steps.ts   # The System 0-9 step definitions
│   │   ├── edge-functions.ts # Edge function call wrappers
│   │   ├── credits.ts        # Credit calculation logic
│   │   ├── i18n/             # Internationalization (13 languages)
│   │   └── ...
│   ├── pages/                # 40+ page components
│   │   ├── admin/            # 12 admin sub-pages
│   │   └── ...
│   ├── integrations/
│   │   └── supabase/         # Auto-generated client & types
│   ├── config/
│   │   ├── pricingTiers.ts   # 4-tier billing configuration
│   │   └── metrics.ts        # Analytics metrics config
│   └── test/                 # Vitest unit/integration tests
├── supabase/
│   ├── functions/            # 14 Deno Edge Functions
│   │   ├── _shared/          # Shared CORS headers
│   │   ├── ai-generate/
│   │   ├── kah-chat/
│   │   ├── aao-execute/
│   │   ├── create-checkout/
│   │   ├── check-subscription/
│   │   ├── customer-portal/
│   │   ├── stripe-webhook/
│   │   ├── process-video-job/
│   │   ├── process-training-job/
│   │   ├── publish-posts/
│   │   ├── generate-image/
│   │   ├── gdpr-process/
│   │   ├── analytics-seed/
│   │   ├── account-lifecycle/
│   │   ├── process-hard-deletes/
│   │   └── admin-manage-user/
│   ├── migrations/           # SQL migration files
│   └── config.toml           # Edge function configuration
├── e2e/                      # Playwright E2E tests
├── docs/                     # Project documentation
├── public/                   # Static public assets
└── playwright.config.ts      # Playwright configuration
```

---

## Database Schema

The database consists of 35+ PostgreSQL tables with Row-Level Security (RLS) enabled, organized into logical domains.

### Core Tables

| Table | Purpose | Key Fields |
|-------|---------|------------|
| `profiles` | User profiles (auto-created on signup) | user_id, name, email, plan, credits, role, onboarding_completed |
| `organizations` | Multi-tenant workspaces | owner_id, name, slug, plan, account_status, billing_status |
| `memberships` | Organization RBAC | organization_id, user_id, role |
| `user_roles` | Platform-level RBAC | user_id, role (app_role enum: super_admin, admin, user) |

### Brand Brain System

| Table | Purpose | Key Fields |
|-------|---------|------------|
| `business_dna` | Core brand memory | brand_name, brand_tone, icp_personas, key_outcomes, differentiators, voice_rules, forbidden_phrases |

### AI Influencer System

| Table | Purpose | Key Fields |
|-------|---------|------------|
| `influencers` | AI persona definitions | name, personality, avatar_url, persona_type, brand_id, model_registry_id |
| `influencer_content` | Generated images/posts | influencer_id, image_url, prompt, content_type |
| `influencer_settings` | Generation parameters | character_weight, keep_outfit, default_style, camera_angle |
| `influencer_personas` | Voice/style guides | style_guide, vocabulary, hook_patterns, cta_patterns |

### Campaign System

| Table | Purpose | Key Fields |
|-------|---------|------------|
| `unified_campaigns` | Campaign entities | name, angle, target_icp, status, brand_id |
| `campaign_assets` | Multi-channel content | campaign_id, asset_type, platform, content, utm_tracking |
| `campaigns` | Legacy story campaigns | influencer_id, total_scenes, status |
| `campaign_scenes` | Scene breakdowns | campaign_id, prompt, caption, image_url |

### Video & Content

| Table | Purpose | Key Fields |
|-------|---------|------------|
| `video_scripts` | Script content | title, platform, scenes, delivery_notes, script_type |
| `video_jobs` | Video generation queue | job_type, status, provider, input_refs |
| `video_outputs` | Generated videos | video_job_id, url, format, duration |
| `render_jobs` | Render processing | type, status, progress, provider_job_id |
| `video_providers` | Provider registry | name, api_base, is_enabled, supported_modalities |
| `provider_models` | Available models | provider_id, model_key, quality_tier, modalities |
| `model_registry` | Trained models | provider, provider_model_id, status, type |
| `content_templates` | Reusable prompts | name, category, prompt_template, style_preset |

### Asset Management

| Table | Purpose | Key Fields |
|-------|---------|------------|
| `asset_library` | Central asset store | type, url, tags, brand_id, version |
| `asset_versions` | Version history | asset_id, version, url, diff, edit_op |
| `edit_sessions` | Editing sessions | asset_id, messages, status |
| `media_objects` | Raw media files | bucket, object_key, mime_type, size_bytes, sha256 |

### Social & Publishing

| Table | Purpose | Key Fields |
|-------|---------|------------|
| `social_connections` | OAuth platform links | platform, access_token, platform_username |
| `social_posts` | Published content | platform_post_id, status, metrics |
| `scheduled_posts` | Content calendar | scheduled_for, platform, content, status |

### Analytics & Optimization

| Table | Purpose | Key Fields |
|-------|---------|------------|
| `analytics_data` | Influencer metrics | followers, likes, views, engagement_rate |
| `analytics_events` | Event tracking | event_type, source, platform, value |
| `auto_insights` | AI recommendations | insight_type, title, confidence |
| `ab_tests` | A/B experiments | test_type, status, target_metric, confidence_level |
| `ab_test_variants` | Test variations | content, impressions, conversion_rate, is_winner |
| `usage_events` | Credit consumption | event_type, credits_used, metadata |

### CRM & Leads

| Table | Purpose | Key Fields |
|-------|---------|------------|
| `leads` | Captured prospects | email, company, stage, source, utm_* |
| `inbound_leads` | Marketing form submissions | lead_type, source_path, utm_* |
| `landing_pages` | Hosted pages | headline, slug, views, conversions |
| `email_sequences` | Nurture campaigns | sequence_type, is_active |
| `email_sequence_steps` | Email content | subject, body, sent, opened, clicked |

### Platform Operations

| Table | Purpose | Key Fields |
|-------|---------|------------|
| `aao_activity_log` | AAO execution log | aao_type, action, status, metadata |
| `credit_ledger` | Credit transactions | user_id, delta, reason, admin_id |
| `notifications` | In-app notifications | type, title, message, is_read |
| `feature_flags` | Feature toggles | name, is_enabled, rules |
| `admin_audit_log` | Admin action tracking | admin_id, action, target_type, details |
| `gdpr_requests` | GDPR compliance | request_type, status, result_url |
| `deletion_jobs` | Account deletion queue | org_id, scheduled_for, status |
| `customer_reviews` | Platform reviews | name, rating, review_text, approved |
| `kah_messages` | Ka'h chat history | role, content, session_id |
| `kah_qa_corpus` | Ka'h knowledge base | question_pattern, answer, category |

### Agency & White-Label

| Table | Purpose | Key Fields |
|-------|---------|------------|
| `white_label_settings` | Custom branding | brand_name, logo_url, custom_domain, colors |
| `custom_email_templates` | Branded emails | template_type, html_content |
| `client_workspaces` | Agency client spaces | client_name, access_token, org_id |
| `collaborators` | Team members | email, role, status, invite_token |
| `org_provider_keys` | BYOK API keys | org_id, provider_id, encrypted_secret_ref |
| `provider_routing_rules` | AI routing config | modality, quality_tier, primary_provider_id |

### Database Functions

| Function | Purpose |
|----------|---------|
| `handle_new_user()` | Auto-creates profile on signup (trigger) |
| `assign_default_role()` | Assigns 'user' role on profile creation (trigger) |
| `has_role(user_id, role)` | SECURITY DEFINER role check for RLS |
| `is_admin(user_id)` | Admin check helper |
| `is_org_member(user_id, org_id)` | Org membership check |
| `get_user_role(user_id)` | Returns user's profile role |
| `get_credits_remaining(user_id)` | Calculates available credits |
| `can_submit_review(user_id)` | Rate-limits reviews (24h cooldown) |
| `track_usage()` | Auto-logs usage events to analytics |
| `set_updated_at()` / `update_updated_at_column()` | Auto-updates timestamps |

### Custom Types

| Type | Values |
|------|--------|
| `app_role` (enum) | `admin`, `moderator`, `user` |

---

## Authentication & Authorization

### Authentication Flow

1. **Email/Password**: Standard signup with email verification
2. **Google OAuth**: One-click sign-in via Google
3. **Session Management**: Supabase JWT tokens with automatic refresh
4. **Idle Timeout**: 5-hour inactivity auto-logout with 1-minute warning dialog

### RBAC System

Four-tier role hierarchy managed via `user_roles` table:

| Role | Rank | Capabilities |
|------|------|-------------|
| `super_admin` | 3 | Full platform control, all admin pages |
| `admin` | 2 | Organization management, Admin Console, Scale & Customize |
| `user` | 1 | Standard access, all System steps 0-7 + 9 |
| `read_only` | 0 | View-only: Dashboard, Notifications |

**Implementation:**
- `src/lib/rbac.ts`: `canAccess()` function checks role hierarchy
- `AdminRoute` component: Server-verified admin gate
- `DashboardLayout` + `MobileNav`: RBAC-filtered menu items
- `has_role()` DB function: Used in RLS policies (SECURITY DEFINER to prevent recursion)

### Route Protection

| Guard | Purpose |
|-------|---------|
| `ProtectedRoute` | Requires authenticated user |
| `AdminRoute` | Requires admin or super_admin role |
| `OnboardingGate` | Redirects to onboarding if not completed |

---

## Edge Functions

14 Deno-based serverless functions deployed to Lovable Cloud:

| Function | Purpose | Auth |
|----------|---------|------|
| `ai-generate` | AI text generation (prompts, content) | Optional |
| `kah-chat` | Ka'h AI assistant chat | Optional |
| `aao-execute` | AAO orchestration (8 types) | Optional |
| `create-checkout` | Stripe checkout session creation | Required |
| `check-subscription` | Subscription status verification | Required |
| `customer-portal` | Stripe billing portal session | Required |
| `stripe-webhook` | Stripe event processing | Webhook signature |
| `process-video-job` | Video generation (Sora/LTX) | Required |
| `process-training-job` | Character model training | Required |
| `publish-posts` | Social media auto-publishing | Required |
| `generate-image` | AI image generation | Required |
| `gdpr-process` | GDPR data export/deletion | Required |
| `analytics-seed` | Demo analytics data seeding | Required |
| `account-lifecycle` | Org pause/delete/restore | Required |
| `process-hard-deletes` | Scheduled org hard deletion | System |
| `admin-manage-user` | Admin user management | Admin |

### Shared Configuration

All edge functions use shared CORS headers from `_shared/cors.ts` with allowed origins:
- `https://matango.ai`
- `https://www.matango.ai`
- `https://matango-ai.lovable.app`
- Preview URLs
- `localhost` (dev)

### Secrets

| Secret | Purpose |
|--------|---------|
| `STRIPE_SECRET_KEY` | Stripe API |
| `OPENAI_API_KEY` | OpenAI GPT |
| `GOOGLE_VEO_API_KEY` | Google Veo video generation |
| `LTX_API_KEY` | LTX video generation |
| `LOVABLE_API_KEY` | Lovable AI platform |
| `SUPABASE_SERVICE_ROLE_KEY` | Admin DB operations |

---

## Implemented Features

### The System (One Loop Architecture)

A sequential 0-9 growth loop that functions as a guided operating system:

| Step | Name | Route | Status |
|------|------|-------|--------|
| 0 | Brand Brain | `/brand-brain` | ✅ Complete |
| 1 | Influencer Studio | `/influencer-studio` | ✅ Complete |
| 2 | Campaign Blueprint | `/campaign-factory` | ✅ Complete |
| 3 | Campaign Factory | `/video-scripts` | ✅ Complete |
| 4 | Video Studio | `/video-studio` | ✅ Complete |
| 5 | Asset Gallery | `/asset-library` | ✅ Complete |
| 6 | AAO & Automation | `/aao-studio` | ⏳ Agency tier |
| 7 | Publish & Schedule | `/schedule` | ✅ Complete |
| 8 | Scale & Customize | `/white-label` | ⏳ Admin+ |
| 9 | Meet Ka'h | `/meet-kah` | ✅ Complete |

Steps are strictly sequential; a step only unlocks once the previous step's database prerequisites are met, with the exception of Step 9 (Ka'h) which unlocks immediately after Step 0.

### Navigation

- **Desktop Sidebar**: Full system steps + Manage section + Admin Console (RBAC-filtered)
- **Mobile Hamburger**: Sheet-based full sidebar mirror with all nav groups
- **Public Navbar**: Landing page navigation with hamburger on mobile
- **The System Dropdown**: Mega dropdown with 3 categories, 19 items

### Billing (Stripe)

4-tier model with `PLAN_RANK` hierarchy:

| Tier | Internal ID | Price | Key Limits |
|------|-------------|-------|------------|
| Free | `free` | $0 | 1 workspace, 20 assets/month |
| Creator | `basic` | $29/month | 3 Brand Brains, 300 assets/month |
| Agency | `agency` | $99/month | Unlimited workspaces, white-label |
| Agency++ | `agency_plus` | $199/month | Priority support, custom integrations |

- Checkout via `create-checkout` edge function → Stripe Checkout
- Subscription verification via `check-subscription` (polled every 60s)
- Plan changes via `customer-portal` → Stripe Customer Portal
- Credit top-ups supported as one-time payments
- All redirect URLs point to `https://matango.ai`

### Internationalization

13 languages supported via `src/lib/i18n/`:
English, Spanish, French, German, Portuguese, Japanese, Korean, Chinese (Simplified), Arabic, Hindi, Italian, Dutch, Russian

### Design System (Emerald Luxe)

- **Theme**: Light (Luxury Cream) + Dark (Emerald Noir)
- **Primary**: `hsl(155, 65%, 25%)` — Deep emerald
- **Accent**: `hsl(42, 55%, 53%)` — Gold
- **Fonts**: Cormorant Garamond (display) + Inter (body)
- **All colors** use HSL CSS custom properties via `index.css`

---

## Third-Party Integrations

### Stripe

- **Products**: 4 subscription tiers + credit top-ups
- **Checkout**: Server-side session creation with customer deduplication
- **Webhooks**: `checkout.session.completed`, `customer.subscription.updated`
- **Portal**: Self-service subscription management

### AI Providers

| Provider | Use Case | Edge Function |
|----------|----------|---------------|
| OpenAI (GPT) | Text generation, chat, scripts | `ai-generate`, `kah-chat` |
| Google Veo / Sora | Video generation | `process-video-job` |
| LTX | Video generation (fallback) | `process-video-job` |
| Lovable AI | Built-in models (no API key needed) | Various |

### Social Media (OAuth)

Planned integrations for: Instagram, Facebook, YouTube, TikTok, LinkedIn

### Storage Buckets

| Bucket | Public | Purpose |
|--------|--------|---------|
| `avatars` | Yes | User & influencer avatars |
| `content` | Yes | Generated content & images |
| `videos` | Yes | Generated videos |
| `training-images` | No | Character training data |
| `brand-assets` | Yes | Brand logos & assets |

---

## Security

### Authentication

- Supabase Auth with JWT tokens
- Google OAuth integration
- Password strength validation with leaked password detection
- 5-hour idle timeout with warning dialog

### Authorization

- Row-Level Security (RLS) on all tables
- `has_role()` SECURITY DEFINER function prevents RLS recursion
- Separate `user_roles` table (not on profiles — prevents privilege escalation)
- `AdminRoute` component with server-side role verification

### Data Protection

- All API queries scoped by `user_id` or org membership
- CORS headers with explicit origin allowlist
- Rate limiting on edge functions (429 responses)
- Credit exhaustion protection (402 responses)
- GDPR-compliant data export and deletion

### Compliance

- Privacy Policy and Terms of Service acceptance dialogs
- GDPR data export/deletion via `gdpr-process` edge function
- Account lifecycle management (pause, soft-delete, hard-delete with grace period)
- Admin audit logging for all administrative actions

---

## Testing

### Unit & Integration Tests (Vitest)

| Test File | Coverage |
|-----------|----------|
| `credits.test.ts` | Credit calculation logic |
| `pricingTiers.test.ts` | Tier configuration validation |
| `plan-gating.test.ts` | Feature access by plan |
| `stripe-consistency.test.ts` | Stripe price ID consistency |
| `example.test.ts` | Setup verification |

### E2E Tests (Playwright)

| Spec File | Flows Tested |
|-----------|-------------|
| `landing.spec.ts` | Hero load, navigation, login button |
| `auth.spec.ts` | Auth page, signup mode, form fields |
| `pricing.spec.ts` | Tier display, CTA buttons, FAQ |
| `dashboard.spec.ts` | Auth redirect for unauthenticated users |

**Config**: `playwright.config.ts` targets `https://matango.ai` with Chrome, Firefox, and Mobile Chrome.

---

## Production Readiness

### ✅ Complete

| Area | Details |
|------|---------|
| Core Features | The System 0-9 loop, 40+ pages |
| Database | 35+ tables with RLS, functions, triggers |
| Authentication | Email + Google OAuth, idle timeout |
| RBAC | 4-tier roles with menu hiding |
| Billing | Stripe checkout, subscriptions, portal |
| Navigation | Desktop sidebar + mobile hamburger |
| i18n | 13 languages |
| SEO | Meta tags, OG images, JSON-LD, sitemap, robots.txt |
| Compliance | Privacy Policy, ToS, GDPR |
| Security | Password strength, leaked check, CORS, rate limiting |
| Error Handling | Global error boundary |
| Testing | Vitest unit tests + Playwright E2E config |
| Custom Domain | matango.ai + www.matango.ai |

### ⏳ In Progress

| Item | Status |
|------|--------|
| Email template branding | Requires sender domain setup |
| Social media OAuth connections | Planned |

### 🔮 Future Enhancements

| Item | Description |
|------|-------------|
| Email template HTML styling | Branded auth emails via Lovable managed flow |
| Real-time collaboration | Supabase Realtime for shared editing |
| Advanced analytics | Custom dashboards with Recharts |
| Mobile PWA | Service worker + manifest optimization |

---

*Document maintained by the Matango.ai engineering team.*
