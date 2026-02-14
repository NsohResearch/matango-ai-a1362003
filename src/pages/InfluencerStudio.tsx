import { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Users, Plus, Sparkles, Eye, Pencil, Trash2, Loader2 } from "lucide-react";
import { useInfluencers, useCreateInfluencer } from "@/hooks/useData";
import { useNavigate } from "react-router-dom";

const PERSONA_TYPES = [
  { value: "founder", label: "Founder", desc: "Visionary leader sharing insights" },
  { value: "practitioner", label: "Practitioner", desc: "Hands-on expert with how-tos" },
  { value: "analyst", label: "Analyst", desc: "Data-driven thought leader" },
  { value: "custom", label: "Custom", desc: "Define your own persona" },
];

const InfluencerStudioPage = () => {
  const { data: influencers, isLoading } = useInfluencers();
  const create = useCreateInfluencer();
  const navigate = useNavigate();
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ name: "", bio: "", personality: "", persona_type: "custom" });

  const handleCreate = () => {
    if (!form.name) return;
    create.mutate(form, { onSuccess: () => { setShowCreate(false); setForm({ name: "", bio: "", personality: "", persona_type: "custom" }); } });
  };

  return (
    <DashboardLayout>
      <div className="p-6 lg:p-8 max-w-6xl">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="font-display text-3xl font-bold flex items-center gap-2">
              <Users className="h-8 w-8 text-primary" /> Influencer Studio
            </h1>
            <p className="mt-1 text-muted-foreground">Create and manage your AI-powered influencers.</p>
          </div>
          <button onClick={() => setShowCreate(true)}
            className="px-4 py-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors flex items-center gap-2">
            <Plus className="h-4 w-4" /> Create Influencer
          </button>
        </div>

        {/* Create dialog */}
        {showCreate && (
          <div className="glass-card rounded-xl p-6 mb-6 border border-primary/20">
            <h3 className="font-display font-semibold mb-4">New Influencer</h3>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="text-sm font-medium mb-1 block">Name *</label>
                <input value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                  className="w-full rounded-lg border border-border bg-secondary px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50" placeholder="Influencer name" />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Persona Type</label>
                <select value={form.persona_type} onChange={(e) => setForm((f) => ({ ...f, persona_type: e.target.value }))}
                  className="w-full rounded-lg border border-border bg-secondary px-4 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50">
                  {PERSONA_TYPES.map((p) => <option key={p.value} value={p.value}>{p.label} — {p.desc}</option>)}
                </select>
              </div>
            </div>
            <div className="mb-4">
              <label className="text-sm font-medium mb-1 block">Bio</label>
              <textarea value={form.bio} onChange={(e) => setForm((f) => ({ ...f, bio: e.target.value }))}
                className="w-full rounded-lg border border-border bg-secondary px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 min-h-[80px]" placeholder="Brief description of your influencer" />
            </div>
            <div className="mb-4">
              <label className="text-sm font-medium mb-1 block">Personality</label>
              <input value={form.personality} onChange={(e) => setForm((f) => ({ ...f, personality: e.target.value }))}
                className="w-full rounded-lg border border-border bg-secondary px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50" placeholder="e.g. Confident, witty, uses data-driven arguments" />
            </div>
            <div className="flex gap-3 justify-end">
              <button onClick={() => setShowCreate(false)} className="px-4 py-2 rounded-lg border border-border text-sm text-muted-foreground hover:text-foreground">Cancel</button>
              <button onClick={handleCreate} disabled={create.isPending || !form.name}
                className="px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 disabled:opacity-50 flex items-center gap-2">
                {create.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />} Create
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
                  <button onClick={() => navigate(`/generation-workspace/${inf.id}`)} className="p-2 rounded-lg bg-primary/10 text-primary hover:bg-primary/20"><Sparkles className="h-4 w-4" /></button>
                  <button onClick={() => navigate(`/influencer/${inf.id}`)} className="p-2 rounded-lg bg-secondary text-muted-foreground hover:text-foreground"><Eye className="h-4 w-4" /></button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="glass-card rounded-xl p-12 text-center">
            <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="font-display text-lg font-semibold mb-2">No influencers yet</h3>
            <p className="text-sm text-muted-foreground mb-4">Create your first AI influencer to start generating content.</p>
            <button onClick={() => setShowCreate(true)}
              className="px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90">
              Create Your First Influencer
            </button>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default InfluencerStudioPage;
