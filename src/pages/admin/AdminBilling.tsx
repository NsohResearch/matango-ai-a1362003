import { useState, useEffect } from "react";
import { AdminLayout } from "@/pages/Admin";
import { Search, Download, Loader2, CreditCard, ChevronDown, ChevronUp, Plus, Minus, ArrowUpDown } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { PRICING_TIERS } from "@/config/pricingTiers";

const statusColors: Record<string, string> = {
  active: "bg-primary/20 text-primary",
  trialing: "bg-blue-500/20 text-blue-400",
  past_due: "bg-destructive/20 text-destructive",
  canceled: "bg-muted text-muted-foreground",
  free: "bg-secondary text-muted-foreground",
  basic: "bg-primary/20 text-primary",
  agency: "bg-amber-500/20 text-amber-400",
  enterprise: "bg-purple-500/20 text-purple-400",
};

const tierLabel = (plan: string) => {
  const t = PRICING_TIERS.find((p) => p.id === plan);
  return t?.displayName || plan;
};

type ManageAction = "set_plan" | "grant_credits" | "deduct_credits";

export default function AdminBilling() {
  const [searchQuery, setSearchQuery] = useState("");
  const [profiles, setProfiles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Manage user dialog
  const [selectedUser, setSelectedUser] = useState<any | null>(null);
  const [manageAction, setManageAction] = useState<ManageAction>("set_plan");
  const [newPlan, setNewPlan] = useState("free");
  const [creditAmount, setCreditAmount] = useState("");
  const [note, setNote] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const fetchProfiles = async () => {
    setLoading(true);
    const { data } = await supabase.from("profiles").select("*").order("created_at", { ascending: false });
    setProfiles(data || []);
    setLoading(false);
  };

  useEffect(() => { fetchProfiles(); }, []);

  const filtered = profiles.filter(p =>
    !searchQuery ||
    (p.email || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
    (p.name || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
    (p.plan || "").toLowerCase().includes(searchQuery.toLowerCase())
  );

  const planCounts = profiles.reduce((acc, p) => {
    acc[p.plan || "free"] = (acc[p.plan || "free"] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const creatorCount = planCounts["basic"] || 0;
  const agencyCount = planCounts["agency"] || 0;
  const mrr = creatorCount * 199 + agencyCount * 399;

  const openManageDialog = (user: any) => {
    setSelectedUser(user);
    setManageAction("set_plan");
    setNewPlan(user.plan || "free");
    setCreditAmount("");
    setNote("");
  };

  const handleSubmit = async () => {
    if (!selectedUser) return;
    setSubmitting(true);
    try {
      const body: any = {
        action: manageAction,
        target_user_id: selectedUser.user_id,
        note: note || undefined,
      };
      if (manageAction === "set_plan") body.plan = newPlan;
      if (manageAction === "grant_credits" || manageAction === "deduct_credits") {
        body.credits = parseInt(creditAmount, 10);
        if (isNaN(body.credits) || body.credits <= 0) {
          toast.error("Enter a valid positive number for credits.");
          setSubmitting(false);
          return;
        }
      }

      const { data, error } = await supabase.functions.invoke("admin-manage-user", { body });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);

      toast.success(
        manageAction === "set_plan"
          ? `Plan changed to ${tierLabel(newPlan)}`
          : manageAction === "grant_credits"
          ? `Granted ${creditAmount} credits`
          : `Deducted ${creditAmount} credits`
      );
      setSelectedUser(null);
      fetchProfiles();
    } catch (err: any) {
      toast.error(err.message || "Action failed");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AdminLayout title="Billing & User Management" description="Manage subscriptions, credits, and plan overrides.">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Card><CardContent className="p-5"><p className="text-sm text-muted-foreground">MRR</p><p className="text-2xl font-bold font-display">${mrr.toLocaleString()}</p></CardContent></Card>
        <Card><CardContent className="p-5"><p className="text-sm text-muted-foreground">ARR</p><p className="text-2xl font-bold font-display">${(mrr * 12).toLocaleString()}</p></CardContent></Card>
        <Card><CardContent className="p-5"><p className="text-sm text-muted-foreground">Paid Users</p><p className="text-2xl font-bold font-display">{creatorCount + agencyCount}</p></CardContent></Card>
        <Card><CardContent className="p-5"><p className="text-sm text-muted-foreground">Total Users</p><p className="text-2xl font-bold font-display">{profiles.length}</p></CardContent></Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-display">User Plan & Credit Management</CardTitle>
            <Button variant="outline" size="sm"><Download className="h-3 w-3 mr-1" /> Export</Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search by name, email, or plan..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-9" />
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-8"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <CreditCard className="h-8 w-8 mx-auto mb-2" />
              <p>No users found.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {filtered.map((p) => (
                <div key={p.id} className="flex items-center justify-between p-3 rounded-lg border border-border hover:border-primary/30 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary">
                      {(p.name || p.email || "?")[0].toUpperCase()}
                    </div>
                    <div>
                      <p className="text-sm font-medium">{p.name || p.email || "Unknown"}</p>
                      <p className="text-xs text-muted-foreground">{p.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge className={statusColors[p.plan || "free"]}>{tierLabel(p.plan || "free")}</Badge>
                    <span className="text-xs text-muted-foreground tabular-nums">{p.credits ?? 0} credits</span>
                    <Button variant="outline" size="sm" onClick={() => openManageDialog(p)}>
                      <ArrowUpDown className="h-3 w-3 mr-1" /> Manage
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Manage User Dialog */}
      <Dialog open={!!selectedUser} onOpenChange={(open) => !open && setSelectedUser(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="font-display">Manage User</DialogTitle>
            <DialogDescription>
              {selectedUser?.name || selectedUser?.email || "User"} — currently on <strong>{tierLabel(selectedUser?.plan || "free")}</strong> with <strong>{selectedUser?.credits ?? 0}</strong> credits.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label className="text-sm font-medium">Action</Label>
              <Select value={manageAction} onValueChange={(v) => setManageAction(v as ManageAction)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="set_plan">Change Plan</SelectItem>
                  <SelectItem value="grant_credits">Grant Credits</SelectItem>
                  <SelectItem value="deduct_credits">Deduct Credits</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {manageAction === "set_plan" && (
              <div>
                <Label className="text-sm font-medium">New Plan</Label>
                <Select value={newPlan} onValueChange={setNewPlan}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {PRICING_TIERS.map((t) => (
                      <SelectItem key={t.id} value={t.id}>{t.displayName}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {(manageAction === "grant_credits" || manageAction === "deduct_credits") && (
              <div>
                <Label className="text-sm font-medium">
                  {manageAction === "grant_credits" ? "Credits to Grant" : "Credits to Deduct"}
                </Label>
                <Input
                  type="number"
                  min="1"
                  placeholder="e.g. 500"
                  value={creditAmount}
                  onChange={(e) => setCreditAmount(e.target.value)}
                />
              </div>
            )}

            <div>
              <Label className="text-sm font-medium">Note (optional)</Label>
              <Textarea
                placeholder="Reason for this change..."
                value={note}
                onChange={(e) => setNote(e.target.value)}
                rows={2}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setSelectedUser(null)}>Cancel</Button>
            <Button onClick={handleSubmit} disabled={submitting}>
              {submitting && <Loader2 className="h-4 w-4 animate-spin mr-1" />}
              {manageAction === "set_plan" ? "Update Plan" : manageAction === "grant_credits" ? "Grant Credits" : "Deduct Credits"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}
