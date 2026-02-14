import DashboardLayout from "@/components/DashboardLayout";
import { Library, Loader2, Search, Grid, List, Image, Film, Download, Trash2, CalendarDays, SlidersHorizontal } from "lucide-react";
import { useAssetLibrary } from "@/hooks/useData";
import { useState, useMemo } from "react";

const AssetLibraryPage = () => {
  const { data: assets, isLoading } = useAssetLibrary();
  const [search, setSearch] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [filter, setFilter] = useState("all");
  const [dateRange, setDateRange] = useState<"all" | "7d" | "30d" | "90d">("all");
  const [modelFilter, setModelFilter] = useState("all");
  const [sortBy, setSortBy] = useState<"newest" | "oldest">("newest");
  const [showFilters, setShowFilters] = useState(false);

  // Extract unique models for filter dropdown
  const models = useMemo(() => {
    const set = new Set<string>();
    assets?.forEach((a) => { if (a.model) set.add(a.model); });
    return Array.from(set);
  }, [assets]);

  const filtered = useMemo(() => {
    const now = new Date();
    return (assets || [])
      .filter((a) => {
        const matchSearch = !search || (a.prompt || "").toLowerCase().includes(search.toLowerCase());
        const matchType = filter === "all" || a.type === filter;
        const matchModel = modelFilter === "all" || a.model === modelFilter;
        let matchDate = true;
        if (dateRange !== "all") {
          const days = dateRange === "7d" ? 7 : dateRange === "30d" ? 30 : 90;
          const cutoff = new Date(now);
          cutoff.setDate(cutoff.getDate() - days);
          matchDate = new Date(a.created_at) >= cutoff;
        }
        return matchSearch && matchType && matchModel && matchDate;
      })
      .sort((a, b) => {
        const da = new Date(a.created_at).getTime();
        const db = new Date(b.created_at).getTime();
        return sortBy === "newest" ? db - da : da - db;
      });
  }, [assets, search, filter, dateRange, modelFilter, sortBy]);

  return (
    <DashboardLayout>
      <div className="p-6 lg:p-8 max-w-6xl">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="font-display text-3xl font-bold flex items-center gap-2">
              <Library className="h-8 w-8 text-primary" /> Asset Gallery
            </h1>
            <p className="mt-1 text-muted-foreground">Manage your generated images, videos, and assets.</p>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => setViewMode("grid")} className={`p-2 rounded-lg ${viewMode === "grid" ? "bg-primary/10 text-primary" : "text-muted-foreground"}`}><Grid className="h-4 w-4" /></button>
            <button onClick={() => setViewMode("list")} className={`p-2 rounded-lg ${viewMode === "list" ? "bg-primary/10 text-primary" : "text-muted-foreground"}`}><List className="h-4 w-4" /></button>
          </div>
        </div>

        <div className="flex gap-3 mb-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input value={search} onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-border bg-secondary text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
              placeholder="Search assets..." />
          </div>
          <div className="flex rounded-lg border border-border overflow-hidden">
            {["all", "image", "video"].map((f) => (
              <button key={f} onClick={() => setFilter(f)}
                className={`px-3 py-2 text-xs font-medium capitalize ${filter === f ? "bg-primary text-primary-foreground" : "text-muted-foreground"}`}>{f}</button>
            ))}
          </div>
          <button onClick={() => setShowFilters(!showFilters)}
            className={`px-3 py-2 rounded-lg border border-border text-xs font-medium flex items-center gap-1.5 ${showFilters ? "bg-primary/10 text-primary border-primary/30" : "text-muted-foreground"}`}>
            <SlidersHorizontal className="h-3.5 w-3.5" /> Filters
          </button>
        </div>

        {/* Advanced Filters */}
        {showFilters && (
          <div className="flex gap-3 mb-4 p-3 rounded-lg bg-secondary/50 border border-border flex-wrap items-end">
            <div>
              <label className="text-[10px] font-medium text-muted-foreground mb-1 block">Date Range</label>
              <div className="flex rounded-lg border border-border overflow-hidden">
                {([["all", "All"], ["7d", "7 days"], ["30d", "30 days"], ["90d", "90 days"]] as const).map(([val, label]) => (
                  <button key={val} onClick={() => setDateRange(val)}
                    className={`px-2.5 py-1.5 text-[10px] font-medium ${dateRange === val ? "bg-primary text-primary-foreground" : "text-muted-foreground"}`}>
                    {label}
                  </button>
                ))}
              </div>
            </div>
            {models.length > 0 && (
              <div>
                <label className="text-[10px] font-medium text-muted-foreground mb-1 block">Model</label>
                <select value={modelFilter} onChange={(e) => setModelFilter(e.target.value)}
                  className="rounded-lg border border-border bg-background px-3 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-primary/50">
                  <option value="all">All models</option>
                  {models.map((m) => <option key={m} value={m}>{m}</option>)}
                </select>
              </div>
            )}
            <div>
              <label className="text-[10px] font-medium text-muted-foreground mb-1 block">Sort</label>
              <select value={sortBy} onChange={(e) => setSortBy(e.target.value as "newest" | "oldest")}
                className="rounded-lg border border-border bg-background px-3 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-primary/50">
                <option value="newest">Newest first</option>
                <option value="oldest">Oldest first</option>
              </select>
            </div>
            <span className="text-[10px] text-muted-foreground ml-auto self-end pb-1">{filtered.length} asset{filtered.length !== 1 ? "s" : ""}</span>
          </div>
        )}

        {isLoading ? (
          <div className="flex items-center justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
        ) : filtered.length > 0 ? (
          viewMode === "grid" ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {filtered.map((a) => (
                <div key={a.id} className="glass-card rounded-xl overflow-hidden group">
                  <div className="aspect-square bg-muted flex items-center justify-center">
                    {a.url ? (
                      a.type === "video" ? <Film className="h-8 w-8 text-muted-foreground" /> :
                      <img src={a.url} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <Image className="h-8 w-8 text-muted-foreground" />
                    )}
                  </div>
                  <div className="p-3">
                    <p className="text-xs text-muted-foreground line-clamp-1">{a.prompt || "No prompt"}</p>
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-[10px] text-muted-foreground">v{a.version || 1}</span>
                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button className="p-1 rounded text-muted-foreground hover:text-foreground"><Download className="h-3 w-3" /></button>
                        <button className="p-1 rounded text-muted-foreground hover:text-destructive"><Trash2 className="h-3 w-3" /></button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-2">
              {filtered.map((a) => (
                <div key={a.id} className="glass-card rounded-xl p-3 flex items-center gap-4">
                  <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center shrink-0">
                    {a.type === "image" ? <Image className="h-4 w-4 text-muted-foreground" /> : <Film className="h-4 w-4 text-muted-foreground" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm truncate">{a.prompt || "No prompt"}</p>
                    <p className="text-xs text-muted-foreground">{a.type} • v{a.version || 1} • {a.model || "default"}</p>
                  </div>
                  <span className="text-xs text-muted-foreground">{new Date(a.created_at).toLocaleDateString()}</span>
                </div>
              ))}
            </div>
          )
        ) : (
          <div className="glass-card rounded-xl p-12 text-center">
            <Library className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="font-display text-lg font-semibold mb-2">No assets yet</h3>
            <p className="text-sm text-muted-foreground">Assets generated from the studio will appear here.</p>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default AssetLibraryPage;
