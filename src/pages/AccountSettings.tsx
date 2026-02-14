import { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Settings, User, CreditCard, Bell, Shield, Trash2, Loader2, Download } from "lucide-react";
import { useProfile } from "@/hooks/useData";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { gdprProcess } from "@/lib/edge-functions";
import PlanSelectionDrawer from "@/components/PlanSelectionDrawer";
import { Button } from "@/components/ui/button";
import DangerZonePanel from "@/components/DangerZonePanel";

const AccountSettingsPage = () => {
  const { user, signOut } = useAuth();
  const { data: profile, isLoading } = useProfile();
  const [tab, setTab] = useState("profile");
  const [name, setName] = useState("");
  const [planDrawerOpen, setPlanDrawerOpen] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [deletionRequested, setDeletionRequested] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);

  const handleChangePassword = async () => {
    if (!user?.email) return;
    setChangingPassword(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(user.email, {
        redirectTo: window.location.origin + "/account-settings",
      });
      if (error) throw error;
      toast.success("Password reset email sent! Check your inbox.");
    } catch (err: any) {
      toast.error(err.message || "Failed to send password reset email");
    } finally {
      setChangingPassword(false);
    }
  };

  const handleUpdateProfile = async () => {
    if (!user) return;
    const { error } = await supabase.from("profiles").update({ name }).eq("user_id", user.id);
    if (error) toast.error(error.message);
    else toast.success("Profile updated!");
  };

  const handleExportData = async () => {
    setExporting(true);
    try {
      const result = await gdprProcess("export_data");
      const blob = new Blob([JSON.stringify(result.export, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `matango-data-export-${new Date().toISOString().split("T")[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success("Data exported successfully!");
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setExporting(false);
    }
  };

  const handleRequestDeletion = async () => {
    if (!confirm("Are you sure you want to request account deletion? This action cannot be undone. Your data will be permanently deleted after admin review.")) return;
    try {
      await gdprProcess("request_deletion");
      setDeletionRequested(true);
      toast.success("Deletion request submitted. An admin will process it within 30 days.");
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const tabs = [
    { id: "profile", label: "Profile", icon: User },
    { id: "billing", label: "Billing", icon: CreditCard },
    { id: "notifications", label: "Notifications", icon: Bell },
    { id: "security", label: "Security", icon: Shield },
    { id: "danger", label: "Danger Zone", icon: Trash2 },
  ];

  return (
    <DashboardLayout>
      <div className="p-6 lg:p-8 max-w-4xl">
        <h1 className="font-display text-3xl font-bold flex items-center gap-2 mb-6">
          <Settings className="h-8 w-8 text-primary" /> Account Settings
        </h1>

        <div className="flex gap-6">
          <div className="w-48 shrink-0">
            {tabs.map((t) => (
              <button key={t.id} onClick={() => setTab(t.id)}
                className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-left transition-colors mb-1 ${tab === t.id ? "bg-primary/10 text-primary font-medium" : "text-muted-foreground hover:text-foreground"}`}>
                <t.icon className="h-4 w-4" /> {t.label}
              </button>
            ))}
          </div>

          <div className="flex-1">
            {isLoading ? (
              <div className="flex items-center justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
            ) : (
              <div className="glass-card rounded-xl p-6">
                {tab === "profile" && (
                  <div className="space-y-4">
                    <h3 className="font-display font-semibold mb-4 text-foreground">Profile Information</h3>
                    <div>
                      <label className="text-sm font-medium mb-1 block text-foreground">Email</label>
                      <input value={user?.email || ""} disabled className="w-full rounded-lg border border-border bg-muted px-4 py-2.5 text-sm text-muted-foreground" />
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-1 block text-foreground">Display Name</label>
                      <input value={name || profile?.name || ""} onChange={(e) => setName(e.target.value)}
                        className="w-full rounded-lg border border-border bg-secondary px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50" placeholder="Your name" />
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-1 block text-foreground">Plan</label>
                      <div className="flex items-center gap-3">
                        <span className="px-3 py-1 rounded-full bg-primary/20 text-primary text-sm font-medium capitalize">{profile?.plan || "free"}</span>
                        <span className="text-sm text-muted-foreground">{profile?.credits || 0} credits remaining</span>
                      </div>
                    </div>
                    <button onClick={handleUpdateProfile} className="px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90">Save Changes</button>
                  </div>
                )}

                {tab === "billing" && (
                  <div>
                    <h3 className="font-display font-semibold mb-4 text-foreground">Billing & Subscription</h3>
                    <div className="p-4 rounded-lg bg-secondary/50 mb-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-medium capitalize text-foreground">{profile?.plan || "Free"} Plan</div>
                          <div className="text-sm text-muted-foreground">{profile?.credits || 0} credits remaining this month</div>
                        </div>
                        <Button onClick={() => setPlanDrawerOpen(true)}>Upgrade</Button>
                      </div>
                    </div>
                    <div className="space-y-2 text-sm text-muted-foreground">
                      <p>• Free: 50 credits/month (5/day limit)</p>
                      <p>• Basic ($199/mo): 500 credits/month</p>
                      <p>• Agency ($399/mo): Unlimited credits</p>
                      <p>• Agency++: Custom pricing</p>
                    </div>
                  </div>
                )}

                {tab === "notifications" && (
                  <div>
                    <h3 className="font-display font-semibold mb-4 text-foreground">Notification Preferences</h3>
                    {["Campaign updates", "Post published", "Weekly reports", "Milestone alerts", "Team invites"].map((pref) => (
                      <label key={pref} className="flex items-center justify-between py-3 border-b border-border last:border-0">
                        <span className="text-sm text-foreground">{pref}</span>
                        <input type="checkbox" defaultChecked className="rounded border-border" />
                      </label>
                    ))}
                  </div>
                )}

                {tab === "security" && (
                  <div>
                    <h3 className="font-display font-semibold mb-4 text-foreground">Security & Data</h3>
                    <div className="space-y-6">
                      <div>
                        <h4 className="text-sm font-medium mb-2 text-foreground">Password</h4>
                        <Button variant="outline" size="sm" onClick={handleChangePassword} disabled={changingPassword}>
                          {changingPassword ? <Loader2 className="h-3 w-3 animate-spin mr-1" /> : null}
                          Change Password
                        </Button>
                      </div>
                      <div>
                        <h4 className="text-sm font-medium mb-2 text-foreground">Data Export (GDPR)</h4>
                        <p className="text-xs text-muted-foreground mb-2">Download all your data as a JSON file.</p>
                        <Button variant="outline" size="sm" onClick={handleExportData} disabled={exporting}>
                          {exporting ? <Loader2 className="h-3 w-3 animate-spin mr-1" /> : <Download className="h-3 w-3 mr-1" />}
                          <span className="font-sans">Export My Data</span>
                        </Button>
                      </div>
                    </div>
                  </div>
                )}

                {tab === "danger" && (
                  <div>
                    <DangerZonePanel orgName={profile?.name || user?.email?.split("@")[0] || "CONFIRM"} />
                    <div className="mt-6 pt-4 border-t border-border">
                      <button onClick={signOut} className="px-4 py-2 rounded-lg bg-muted text-muted-foreground text-sm font-medium hover:bg-muted/80">
                        Sign Out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
      <PlanSelectionDrawer open={planDrawerOpen} onOpenChange={setPlanDrawerOpen} origin="upgrade" />
    </DashboardLayout>
  );
};

export default AccountSettingsPage;
