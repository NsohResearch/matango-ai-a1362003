import { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Brain, Globe, Sparkles, ChevronRight, Check, Plus, Trash2, Loader2 } from "lucide-react";
import { useBrandBrains, useUpsertBrandBrain } from "@/hooks/useData";
import { aiGenerate } from "@/lib/edge-functions";
import { toast } from "sonner";

const STEPS = ["Basics", "ICP Personas", "Value Prop", "Claims & Proof", "Voice Rules"];
const TONES = ["Professional", "Casual", "Bold", "Playful", "Authoritative", "Friendly", "Technical", "Inspirational"];
const CATEGORIES = ["SaaS", "E-commerce", "Agency", "Fintech", "Health & Wellness", "Education", "Real Estate", "Media", "Consulting", "AI/ML", "B2B Services", "Consumer"];

const BrandBrainPage = () => {
  const { data: brands, isLoading } = useBrandBrains();
  const upsert = useUpsertBrandBrain();
  const [step, setStep] = useState(0);
  const [enriching, setEnriching] = useState(false);
  const [form, setForm] = useState({
    id: undefined as string | undefined,
    brand_name: "",
    product_name: "",
    tagline: "",
    website_url: "",
    category: "",
    brand_tone: "Professional",
    icp_personas: [] as { name: string; role: string; pain: string }[],
    key_outcomes: [] as string[],
    differentiators: [] as string[],
    claims_proof: [] as { claim: string; proof: string }[],
    voice_rules: [] as string[],
    forbidden_phrases: [] as string[],
  });

  const updateField = (field: string, value: unknown) => setForm((f) => ({ ...f, [field]: value }));

  const loadBrand = (brand: any) => {
    setForm({
      id: brand.id,
      brand_name: brand.brand_name || "",
      product_name: brand.product_name || "",
      tagline: brand.tagline || "",
      website_url: brand.website_url || "",
      category: brand.category || "",
      brand_tone: brand.brand_tone || "Professional",
      icp_personas: brand.icp_personas || [],
      key_outcomes: brand.key_outcomes || [],
      differentiators: brand.differentiators || [],
      claims_proof: brand.claims_proof || [],
      voice_rules: brand.voice_rules || [],
      forbidden_phrases: brand.forbidden_phrases || [],
    });
    setStep(0);
  };

  const handleEnrichFromUrl = async () => {
    if (!form.website_url) { toast.error("Enter a website URL first"); return; }
    setEnriching(true);
    try {
      const res = await aiGenerate(
        `Analyze this website and extract brand information: ${form.website_url}. Return JSON with: brand_name, tagline, category, brand_tone, icp_personas (array of {name, role, pain}), key_outcomes (array of strings), differentiators (array of strings), claims_proof (array of {claim, proof}), voice_rules (array of strings).`,
        "brand-enrich"
      );
      const parsed = JSON.parse(res.content.replace(/```json\\n?|```/g, ""));
      setForm((f) => ({ ...f, ...parsed, id: f.id }));
      toast.success("Brand enriched from website!");
    } catch {
      toast.error("Enrichment failed. Please fill manually.");
    } finally {
      setEnriching(false);
    }
  };

  const handleSave = () => {
    if (!form.brand_name) { toast.error("Brand name is required"); return; }
    upsert.mutate({ ...form, status: "active" });
  };

  const completionScore = () => {
    let s = 0;
    if (form.brand_name) s += 15;
    if (form.tagline) s += 10;
    if (form.category) s += 10;
    if (form.icp_personas.length) s += 20;
    if (form.key_outcomes.length) s += 15;
    if (form.differentiators.length) s += 10;
    if (form.claims_proof.length) s += 10;
    if (form.voice_rules.length) s += 10;
    return Math.min(100, s);
  };

  return (
    <DashboardLayout>
      <div className="p-6 lg:p-8 max-w-5xl">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="font-display text-3xl font-bold flex items-center gap-2">
              <Brain className="h-8 w-8 text-primary" /> Brand Brain
            </h1>
            <p className="mt-1 text-muted-foreground">Define your brand memory. Everything flows from here.</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-right">
              <div className="text-sm text-muted-foreground">Completion</div>
              <div className="text-2xl font-bold text-primary">{completionScore()}%</div>
            </div>
            <div className="w-16 h-16 relative">
              <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
                <circle cx="18" cy="18" r="16" fill="none" stroke="hsl(var(--muted))" strokeWidth="2" />
                <circle cx="18" cy="18" r="16" fill="none" stroke="hsl(var(--primary))" strokeWidth="2"
                  strokeDasharray={`${completionScore()} ${100 - completionScore()}`} strokeLinecap="round" />
              </svg>
            </div>
          </div>
        </div>

        {/* Existing brands */}
        {brands && brands.length > 0 && (
          <div className="flex gap-2 mb-6 flex-wrap">
            {brands.map((b) => (
              <button key={b.id} onClick={() => loadBrand(b)}
                className={`px-4 py-2 rounded-lg text-sm border transition-colors ${form.id === b.id ? "border-primary bg-primary/10 text-primary" : "border-border bg-secondary/50 text-muted-foreground hover:bg-secondary"}`}>
                {b.brand_name || "Untitled Brand"}
              </button>
            ))}
            <button onClick={() => setForm({ id: undefined, brand_name: "", product_name: "", tagline: "", website_url: "", category: "", brand_tone: "Professional", icp_personas: [], key_outcomes: [], differentiators: [], claims_proof: [], voice_rules: [], forbidden_phrases: [] })}
              className="px-4 py-2 rounded-lg text-sm border border-dashed border-border text-muted-foreground hover:border-primary hover:text-primary transition-colors flex items-center gap-1">
              <Plus className="h-3 w-3" /> New Brand
            </button>
          </div>
        )}

        {/* Step navigation */}
        <div className="flex gap-1 mb-8">
          {STEPS.map((s, i) => (
            <button key={s} onClick={() => setStep(i)}
              className={`flex-1 py-2 px-3 text-xs font-medium rounded-lg transition-colors ${i === step ? "bg-primary text-primary-foreground" : i < step ? "bg-primary/20 text-primary" : "bg-secondary text-muted-foreground"}`}>
              {i < step ? <Check className="h-3 w-3 inline mr-1" /> : null}{s}
            </button>
          ))}
        </div>

        {/* Step content */}
        <div className="glass-card rounded-xl p-6 space-y-6">
          {step === 0 && (
            <>
              <div className="flex gap-3">
                <input value={form.website_url} onChange={(e) => updateField("website_url", e.target.value)}
                  className="flex-1 rounded-lg border border-border bg-secondary px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                  placeholder="https://yourwebsite.com" />
                <button onClick={handleEnrichFromUrl} disabled={enriching}
                  className="px-4 py-2 rounded-lg bg-accent text-accent-foreground text-sm font-medium hover:bg-accent/90 transition-colors flex items-center gap-2 disabled:opacity-50">
                  {enriching ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                  Auto-Enrich
                </button>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-foreground mb-1 block">Brand Name *</label>
                  <input value={form.brand_name} onChange={(e) => updateField("brand_name", e.target.value)}
                    className="w-full rounded-lg border border-border bg-secondary px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50" placeholder="Your Brand" />
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground mb-1 block">Product Name</label>
                  <input value={form.product_name} onChange={(e) => updateField("product_name", e.target.value)}
                    className="w-full rounded-lg border border-border bg-secondary px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50" placeholder="Product/Service" />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-foreground mb-1 block">Tagline</label>
                <input value={form.tagline} onChange={(e) => updateField("tagline", e.target.value)}
                  className="w-full rounded-lg border border-border bg-secondary px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50" placeholder="Your brand promise in one line" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-foreground mb-1 block">Category</label>
                  <select value={form.category} onChange={(e) => updateField("category", e.target.value)}
                    className="w-full rounded-lg border border-border bg-secondary px-4 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50">
                    <option value="">Select category</option>
                    {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground mb-1 block">Brand Tone</label>
                  <select value={form.brand_tone} onChange={(e) => updateField("brand_tone", e.target.value)}
                    className="w-full rounded-lg border border-border bg-secondary px-4 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50">
                    {TONES.map((t) => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
              </div>
            </>
          )}

          {step === 1 && (
            <>
              <div className="flex items-center justify-between">
                <h3 className="font-display font-semibold">ICP Personas</h3>
                <button onClick={() => updateField("icp_personas", [...form.icp_personas, { name: "", role: "", pain: "" }])}
                  className="px-3 py-1.5 rounded-lg bg-primary/10 text-primary text-sm flex items-center gap-1 hover:bg-primary/20"><Plus className="h-3 w-3" /> Add Persona</button>
              </div>
              {form.icp_personas.map((p, i) => (
                <div key={i} className="grid grid-cols-3 gap-3 items-start">
                  <input value={p.name} onChange={(e) => { const arr = [...form.icp_personas]; arr[i] = { ...arr[i], name: e.target.value }; updateField("icp_personas", arr); }}
                    className="rounded-lg border border-border bg-secondary px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50" placeholder="Persona name" />
                  <input value={p.role} onChange={(e) => { const arr = [...form.icp_personas]; arr[i] = { ...arr[i], role: e.target.value }; updateField("icp_personas", arr); }}
                    className="rounded-lg border border-border bg-secondary px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50" placeholder="Role/Title" />
                  <div className="flex gap-2">
                    <input value={p.pain} onChange={(e) => { const arr = [...form.icp_personas]; arr[i] = { ...arr[i], pain: e.target.value }; updateField("icp_personas", arr); }}
                      className="flex-1 rounded-lg border border-border bg-secondary px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50" placeholder="Pain point" />
                    <button onClick={() => updateField("icp_personas", form.icp_personas.filter((_, j) => j !== i))} className="text-destructive hover:text-destructive/80"><Trash2 className="h-4 w-4" /></button>
                  </div>
                </div>
              ))}
              {form.icp_personas.length === 0 && <p className="text-sm text-muted-foreground text-center py-8">No personas yet. Add your ideal customer profiles.</p>}
            </>
          )}

          {step === 2 && (
            <>
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-display font-semibold">Key Outcomes</h3>
                  <button onClick={() => updateField("key_outcomes", [...form.key_outcomes, ""])}
                    className="px-3 py-1.5 rounded-lg bg-primary/10 text-primary text-sm flex items-center gap-1 hover:bg-primary/20"><Plus className="h-3 w-3" /> Add</button>
                </div>
                {form.key_outcomes.map((o, i) => (
                  <div key={i} className="flex gap-2 mb-2">
                    <input value={o} onChange={(e) => { const arr = [...form.key_outcomes]; arr[i] = e.target.value; updateField("key_outcomes", arr); }}
                      className="flex-1 rounded-lg border border-border bg-secondary px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50" placeholder="e.g. 3x faster content creation" />
                    <button onClick={() => updateField("key_outcomes", form.key_outcomes.filter((_, j) => j !== i))} className="text-destructive hover:text-destructive/80"><Trash2 className="h-4 w-4" /></button>
                  </div>
                ))}
              </div>
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-display font-semibold">Differentiators</h3>
                  <button onClick={() => updateField("differentiators", [...form.differentiators, ""])}
                    className="px-3 py-1.5 rounded-lg bg-primary/10 text-primary text-sm flex items-center gap-1 hover:bg-primary/20"><Plus className="h-3 w-3" /> Add</button>
                </div>
                {form.differentiators.map((d, i) => (
                  <div key={i} className="flex gap-2 mb-2">
                    <input value={d} onChange={(e) => { const arr = [...form.differentiators]; arr[i] = e.target.value; updateField("differentiators", arr); }}
                      className="flex-1 rounded-lg border border-border bg-secondary px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50" placeholder="What makes you different" />
                    <button onClick={() => updateField("differentiators", form.differentiators.filter((_, j) => j !== i))} className="text-destructive hover:text-destructive/80"><Trash2 className="h-4 w-4" /></button>
                  </div>
                ))}
              </div>
            </>
          )}

          {step === 3 && (
            <>
              <div className="flex items-center justify-between">
                <h3 className="font-display font-semibold">Claims & Proof</h3>
                <button onClick={() => updateField("claims_proof", [...form.claims_proof, { claim: "", proof: "" }])}
                  className="px-3 py-1.5 rounded-lg bg-primary/10 text-primary text-sm flex items-center gap-1 hover:bg-primary/20"><Plus className="h-3 w-3" /> Add</button>
              </div>
              {form.claims_proof.map((cp, i) => (
                <div key={i} className="grid grid-cols-2 gap-3">
                  <input value={cp.claim} onChange={(e) => { const arr = [...form.claims_proof]; arr[i] = { ...arr[i], claim: e.target.value }; updateField("claims_proof", arr); }}
                    className="rounded-lg border border-border bg-secondary px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50" placeholder="Claim" />
                  <div className="flex gap-2">
                    <input value={cp.proof} onChange={(e) => { const arr = [...form.claims_proof]; arr[i] = { ...arr[i], proof: e.target.value }; updateField("claims_proof", arr); }}
                      className="flex-1 rounded-lg border border-border bg-secondary px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50" placeholder="Proof / source" />
                    <button onClick={() => updateField("claims_proof", form.claims_proof.filter((_, j) => j !== i))} className="text-destructive hover:text-destructive/80"><Trash2 className="h-4 w-4" /></button>
                  </div>
                </div>
              ))}
            </>
          )}

          {step === 4 && (
            <>
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-display font-semibold">Voice Rules</h3>
                  <button onClick={() => updateField("voice_rules", [...form.voice_rules, ""])}
                    className="px-3 py-1.5 rounded-lg bg-primary/10 text-primary text-sm flex items-center gap-1 hover:bg-primary/20"><Plus className="h-3 w-3" /> Add</button>
                </div>
                {form.voice_rules.map((r, i) => (
                  <div key={i} className="flex gap-2 mb-2">
                    <input value={r} onChange={(e) => { const arr = [...form.voice_rules]; arr[i] = e.target.value; updateField("voice_rules", arr); }}
                      className="flex-1 rounded-lg border border-border bg-secondary px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50" placeholder="e.g. Always use active voice" />
                    <button onClick={() => updateField("voice_rules", form.voice_rules.filter((_, j) => j !== i))} className="text-destructive hover:text-destructive/80"><Trash2 className="h-4 w-4" /></button>
                  </div>
                ))}
              </div>
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-display font-semibold">Forbidden Phrases</h3>
                  <button onClick={() => updateField("forbidden_phrases", [...form.forbidden_phrases, ""])}
                    className="px-3 py-1.5 rounded-lg bg-primary/10 text-primary text-sm flex items-center gap-1 hover:bg-primary/20"><Plus className="h-3 w-3" /> Add</button>
                </div>
                {form.forbidden_phrases.map((p, i) => (
                  <div key={i} className="flex gap-2 mb-2">
                    <input value={p} onChange={(e) => { const arr = [...form.forbidden_phrases]; arr[i] = e.target.value; updateField("forbidden_phrases", arr); }}
                      className="flex-1 rounded-lg border border-border bg-secondary px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50" placeholder="e.g. synergy, disrupt" />
                    <button onClick={() => updateField("forbidden_phrases", form.forbidden_phrases.filter((_, j) => j !== i))} className="text-destructive hover:text-destructive/80"><Trash2 className="h-4 w-4" /></button>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Navigation */}
        <div className="flex justify-between mt-6">
          <button onClick={() => setStep(Math.max(0, step - 1))} disabled={step === 0}
            className="px-5 py-2.5 rounded-lg border border-border text-sm font-medium text-muted-foreground hover:text-foreground disabled:opacity-30 transition-colors">Back</button>
          <div className="flex gap-3">
            <button onClick={handleSave} disabled={upsert.isPending}
              className="px-5 py-2.5 rounded-lg border border-primary text-sm font-medium text-primary hover:bg-primary/10 transition-colors">
              {upsert.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save Draft"}
            </button>
            {step < STEPS.length - 1 ? (
              <button onClick={() => setStep(step + 1)}
                className="px-5 py-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors flex items-center gap-1">
                Next <ChevronRight className="h-4 w-4" />
              </button>
            ) : (
              <button onClick={handleSave} disabled={upsert.isPending}
                className="px-5 py-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors">
                Complete Brand Brain
              </button>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default BrandBrainPage;
