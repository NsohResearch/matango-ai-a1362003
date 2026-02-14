import { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Settings, User, CreditCard, Bell, Shield, Trash2, Loader2 } from "lucide-react";
import { useProfile } from "@/hooks/useData";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const AccountSettingsPage = () => {
  const { user, signOut } = useAuth();
  const { data: profile, isLoading } = useProfile();
  const [tab, setTab] = useState("profile");
  const [name, setName] = useState("");

  const handleUpdateProfile = async () => {
    if (!user) return;
    const { error } = await supabase.from("profiles").update({ name }).eq("user_id", user.id);
    if (error) toast.error(error.message);
    else toast.success("Profile updated!");
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
                    <h3 className="font-display font-semibold mb-4">Profile Information</h3>
                    <div>
                      <label className="text-sm font-medium mb-1 block">Email</label>
                      <input value={user?.email || ""} disabled className="w-full rounded-lg border border-border bg-muted px-4 py-2.5 text-sm text-muted-foreground" />
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-1 block">Display Name</label>
                      <input value={name || profile?.name || ""} onChange={(e) => setName(e.target.value)}
                        className="w-full rounded-lg border border-border bg-secondary px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50" placeholder="Your name" />
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-1 block">Plan</label>
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
                    <h3 className="font-display font-semibold mb-4">Billing & Subscription</h3>
                    <div className="p-4 rounded-lg bg-secondary/50 mb-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-medium capitalize">{profile?.plan || "Free"} Plan</div>
                          <div className="text-sm text-muted-foreground">Current plan</div>
                        </div>
                        <button className="px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90">Upgrade</button>
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground">Billing management will be available through Stripe integration.</p>
                  </div>
                )}

                {tab === "notifications" && (
                  <div>
                    <h3 className="font-display font-semibold mb-4">Notification Preferences</h3>
                    {["Campaign updates", "Post published", "Weekly reports", "Milestone alerts", "Team invites"].map((pref) => (
                      <label key={pref} className="flex items-center justify-between py-3 border-b border-border last:border-0">
                        <span className="text-sm">{pref}</span>
                        <input type="checkbox" defaultChecked className="rounded border-border" />
                      </label>
                    ))}
                  </div>
                )}

                {tab === "security" && (
                  <div>
                    <h3 className="font-display font-semibold mb-4">Security</h3>
                    <button className="px-4 py-2 rounded-lg border border-border text-sm text-muted-foreground hover:text-foreground">Change Password</button>
                    <div className="mt-6">
                      <h4 className="text-sm font-medium mb-2">Active Sessions</h4>
                      <p className="text-sm text-muted-foreground">You are currently signed in on this device.</p>
                    </div>
                  </div>
                )}

                {tab === "danger" && (
                  <div>
                    <h3 className="font-display font-semibold text-destructive mb-4">Danger Zone</h3>
                    <p className="text-sm text-muted-foreground mb-4">Once you delete your account, there is no going back. All data will be permanently removed after 90 days.</p>
                    <button onClick={signOut} className="px-4 py-2 rounded-lg bg-destructive text-destructive-foreground text-sm font-medium hover:bg-destructive/90 mr-3">Sign Out</button>
                    <button className="px-4 py-2 rounded-lg border border-destructive text-destructive text-sm font-medium hover:bg-destructive/10">Delete Account</button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AccountSettingsPage;
