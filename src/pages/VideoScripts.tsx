import { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { FileText, Plus, Loader2, Play, Clock, Film, Sparkles, X, Zap, Brain, ChevronRight } from "lucide-react";
import { useVideoScripts, useCreateVideoScript, useBrandBrains, useInfluencers } from "@/hooks/useData";
import { aiGenerate } from "@/lib/edge-functions";
import { useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "sonner";
import { estimateCredits, formatCredits } from "@/lib/credits";
import StepTransition from "@/components/system/StepTransition";

const PLATFORMS = [
  { value: "tiktok", label: "TikTok" },
  { value: "youtube_shorts", label: "YouTube Shorts" },
  { value: "instagram_reels", label: "Instagram Reels" },
  { value: "youtube", label: "YouTube" },
  { value: "linkedin", label: "LinkedIn" },
];

const HOOK_STYLES = [
  { value: "contrarian", label: "Contrarian" },
  { value: "educational", label: "Educational" },
  { value: "storytelling", label: "Storytelling" },
  { value: "direct", label: "Direct" },
];

const CTA_TYPES = [
  { value: "download", label: "Download" },
  { value: "subscribe", label: "Subscribe" },
  { value: "book-demo", label: "Book Demo" },
  { value: "learn-more", label: "Learn More" },
  { value: "start-trial", label: "Start Trial" },
];

const OBJECTIVES = [
  { value: "awareness", label: "Brand Awareness" },
  { value: "leads", label: "Lead Generation" },
  { value: "authority", label: "Thought Leadership" },
];

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
  const [generatedScript, setGeneratedScript] = useState<any>(null);
  const [form, setForm] = useState({
    brand_id: brandId || "",
    influencer_id: influencerId || "",
    objective: "awareness",
    platform: "tiktok",
    duration: 30,
    hook_style: "educational",
    cta_type: "learn-more",
  });

  const creditCost = estimateCredits("script-generate");
  const activeBrand = brands?.find((b) => b.id === form.brand_id);
  const activeInfluencer = influencers?.find((i) => i.id === form.influencer_id);

  const handleGenerate = async () => {
    if (!form.brand_id) { toast.error("Select a Brand Brain first"); return; }
    setGenerating(true);
    try {
      const brand = brands?.find((b) => b.id === form.brand_id);
      const influencer = influencers?.find((i) => i.id === form.influencer_id);

      const prompt = JSON.stringify({
        brandBrain: {
          productName: brand?.product_name || brand?.brand_name || "",
          icp: JSON.stringify(brand?.icp_personas || []),
          tone: brand?.brand_tone || "",
          claims: (brand?.claims_proof as any[])?.map((c: any) => c.claim) || [],
          forbiddenPhrases: brand?.forbidden_phrases || [],
          tagline: brand?.tagline || "",
        },
        influencerProfile: influencer ? {
          name: influencer.name,
          personality: influencer.personality,
          persona_type: influencer.persona_type,
        } : null,
        campaignObjective: form.objective,
        platform: form.platform,
        duration: `${form.duration}s`,
        hookStyle: form.hook_style,
        ctaType: form.cta_type,
      });

      const res = await aiGenerate(prompt, "script-generate");
      const data = JSON.parse(res.content);
      setGeneratedScript(data);
      toast.success(`Script generated! (${formatCredits(res.credits_used || creditCost)} used)`);
    } catch (err: any) {
      toast.error(err.message || "Script generation failed.");
    } finally {
      setGenerating(false);
    }
  };

  const handleSave = async () => {
    if (!generatedScript) return;
    try {
      const saved = await createScript.mutateAsync({
        title: generatedScript.title,
        platform: form.platform,
        duration: generatedScript.total_duration_seconds || form.duration,
        script_type: form.hook_style,
        scenes: generatedScript.scenes,
        delivery_notes: generatedScript.delivery_notes,
      });
      setGeneratedScript(null);
      setShowCreate(false);
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  return (
    <DashboardLayout>
      <div className="p-6 lg:p-8 max-w-6xl">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="font-display text-3xl font-bold flex items-center gap-2">
              <FileText className="h-8 w-8 text-primary" /> Script Generator
            </h1>
            <p className="mt-1 text-muted-foreground">AI-powered scene-ready scripts from your Brand Brain.</p>
          </div>
          <button onClick={() => { setShowCreate(true); setGeneratedScript(null); }}
            className="px-4 py-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 flex items-center gap-2">
            <Plus className="h-4 w-4" /> New Script
          </button>
        </div>

        {/* Create Panel */}
        {showCreate && (
          <div className="glass-card rounded-xl p-6 mb-6 border border-primary/20">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-display font-semibold flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-primary" /> Generate Script from DNA
              </h3>
              <button onClick={() => setShowCreate(false)} className="text-muted-foreground hover:text-foreground"><X className="h-4 w-4" /></button>
            </div>

            {/* Brand + Influencer selectors */}
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="p-3 rounded-lg bg-secondary/50 border border-border">
                <label className="text-xs font-medium text-muted-foreground mb-1 block flex items-center gap-1">
                  <Brain className="h-3 w-3" /> Brand Brain *
                </label>
                <select value={form.brand_id} onChange={(e) => setForm((f) => ({ ...f, brand_id: e.target.value }))}
                  className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50">
                  <option value="">Select brand...</option>
                  {brands?.map((b) => <option key={b.id} value={b.id}>{b.brand_name || "Untitled"}</option>)}
                </select>
              </div>
              <div className="p-3 rounded-lg bg-secondary/50 border border-border">
                <label className="text-xs font-medium text-muted-foreground mb-1 block">Influencer (optional)</label>
                <select value={form.influencer_id} onChange={(e) => setForm((f) => ({ ...f, influencer_id: e.target.value }))}
                  className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50">
                  <option value="">No influencer</option>
                  {influencers?.map((i) => <option key={i.id} value={i.id}>{i.name}</option>)}
                </select>
              </div>
            </div>

            {/* Config row */}
            <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-4">
              <div>
                <label className="text-sm font-medium mb-1 block">Objective</label>
                <select value={form.objective} onChange={(e) => setForm((f) => ({ ...f, objective: e.target.value }))}
                  className="w-full rounded-lg border border-border bg-secondary px-3 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50">
                  {OBJECTIVES.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Platform</label>
                <select value={form.platform} onChange={(e) => setForm((f) => ({ ...f, platform: e.target.value }))}
                  className="w-full rounded-lg border border-border bg-secondary px-3 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50">
                  {PLATFORMS.map((p) => <option key={p.value} value={p.value}>{p.label}</option>)}
                </select>
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Duration</label>
                <select value={form.duration} onChange={(e) => setForm((f) => ({ ...f, duration: parseInt(e.target.value) }))}
                  className="w-full rounded-lg border border-border bg-secondary px-3 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50">
                  <option value={15}>15s</option>
                  <option value={30}>30s</option>
                  <option value={60}>60s</option>
                  <option value={90}>90s</option>
                  <option value={120}>120s</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Hook Style</label>
                <select value={form.hook_style} onChange={(e) => setForm((f) => ({ ...f, hook_style: e.target.value }))}
                  className="w-full rounded-lg border border-border bg-secondary px-3 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50">
                  {HOOK_STYLES.map((h) => <option key={h.value} value={h.value}>{h.label}</option>)}
                </select>
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">CTA Type</label>
                <select value={form.cta_type} onChange={(e) => setForm((f) => ({ ...f, cta_type: e.target.value }))}
                  className="w-full rounded-lg border border-border bg-secondary px-3 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50">
                  {CTA_TYPES.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
                </select>
              </div>
            </div>

            <div className="flex items-center gap-3 mb-4">
              <button onClick={handleGenerate} disabled={generating || !form.brand_id}
                className="px-5 py-2.5 rounded-lg bg-accent text-accent-foreground text-sm font-medium hover:bg-accent/90 disabled:opacity-50 flex items-center gap-2">
                {generating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                {generating ? "Generating..." : "Generate Script from DNA"}
              </button>
              <span className="text-xs text-muted-foreground flex items-center gap-1">
                <Zap className="h-3 w-3" /> {formatCredits(creditCost)}
              </span>
            </div>

            {/* Generated Script Preview */}
            {generatedScript && (
              <div className="border border-primary/20 rounded-lg p-4 bg-secondary/30">
                <h4 className="font-display font-semibold text-lg mb-3">{generatedScript.title}</h4>
                <div className="space-y-3">
                  {generatedScript.scenes?.map((scene: any, i: number) => (
                    <div key={i} className="p-3 rounded-lg bg-background border border-border">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-semibold text-primary">Scene {scene.scene_number || i + 1}</span>
                        <span className="text-xs text-muted-foreground flex items-center gap-1"><Clock className="h-3 w-3" /> {scene.duration_seconds}s</span>
                      </div>
                      <p className="text-sm font-medium mb-1">"{scene.dialogue}"</p>
                      <p className="text-xs text-muted-foreground">📹 {scene.visual_direction}</p>
                      <p className="text-xs text-muted-foreground">🎥 {scene.camera_direction}</p>
                      {scene.text_overlay && <p className="text-xs text-muted-foreground">📝 {scene.text_overlay}</p>}
                    </div>
                  ))}
                </div>
                {generatedScript.cta_line && (
                  <p className="text-sm mt-3 text-primary font-medium">CTA: {generatedScript.cta_line}</p>
                )}
                {generatedScript.delivery_notes && (
                  <p className="text-xs mt-2 text-muted-foreground italic">{generatedScript.delivery_notes}</p>
                )}
                <div className="flex gap-3 mt-4 justify-end">
                  <button onClick={() => setGeneratedScript(null)} className="px-4 py-2 rounded-lg border border-border text-sm text-muted-foreground">Discard</button>
                  <button onClick={handleGenerate} disabled={generating} className="px-4 py-2 rounded-lg border border-border text-sm text-muted-foreground flex items-center gap-1">
                    <Sparkles className="h-3 w-3" /> Regenerate
                  </button>
                  <button onClick={handleSave} disabled={createScript.isPending}
                    className="px-5 py-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 disabled:opacity-50 flex items-center gap-2">
                    {createScript.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <ChevronRight className="h-4 w-4" />}
                    Save & Continue
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Scripts Grid */}
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
                  <div className="flex gap-2 mt-4 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => navigate(`/video-studio?scriptId=${s.id}`)}
                      className="flex-1 px-3 py-2 rounded-lg bg-primary/10 text-primary text-xs font-medium hover:bg-primary/20 flex items-center justify-center gap-1">
                      <Play className="h-3 w-3" /> Send to Video Studio
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
            <p className="text-sm text-muted-foreground mb-4">Generate AI-powered video scripts from your Brand Brain.</p>
            <button onClick={() => setShowCreate(true)}
              className="px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium flex items-center gap-2 mx-auto">
              <Sparkles className="h-4 w-4" /> Generate Your First Script
            </button>
          </div>
        )}

        <StepTransition stepId={6} />
      </div>
    </DashboardLayout>
  );
};

export default VideoScriptsPage;
