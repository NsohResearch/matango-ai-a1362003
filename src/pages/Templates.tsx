import DashboardLayout from "@/components/DashboardLayout";
import { Layers, Search, Loader2, Star, Download } from "lucide-react";
import { useContentTemplates } from "@/hooks/useData";
import { useState } from "react";

const CATEGORIES = ["All", "Product", "Lifestyle", "Fashion", "Tech", "Food", "Travel", "Fitness", "Custom"];

const TemplatesPage = () => {
  const { data: templates, isLoading } = useContentTemplates();
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");

  const filtered = templates?.filter((t) => {
    const matchSearch = !search || t.name.toLowerCase().includes(search.toLowerCase());
    const matchCat = category === "All" || t.category === category.toLowerCase();
    return matchSearch && matchCat;
  }) || [];

  return (
    <DashboardLayout>
      <div className="p-6 lg:p-8 max-w-6xl">
        <div className="mb-6">
          <h1 className="font-display text-3xl font-bold flex items-center gap-2">
            <Layers className="h-8 w-8 text-primary" /> Templates
          </h1>
          <p className="mt-1 text-muted-foreground">Browse and use campaign and content templates.</p>
        </div>

        <div className="flex gap-3 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input value={search} onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-border bg-secondary text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
              placeholder="Search templates..." />
          </div>
        </div>

        <div className="flex gap-2 mb-6 flex-wrap">
          {CATEGORIES.map((c) => (
            <button key={c} onClick={() => setCategory(c)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${category === c ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground hover:text-foreground"}`}>
              {c}
            </button>
          ))}
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
        ) : filtered.length > 0 ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((t) => (
              <div key={t.id} className="glass-card rounded-xl p-5 hover:border-primary/20 transition-colors group">
                <div className="flex items-start justify-between mb-3">
                  <span className="text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full bg-secondary text-muted-foreground">{t.category || "custom"}</span>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Star className="h-3 w-3" /> {t.usage_count || 0}
                  </div>
                </div>
                <h3 className="font-display font-semibold">{t.name}</h3>
                {t.description && <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{t.description}</p>}
                <button className="mt-4 w-full px-3 py-2 rounded-lg bg-primary/10 text-primary text-sm font-medium hover:bg-primary/20 transition-colors flex items-center justify-center gap-1 opacity-0 group-hover:opacity-100">
                  <Download className="h-3 w-3" /> Use Template
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="glass-card rounded-xl p-12 text-center">
            <Layers className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="font-display text-lg font-semibold mb-2">No templates found</h3>
            <p className="text-sm text-muted-foreground">Templates will be available soon, or create your own.</p>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default TemplatesPage;
