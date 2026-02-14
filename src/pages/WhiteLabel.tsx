import DashboardLayout from "@/components/DashboardLayout";
import { Palette, Loader2, Upload, Eye } from "lucide-react";
import { useState } from "react";

const WhiteLabelPage = () => {
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
            <label className="flex items-center gap-2 mt-4">
              <input type="checkbox" checked={form.hide_branding} onChange={(e) => setForm(f => ({ ...f, hide_branding: e.target.checked }))} className="rounded border-border" />
              <span className="text-sm">Hide Matango branding</span>
            </label>
          </div>

          <div className="flex gap-3">
            <button className="px-4 py-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 flex items-center gap-2">
              Save Settings
            </button>
            <button className="px-4 py-2.5 rounded-lg border border-border text-sm text-muted-foreground hover:text-foreground flex items-center gap-2">
              <Eye className="h-4 w-4" /> Preview
            </button>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default WhiteLabelPage;
