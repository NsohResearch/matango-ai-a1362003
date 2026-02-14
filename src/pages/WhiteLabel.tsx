import { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Palette, Save, Eye, Loader2 } from "lucide-react";
import { useOrganization, useWhiteLabelSettings, useUpsertWhiteLabelSettings } from "@/hooks/useData";
import { toast } from "sonner";

const WhiteLabelPage = () => {
  const { data: org, isLoading: orgLoading } = useOrganization();
  const { data: settings, isLoading: settingsLoading } = useWhiteLabelSettings(org?.id);
  const upsertMutation = useUpsertWhiteLabelSettings();

  const [form, setForm] = useState({
    brand_name: "",
    primary_color: "#22c55e",
    secondary_color: "#1a1a2e",
    accent_color: "#f59e0b",
    logo_url: "",
    favicon_url: "",
    custom_domain: "",
    support_email: "",
    custom_footer: "",
    hide_branding: false,
  });

  const [initialized, setInitialized] = useState(false);

  // Load settings into form when available
  if (settings && !initialized) {
    setForm({
      brand_name: settings.brand_name || "",
      primary_color: settings.primary_color || "#22c55e",
      secondary_color: settings.secondary_color || "#1a1a2e",
      accent_color: settings.accent_color || "#f59e0b",
      logo_url: settings.logo_url || "",
      favicon_url: settings.favicon_url || "",
      custom_domain: settings.custom_domain || "",
      support_email: settings.support_email || "",
      custom_footer: settings.custom_footer || "",
      hide_branding: settings.hide_branding || false,
    });
    setInitialized(true);
  }

  const handleSave = () => {
    if (!org?.id) {
      toast.error("No organization found. Please complete onboarding first.");
      return;
    }
    upsertMutation.mutate({ org_id: org.id, ...form });
  };

  const isLoading = orgLoading || settingsLoading;

  return (
    <DashboardLayout>
      <div className="p-6 lg:p-8 max-w-4xl">
        <div className="mb-6">
          <h1 className="font-display text-3xl font-bold flex items-center gap-2">
            <Palette className="h-8 w-8 text-primary" /> White Label
          </h1>
          <p className="mt-1 text-muted-foreground">Customize the platform with your agency branding.</p>
          <span className="inline-block mt-2 text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full bg-accent/20 text-accent">Agency Tier Feature</span>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
        ) : (
          <div className="space-y-6">
            <div className="glass-card rounded-xl p-6">
              <h3 className="font-display font-semibold mb-4">Branding</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium mb-1 block">Brand Name</label>
                  <input value={form.brand_name} onChange={(e) => setForm(f => ({ ...f, brand_name: e.target.value }))}
                    className="w-full rounded-lg border border-border bg-secondary px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50" placeholder="Your Agency Name" />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1 block">Custom Domain</label>
                  <input value={form.custom_domain} onChange={(e) => setForm(f => ({ ...f, custom_domain: e.target.value }))}
                    className="w-full rounded-lg border border-border bg-secondary px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50" placeholder="app.youragency.com" />
                </div>
              </div>
            </div>

            <div className="glass-card rounded-xl p-6">
              <h3 className="font-display font-semibold mb-4">Colors</h3>
              <div className="grid grid-cols-3 gap-4">
                {[
                  { key: "primary_color", label: "Primary" },
                  { key: "secondary_color", label: "Secondary" },
                  { key: "accent_color", label: "Accent" },
                ].map((c) => (
                  <div key={c.key}>
                    <label className="text-sm font-medium mb-1 block">{c.label}</label>
                    <div className="flex items-center gap-2">
                      <input type="color" value={(form as any)[c.key]}
                        onChange={(e) => setForm(f => ({ ...f, [c.key]: e.target.value }))}
                        className="w-10 h-10 rounded-lg border border-border cursor-pointer" />
                      <input value={(form as any)[c.key]}
                        onChange={(e) => setForm(f => ({ ...f, [c.key]: e.target.value }))}
                        className="flex-1 rounded-lg border border-border bg-secondary px-3 py-2 text-sm text-foreground font-mono" />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="glass-card rounded-xl p-6">
              <h3 className="font-display font-semibold mb-4">Assets</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium mb-1 block">Logo URL</label>
                  <input value={form.logo_url} onChange={(e) => setForm(f => ({ ...f, logo_url: e.target.value }))}
                    className="w-full rounded-lg border border-border bg-secondary px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50" placeholder="https://..." />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1 block">Support Email</label>
                  <input value={form.support_email} onChange={(e) => setForm(f => ({ ...f, support_email: e.target.value }))}
                    className="w-full rounded-lg border border-border bg-secondary px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50" placeholder="support@agency.com" />
                </div>
              </div>
              <div className="mt-4">
                <label className="text-sm font-medium mb-1 block">Custom Footer</label>
                <input value={form.custom_footer} onChange={(e) => setForm(f => ({ ...f, custom_footer: e.target.value }))}
                  className="w-full rounded-lg border border-border bg-secondary px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50" placeholder="© 2026 Your Agency" />
              </div>
              <label className="flex items-center gap-2 mt-4">
                <input type="checkbox" checked={form.hide_branding} onChange={(e) => setForm(f => ({ ...f, hide_branding: e.target.checked }))} className="rounded border-border" />
                <span className="text-sm">Hide Matango branding</span>
              </label>
            </div>

            {/* Preview */}
            {form.brand_name && (
              <div className="glass-card rounded-xl p-6">
                <h3 className="font-display font-semibold mb-4">Preview</h3>
                <div className="rounded-lg p-6 border border-border" style={{ background: form.secondary_color }}>
                  <div className="flex items-center gap-3 mb-4">
                    {form.logo_url && <img src={form.logo_url} alt="Logo" className="h-8 w-8 rounded" />}
                    <span className="font-display text-lg font-bold" style={{ color: form.primary_color }}>{form.brand_name}</span>
                  </div>
                  <div className="flex gap-2">
                    <div className="px-4 py-2 rounded-lg text-sm font-medium text-white" style={{ background: form.primary_color }}>Primary Button</div>
                    <div className="px-4 py-2 rounded-lg text-sm font-medium text-white" style={{ background: form.accent_color }}>Accent Button</div>
                  </div>
                  {form.custom_footer && <p className="mt-4 text-xs opacity-60 text-white">{form.custom_footer}</p>}
                </div>
              </div>
            )}

            <div className="flex gap-3">
              <button onClick={handleSave} disabled={upsertMutation.isPending}
                className="px-4 py-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 flex items-center gap-2 disabled:opacity-50">
                {upsertMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                Save Settings
              </button>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default WhiteLabelPage;
