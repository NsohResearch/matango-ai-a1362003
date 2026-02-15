import { useState, useEffect } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import WorkflowNav from "@/components/WorkflowNav";
import { Calendar, ChevronLeft, ChevronRight, Plus, Loader2, Clock, X, Send, Layers, Trash2, Image, Film, Paperclip } from "lucide-react";
import { useScheduledPosts, useCreateScheduledPost, useBatchCreateScheduledPosts, useCampaigns } from "@/hooks/useData";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, addMonths, subMonths, isToday, addDays } from "date-fns";
import { useSearchParams } from "react-router-dom";
import { resolveAssetUrl } from "@/lib/storage";
import { toast } from "sonner";

const PLATFORMS = ["instagram", "tiktok", "linkedin", "twitter", "youtube", "facebook"];
const PLATFORM_COLORS: Record<string, string> = {
  instagram: "bg-pink-500/20 text-pink-400",
  tiktok: "bg-cyan-500/20 text-cyan-400",
  linkedin: "bg-blue-500/20 text-blue-400",
  twitter: "bg-sky-500/20 text-sky-400",
  youtube: "bg-red-500/20 text-red-400",
  facebook: "bg-indigo-500/20 text-indigo-400",
};

interface BatchRow {
  id: string;
  platform: string;
  content: string;
  scheduled_for: string;
  campaign_id: string;
}

const emptyRow = (): BatchRow => ({
  id: crypto.randomUUID(),
  platform: "instagram",
  content: "",
  scheduled_for: "",
  campaign_id: "",
});

