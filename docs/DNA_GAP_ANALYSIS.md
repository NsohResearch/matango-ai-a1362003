# Matango.ai — DNA vs Implementation Gap Analysis
## Deep Audit: February 2026

---

## Executive Summary

The DNA document describes a **fully autonomous multi-tenant marketing agency platform** with 8 AAO types, a complete Video Studio (Creator OS), template marketplace, GDPR compliance suite, Stripe billing, and white-label capabilities. The current Lovable implementation has **strong foundations** but significant gaps in autonomous execution, AI-powered content generation, and billing integration.

### Scoring: DNA Promise vs Current Reality

| Category | DNA Promise | Current State | Gap Score |
|----------|------------|---------------|-----------|
| **Brand Brain** | AI enrichment + full DNA | ✅ 5-step wizard + AI enrich | 🟢 85% |
| **Influencer Studio** | Create/train/generate/gallery | ⚠️ CRUD only, no image gen | 🟡 40% |
| **Video Scripts** | AI script generation | ⚠️ List view, no generation | 🔴 20% |
| **Video Studio** | Scene builder, export, lip-sync | ⚠️ Job list, no scene builder | 🔴 15% |
| **AAO Studio** | 8 autonomous operator types | ⚠️ Static deploy form | 🔴 10% |
| **Campaign Factory** | Multi-channel auto-generation | ⚠️ CRUD only, no AI gen | 🟡 35% |
| **Scheduler** | Calendar + auto-publish | ⚠️ Calendar view, no create flow | 🟡 45% |
| **Analytics Hub** | AI insights + real data | ⚠️ Charts exist but no data pipeline | 🟡 50% |
| **K'ah Assistant** | QA corpus + LLM fallback | ✅ Working with edge function | 🟢 80% |
| **Auth & IAM** | Multi-tenant + RBAC | ⚠️ Auth works, roles on profile table | 🟡 55% |
| **Billing/Stripe** | 4 tiers + subscriptions | 🔴 Not integrated | 🔴 0% |
| **GDPR Compliance** | Export + deletion + audit | ⚠️ Admin pages exist, no backend | 🔴 15% |
| **White-Label** | Custom domains + branding | ⚠️ Settings table exists, no UI wiring | 🔴 20% |
| **Template Marketplace** | Browse/purchase/publish | 🔴 Coming Soon stub | 🔴 0% |
| **Social OAuth** | 6 platform connections | 🔴 Table exists, no OAuth flow | 🔴 5% |

---

## Critical Gaps (P0 — Must Fix)

### 1. Video Script Generation is Non-Functional
**DNA says:** AI generates scripts with scene breakdowns, dialogue, camera directions  
**Reality:** "New Script" button does nothing. No mutation hook exists.  
**Fix:** Add `useCreateVideoScript` mutation + AI-powered script generation via `ai-generate` edge function with `script-generate` type (already defined in the edge function).

### 2. Campaign Factory Has No AI Generation
**DNA says:** Auto-generate multi-channel assets (social posts, email sequences, ad copy)  
**Reality:** Creates campaign record only. No asset generation.  
**Fix:** After campaign creation, call `ai-generate` with `campaign-generate` type to populate `campaign_assets` table.

### 3. Influencer Studio Has No Image Generation
**DNA says:** Generate consistent AI influencer images  
**Reality:** Can create influencer profiles, but no image/avatar generation.  
**Fix:** Integrate Lovable AI with image generation prompts, store results in `asset_library`.

### 4. Scheduler Has No Post Creation Flow
**DNA says:** Schedule posts to specific platforms with content  
**Reality:** Calendar displays but "Schedule Post" button does nothing.  
**Fix:** Add `useCreateScheduledPost` mutation with platform, content, datetime, and asset selection.

### 5. Roles Stored on Profile Table (Security Risk)
**DNA says:** RBAC with super_admin, admin, user, team_member, read_only  
**Reality:** `role` column on `profiles` table — vulnerable to privilege escalation.  
**Fix:** Create dedicated `user_roles` table with security definer function per Lovable guidelines.

---

## High Priority Gaps (P1 — Should Fix)

