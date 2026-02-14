import { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Palette, Plus, Loader2, Star, MoreVertical, Pencil, Archive, Trash2, ArrowRightLeft, X } from "lucide-react";
import { useBrandBrains, useDeleteBrand, useArchiveBrand, useTransferBrand, useUpsertBrandBrain } from "@/hooks/useData";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

type BrandAction = { type: "delete" | "archive" | "transfer"; brandId: string; brandName: string } | null;

const BrandsPage = () => {
  const { data: brands, isLoading } = useBrandBrains();
  const navigate = useNavigate();
  const deleteBrand = useDeleteBrand();
  const archiveBrand = useArchiveBrand();
  const transferBrand = useTransferBrand();
  const upsertBrand = useUpsertBrandBrain();
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const [action, setAction] = useState<BrandAction>(null);
  const [transferEmail, setTransferEmail] = useState("");
  const [filter, setFilter] = useState<"all" | "active" | "archived">("all");

  const filtered = brands?.filter((b) => {
    if (filter === "active") return b.status === "active";
    if (filter === "archived") return b.status === "archived";
    return true;
  }) || [];

  const handleConfirmAction = () => {
    if (!action) return;
    if (action.type === "delete") {
      deleteBrand.mutate(action.brandId, { onSuccess: () => setAction(null) });
    } else if (action.type === "archive") {
      archiveBrand.mutate(action.brandId, { onSuccess: () => setAction(null) });
    } else if (action.type === "transfer") {
      if (!transferEmail) { toast.error("Enter the recipient's email"); return; }
      transferBrand.mutate({ id: action.brandId, newOwnerEmail: transferEmail }, { onSuccess: () => { setAction(null); setTransferEmail(""); } });
    }
  };

  const handleRestore = (id: string) => {
    upsertBrand.mutate({ id, status: "active", is_active: true });
  };

  return (
    <DashboardLayout>
      <div className="p-6 lg:p-8 max-w-5xl">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="font-display text-3xl font-bold flex items-center gap-2">
              <Palette className="h-8 w-8 text-primary" /> Brands
            </h1>
            <p className="mt-1 text-muted-foreground">Manage, edit, archive, or transfer your brands.</p>
          </div>
          <button onClick={() => navigate("/brand-brain")}
            className="px-4 py-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 flex items-center gap-2">
            <Plus className="h-4 w-4" /> New Brand
          </button>
        </div>

        {/* Filter tabs */}
        <div className="flex gap-1 mb-6 p-1 bg-secondary rounded-lg w-fit">
          {(["all", "active", "archived"] as const).map((f) => (
            <button key={f} onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-md text-sm font-medium capitalize transition-colors ${filter === f ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"}`}>
              {f}
            </button>
          ))}
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
        ) : filtered.length > 0 ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((b) => (
              <div key={b.id}
                className={`glass-card rounded-xl p-5 transition-colors group relative ${b.status === "archived" ? "opacity-60" : "hover:border-primary/20"}`}>
                <div className="flex items-start justify-between mb-3">
                  <div onClick={() => navigate("/brand-brain")} className="cursor-pointer flex-1">
                    <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center text-primary font-bold text-lg">
                      {(b.brand_name || "B").charAt(0)}
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    {b.is_active && <Star className="h-4 w-4 text-accent fill-accent" />}
                    <div className="relative">
                      <button onClick={(e) => { e.stopPropagation(); setOpenMenu(openMenu === b.id ? null : b.id); }}
                        className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors">
                        <MoreVertical className="h-4 w-4" />
                      </button>
                      {openMenu === b.id && (
                        <div className="absolute right-0 top-8 z-20 w-44 rounded-lg border border-border bg-background shadow-lg py-1"
                          onClick={(e) => e.stopPropagation()}>
                          <button onClick={() => { navigate("/brand-brain"); setOpenMenu(null); }}
                            className="w-full px-3 py-2 text-sm text-left flex items-center gap-2 hover:bg-secondary">
                            <Pencil className="h-3.5 w-3.5" /> Edit Brand
                          </button>
                          {b.status !== "archived" ? (
                            <button onClick={() => { setAction({ type: "archive", brandId: b.id, brandName: b.brand_name || "Untitled" }); setOpenMenu(null); }}
                              className="w-full px-3 py-2 text-sm text-left flex items-center gap-2 hover:bg-secondary">
                              <Archive className="h-3.5 w-3.5" /> Archive Brand
                            </button>
                          ) : (
                            <button onClick={() => { handleRestore(b.id); setOpenMenu(null); }}
                              className="w-full px-3 py-2 text-sm text-left flex items-center gap-2 hover:bg-secondary text-primary">
                              <Archive className="h-3.5 w-3.5" /> Restore Brand
                            </button>
                          )}
                          <button onClick={() => { setAction({ type: "transfer", brandId: b.id, brandName: b.brand_name || "Untitled" }); setOpenMenu(null); }}
                            className="w-full px-3 py-2 text-sm text-left flex items-center gap-2 hover:bg-secondary">
                            <ArrowRightLeft className="h-3.5 w-3.5" /> Transfer Brand
                          </button>
                          <div className="border-t border-border my-1" />
                          <button onClick={() => { setAction({ type: "delete", brandId: b.id, brandName: b.brand_name || "Untitled" }); setOpenMenu(null); }}
                            className="w-full px-3 py-2 text-sm text-left flex items-center gap-2 hover:bg-destructive/10 text-destructive">
                            <Trash2 className="h-3.5 w-3.5" /> Delete Brand
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                <div onClick={() => navigate("/brand-brain")} className="cursor-pointer">
                  <h3 className="font-display font-semibold">{b.brand_name || "Untitled Brand"}</h3>
                  {b.tagline && <p className="text-sm text-muted-foreground mt-1 line-clamp-1">{b.tagline}</p>}
                  <div className="flex items-center gap-2 mt-3">
                    <span className="text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full bg-secondary text-muted-foreground">{b.category || "Uncategorized"}</span>
                    <span className={`text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full ${b.status === "active" ? "bg-primary/20 text-primary" : b.status === "archived" ? "bg-muted text-muted-foreground" : "bg-muted text-muted-foreground"}`}>{b.status}</span>
                  </div>
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

        {/* Confirmation Modal */}
        {action && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={() => setAction(null)}>
            <div className="bg-background border border-border rounded-xl p-6 max-w-md w-full mx-4 shadow-xl" onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-display font-semibold text-lg capitalize">{action.type} Brand</h3>
                <button onClick={() => setAction(null)} className="p-1 rounded-lg hover:bg-secondary"><X className="h-4 w-4" /></button>
              </div>

              {action.type === "delete" && (
                <p className="text-sm text-muted-foreground mb-6">
                  Are you sure you want to permanently delete <strong className="text-foreground">{action.brandName}</strong>? This action cannot be undone. All associated data will be removed.
                </p>
              )}
              {action.type === "archive" && (
                <p className="text-sm text-muted-foreground mb-6">
                  Archive <strong className="text-foreground">{action.brandName}</strong>? The brand will be hidden from active views but can be restored later.
                </p>
              )}
              {action.type === "transfer" && (
                <div className="space-y-3 mb-6">
                  <p className="text-sm text-muted-foreground">
                    Transfer <strong className="text-foreground">{action.brandName}</strong> to another user. Enter their email address.
                  </p>
                  <input value={transferEmail} onChange={(e) => setTransferEmail(e.target.value)}
                    className="w-full rounded-lg border border-border bg-secondary px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                    placeholder="recipient@agency.com" type="email" />
                </div>
              )}

              <div className="flex justify-end gap-3">
                <button onClick={() => setAction(null)}
                  className="px-4 py-2 rounded-lg border border-border text-sm font-medium text-muted-foreground hover:text-foreground">Cancel</button>
                <button onClick={handleConfirmAction}
                  disabled={deleteBrand.isPending || archiveBrand.isPending || transferBrand.isPending}
                  className={`px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 ${
                    action.type === "delete" ? "bg-destructive text-destructive-foreground hover:bg-destructive/90" : "bg-primary text-primary-foreground hover:bg-primary/90"
                  } disabled:opacity-50`}>
                  {(deleteBrand.isPending || archiveBrand.isPending || transferBrand.isPending) && <Loader2 className="h-4 w-4 animate-spin" />}
                  {action.type === "delete" ? "Delete" : action.type === "archive" ? "Archive" : "Transfer"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default BrandsPage;