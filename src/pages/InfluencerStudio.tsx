import { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Users, Plus, Sparkles, Eye, Loader2, Brain, Zap, ChevronRight } from "lucide-react";
import { useInfluencers, useCreateInfluencer, useBrandBrains } from "@/hooks/useData";
import { aiGenerate } from "@/lib/edge-functions";
import { useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "sonner";
import { estimateCredits, formatCredits } from "@/lib/credits";
import StepTransition from "@/components/system/StepTransition";

const PERSONA_TYPES = [
  { value: "Founder", label: "Founder", desc: "Visionary leader sharing insights" },
  { value: "Educator", label: "Educator", desc: "Hands-on expert with how-tos" },
  { value: "Analyst", label: "Analyst", desc: "Data-driven thought leader" },
  { value: "Creator", label: "Creator", desc: "Creative content builder" },
  { value: "Custom", label: "Custom", desc: "Define your own persona" },
];

const STYLE_PRESETS = [
  { value: "realistic", label: "Realistic" },
  { value: "cinematic", label: "Cinematic" },
  { value: "professional", label: "Professional" },
  { value: "cyber-noir", label: "Cyber Noir" },
];

const InfluencerStudioPage = () => {
  const { data: influencers, isLoading } = useInfluencers();
  const { data: brands } = useBrandBrains();
  const create = useCreateInfluencer();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const brandId = searchParams.get("brandId");

  const [showCreate, setShowCreate] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [form, setForm] = useState({
    name: "", bio: "", personality: "", persona_type: "Founder",
    style_preset: "realistic", brand_id: brandId || "",
    character_weight: 0.8, tags: "",
  });

  const activeBrand = brands?.find((b) => b.id === form.brand_id);
  const creditCost = estimateCredits("influencer-assist");

  const handleAIAssist = async () => {
    if (!form.brand_id) { toast.error("Select a Brand Brain first"); return; }
    setGenerating(true);
    try {
      const brand = brands?.find((b) => b.id === form.brand_id);
      const prompt = JSON.stringify({
        brandBrain: {
          productName: brand?.product_name || brand?.brand_name || "",
          icp: JSON.stringify(brand?.icp_personas || []),
          tone: brand?.brand_tone || "",
          claims: (brand?.claims_proof as any[])?.map((c: any) => c.claim) || [],
          forbiddenPhrases: brand?.forbidden_phrases || [],
        },
        personaType: form.persona_type,
        stylePreference: form.style_preset,
        tags: form.tags ? form.tags.split(",").map((t) => t.trim()) : [],
      });

      const res = await aiGenerate(prompt, "influencer-assist");
      const data = JSON.parse(res.content);

      setForm((f) => ({
        ...f,
        name: data.name || f.name,
        bio: data.bio || f.bio,
        personality: data.personality || f.personality,
      }));

      toast.success(`AI draft generated! (${formatCredits(res.credits_used || creditCost)} used)`);
    } catch (err: any) {
      toast.error(err.message || "AI generation failed");
    } finally {
      setGenerating(false);
    }
  };

  const handleCreate = () => {
    if (!form.name) return;
    create.mutate(
      {
        name: form.name,
        bio: form.bio,
        personality: form.personality,
        persona_type: form.persona_type.toLowerCase(),
      },
      {
        onSuccess: (data) => {
          setShowCreate(false);
          setForm({ name: "", bio: "", personality: "", persona_type: "Founder", style_preset: "realistic", brand_id: brandId || "", character_weight: 0.8, tags: "" });
          toast.success("Influencer created! Proceed to script generation.");
        },
      }
    );
  };

  return (
    <DashboardLayout>
      <div className="p-6 lg:p-8 max-w-6xl">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="font-display text-3xl font-bold flex items-center gap-2">
              <Users className="h-8 w-8 text-primary" /> Influencer Studio
            </h1>
            <p className="mt-1 text-muted-foreground">Create AI-powered influencers aligned to your Brand Brain.</p>
          </div>
          <button onClick={() => setShowCreate(true)}
            className="px-4 py-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors flex items-center gap-2">
            <Plus className="h-4 w-4" /> Create Influencer
          </button>
        </div>

        {/* AI-Assisted Creation Panel */}
        {showCreate && (
          <div className="glass-card rounded-xl p-6 mb-6 border border-primary/20">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-display font-semibold flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-primary" /> AI-Assisted Influencer Creation
              </h3>
              <button onClick={() => setShowCreate(false)} className="text-muted-foreground hover:text-foreground text-sm">Cancel</button>
            </div>

            {/* Brand selector */}
            <div className="mb-4 p-3 rounded-lg bg-secondary/50 border border-border">
              <label className="text-xs font-medium text-muted-foreground mb-1 block flex items-center gap-1">
                <Brain className="h-3 w-3" /> Brand Brain (required for AI assist)
              </label>
              <select value={form.brand_id} onChange={(e) => setForm((f) => ({ ...f, brand_id: e.target.value }))}
                className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50">
                <option value="">Select a brand...</option>
                {brands?.map((b) => <option key={b.id} value={b.id}>{b.brand_name || "Untitled Brand"}</option>)}
              </select>
              {activeBrand && (
                <p className="text-xs text-muted-foreground mt-1">Tone: {activeBrand.brand_tone} · Category: {activeBrand.category}</p>
              )}
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
              <div>
                <label className="text-sm font-medium mb-1 block">Persona Type</label>
                <select value={form.persona_type} onChange={(e) => setForm((f) => ({ ...f, persona_type: e.target.value }))}
                  className="w-full rounded-lg border border-border bg-secondary px-4 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50">
                  {PERSONA_TYPES.map((p) => <option key={p.value} value={p.value}>{p.label} — {p.desc}</option>)}
                </select>
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Visual Style</label>
                <select value={form.style_preset} onChange={(e) => setForm((f) => ({ ...f, style_preset: e.target.value }))}
                  className="w-full rounded-lg border border-border bg-secondary px-4 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50">
                  {STYLE_PRESETS.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
                </select>
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Character Weight</label>
                <input type="range" min="0" max="1" step="0.1" value={form.character_weight}
                  onChange={(e) => setForm((f) => ({ ...f, character_weight: parseFloat(e.target.value) }))}
                  className="w-full mt-2" />
                <span className="text-xs text-muted-foreground">{form.character_weight}</span>
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Tags</label>
                <input value={form.tags} onChange={(e) => setForm((f) => ({ ...f, tags: e.target.value }))}
                  className="w-full rounded-lg border border-border bg-secondary px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                  placeholder="tech, B2B, startup" />
              </div>
            </div>

            {/* AI Generate Button */}
            <div className="mb-4 flex items-center gap-3">
              <button onClick={handleAIAssist} disabled={generating || !form.brand_id}
                className="px-5 py-2.5 rounded-lg bg-accent text-accent-foreground text-sm font-medium hover:bg-accent/90 disabled:opacity-50 flex items-center gap-2">
                {generating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                {generating ? "Generating..." : "AI Generate Draft"}
              </button>
              <span className="text-xs text-muted-foreground flex items-center gap-1">
                <Zap className="h-3 w-3" /> {formatCredits(creditCost)}
              </span>
            </div>

            {/* Manual fields */}
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="text-sm font-medium mb-1 block">Name *</label>
                <input value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                  className="w-full rounded-lg border border-border bg-secondary px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50" placeholder="Influencer name" />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Bio</label>
                <input value={form.bio} onChange={(e) => setForm((f) => ({ ...f, bio: e.target.value }))}
                  className="w-full rounded-lg border border-border bg-secondary px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50" placeholder="Brief description" />
              </div>
            </div>
            <div className="mb-4">
              <label className="text-sm font-medium mb-1 block">Personality</label>
              <textarea value={form.personality} onChange={(e) => setForm((f) => ({ ...f, personality: e.target.value }))}
                className="w-full rounded-lg border border-border bg-secondary px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 min-h-[80px]"
                placeholder="e.g. Confident, data-driven, uses clear analogies..." />
            </div>

            <div className="flex gap-3 justify-end">
              <button onClick={() => setShowCreate(false)} className="px-4 py-2 rounded-lg border border-border text-sm text-muted-foreground hover:text-foreground">Cancel</button>
              <button onClick={handleCreate} disabled={create.isPending || !form.name}
                className="px-5 py-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 disabled:opacity-50 flex items-center gap-2">
                {create.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <ChevronRight className="h-4 w-4" />}
                Create Influencer
              </button>
            </div>
          </div>
        )}

        {/* Grid */}
        {isLoading ? (
          <div className="flex items-center justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
        ) : influencers && influencers.length > 0 ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {influencers.map((inf) => (
              <div key={inf.id} className="glass-card rounded-xl p-5 hover:border-primary/30 transition-colors group">
                <div className="flex items-start justify-between mb-3">
                  <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-lg">
                    {inf.name.charAt(0)}
                  </div>
                  <span className={`text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full ${inf.status === "active" ? "bg-primary/20 text-primary" : "bg-muted text-muted-foreground"}`}>
                    {inf.status}
                  </span>
                </div>
                <h3 className="font-display font-semibold">{inf.name}</h3>
                <p className="text-xs text-muted-foreground mt-0.5 capitalize">{inf.persona_type || "Custom"} persona</p>
                {inf.bio && <p className="text-sm text-muted-foreground mt-2 line-clamp-2">{inf.bio}</p>}
                <div className="flex gap-2 mt-4 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => navigate(`/video-scripts?influencerId=${inf.id}&brandId=${inf.brand_id || ""}`)}
                    className="flex-1 px-3 py-2 rounded-lg bg-primary/10 text-primary text-xs font-medium hover:bg-primary/20 flex items-center justify-center gap-1">
                    <Sparkles className="h-3 w-3" /> Generate Script
                  </button>
                  <button onClick={() => navigate(`/influencer/${inf.id}`)}
                    className="p-2 rounded-lg bg-secondary text-muted-foreground hover:text-foreground">
                    <Eye className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="glass-card rounded-xl p-12 text-center">
            <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="font-display text-lg font-semibold mb-2">No influencers yet</h3>
            <p className="text-sm text-muted-foreground mb-4">Create your first AI influencer aligned to your Brand Brain.</p>
            <button onClick={() => setShowCreate(true)}
              className="px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90">
              Create Your First Influencer
            </button>
          </div>
        )}

        <StepTransition stepId={5} />
      </div>
    </DashboardLayout>
  );
};

export default InfluencerStudioPage;
