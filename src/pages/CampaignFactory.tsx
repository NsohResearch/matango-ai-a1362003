import { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import WorkflowNav from "@/components/WorkflowNav";
import { Megaphone, Plus, Loader2, ChevronRight, Eye, BarChart3 } from "lucide-react";
import { useCampaigns, useCreateCampaign, useBrandBrains } from "@/hooks/useData";
import { useNavigate, useSearchParams } from "react-router-dom";

const STATUS_COLORS: Record<string, string> = {
  draft: "bg-muted text-muted-foreground",
  generating: "bg-accent/20 text-accent",
  review: "bg-blue-500/20 text-blue-400",
  approved: "bg-primary/20 text-primary",
  scheduled: "bg-purple-500/20 text-purple-400",
  live: "bg-green-500/20 text-green-400",
};

const CampaignFactoryPage = () => {
  const { data: campaigns, isLoading } = useCampaigns();
  const { data: brands } = useBrandBrains();
  const create = useCreateCampaign();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const brandId = searchParams.get("brandId");
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ name: "", angle: "", target_icp: "", brand_id: "" });

  const handleCreate = () => {
    if (!form.name) return;
    create.mutate({ ...form, brand_id: form.brand_id || undefined }, {
      onSuccess: () => { setShowCreate(false); setForm({ name: "", angle: "", target_icp: "", brand_id: "" }); },
    });
  };

  return (
    <DashboardLayout>
      <div className="p-6 lg:p-8 max-w-6xl">
        <WorkflowNav brandId={brandId} />
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="font-display text-3xl font-bold flex items-center gap-2">
              <Megaphone className="h-8 w-8 text-primary" /> Campaign Factory
            </h1>
            <p className="mt-1 text-muted-foreground">Create unified campaigns with auto-generated multi-channel assets.</p>
          </div>
          <button onClick={() => setShowCreate(true)}
            className="px-4 py-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 flex items-center gap-2">
            <Plus className="h-4 w-4" /> New Campaign
          </button>
        </div>

        {showCreate && (
          <div className="glass-card rounded-xl p-6 mb-6 border border-primary/20">
            <h3 className="font-display font-semibold mb-4">Create Campaign</h3>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="text-sm font-medium mb-1 block">Campaign Name *</label>
                <input value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                  className="w-full rounded-lg border border-border bg-secondary px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50" placeholder="Q1 Product Launch" />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Brand</label>
                <select value={form.brand_id} onChange={(e) => setForm((f) => ({ ...f, brand_id: e.target.value }))}
                  className="w-full rounded-lg border border-border bg-secondary px-4 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50">
                  <option value="">Select brand</option>
                  {brands?.map((b) => <option key={b.id} value={b.id}>{b.brand_name || "Untitled"}</option>)}
                </select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="text-sm font-medium mb-1 block">Angle / Hook</label>
                <input value={form.angle} onChange={(e) => setForm((f) => ({ ...f, angle: e.target.value }))}
                  className="w-full rounded-lg border border-border bg-secondary px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50" placeholder="Pain-point based, testimonial, etc." />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Target ICP</label>
                <input value={form.target_icp} onChange={(e) => setForm((f) => ({ ...f, target_icp: e.target.value }))}
                  className="w-full rounded-lg border border-border bg-secondary px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50" placeholder="Solopreneurs, CMOs, etc." />
              </div>
            </div>
            <div className="flex gap-3 justify-end">
              <button onClick={() => setShowCreate(false)} className="px-4 py-2 rounded-lg border border-border text-sm text-muted-foreground">Cancel</button>
              <button onClick={handleCreate} disabled={create.isPending || !form.name}
                className="px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 disabled:opacity-50 flex items-center gap-2">
                {create.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : null} Create Campaign
              </button>
            </div>
          </div>
        )}

        {isLoading ? (
          <div className="flex items-center justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
        ) : campaigns && campaigns.length > 0 ? (
          <div className="space-y-3">
            {campaigns.map((c) => (
              <div key={c.id} className="glass-card rounded-xl p-5 flex items-center justify-between hover:border-primary/20 transition-colors">
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <h3 className="font-display font-semibold">{c.name}</h3>
                    <span className={`text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full ${STATUS_COLORS[c.status] || STATUS_COLORS.draft}`}>{c.status}</span>
                  </div>
                  {c.angle && <p className="text-sm text-muted-foreground mt-1">{c.angle}</p>}
                  <div className="flex gap-4 mt-2 text-xs text-muted-foreground">
                    <span>{c.impressions || 0} impressions</span>
                    <span>{c.clicks || 0} clicks</span>
                    <span>{c.conversions || 0} conversions</span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => navigate(`/campaigns/${c.id}`)} className="p-2 rounded-lg bg-secondary text-muted-foreground hover:text-foreground"><Eye className="h-4 w-4" /></button>
                  <button className="p-2 rounded-lg bg-secondary text-muted-foreground hover:text-foreground"><BarChart3 className="h-4 w-4" /></button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="glass-card rounded-xl p-12 text-center">
            <Megaphone className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="font-display text-lg font-semibold mb-2">No campaigns yet</h3>
            <p className="text-sm text-muted-foreground mb-4">Create your first campaign to start generating multi-channel content.</p>
            <button onClick={() => setShowCreate(true)} className="px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium">Create First Campaign</button>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default CampaignFactoryPage;
