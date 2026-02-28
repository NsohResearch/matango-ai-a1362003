/**
 * RBAC configuration for menu visibility.
 * Roles ranked: super_admin > admin > user > read_only
 */

export type AppRole = "super_admin" | "admin" | "user" | "read_only";

const ROLE_RANK: Record<AppRole, number> = {
  read_only: 0,
  user: 1,
  admin: 2,
  super_admin: 3,
};

/** The minimum role required to see each nav section / route */
export interface NavVisibility {
  minRole: AppRole;
}

/** System step visibility — most are "user", some are gated higher */
export const SYSTEM_STEP_VISIBILITY: Record<number, NavVisibility> = {
  0: { minRole: "user" },       // Brand Brain
  1: { minRole: "user" },       // Influencer Studio
  2: { minRole: "user" },       // Campaign Blueprint
  3: { minRole: "user" },       // Campaign Factory
  4: { minRole: "user" },       // Video Studio
  5: { minRole: "user" },       // Asset Gallery
  6: { minRole: "user" },       // AAO & Automation
  7: { minRole: "user" },       // Publish & Schedule
  8: { minRole: "admin" },      // Scale & Customize (admin+)
  9: { minRole: "user" },       // Meet Ka'h
};

/** Manage section visibility */
export const MANAGE_VISIBILITY: Record<string, NavVisibility> = {
  "/dashboard":         { minRole: "read_only" },
  "/notifications":     { minRole: "read_only" },
  "/account-settings":  { minRole: "user" },
};

/** Admin console requires admin+ */
export const ADMIN_VISIBILITY: NavVisibility = { minRole: "admin" };

/**
 * Given the user's roles array, return the highest role.
 */
export function getHighestRole(roles: string[] | undefined): AppRole {
  if (!roles || roles.length === 0) return "user";
  let highest: AppRole = "read_only";
  for (const r of roles) {
    const role = r as AppRole;
    if (ROLE_RANK[role] !== undefined && ROLE_RANK[role] > ROLE_RANK[highest]) {
      highest = role;
    }
  }
  return highest;
}

/**
 * Check if the user's highest role meets the minimum requirement.
 */
export function canAccess(userRoles: string[] | undefined, required: NavVisibility): boolean {
  const highest = getHighestRole(userRoles);
  return ROLE_RANK[highest] >= ROLE_RANK[required.minRole];
}
