import { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import WorkflowNav from "@/components/WorkflowNav";
import { FileText, Plus, Loader2, Play, Clock, Film, Sparkles, X } from "lucide-react";
import { useVideoScripts, useCreateVideoScript, useBrandBrains, useInfluencers } from "@/hooks/useData";
import { aiGenerate } from "@/lib/edge-functions";
import { useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "sonner";

const PLATFORMS = ["tiktok", "instagram_reels", "youtube_shorts", "youtube", "linkedin"];
const SCRIPT_TYPES = ["hook-story-cta", "educational", "testimonial", "product-demo", "behind-the-scenes"];

const VideoScriptsPage = () => {
  const { data: scripts, isLoading } = useVideoScripts();
  const { data: brands } = useBrandBrains();
  const { data: influencers } = useInfluencers();
  const createScript = useCreateVideoScript();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const brandId = searchParams.get("brandId");
  const influencerId = searchParams.get("influencerId");

  const [showCreate, setShowCreate] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [form, setForm] = useState({
    topic: "",
    platform: "tiktok",
    script_type: "hook-story-cta",
    duration: 30,
    brand_id: brandId || "",
    influencer_id: influencerId || "",
  });

  const handleGenerate = async () => {
    if (!form.topic) { toast.error("Enter a topic or product to create a script about"); return; }
    setGenerating(true);
    try {
      const brand = brands?.find((b) => b.id === form.brand_id);
      const influencer = influencers?.find((i) => i.id === form.influencer_id);

      const prompt = `Create a ${form.duration}-second ${form.script_type} video script for ${form.platform}.
Topic: ${form.topic}
${brand ? `Brand: ${brand.brand_name}, Tone: ${brand.brand_tone}, Tagline: ${brand.tagline}` : ""}
${influencer ? `Influencer persona: ${influencer.name} — ${influencer.personality}` : ""}

Return JSON with:
- title: string (catchy script title)
- scenes: array of { scene_number, duration_seconds, visual_direction, dialogue, camera_note }
- delivery_notes: string (overall delivery guidance)
- platform: "${form.platform}"
- duration: ${form.duration}`;

      const res = await aiGenerate(prompt, "script-generate");
      const parsed = JSON.parse(res.content.replace(/```json\n?|```/g, ""));

      await createScript.mutateAsync({
        title: parsed.title || form.topic,
        platform: form.platform,
        duration: form.duration,
        script_type: form.script_type,
        scenes: parsed.scenes,
        delivery_notes: parsed.delivery_notes,
      });

      setShowCreate(false);
      setForm({ topic: "", platform: "tiktok", script_type: "hook-story-cta", duration: 30, brand_id: "", influencer_id: "" });
    } catch (err) {
      toast.error("Script generation failed. Please try again.");
      console.error(err);
    } finally {
      setGenerating(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="p-6 lg:p-8 max-w-6xl">
        <WorkflowNav brandId={brandId} influencerId={influencerId} />
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="font-display text-3xl font-bold flex items-center gap-2">
              <FileText className="h-8 w-8 text-primary" /> Video Scripts
            </h1>
            <p className="mt-1 text-muted-foreground">AI-generated video scripts with scene breakdowns.</p>
          </div>
          <button onClick={() => setShowCreate(true)}
            className="px-4 py-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 flex items-center gap-2">
            <Plus className="h-4 w-4" /> New Script
          </button>
        </div>

        {/* Create dialog */}
        {showCreate && (
          <div className="glass-card rounded-xl p-6 mb-6 border border-primary/20">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-display font-semibold flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-primary" /> Generate Script with AI
              </h3>
              <button onClick={() => setShowCreate(false)} className="text-muted-foreground hover:text-foreground"><X className="h-4 w-4" /></button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-1 block">Topic / Product *</label>
                <input value={form.topic} onChange={(e) => setForm((f) => ({ ...f, topic: e.target.value }))}
                  className="w-full rounded-lg border border-border bg-secondary px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                  placeholder="e.g. Launch our new AI productivity tool for solopreneurs" />
              </div>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <label className="text-sm font-medium mb-1 block">Platform</label>
                  <select value={form.platform} onChange={(e) => setForm((f) => ({ ...f, platform: e.target.value }))}
                    className="w-full rounded-lg border border-border bg-secondary px-4 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50">
                    {PLATFORMS.map((p) => <option key={p} value={p}>{p.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium mb-1 block">Script Type</label>
                  <select value={form.script_type} onChange={(e) => setForm((f) => ({ ...f, script_type: e.target.value }))}
                    className="w-full rounded-lg border border-border bg-secondary px-4 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50">
                    {SCRIPT_TYPES.map((t) => <option key={t} value={t}>{t.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium mb-1 block">Duration (sec)</label>
                  <input type="number" value={form.duration} onChange={(e) => setForm((f) => ({ ...f, duration: parseInt(e.target.value) || 30 }))}
                    className="w-full rounded-lg border border-border bg-secondary px-4 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50" />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1 block">Brand</label>
                  <select value={form.brand_id} onChange={(e) => setForm((f) => ({ ...f, brand_id: e.target.value }))}
                    className="w-full rounded-lg border border-border bg-secondary px-4 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50">
                    <option value="">No brand</option>
                    {brands?.map((b) => <option key={b.id} value={b.id}>{b.brand_name || "Untitled"}</option>)}
                  </select>
                </div>
              </div>
              <div className="flex gap-3 justify-end">
                <button onClick={() => setShowCreate(false)} className="px-4 py-2 rounded-lg border border-border text-sm text-muted-foreground">Cancel</button>
                <button onClick={handleGenerate} disabled={generating || !form.topic}
                  className="px-5 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 disabled:opacity-50 flex items-center gap-2">
                  {generating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                  {generating ? "Generating..." : "Generate Script"}
                </button>
              </div>
            </div>
          </div>
        )}

        {isLoading ? (
          <div className="flex items-center justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
        ) : scripts && scripts.length > 0 ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {scripts.map((s) => {
              const scenes = Array.isArray(s.scenes) ? s.scenes : [];
              return (
                <div key={s.id} className="glass-card rounded-xl p-5 hover:border-primary/20 transition-colors group">
                  <div className="flex items-start justify-between mb-3">
                    <Film className="h-5 w-5 text-primary" />
                    <span className="text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full bg-secondary text-muted-foreground">
                      {s.script_type || "custom"}
                    </span>
                  </div>
                  <h3 className="font-display font-semibold">{s.title || "Untitled Script"}</h3>
                  <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                    {s.duration && <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> {s.duration}s</span>}
                    {s.platform && <span className="capitalize">{s.platform.replace(/_/g, " ")}</span>}
                    {scenes.length > 0 && <span>{scenes.length} scenes</span>}
                  </div>
                  {s.delivery_notes && (
                    <p className="text-xs text-muted-foreground mt-2 line-clamp-2">{s.delivery_notes}</p>
                  )}
                  <div className="flex gap-2 mt-4 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => navigate(`/video-studio?scriptId=${s.id}&brandId=${brandId || ""}`)}
                      className="flex-1 px-3 py-2 rounded-lg bg-primary/10 text-primary text-xs font-medium hover:bg-primary/20 flex items-center justify-center gap-1">
                      <Play className="h-3 w-3" /> Send to Studio
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="glass-card rounded-xl p-12 text-center">
            <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="font-display text-lg font-semibold mb-2">No scripts yet</h3>
            <p className="text-sm text-muted-foreground mb-4">Generate AI-powered video scripts for your campaigns.</p>
            <button onClick={() => setShowCreate(true)}
              className="px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium flex items-center gap-2 mx-auto">
              <Sparkles className="h-4 w-4" /> Generate Your First Script
            </button>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default VideoScriptsPage;
