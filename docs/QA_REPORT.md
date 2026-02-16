# Matango.ai — QA Audit Report

**Date:** 2026-02-16  
**Scope:** Full platform audit — Auth, RBAC, billing, plan gating, tenant isolation, route protection  
**Status:** ✅ ALL TESTS PASSING (23/23)

---

## Executive Summary

Performed a comprehensive audit covering authentication, authorization, billing integration, plan gating, credit model, and route protection. Found and fixed **2 critical bugs** and documented **5 recommendations** for future hardening.

---

## Test Suite Results

| Suite | Tests | Status |
|-------|-------|--------|
| `plan-gating.test.ts` | 12 | ✅ PASS |
| `credits.test.ts` | 6 | ✅ PASS |
| `stripe-consistency.test.ts` | 4 | ✅ PASS |
| `example.test.ts` | 1 | ✅ PASS |
| **Total** | **23** | **✅ ALL PASS** |

---

## Critical Bugs Found & Fixed

### P0-1: Stripe Price ID Mismatch (FIXED)
- **Location:** `PlanSelectionDrawer.tsx`
- **Issue:** Used stale Stripe price IDs (`price_1T0cav...`, `price_1T0caw...`) that didn't match the actual Stripe products configured in `Pricing.tsx` (`price_1RVWxe...`, `price_1RVWyS...`).
- **Impact:** Users upgrading from the plan drawer would create checkout sessions for wrong/nonexistent prices → checkout failure.
- **Fix:** Aligned price IDs to match `Pricing.tsx` values.

### P0-2: Webhook Hardcoded Plan (FIXED)
- **Location:** `supabase/functions/stripe-webhook/index.ts`
- **Issue:** `checkout.session.completed` always set plan to `"basic"` regardless of which product was purchased. Agency subscribers would be marked as Creator.
- **Fix:** Webhook now retrieves the subscription from Stripe, reads the product ID, and maps it via `PRODUCT_MAP` to the correct internal plan key (`basic` or `agency`).
- **Also fixed:** `customer.subscription.updated` handler now correctly maps product → plan instead of hardcoding `"basic"`.

---

## Audit Findings by Category

### Authentication & Authorization ✅
| Check | Status | Notes |
|-------|--------|-------|
| ProtectedRoute redirects unauthenticated | ✅ | Redirects to `/auth` |
| AdminRoute checks `user_roles` table | ✅ | Uses `useUserRoles()` hook |
| Super admin route gating | ✅ | `SUPER_ADMIN_ONLY_ROUTES` enforced |
| Roles stored in separate table | ✅ | `user_roles` table, not on profiles |
| `has_role()` is SECURITY DEFINER | ✅ | Prevents RLS recursion |
| Onboarding gate for incomplete profiles | ✅ | Redirects to `/onboarding/profile` |

### Billing & Subscription ✅ (after fixes)
| Check | Status | Notes |
|-------|--------|-------|
| `check-subscription` uses Stripe as source of truth | ✅ | Queries Stripe API directly |
| Plan synced to profiles table | ✅ | Via `check-subscription` and webhook |
| Webhook handles checkout.session.completed | ✅ | Now maps product → plan correctly |
| Webhook handles subscription.updated | ✅ | Now maps product → plan correctly |
| Webhook handles subscription.deleted | ✅ | Downgrades to free |
| Webhook handles invoice.payment_failed | ✅ | Creates notification |
| Auto-refresh subscription state | ✅ | Every 60s in AuthProvider |

### Plan Gating ⚠️
| Check | Status | Notes |
|-------|--------|-------|
| Free tier limits displayed correctly | ✅ | 1 Brand Brain, 5 gen/day |
| Creator tier features displayed | ✅ | Video Studio, 100 gen/day |
| Agency tier features displayed | ✅ | Unlimited, white label |
| **Backend plan enforcement** | ⚠️ | **UI-only gating** — no server-side check |
| ComingSoonPage shows tier requirement | ✅ | Displays tier badge |

### RLS & Tenant Isolation ✅
| Check | Status | Notes |
|-------|--------|-------|
| All user tables scoped by `user_id` | ✅ | RLS policies in place |
| Org-scoped tables use `is_org_member()` | ✅ | SECURITY DEFINER function |
| Admin tables use `is_admin()` | ✅ | SECURITY DEFINER function |
| Public read tables (templates, flags) | ✅ | Intentional `USING (true)` for SELECT |

### Linter Warnings
| Warning | Severity | Action |
|---------|----------|--------|
| Permissive RLS (`USING (true)`) | WARN | Acceptable — only on SELECT for public-read tables (templates, feature flags, QA corpus) |
| Leaked password protection disabled | WARN | **Recommend enabling** in auth settings |

---

## Recommendations for Next Hardening Sprint

### 1. Backend Plan Gating (P1)
Currently, plan limits (Brand Brain count, generation quotas) are enforced only in the UI. A determined user could bypass these via direct API calls. **Recommendation:** Add server-side checks in edge functions (`ai-generate`, `process-video-job`) that verify the user's plan before executing.

### 2. Enable Leaked Password Protection (P1)
The database linter flagged that leaked password protection is disabled. **Recommendation:** Enable it via auth configuration to prevent users from using known compromised passwords.

### 3. Add E2E Tests with Playwright (P2)
The current test suite covers unit-level logic. For full regression confidence, add Playwright E2E tests covering: signup → onboarding → brand creation → generation → upgrade flows.

### 4. Stripe Webhook Signature Verification (P1)
The webhook falls back to raw JSON parsing when `STRIPE_WEBHOOK_SECRET` is not set. **Recommendation:** Configure `STRIPE_WEBHOOK_SECRET` and make signature verification mandatory.

### 5. Rate Limiting on Edge Functions (P2)
While `process-video-job` returns 429 on rate limit, other edge functions (`ai-generate`, `kah-chat`) should also have rate limiting to prevent abuse.

---

## Files Modified

| File | Change |
|------|--------|
| `src/components/PlanSelectionDrawer.tsx` | Fixed Stripe price IDs |
| `supabase/functions/stripe-webhook/index.ts` | Fixed plan mapping in webhook handlers |
| `src/test/plan-gating.test.ts` | NEW — 12 tests for plan config & routes |
| `src/test/credits.test.ts` | NEW — 6 tests for credit model |
| `src/test/stripe-consistency.test.ts` | NEW — 4 tests for Stripe ID consistency |

---

## Conclusion

**Final Status: ✅ PASS** (with recommendations)

All critical billing bugs have been fixed and verified. The platform's auth/RBAC system is correctly implemented with proper role separation. Plan gating works at the UI level; backend enforcement is the top recommendation for the next sprint.
