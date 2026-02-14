import { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import WorkflowNav from "@/components/WorkflowNav";
import { Megaphone, Plus, Loader2, ChevronRight, Eye, BarChart3, Sparkles, X, History, Copy, Layers, Send, CalendarDays, Trash2 } from "lucide-react";
import { useCampaigns, useCreateCampaign, useBrandBrains, useBatchCreateScheduledPosts } from "@/hooks/useData";
import { aaoExecute } from "@/lib/edge-functions";
import { useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "sonner";

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
  const batchCreate = useBatchCreateScheduledPosts();
  const [showCreate, setShowCreate] = useState(false);
  const [showBatch, setShowBatch] = useState(false);
  const [generatingAssets, setGeneratingAssets] = useState<string | null>(null);
  const [form, setForm] = useState({ name: "", angle: "", target_icp: "", brand_id: brandId || "" });

  // Batch scheduling state
  const [batchCampaignId, setBatchCampaignId] = useState("");
  const [batchRows, setBatchRows] = useState<{ platform: string; content: string; scheduled_for: string }[]>([
    { platform: "instagram", content: "", scheduled_for: "" },
  ]);
  const [batchStartDate, setBatchStartDate] = useState("");
  const [batchInterval, setBatchInterval] = useState(2);

  const addBatchRow = () => setBatchRows((r) => [...r, { platform: "instagram", content: "", scheduled_for: "" }]);
  const removeBatchRow = (i: number) => setBatchRows((r) => r.filter((_, idx) => idx !== i));
  const updateBatchRow = (i: number, field: string, value: string) =>
    setBatchRows((r) => r.map((row, idx) => (idx === i ? { ...row, [field]: value } : row)));

  const autoFillDates = () => {
    if (!batchStartDate) { toast.error("Set a start date first"); return; }
    setBatchRows((rows) =>
      rows.map((row, i) => {
        const d = new Date(batchStartDate);
        d.setDate(d.getDate() + i * batchInterval);
        return { ...row, scheduled_for: d.toISOString().slice(0, 16) };
      })
    );
    toast.success("Dates auto-filled");
  };

  const handleBatchSubmit = () => {
    const valid = batchRows.filter((r) => r.content && r.scheduled_for);
    if (valid.length === 0) { toast.error("Add at least one post with content and date"); return; }
    batchCreate.mutate(
      valid.map((r) => ({ ...r, campaign_id: batchCampaignId || undefined })),
      { onSuccess: () => { setShowBatch(false); setBatchRows([{ platform: "instagram", content: "", scheduled_for: "" }]); } }
    );
  };

  // Last 5 campaigns for reuse
  const recentCampaigns = (campaigns || []).slice(0, 5);

  const handleCreate = () => {
    if (!form.name) return;
    create.mutate({ ...form, brand_id: form.brand_id || undefined }, {
      onSuccess: () => { setShowCreate(false); setForm({ name: "", angle: "", target_icp: "", brand_id: "" }); },
    });
  };

  const handleReuse = (campaign: typeof recentCampaigns[0]) => {
    setForm({
      name: `${campaign.name} (Copy)`,
      angle: campaign.angle || "",
      target_icp: campaign.target_icp || "",
      brand_id: campaign.brand_id || "",
    });
    setShowCreate(true);
    toast.info(`Loaded "${campaign.name}" as template — edit and save as new.`);
  };

  const handleGenerateAssets = async (campaignId: string, campaignName: string, angle?: string | null, targetIcp?: string | null) => {
    setGeneratingAssets(campaignId);
    try {
      const brand = brands?.find((b) => b.id === form.brand_id);
      await aaoExecute("campaign", 
        `Generate multi-channel campaign assets for "${campaignName}".
Angle: ${angle || "General awareness"}
Target ICP: ${targetIcp || "General audience"}
Platforms: Instagram, TikTok, LinkedIn, Twitter, Email

Return JSON with an "assets" array where each item has: { type: "social_post"|"email"|"ad_copy", platform: string, content: string, hashtags?: string[] }
Generate at least 6 assets across platforms.`,
        { campaign_id: campaignId, brand_id: brand?.id }
      );
      toast.success("Campaign assets generated! Check the campaign detail view.");
    } catch (err: any) {
      toast.error(err.message || "Asset generation failed");
    } finally {
      setGeneratingAssets(null);
    }
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
            <p className="mt-1 text-muted-foreground">Create unified campaigns with AI-generated multi-channel assets.</p>
          </div>
          <div className="flex gap-2">
            <button onClick={() => setShowBatch(true)}
              className="px-4 py-2.5 rounded-lg border border-border bg-secondary text-sm font-medium hover:bg-secondary/80 flex items-center gap-2">
              <Layers className="h-4 w-4" /> Batch Schedule
            </button>
            <button onClick={() => setShowCreate(true)}
              className="px-4 py-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 flex items-center gap-2">
              <Plus className="h-4 w-4" /> New Campaign
            </button>
          </div>
        </div>

        {/* Recent Campaigns for Reuse */}
        {!showCreate && recentCampaigns.length > 0 && (
          <div className="mb-6">
            <h3 className="text-sm font-medium text-muted-foreground flex items-center gap-1.5 mb-3">
              <History className="h-4 w-4" /> Recent Campaigns — click to reuse
            </h3>
            <div className="flex gap-2 flex-wrap">
              {recentCampaigns.map((c) => (
                <button
                  key={c.id}
                  onClick={() => handleReuse(c)}
                  className="px-3 py-2 rounded-lg border border-border bg-secondary/50 hover:border-primary/30 hover:bg-secondary transition-colors text-left group/reuse flex items-center gap-2"
                >
                  <div>
                    <span className="text-sm font-medium block">{c.name}</span>
                    {c.angle && <span className="text-[11px] text-muted-foreground line-clamp-1">{c.angle}</span>}
                  </div>
                  <Copy className="h-3.5 w-3.5 text-muted-foreground opacity-0 group-hover/reuse:opacity-100 transition-opacity shrink-0" />
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Batch Schedule Panel */}
        {showBatch && (
          <div className="glass-card rounded-xl p-6 mb-6 border border-accent/20">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-display font-semibold flex items-center gap-2">
                <Layers className="h-5 w-5 text-accent-foreground" /> Batch Schedule Posts
              </h3>
              <button onClick={() => setShowBatch(false)} className="text-muted-foreground hover:text-foreground"><X className="h-4 w-4" /></button>
            </div>

            {/* Campaign selector */}
            <div className="mb-4">
              <label className="text-sm font-medium mb-1 block">Campaign (optional)</label>
              <select value={batchCampaignId} onChange={(e) => setBatchCampaignId(e.target.value)}
                className="w-full rounded-lg border border-border bg-secondary px-4 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50">
                <option value="">No campaign</option>
                {campaigns?.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>

            {/* Auto-fill controls */}
            <div className="flex gap-3 items-end mb-4 p-3 rounded-lg bg-secondary/50 border border-border">
              <div>
                <label className="text-xs font-medium mb-1 block">Start Date</label>
                <input type="datetime-local" value={batchStartDate} onChange={(e) => setBatchStartDate(e.target.value)}
                  className="rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" />
              </div>
              <div>
                <label className="text-xs font-medium mb-1 block">Interval (days)</label>
                <input type="number" min={1} max={30} value={batchInterval} onChange={(e) => setBatchInterval(parseInt(e.target.value) || 1)}
                  className="w-20 rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" />
              </div>
              <button onClick={autoFillDates}
                className="px-3 py-2 rounded-lg bg-accent/10 text-accent-foreground text-xs font-medium hover:bg-accent/20 flex items-center gap-1">
                <CalendarDays className="h-3.5 w-3.5" /> Auto-fill Dates
              </button>
            </div>

            {/* Batch rows */}
            <div className="space-y-2 mb-4 max-h-64 overflow-y-auto">
              {batchRows.map((row, i) => (
                <div key={i} className="flex gap-2 items-start">
                  <select value={row.platform} onChange={(e) => updateBatchRow(i, "platform", e.target.value)}
                    className="w-28 shrink-0 rounded-lg border border-border bg-secondary px-2 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-primary/50">
                    <option value="instagram">Instagram</option>
                    <option value="tiktok">TikTok</option>
                    <option value="linkedin">LinkedIn</option>
                    <option value="twitter">Twitter</option>
                    <option value="facebook">Facebook</option>
                  </select>
                  <input value={row.content} onChange={(e) => updateBatchRow(i, "content", e.target.value)}
                    placeholder="Post content..."
                    className="flex-1 rounded-lg border border-border bg-secondary px-3 py-2 text-xs placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50" />
                  <input type="datetime-local" value={row.scheduled_for} onChange={(e) => updateBatchRow(i, "scheduled_for", e.target.value)}
                    className="w-44 shrink-0 rounded-lg border border-border bg-secondary px-2 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-primary/50" />
                  {batchRows.length > 1 && (
                    <button onClick={() => removeBatchRow(i)} className="p-2 text-muted-foreground hover:text-destructive shrink-0"><Trash2 className="h-3.5 w-3.5" /></button>
                  )}
                </div>
              ))}
            </div>

            <div className="flex justify-between">
              <button onClick={addBatchRow} className="text-xs text-primary hover:underline">+ Add Row</button>
              <div className="flex gap-2">
                <button onClick={() => setShowBatch(false)} className="px-4 py-2 rounded-lg border border-border text-sm text-muted-foreground">Cancel</button>
                <button onClick={handleBatchSubmit} disabled={batchCreate.isPending}
                  className="px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 disabled:opacity-50 flex items-center gap-2">
                  {batchCreate.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                  Schedule {batchRows.filter((r) => r.content && r.scheduled_for).length} Posts
                </button>
              </div>
            </div>
          </div>
        )}

        {showCreate && (
          <div className="glass-card rounded-xl p-6 mb-6 border border-primary/20">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-display font-semibold">Create Campaign</h3>
              <button onClick={() => setShowCreate(false)} className="text-muted-foreground hover:text-foreground"><X className="h-4 w-4" /></button>
            </div>
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
                  <button onClick={() => handleGenerateAssets(c.id, c.name, c.angle, c.target_icp)}
                    disabled={generatingAssets === c.id}
                    className="px-3 py-2 rounded-lg bg-primary/10 text-primary text-xs font-medium hover:bg-primary/20 flex items-center gap-1 disabled:opacity-50">
                    {generatingAssets === c.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Sparkles className="h-3.5 w-3.5" />}
                    Generate Assets
                  </button>
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