const SchedulerPage = () => {
  const { data: posts, isLoading } = useScheduledPosts();
  const { data: campaigns } = useCampaigns();
  const createPost = useCreateScheduledPost();
  const batchCreate = useBatchCreateScheduledPosts();
  const [searchParams, setSearchParams] = useSearchParams();
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [view, setView] = useState<"month" | "week" | "list">("month");
  const [showCreate, setShowCreate] = useState(false);
  const [showBatch, setShowBatch] = useState(false);
  const [attachedAsset, setAttachedAsset] = useState<{ id: string; url: string; type: string; resolvedUrl?: string } | null>(null);
  const [form, setForm] = useState({
    platform: "instagram",
    content: "",
    scheduled_for: "",
    campaign_id: "",
  });

  // Consume asset query params from "Send to Scheduler"
  useEffect(() => {
    const assetId = searchParams.get("assetId");
    const assetUrl = searchParams.get("assetUrl");
    const assetType = searchParams.get("assetType");
    if (assetId && assetUrl) {
      setAttachedAsset({ id: assetId, url: decodeURIComponent(assetUrl), type: assetType || "image" });
      setShowCreate(true);
      // Resolve the URL for display
      resolveAssetUrl(decodeURIComponent(assetUrl), assetType === "video" ? "videos" : "content", true)
        .then((resolved) => {
          if (resolved) setAttachedAsset((prev) => prev ? { ...prev, resolvedUrl: resolved } : null);
        });
      // Clear params from URL
      setSearchParams({}, { replace: true });
    }
  }, [searchParams, setSearchParams]);

  // Batch state
  const [batchRows, setBatchRows] = useState<BatchRow[]>([emptyRow(), emptyRow(), emptyRow()]);
  const [batchDefaults, setBatchDefaults] = useState({ campaign_id: "", startDate: format(addDays(new Date(), 1), "yyyy-MM-dd"), interval: "1" });

  const days = eachDayOfInterval({
    start: startOfMonth(currentMonth),
    end: endOfMonth(currentMonth),
  });

  const firstDayOffset = startOfMonth(currentMonth).getDay();

  const getPostsForDay = (day: Date) =>
    posts?.filter((p) => isSameDay(new Date(p.scheduled_for), day)) || [];

  const handleCreate = () => {
    if (!form.content) { toast.error("Add post content"); return; }
    if (!form.scheduled_for) { toast.error("Select a date and time"); return; }
    createPost.mutate(
      {
        ...form,
        campaign_id: form.campaign_id || undefined,
        image_url: attachedAsset?.url || undefined,
      },
      {
        onSuccess: () => {
          setShowCreate(false);
          setForm({ platform: "instagram", content: "", scheduled_for: "", campaign_id: "" });
          setAttachedAsset(null);
        },
      }
    );
  };

  const updateBatchRow = (id: string, field: keyof BatchRow, value: string) => {
    setBatchRows((rows) => rows.map((r) => (r.id === id ? { ...r, [field]: value } : r)));
  };

  const addBatchRow = () => setBatchRows((rows) => [...rows, emptyRow()]);
  const removeBatchRow = (id: string) => setBatchRows((rows) => rows.length > 1 ? rows.filter((r) => r.id !== id) : rows);

  const autoFillDates = () => {
    const start = new Date(batchDefaults.startDate + "T10:00");
    const intervalDays = parseInt(batchDefaults.interval) || 1;
    setBatchRows((rows) =>
      rows.map((r, i) => ({
        ...r,
        scheduled_for: r.scheduled_for || format(addDays(start, i * intervalDays), "yyyy-MM-dd'T'HH:mm"),
        campaign_id: r.campaign_id || batchDefaults.campaign_id,
      }))
    );
  };

  const handleBatchSubmit = () => {
    const valid = batchRows.filter((r) => r.content && r.scheduled_for);
    if (valid.length === 0) { toast.error("Fill in at least one post with content and date"); return; }
    batchCreate.mutate(
      valid.map((r) => ({
        platform: r.platform,
        content: r.content,
        scheduled_for: r.scheduled_for,
        campaign_id: r.campaign_id || undefined,
      })),
      {
        onSuccess: () => {
          setShowBatch(false);
          setBatchRows([emptyRow(), emptyRow(), emptyRow()]);
        },
      }
    );
  };

  return (
    <DashboardLayout>
      <div className="p-6 lg:p-8 max-w-6xl">
        <WorkflowNav />
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="font-display text-3xl font-bold flex items-center gap-2">
              <Calendar className="h-8 w-8 text-primary" /> Scheduler
            </h1>
            <p className="mt-1 text-muted-foreground">Schedule and auto-publish across all channels.</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex rounded-lg border border-border overflow-hidden">
              {(["month", "week", "list"] as const).map((v) => (
                <button key={v} onClick={() => setView(v)}
                  className={`px-3 py-1.5 text-xs font-medium capitalize ${view === v ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}>
                  {v}
                </button>
              ))}
            </div>
            <button onClick={() => { setShowBatch(true); setShowCreate(false); }}
              className="px-4 py-2.5 rounded-lg border border-primary text-primary text-sm font-medium hover:bg-primary/10 flex items-center gap-2">
              <Layers className="h-4 w-4" /> Batch Schedule
            </button>
            <button onClick={() => { setShowCreate(true); setShowBatch(false); }}
              className="px-4 py-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 flex items-center gap-2">
              <Plus className="h-4 w-4" /> Schedule Post
            </button>
          </div>
        </div>

        {/* Batch schedule panel */}
        {showBatch && (
          <div className="glass-card rounded-xl p-6 mb-6 border border-primary/20">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-display font-semibold flex items-center gap-2">
                  <Layers className="h-5 w-5 text-primary" /> Batch Schedule
                </h3>
                <p className="text-xs text-muted-foreground mt-1">Schedule multiple posts at once. Auto-fill dates for a drip campaign.</p>
              </div>
              <button onClick={() => setShowBatch(false)} className="text-muted-foreground hover:text-foreground"><X className="h-4 w-4" /></button>
            </div>

            {/* Batch defaults */}
            <div className="grid grid-cols-4 gap-4 mb-4 p-3 rounded-lg bg-muted/30 border border-border">
              <div>
                <label className="text-xs font-medium mb-1 block text-muted-foreground">Campaign (all)</label>
                <select value={batchDefaults.campaign_id} onChange={(e) => setBatchDefaults((d) => ({ ...d, campaign_id: e.target.value }))}
                  className="w-full rounded-lg border border-border bg-secondary px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50">
                  <option value="">No campaign</option>
                  {campaigns?.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs font-medium mb-1 block text-muted-foreground">Start date</label>
                <input type="date" value={batchDefaults.startDate} onChange={(e) => setBatchDefaults((d) => ({ ...d, startDate: e.target.value }))}
                  className="w-full rounded-lg border border-border bg-secondary px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50" />
              </div>
              <div>
                <label className="text-xs font-medium mb-1 block text-muted-foreground">Days apart</label>
                <input type="number" min="1" max="30" value={batchDefaults.interval} onChange={(e) => setBatchDefaults((d) => ({ ...d, interval: e.target.value }))}
                  className="w-full rounded-lg border border-border bg-secondary px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50" />
              </div>
              <div className="flex items-end">
                <button onClick={autoFillDates}
                  className="w-full px-3 py-2 rounded-lg border border-primary text-primary text-sm font-medium hover:bg-primary/10 transition-colors">
                  Auto-fill Dates
                </button>
              </div>
            </div>

            {/* Batch rows */}
            <div className="space-y-2 max-h-[40vh] overflow-y-auto">
              {batchRows.map((row, i) => (
                <div key={row.id} className="grid grid-cols-[40px_120px_1fr_180px_40px] gap-2 items-center">
                  <span className="text-xs font-bold text-muted-foreground text-center">{i + 1}</span>
                  <select value={row.platform} onChange={(e) => updateBatchRow(row.id, "platform", e.target.value)}
                    className="rounded-lg border border-border bg-secondary px-2 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50">
                    {PLATFORMS.map((p) => <option key={p} value={p}>{p.charAt(0).toUpperCase() + p.slice(1)}</option>)}
                  </select>
                  <input type="text" value={row.content} onChange={(e) => updateBatchRow(row.id, "content", e.target.value)}
                    placeholder="Post content..."
                    className="rounded-lg border border-border bg-secondary px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50" />
                  <input type="datetime-local" value={row.scheduled_for} onChange={(e) => updateBatchRow(row.id, "scheduled_for", e.target.value)}
                    className="rounded-lg border border-border bg-secondary px-2 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50" />
                  <button onClick={() => removeBatchRow(row.id)} className="p-1 text-muted-foreground hover:text-destructive transition-colors">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>

            <div className="flex items-center justify-between mt-4">
              <button onClick={addBatchRow} className="text-sm text-primary hover:underline flex items-center gap-1">
                <Plus className="h-3 w-3" /> Add row
              </button>
              <div className="flex gap-3">
                <span className="text-xs text-muted-foreground self-center">
                  {batchRows.filter((r) => r.content && r.scheduled_for).length} of {batchRows.length} ready
                </span>
                <button onClick={() => setShowBatch(false)} className="px-4 py-2 rounded-lg border border-border text-sm text-muted-foreground">Cancel</button>
                <button onClick={handleBatchSubmit} disabled={batchCreate.isPending}
                  className="px-5 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 disabled:opacity-50 flex items-center gap-2">
                  {batchCreate.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                  Schedule All
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Single post create dialog */}
        {showCreate && (
          <div className="glass-card rounded-xl p-6 mb-6 border border-primary/20">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-display font-semibold">Schedule New Post</h3>
              <button onClick={() => setShowCreate(false)} className="text-muted-foreground hover:text-foreground"><X className="h-4 w-4" /></button>
            </div>
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="text-sm font-medium mb-1 block">Platform *</label>
                  <select value={form.platform} onChange={(e) => setForm((f) => ({ ...f, platform: e.target.value }))}
                    className="w-full rounded-lg border border-border bg-secondary px-4 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50">
                    {PLATFORMS.map((p) => <option key={p} value={p}>{p.charAt(0).toUpperCase() + p.slice(1)}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium mb-1 block">Date & Time *</label>
                  <input type="datetime-local" value={form.scheduled_for} onChange={(e) => setForm((f) => ({ ...f, scheduled_for: e.target.value }))}
                    className="w-full rounded-lg border border-border bg-secondary px-4 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50" />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1 block">Campaign</label>
                  <select value={form.campaign_id} onChange={(e) => setForm((f) => ({ ...f, campaign_id: e.target.value }))}
                    className="w-full rounded-lg border border-border bg-secondary px-4 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50">
                    <option value="">No campaign</option>
                    {campaigns?.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Content *</label>
                <textarea value={form.content} onChange={(e) => setForm((f) => ({ ...f, content: e.target.value }))}
                  className="w-full rounded-lg border border-border bg-secondary px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 min-h-[100px]"
                  placeholder="Write your post content..." />
              </div>

              {/* Attached media */}
              {attachedAsset && (
                <div className="p-3 rounded-lg bg-secondary/50 border border-border">
                  <div className="flex items-center gap-3">
                    <div className="w-16 h-16 rounded-lg overflow-hidden border border-border bg-muted flex items-center justify-center shrink-0">
                      {attachedAsset.resolvedUrl && attachedAsset.type === "image" ? (
                        <img src={attachedAsset.resolvedUrl} alt="Attached" className="w-full h-full object-cover" />
                      ) : attachedAsset.type === "video" ? (
                        <Film className="h-6 w-6 text-muted-foreground" />
                      ) : (
                        <Image className="h-6 w-6 text-muted-foreground" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium flex items-center gap-1.5">
                        <Paperclip className="h-3.5 w-3.5 text-primary" />
                        Media attached
                      </p>
                      <p className="text-xs text-muted-foreground capitalize">{attachedAsset.type} · ID: {attachedAsset.id.slice(0, 8)}…</p>
                    </div>
                    <button onClick={() => setAttachedAsset(null)} className="p-1 rounded text-muted-foreground hover:text-destructive">
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              )}
              <div className="flex gap-3 justify-end">
                <button onClick={() => setShowCreate(false)} className="px-4 py-2 rounded-lg border border-border text-sm text-muted-foreground">Cancel</button>
                <button onClick={handleCreate} disabled={createPost.isPending}
                  className="px-5 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 disabled:opacity-50 flex items-center gap-2">
                  {createPost.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                  Schedule
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Calendar header */}
        <div className="flex items-center justify-between mb-4">
          <button onClick={() => setCurrentMonth(subMonths(currentMonth, 1))} className="p-2 rounded-lg bg-secondary text-muted-foreground hover:text-foreground">
            <ChevronLeft className="h-4 w-4" />
          </button>
          <h2 className="font-display text-xl font-semibold">{format(currentMonth, "MMMM yyyy")}</h2>
          <button onClick={() => setCurrentMonth(addMonths(currentMonth, 1))} className="p-2 rounded-lg bg-secondary text-muted-foreground hover:text-foreground">
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
        ) : view === "month" ? (
          <div className="glass-card rounded-xl overflow-hidden">
            <div className="grid grid-cols-7 border-b border-border">
              {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
                <div key={d} className="p-3 text-center text-xs font-medium text-muted-foreground">{d}</div>
              ))}
            </div>
            <div className="grid grid-cols-7">
              {Array.from({ length: firstDayOffset }).map((_, i) => (
                <div key={`empty-${i}`} className="min-h-[100px] border-b border-r border-border bg-muted/20" />
              ))}
              {days.map((day) => {
                const dayPosts = getPostsForDay(day);
                return (
                  <div key={day.toISOString()} className={`min-h-[100px] border-b border-r border-border p-2 ${isToday(day) ? "bg-primary/5" : ""}`}>
                    <span className={`text-xs font-medium ${isToday(day) ? "text-primary" : "text-muted-foreground"}`}>
                      {format(day, "d")}
                    </span>
                    <div className="mt-1 space-y-1">
                      {dayPosts.slice(0, 3).map((p) => (
                        <div key={p.id} className={`text-[10px] px-1.5 py-0.5 rounded truncate ${PLATFORM_COLORS[p.platform] || "bg-muted text-muted-foreground"}`}>
                          {p.platform}
                        </div>
                      ))}
                      {dayPosts.length > 3 && (
                        <div className="text-[10px] text-muted-foreground">+{dayPosts.length - 3} more</div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            {posts && posts.length > 0 ? posts.map((p) => (
              <div key={p.id} className="glass-card rounded-xl p-4 flex items-center gap-4">
                <div className={`px-2.5 py-1 rounded-lg text-xs font-medium capitalize ${PLATFORM_COLORS[p.platform] || "bg-muted text-muted-foreground"}`}>
                  {p.platform}
                </div>
                <div className="flex-1">
                  <p className="text-sm line-clamp-1">{p.content || "No content"}</p>
                </div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Clock className="h-3 w-3" />
                  {format(new Date(p.scheduled_for), "MMM d, HH:mm")}
                </div>
                <span className={`text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full ${
                  p.status === "published" ? "bg-primary/20 text-primary" :
                  p.status === "failed" ? "bg-destructive/20 text-destructive" :
                  "bg-muted text-muted-foreground"
                }`}>{p.status}</span>
              </div>
            )) : (
              <div className="glass-card rounded-xl p-12 text-center">
                <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="font-display text-lg font-semibold mb-2">No scheduled posts</h3>
                <p className="text-sm text-muted-foreground mb-4">Schedule your first post to start publishing.</p>
                <button onClick={() => setShowCreate(true)}
                  className="px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium">
                  Schedule First Post
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default SchedulerPage;
