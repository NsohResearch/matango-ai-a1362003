# Matango.ai Platform DNA

**Production-Grade System Blueprint**
**Version:** 1.0.0
**Last Updated:** February 4, 2026
**Classification:** Internal Technical Reference

---

## Table of Contents

1. [Platform Identity & Thesis](#1-platform-identity--thesis)
2. [IAM Architecture](#2-iam-architecture)
3. [System Architecture Layers](#3-system-architecture-layers)
4. [Video Studio Engine](#4-video-studio-engine)
5. [K'ah AI Avatar & Assistant](#5-kah-ai-avatar--assistant)
6. [Workflow DNA & State Machines](#6-workflow-dna--state-machines)
7. [Data Model & Entity Relationships](#7-data-model--entity-relationships)
8. [Governance, Security & Compliance](#8-governance-security--compliance)
9. [Monetization & Platform Economics](#9-monetization--platform-economics)
10. [Deployment Readiness](#10-deployment-readiness)
11. [Go-Live Checklist](#11-go-live-checklist)

---

## 1. Platform Identity & Thesis

### 1.1 Core Identity

**Platform Name:** Matango.ai

**Tagline:** "Matango.ai is an AI Marketing Agency where humans set the direction and operators do the work."

**Mission Statement:** To democratize enterprise-grade marketing capabilities through AI-Amplified Operators (AAOs), enabling solopreneurs, creators, and agencies to compete with Fortune 500 marketing departments.

### 1.2 Foundational Thesis

Matango.ai operates on the **AI-Amplified Operator (AAO)** paradigm—a fundamental shift from traditional marketing tools:

| Dimension | Traditional Tools | Basic Automation | AAOs |
|-----------|------------------|------------------|------|
| Execution Model | Manual operation | If-this-then-that | Autonomous execution |
| Context Awareness | None | Limited | Brand-aware decisions |
| Integration | Siloed | Point-to-point | Cross-channel intelligence |
| Learning | Static | No learning | Continuous improvement |
| Human Role | Do the work | Configure rules | Set direction |

**Key Differentiator:** AAOs are not tools users operate—they are intelligent agents that execute marketing tasks autonomously while staying aligned with the user's brand strategy through the **Brand Brain** system.

### 1.3 Target Market Segments

| Segment | Description | Plan Alignment |
|---------|-------------|----------------|
| **Solopreneurs** | Individual creators and founders | Free → Basic |
| **SMB Marketing Teams** | Small teams (2-10 people) | Basic → Agency |
| **Marketing Agencies** | Multi-client service providers | Agency → Agency++ |
| **Enterprise** | Large organizations with custom needs | Agency++ (Contact Sales) |

### 1.4 Competitive Positioning

**Direct Competitors:** Jasper, Copy.ai, Synthesia, HeyGen

**Differentiation:**
- **Brand Brain Integration:** Unlike point solutions, Matango maintains brand coherence across all content types
- **AAO Architecture:** Autonomous execution vs. manual tool operation
- **Full-Stack Solution:** Content creation + scheduling + analytics + video in one platform
- **White-Label Capability:** Agencies can resell under their own brand

---

## 2. IAM Architecture

### 2.1 Identity Model

Matango.ai implements a **multi-tenant, role-based identity architecture** with the following principals:

```
┌─────────────────────────────────────────────────────────────┐
│                    IDENTITY HIERARCHY                        │
├─────────────────────────────────────────────────────────────┤
│  Platform Owner (Super Admin)                                │
│    └── Tenant (User Account)                                 │
│          ├── Organization (Optional)                         │
│          │     └── Team Members                              │
│          ├── Brands/Customers (White-Label)                  │
│          └── AI Influencers (Managed Identities)            │
└─────────────────────────────────────────────────────────────┘
```

### 2.2 Authentication (AuthN)

**Primary Method:** Manus OAuth 2.0 Integration

| Component | Implementation |
|-----------|----------------|
| OAuth Provider | Manus OAuth Server (`OAUTH_SERVER_URL`) |
| Token Type | JWT (signed with `JWT_SECRET`) |
| Session Management | HTTP-only cookies with secure flags |
| Token Refresh | Automatic via `refreshAccessToken()` |

**Authentication Flow:**
```
User → Login Portal → OAuth Server → Callback → JWT Cookie → Protected Routes
```

### 2.3 Authorization (AuthZ)

**Role Hierarchy:**

| Role | Scope | Capabilities |
|------|-------|--------------|
| `super_admin` | Platform-wide | All operations + tenant management |
| `admin` | Platform-wide | Tenant management, GDPR processing |
| `user` | Tenant-scoped | Full access to own resources |
| `team_member` | Organization-scoped | Limited by organization permissions |
| `read_only` | Tenant-scoped | View-only access (suspended state) |

**Authorization Procedures:**
```typescript
// Public - No authentication required
publicProcedure

// Protected - Requires authenticated user
protectedProcedure

// Admin - Requires admin or super_admin role
adminProcedure

// Super Admin - Requires super_admin role only
superAdminProcedure
```

### 2.4 Tenant Isolation

**Data Isolation Model:** Row-level security via `userId` foreign keys

**Tenant States:**
- `active` - Full platform access
- `suspended` - No access, data preserved
- `read_only` - View-only, no mutations

**Resource Limits by Plan:**

| Resource | Free | Basic | Agency | Agency++ |
|----------|------|-------|--------|----------|
| AI Influencers | 1 | 5 | Unlimited | Unlimited |
| Images/Month | 3 | 100 | 500 | Unlimited |
| Videos/Month | 0 | 10 | 50 | 200 |
| Team Members | 1 | 1 | 5 | Unlimited |
| Custom Domains | 0 | 3 | 20 | Unlimited |
| Brands/Customers | 0 | 3 | 20 | Unlimited |

### 2.5 Social Platform OAuth

**Supported Platforms:**
- Instagram (Meta Business API)
- Twitter/X (OAuth 2.0)
- LinkedIn (OAuth 2.0)
- TikTok (OAuth 2.0)
- YouTube (Google OAuth)
- Facebook (Meta Business API)

**Token Management:**
- Encrypted storage in `social_connections` table
- Automatic token refresh via background jobs
- Scoped permissions per platform

---

## 3. System Architecture Layers

### 3.1 Architecture Overview

```
┌─────────────────────────────────────────────────────────────────────┐
│                         CLIENT LAYER                                 │
│  React 19 + Tailwind 4 + shadcn/ui + Framer Motion                  │
├─────────────────────────────────────────────────────────────────────┤
│                         API GATEWAY                                  │
│  tRPC 11 + Express 4 + Superjson                                    │
├─────────────────────────────────────────────────────────────────────┤
│                       SERVICE LAYER                                  │
│  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐       │
│  │ Auth    │ │ Content │ │ Video   │ │ Social  │ │ Payment │       │
│  │ Service │ │ Service │ │ Service │ │ Service │ │ Service │       │
│  └─────────┘ └─────────┘ └─────────┘ └─────────┘ └─────────┘       │
├─────────────────────────────────────────────────────────────────────┤
│                      INTEGRATION LAYER                               │
│  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐       │
│  │ LLM API │ │ Image   │ │ Voice   │ │ Storage │ │ Stripe  │       │
│  │ (Manus) │ │ Gen API │ │ API     │ │ (S3)    │ │ API     │       │
│  └─────────┘ └─────────┘ └─────────┘ └─────────┘ └─────────┘       │
├─────────────────────────────────────────────────────────────────────┤
│                       DATA LAYER                                     │
│  MySQL/TiDB (Drizzle ORM) + S3 (File Storage)                       │
└─────────────────────────────────────────────────────────────────────┘
```

### 3.2 Technology Stack

| Layer | Technology | Purpose |
|-------|------------|---------|
| **Frontend** | React 19 | UI framework |
| | Tailwind CSS 4 | Styling |
| | shadcn/ui | Component library |
| | Framer Motion | Animations |
| | wouter | Routing |
| | TanStack Query | Server state |
| **API** | tRPC 11 | Type-safe RPC |
| | Express 4 | HTTP server |
| | Superjson | Serialization |
| | Zod | Validation |
| **Backend** | Node.js 22 | Runtime |
| | TypeScript 5.9 | Language |
| | Drizzle ORM | Database access |
| **Database** | MySQL/TiDB | Primary store |
| | S3 | File storage |
| **External APIs** | Manus LLM | AI generation |
| | Manus Image | Image generation |
| | Stripe | Payments |

### 3.3 API Surface (tRPC Routers)

| Router | Procedures | Description |
|--------|------------|-------------|
| `auth` | 3 | Authentication & session |
| `influencer` | 12 | AI influencer CRUD |
| `content` | 8 | Content generation |
| `campaign` | 6 | Campaign management |
| `brandBrain` | 5 | Brand DNA management |
| `analytics` | 4 | Performance metrics |
| `social` | 6 | Social connections |
| `admin` | 15 | Tenant management |
| `gdpr` | 8 | Data privacy |
| `kah` | 5 | K'ah demo influencer |
| `creator` | 25+ | Video Studio (Creator OS) |
| `marketplace` | 12 | Template marketplace |
| `collaboration` | 8 | Real-time editing |
| `aaoActivity` | 6 | AAO status tracking |

### 3.4 File Storage Architecture

**Storage Provider:** AWS S3 (via Manus Built-in API)

**File Categories:**
- `/avatars/` - AI influencer profile images
- `/content/` - Generated marketing content
- `/videos/` - Video exports
- `/assets/` - User-uploaded media
- `/exports/` - GDPR data exports

**Access Pattern:**
```typescript
// Upload
const { url } = await storagePut(fileKey, buffer, contentType);

// Presigned URL for download
const { url } = await storageGet(fileKey, expiresIn);
```

---

## 4. Video Studio Engine

### 4.1 Creator OS Overview

The **Creator OS** (Video Studio Pro) is Matango's video creation engine, enabling users to produce professional marketing videos without traditional video editing skills.

### 4.2 Data Model

```
┌─────────────────┐
│ creator_projects│
│ (Video Project) │
└────────┬────────┘
         │ 1:N
         ▼
┌─────────────────┐     ┌─────────────────┐
│ creator_scenes  │────▶│ creator_scene_  │
│ (Scene)         │ 1:N │ elements        │
└────────┬────────┘     └─────────────────┘
         │
         ▼
┌─────────────────┐     ┌─────────────────┐
│ creator_avatars │     │ creator_voices  │
│ (AI Avatar)     │     │ (TTS Voice)     │
└─────────────────┘     └─────────────────┘
```

### 4.3 Scene Structure

| Field | Type | Description |
|-------|------|-------------|
| `title` | string | Scene name |
| `duration` | number | Duration in seconds |
| `script` | text | Voiceover script |
| `backgroundType` | enum | color, image, video |
| `backgroundValue` | string | Color hex or asset URL |
| `avatarId` | number | Selected AI avatar |
| `voiceId` | number | Selected TTS voice |
| `transition` | enum | fade, dissolve, slide, zoom, none |
| `transitionDuration` | number | Transition time (ms) |

### 4.4 Scene Elements

| Element Type | Properties |
|--------------|------------|
| `text` | content, font, size, color, position, animation |
| `image` | src, size, position, opacity, animation |
| `shape` | type, fill, stroke, size, position |
| `video` | src, size, position, loop, muted |

### 4.5 Export Pipeline

```
Project → Scene Rendering → Audio Synthesis → Video Composition → Export
```

**Export Settings:**

| Setting | Options |
|---------|---------|
| Resolution | 720p, 1080p, 4K |
| Format | MP4, WebM, MOV, GIF |
| Quality | Draft, Standard, High, Ultra |
| Frame Rate | 24, 30, 60 fps |
| Aspect Ratio | 16:9, 9:16, 1:1, 4:5 |

### 4.6 Template Marketplace

**Template Categories:**
- Social Media (Instagram, TikTok, LinkedIn)
- YouTube (Intros, Outros, Thumbnails)
- Ads (Product, Service, Brand)
- Tutorials (How-to, Explainer)
- Announcements (Product Launch, Event)
- Testimonials (Customer Stories)

**Marketplace Features:**
- Browse/search templates
- Preview before purchase
- One-click use
- Creator publishing
- Rating/review system

---

## 5. K'ah AI Avatar & Assistant

### 5.1 Identity Profile

| Attribute | Value |
|-----------|-------|
| **Name** | K'ah (pronounced "Kah") |
| **Role** | Demo AI Influencer & Brand Ambassador |
| **Tagline** | "Your AI Marketing Guide" |
| **Signature** | "Your brand already has roots. Let's help them spread." |

### 5.2 Personality Traits

- Warm & Approachable
- Knowledgeable but not condescending
- Encouraging and supportive
- Professional yet friendly
- Creative and inspiring

**Communication Style:**
- Conversational, helpful, and empowering
- Uses nature and growth metaphors (roots, seeds, blooming)
- Casual language with occasional emojis
- Concise responses (2-4 sentences typically)

### 5.3 Knowledge Domains

| Domain | Topics |
|--------|--------|
| **About K'ah** | Identity, creation story, capabilities |
| **Platform** | Matango features, Brand Brain, Campaign Factory |
| **Marketing** | Brand building, content strategy, social media |
| **Pricing** | Plans, features, trials |
| **How-To** | Getting started, creating influencers, scheduling |
| **Motivation** | Encouragement, overcoming challenges |

### 5.4 Response Architecture

```
User Message
    │
    ▼
┌─────────────────┐
│ Corpus Lookup   │──▶ Pre-defined Response (if match)
└────────┬────────┘
         │ (no match)
         ▼
┌─────────────────┐
│ LLM Generation  │──▶ Dynamic Response (with K'ah system prompt)
└────────┬────────┘
         │ (error)
         ▼
┌─────────────────┐
│ Fallback        │──▶ Default greeting
└─────────────────┘
```

### 5.5 Integration Points

- **Chat Widget:** Floating assistant on all pages
- **Meet K'ah Page:** Dedicated introduction page
- **Onboarding:** Guides new users through setup
- **Product Tour:** Interactive platform walkthrough

---

## 6. Workflow DNA & State Machines

### 6.1 User Lifecycle

```
┌──────────┐    ┌──────────┐    ┌──────────┐    ┌──────────┐
│ Visitor  │───▶│ Sign Up  │───▶│Onboarding│───▶│ Active   │
└──────────┘    └──────────┘    └──────────┘    └──────────┘
                                                     │
                                    ┌────────────────┼────────────────┐
                                    ▼                ▼                ▼
                              ┌──────────┐    ┌──────────┐    ┌──────────┐
                              │ Upgraded │    │ Churned  │    │ Suspended│
                              └──────────┘    └──────────┘    └──────────┘
```

### 6.2 Content Generation Workflow

```
Brand Brain Setup
       │
       ▼
┌─────────────────┐
│ Select Content  │
│ Type            │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Configure       │
│ Parameters      │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ AI Generation   │
│ (LLM/Image)     │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Review & Edit   │
└────────┬────────┘
         │
    ┌────┴────┐
    ▼         ▼
┌───────┐ ┌───────┐
│Publish│ │Schedule│
└───────┘ └───────┘
```

### 6.3 Video Export State Machine

```
┌─────────┐    ┌───────────┐    ┌───────────┐    ┌───────────┐
│ pending │───▶│ rendering │───▶│ completed │    │  failed   │
└─────────┘    └─────┬─────┘    └───────────┘    └───────────┘
                     │                                  ▲
                     └──────────────────────────────────┘
                              (on error)
```

### 6.4 Campaign Lifecycle

```
┌─────────┐    ┌─────────┐    ┌─────────┐    ┌─────────┐    ┌─────────┐
│  Draft  │───▶│ Review  │───▶│ Active  │───▶│ Paused  │───▶│Completed│
└─────────┘    └─────────┘    └────┬────┘    └────┬────┘    └─────────┘
                                   │              │
                                   └──────────────┘
                                     (toggle)
```

### 6.5 GDPR Request Workflow

```
User Request
     │
     ▼
┌─────────┐    ┌────────────┐    ┌───────────┐
│ pending │───▶│ processing │───▶│ completed │
└─────────┘    └────────────┘    └───────────┘
     │                                  │
     ▼                                  ▼
┌─────────┐                      ┌───────────┐
│cancelled│                      │  failed   │
└─────────┘                      └───────────┘
```

---

## 7. Data Model & Entity Relationships

### 7.1 Core Entities

#### Users & Tenants
```sql
users (
  id, openId, name, email, avatar, role,
  plan, planExpiresAt, trialEndsAt,
  influencersLimit, imagesPerMonth, videosPerMonth,
  brandsLimit, customDomainsLimit, teamMembersLimit,
  status, onboardingCompleted, createdAt, updatedAt
)
```

#### Organizations (Multi-tenant)
```sql
organizations (
  id, name, slug, ownerId, logo, brandColor,
  customDomain, whiteLabelEnabled, createdAt
)

organization_members (
  id, organizationId, userId, role, invitedBy, createdAt
)
```

#### AI Influencers
```sql
influencers (
  id, userId, name, age, bio, personality,
  avatarUrl, tags, isPublic, createdAt, updatedAt
)
```

#### Brand Brain
```sql
brand_brain (
  id, userId, brandName, tagline, mission, values,
  voiceTone, targetAudience, visualStyle, colorPalette,
  competitors, uniqueSellingPoints, createdAt, updatedAt
)
```

### 7.2 Content & Campaigns

```sql
content (
  id, userId, influencerId, type, title, body,
  imageUrl, platform, status, scheduledAt,
  publishedAt, createdAt
)

campaigns (
  id, userId, name, description, status,
  startDate, endDate, budget, targetMetrics,
  createdAt, updatedAt
)

campaign_content (
  id, campaignId, contentId, platform, scheduledAt
)
```

### 7.3 Video Studio (Creator OS)

```sql
creator_projects (
  id, userId, title, description, status,
  aspectRatio, thumbnailUrl, duration,
  folderId, createdAt, updatedAt
)

creator_scenes (
  id, projectId, title, orderIndex, duration,
  script, backgroundType, backgroundValue,
  avatarId, voiceId, transition, transitionDuration,
  audioUrl, createdAt, updatedAt
)

creator_scene_elements (
  id, sceneId, type, content, properties,
  positionX, positionY, width, height,
  rotation, opacity, zIndex, animation,
  animationDuration, createdAt
)
```

### 7.4 Marketplace & Collaboration

```sql
template_listings (
  id, templateId, sellerId, title, description,
  category, price, currency, previewUrl,
  thumbnailUrl, status, salesCount, rating,
  reviewCount, createdAt
)

project_collaborators (
  id, projectId, userId, role, invitedBy,
  status, createdAt
)

collaborator_presence (
  id, projectId, userId, sceneId, cursorX, cursorY,
  isActive, lastActiveAt
)
```

### 7.5 Analytics & Audit

```sql
analytics_events (
  id, userId, influencerId, eventType, platform,
  contentId, metadata, createdAt
)

audit_logs (
  id, userId, action, resourceType, resourceId,
  metadata, ipAddress, userAgent, createdAt
)

aao_activity_log (
  id, userId, aaoType, action, description,
  metadata, status, startedAt, completedAt
)
```

### 7.6 Entity Relationship Diagram

```
┌─────────┐     ┌─────────────┐     ┌───────────┐
│  users  │────▶│ influencers │────▶│  content  │
└────┬────┘     └─────────────┘     └─────┬─────┘
     │                                    │
     │          ┌─────────────┐           │
     └─────────▶│ brand_brain │           │
     │          └─────────────┘           │
     │                                    │
     │          ┌─────────────┐     ┌─────┴─────┐
     └─────────▶│  campaigns  │────▶│ campaign_ │
     │          └─────────────┘     │  content  │
     │                              └───────────┘
     │          ┌─────────────┐
     └─────────▶│  creator_   │
                │  projects   │
                └──────┬──────┘
                       │
                ┌──────┴──────┐
                ▼             ▼
         ┌───────────┐ ┌───────────┐
         │  scenes   │ │  folders  │
         └─────┬─────┘ └───────────┘
               │
               ▼
         ┌───────────┐
         │ elements  │
         └───────────┘
```

---

## 8. Governance, Security & Compliance

### 8.1 Security Architecture

#### Authentication Security
- JWT tokens with RS256 signing
- HTTP-only, Secure, SameSite cookies
- CSRF protection via token validation
- Session timeout: 7 days (configurable)

#### Data Security
- TLS 1.3 for all connections
- AES-256 encryption for sensitive data at rest
- Row-level tenant isolation
- Input validation via Zod schemas

#### API Security
- Rate limiting per user/IP
- Request size limits
- SQL injection prevention (parameterized queries)
- XSS prevention (content sanitization)

### 8.2 Role-Based Access Control

| Permission | User | Admin | Super Admin |
|------------|------|-------|-------------|
| Own resources | ✓ | ✓ | ✓ |
| View all tenants | ✗ | ✓ | ✓ |
| Suspend tenants | ✗ | ✗ | ✓ |
| Process GDPR | ✗ | ✓ | ✓ |
| Modify limits | ✗ | ✓ | ✓ |
| Platform config | ✗ | ✗ | ✓ |

### 8.3 GDPR Compliance

**Data Subject Rights Implementation:**

| Right | Endpoint | Implementation |
|-------|----------|----------------|
| Right to Access | `gdpr.requestExport` | JSON export of all user data |
| Right to Erasure | `gdpr.requestDeletion` | Full data deletion with admin approval |
| Right to Portability | `gdpr.requestExport` | Machine-readable export |
| Right to Rectification | Standard CRUD | User can edit own data |

**Data Retention:**
- Active accounts: Indefinite
- Deleted accounts: 30-day grace period
- Audit logs: 7 years
- Analytics: 2 years

### 8.4 Audit Logging

**Logged Events:**
- Authentication (login, logout, failed attempts)
- Authorization (access denied)
- Data mutations (create, update, delete)
- Admin actions (suspend, unsuspend, limit changes)
- GDPR requests (export, deletion)

**Audit Log Schema:**
```typescript
{
  userId: number,
  action: string,
  resourceType: string,
  resourceId: number,
  metadata: object,
  ipAddress: string,
  userAgent: string,
  createdAt: timestamp
}
```

### 8.5 Content Moderation

- AI-generated content review queue
- Automated NSFW detection (planned)
- User reporting mechanism
- Admin moderation dashboard

---

## 9. Monetization & Platform Economics

### 9.1 Pricing Tiers

| Plan | Monthly | Yearly | Target Segment |
|------|---------|--------|----------------|
| **Free** | $0 | $0 | Trial users |
| **Basic** | $199 | $1,990 | Solopreneurs |
| **Agency** | $399 | $3,990 | Teams & agencies |
| **Agency++** | Contact | Contact | Enterprise |

### 9.2 Plan Features Matrix

| Feature | Free | Basic | Agency | Agency++ |
|---------|------|-------|--------|----------|
| AI Influencers | 1 | 5 | Unlimited | Unlimited |
| Images/Month | 3 | 100 | 500 | Unlimited |
| Videos/Month | 0 | 10 | 50 | 200 |
| Brand Brain | ✗ | ✓ | ✓ | ✓ |
| Analytics | ✗ | Basic | Full + AI | Full + AI |
| Team Members | 1 | 1 | 5 | Unlimited |
| Custom Domains | 0 | 3 | 20 | Unlimited |
| White-Label | ✗ | ✗ | ✓ | ✓ |
| API Access | ✗ | ✗ | ✓ | ✓ |
| Watermark | ✓ | ✗ | ✗ | ✗ |

### 9.3 Payment Integration

**Provider:** Stripe

**Supported Payment Methods:**
- Credit/Debit Cards
- ACH Direct Debit (US)
- SEPA Direct Debit (EU)
- Apple Pay / Google Pay

**Billing Features:**
- Monthly/Yearly subscriptions
- Promo codes (including 99% test discount)
- Automatic renewal
- Invoice generation
- Usage-based overage (planned)

### 9.4 Revenue Streams

| Stream | Description | Status |
|--------|-------------|--------|
| **Subscriptions** | Monthly/yearly plans | Active |
| **Template Sales** | Marketplace revenue share | Active |
| **API Access** | Usage-based API pricing | Planned |
| **Enterprise** | Custom contracts | Active |
| **White-Label** | Agency reseller program | Active |

### 9.5 Marketplace Economics

**Template Marketplace:**
- Seller revenue share: 70%
- Platform fee: 30%
- Minimum price: $0.50
- Maximum price: $999

---

## 10. Deployment Readiness

### 10.1 Infrastructure Requirements

| Component | Specification |
|-----------|---------------|
| **Compute** | Node.js 22+ runtime |
| **Database** | MySQL 8.0+ / TiDB |
| **Storage** | S3-compatible object storage |
| **CDN** | CloudFront or equivalent |
| **SSL** | TLS 1.3 certificates |

### 10.2 Environment Variables

**Required Secrets:**
```
DATABASE_URL          # MySQL connection string
JWT_SECRET            # Session signing key
STRIPE_SECRET_KEY     # Stripe API key
STRIPE_WEBHOOK_SECRET # Stripe webhook verification
MAILGUN_API_KEY       # Email service
MAILGUN_DOMAIN        # Email domain
```

**Platform Configuration:**
```
VITE_APP_ID           # Application identifier
VITE_APP_TITLE        # Application title
VITE_APP_LOGO         # Logo URL
OAUTH_SERVER_URL      # OAuth backend
VITE_OAUTH_PORTAL_URL # Login portal
BUILT_IN_FORGE_API_URL # Manus API endpoint
BUILT_IN_FORGE_API_KEY # Manus API key
```

### 10.3 Database Migrations

**Migration Strategy:** Schema-first with Drizzle Kit

```bash
# Generate migration
pnpm drizzle-kit generate

# Apply migration
pnpm drizzle-kit migrate

# Push schema (development)
pnpm db:push
```

### 10.4 Build & Deploy

```bash
# Development
pnpm dev

# Production build
pnpm build

# Start production server
node dist/index.js
```

### 10.5 Health Checks

| Endpoint | Purpose |
|----------|---------|
| `/api/health` | Basic liveness |
| `/api/trpc/system.health` | Full system health |

---

## 11. Go-Live Checklist

### 11.1 Pre-Launch Verification

#### Infrastructure
- [ ] Production database provisioned and migrated
- [ ] S3 bucket configured with proper CORS
- [ ] SSL certificates installed
- [ ] CDN configured for static assets
- [ ] Environment variables set in production

#### Security
- [ ] JWT_SECRET is cryptographically strong (32+ bytes)
- [ ] All API keys rotated from development
- [ ] Rate limiting configured
- [ ] CORS origins restricted to production domains
- [ ] Audit logging enabled

#### Payments
- [ ] Stripe live keys configured
- [ ] Webhook endpoint verified
- [ ] Test transactions completed
- [ ] Promo codes tested
- [ ] Invoice generation verified

#### Compliance
- [ ] Privacy policy published
- [ ] Terms of service published
- [ ] Cookie consent implemented
- [ ] GDPR export/deletion tested
- [ ] Data retention policies documented

### 11.2 Functional Verification

#### Authentication
- [ ] OAuth login flow works
- [ ] Session persistence across refreshes
- [ ] Logout clears session
- [ ] Role-based access enforced

#### Core Features
- [ ] AI influencer creation works
- [ ] Image generation produces results
- [ ] Video export completes
- [ ] Content scheduling works
- [ ] Analytics data populates

#### K'ah Assistant
- [ ] Chat widget loads
- [ ] Responses are contextual
- [ ] LLM fallback works
- [ ] Suggested questions display

### 11.3 Performance Verification

- [ ] Page load < 3 seconds
- [ ] API response < 500ms (p95)
- [ ] Image generation < 30 seconds
- [ ] Video export < 5 minutes (1-minute video)

### 11.4 Monitoring Setup

- [ ] Error tracking configured (Sentry/equivalent)
- [ ] Performance monitoring enabled
- [ ] Uptime monitoring configured
- [ ] Alert thresholds set
- [ ] On-call rotation established

### 11.5 Documentation

- [ ] API documentation generated
- [ ] User guides published
- [ ] Admin documentation complete
- [ ] Runbook for common issues
- [ ] Incident response plan

### 11.6 Launch Readiness

- [ ] Staging environment validated
- [ ] Load testing completed
- [ ] Rollback plan documented
- [ ] Support team briefed
- [ ] Marketing materials ready

---

## Appendix A: AAO Type Reference

| AAO Type | Icon | Primary Function |
|----------|------|------------------|
| Content AAO | Sparkles | Generate marketing content |
| Engagement AAO | MessageSquare | Manage audience interactions |
| Analytics AAO | BarChart3 | Process data and insights |
| Campaign AAO | Target | Orchestrate multi-channel campaigns |
| Video AAO | Video | Create and edit video content |
| Visual AAO | Image | Generate visual brand assets |
| Scheduling AAO | Calendar | Manage content calendar |
| Lead AAO | Users | Capture and nurture leads |

---

## Appendix B: API Quick Reference

### Authentication
```typescript
trpc.auth.me.useQuery()           // Get current user
trpc.auth.logout.useMutation()    // Logout
```

### Influencers
```typescript
trpc.influencer.list.useQuery()   // List user's influencers
trpc.influencer.create.useMutation() // Create influencer
trpc.influencer.chat.useMutation()   // Chat with influencer
```

### Content
```typescript
trpc.content.generate.useMutation()  // Generate content
trpc.content.schedule.useMutation()  // Schedule content
```

### Video Studio
```typescript
trpc.creator.projects.list.useQuery()    // List projects
trpc.creator.scenes.create.useMutation() // Create scene
trpc.creator.exports.create.useMutation() // Start export
```

---

## Appendix C: Database Table Index

| Table | Description |
|-------|-------------|
| `users` | User accounts and tenant data |
| `organizations` | Multi-tenant organizations |
| `organization_members` | Organization membership |
| `influencers` | AI influencer profiles |
| `brand_brain` | Brand DNA configuration |
| `content` | Generated content |
| `campaigns` | Marketing campaigns |
| `campaign_content` | Campaign-content mapping |
| `social_connections` | OAuth tokens for platforms |
| `scheduled_posts` | Content scheduling queue |
| `analytics_events` | Performance metrics |
| `leads` | Captured leads |
| `audit_logs` | Security audit trail |
| `data_export_requests` | GDPR requests |
| `white_label_settings` | White-label configuration |
| `creator_projects` | Video projects |
| `creator_scenes` | Video scenes |
| `creator_scene_elements` | Scene overlays |
| `creator_avatars` | AI avatars |
| `creator_voices` | TTS voices |
| `creator_assets` | Media library |
| `creator_templates` | Video templates |
| `creator_export_jobs` | Export queue |
| `creator_usage` | Usage tracking |
| `template_listings` | Marketplace listings |
| `template_purchases` | Purchase records |
| `template_reviews` | User reviews |
| `project_collaborators` | Collaboration access |
| `collaborator_presence` | Real-time presence |
| `aao_activity_log` | AAO task history |
| `aao_daily_stats` | AAO statistics |

---

**Document End**

*This DNA document serves as the authoritative technical reference for the Matango.ai platform. It should be updated with each major release to reflect architectural changes, new features, and evolving best practices.*
