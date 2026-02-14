import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

function hexToHsl(hex: string): string {
  const h = hex.replace("#", "");
  const r = parseInt(h.substring(0, 2), 16) / 255;
  const g = parseInt(h.substring(2, 4), 16) / 255;
  const b = parseInt(h.substring(4, 6), 16) / 255;

  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let hue = 0, sat = 0;
  const light = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    sat = light > 0.5 ? d / (2 - max - min) : d / (max + min);
    if (max === r) hue = ((g - b) / d + (g < b ? 6 : 0)) / 6;
    else if (max === g) hue = ((b - r) / d + 2) / 6;
    else hue = ((r - g) / d + 4) / 6;
  }

  return `${Math.round(hue * 360)} ${Math.round(sat * 100)}% ${Math.round(light * 100)}%`;
}

function setFavicon(href: string) {
  let link = document.querySelector<HTMLLinkElement>('link[rel="icon"]');
  if (!link) {
    link = document.createElement("link");
    link.rel = "icon";
    document.head.appendChild(link);
  }
  link.href = href;
}

/**
 * Loads org branding and applies CSS custom properties + favicon.
 * Safe to call on every render — only fetches once per session.
 */
export function useBrandingBootstrap() {
  const { user } = useAuth();

  useEffect(() => {
    if (!user) return;

    let cancelled = false;

    async function load() {
      // Find user's org membership
      const { data: membership } = await supabase
        .from("memberships")
        .select("organization_id")
        .eq("user_id", user!.id)
        .limit(1)
        .maybeSingle();

      if (!membership || cancelled) return;

      const { data: org } = await supabase
        .from("organizations")
        .select("logo_url, favicon_url, name")
        .eq("id", membership.organization_id)
        .maybeSingle();

      const { data: wl } = await supabase
        .from("white_label_settings")
        .select("primary_color, secondary_color, accent_color, brand_font, brand_name, hide_branding")
        .eq("org_id", membership.organization_id)
        .maybeSingle();

      if (cancelled) return;

      // Apply CSS vars if custom colors exist
      if (wl?.primary_color) {
        document.documentElement.style.setProperty("--brand-primary", hexToHsl(wl.primary_color));
      }
      if (wl?.accent_color) {
        document.documentElement.style.setProperty("--brand-accent", hexToHsl(wl.accent_color));
      }
      if (wl?.brand_font) {
        document.documentElement.style.setProperty("--brand-font", wl.brand_font);
      }

      // Favicon
      if (org?.favicon_url) {
        setFavicon(org.favicon_url);
      }

      // Platform name
      const platformName = wl?.brand_name || org?.name;
      if (platformName) {
        document.title = `${platformName} — Matango`;
      }
    }

    load();
    return () => { cancelled = true; };
  }, [user?.id]);
}