### 6. No Stripe Billing Integration
**DNA says:** Free ($0), Basic ($199), Agency ($399), Agency++ (Contact)  
**Fix:** Enable Stripe integration, create subscription edge function, connect to PlanSelectionDrawer.

### 7. AAO Studio is Static
**DNA says:** 8 AAO types that autonomously execute marketing tasks  
**Reality:** A deploy form with dropdowns. No autonomous execution.  
**Fix:** Build AAO orchestration engine — each AAO type triggers specific AI workflows (content generation, scheduling, analytics processing).

### 8. No Social Platform OAuth
**DNA says:** Instagram, Twitter, LinkedIn, TikTok, YouTube, Facebook connections  
**Reality:** `social_connections` table exists but no OAuth flow.  
**Fix:** This requires external OAuth apps (Meta, Twitter, etc.) — gate behind "Coming Soon" with clear roadmap, or implement mock connections for demo.

### 9. GDPR Backend Missing
**DNA says:** Export, deletion, audit trail with admin approval  
**Reality:** Admin UI pages exist but no backend procedures.  
**Fix:** Create edge functions for data export (JSON dump of user data) and deletion request processing.

---

## Medium Priority Gaps (P2 — Nice to Have)

### 10. Video Studio Scene Builder
The DNA describes a full scene-by-scene editor with elements (text, image, shape, video), transitions, and export pipeline. This is a significant engineering effort. Current implementation shows a job list with status tracking.

### 11. Template Marketplace
Full marketplace with listings, purchases, reviews, and creator publishing. Requires significant e-commerce infrastructure.

### 12. Real-time Collaboration
Project collaborators with presence tracking. Requires Supabase Realtime channels.

### 13. White-Label Full Implementation
Custom domains, branding removal, favicon replacement. The `white_label_settings` table exists but no UI connects to it.

---

## What's Working Well ✅

1. **Brand Brain** — Full 5-step wizard with AI enrichment, multi-brand support
2. **K'ah Chat** — QA corpus lookup + LLM fallback, session persistence
3. **Dashboard** — Growth Loop visualization + AAO Activity Widget
4. **Navigation** — The System mega dropdown, WorkflowNav pipeline, sidebar organization
5. **Auth** — Google OAuth + email signup with Supabase
6. **Database Schema** — 35+ tables with RLS policies
7. **Edge Functions** — `ai-generate` with multiple prompt types, `kah-chat`
8. **Admin Console** — 11 sub-modules with real UI implementations

---

## Implementation Roadmap

### Sprint 1: Core AI Workflows (Make the loop work)
1. ✅ Wire Video Script generation (AI → database → list)
2. ✅ Wire Campaign Factory AI generation (campaign → multi-channel assets)
3. ✅ Wire Scheduler post creation flow
4. ✅ Fix IAM: migrate roles to dedicated table

### Sprint 2: AAO Engine + Billing
5. Build AAO orchestration (Content AAO, Campaign AAO, Scheduling AAO)
6. Enable Stripe integration with 4 pricing tiers
7. Implement usage tracking and credit deduction

### Sprint 3: Polish + Compliance
8. GDPR export/deletion edge functions
9. White-label settings UI
10. Social connections mock flow
11. Analytics data pipeline (seed from actual usage)

---

## Innovation Opportunities 🚀

### Next-Generation Features (Not in DNA)

1. **AAO Autopilot Mode** — Set weekly goals, AAOs autonomously create + schedule + analyze content
2. **Brand Brain RAG** — Upload competitor content, product docs → vector embeddings for richer AI context
3. **Content Performance Predictor** — AI scores content before publishing based on historical engagement
4. **Multi-Brand Campaign Cloning** — Adapt successful campaigns across brands with tone/audience adjustment
5. **AI Creative Director** — Reviews all generated content for brand consistency before publishing
6. **Engagement AAO** — Monitors social mentions, drafts responses in brand voice
7. **Competitor Intelligence AAO** — Tracks competitor content and suggests counter-positioning

---

*Document generated from DNA v1.0.0 audit against Lovable implementation*
