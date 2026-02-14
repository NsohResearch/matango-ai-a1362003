import DashboardLayout from "@/components/DashboardLayout";
import { Palette, Plus, Loader2, Check, Star } from "lucide-react";
import { useBrandBrains } from "@/hooks/useData";
import { useNavigate } from "react-router-dom";

const BrandsPage = () => {
  const { data: brands, isLoading } = useBrandBrains();
  const navigate = useNavigate();

  return (
    <DashboardLayout>
      <div className="p-6 lg:p-8 max-w-5xl">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="font-display text-3xl font-bold flex items-center gap-2">
              <Palette className="h-8 w-8 text-primary" /> Brands
            </h1>
            <p className="mt-1 text-muted-foreground">Manage multiple brands for your agency.</p>
          </div>
          <button onClick={() => navigate("/brand-brain")}
            className="px-4 py-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 flex items-center gap-2">
            <Plus className="h-4 w-4" /> New Brand
          </button>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
        ) : brands && brands.length > 0 ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {brands.map((b) => (
              <div key={b.id} onClick={() => navigate("/brand-brain")}
                className="glass-card rounded-xl p-5 hover:border-primary/20 transition-colors cursor-pointer group">
                <div className="flex items-start justify-between mb-3">
                  <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center text-primary font-bold text-lg">
                    {(b.brand_name || "B").charAt(0)}
                  </div>
                  {b.is_active && <Star className="h-4 w-4 text-accent fill-accent" />}
                </div>
                <h3 className="font-display font-semibold">{b.brand_name || "Untitled Brand"}</h3>
                {b.tagline && <p className="text-sm text-muted-foreground mt-1 line-clamp-1">{b.tagline}</p>}
                <div className="flex items-center gap-2 mt-3">
                  <span className="text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full bg-secondary text-muted-foreground">{b.category || "Uncategorized"}</span>
                  <span className={`text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full ${b.status === "active" ? "bg-primary/20 text-primary" : "bg-muted text-muted-foreground"}`}>{b.status}</span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="glass-card rounded-xl p-12 text-center">
            <Palette className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="font-display text-lg font-semibold mb-2">No brands yet</h3>
            <p className="text-sm text-muted-foreground mb-4">Set up your first brand in Brand Brain.</p>
            <button onClick={() => navigate("/brand-brain")} className="px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium">Go to Brand Brain</button>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default BrandsPage;
