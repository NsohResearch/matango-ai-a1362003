import DashboardLayout from "@/components/DashboardLayout";
import { Users, Plus, Mail, Shield, Loader2 } from "lucide-react";
import { useState } from "react";

const TeamPage = () => {
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState("viewer");

  return (
    <DashboardLayout>
      <div className="p-6 lg:p-8 max-w-4xl">
        <div className="mb-6">
          <h1 className="font-display text-3xl font-bold flex items-center gap-2">
            <Users className="h-8 w-8 text-primary" /> Team
          </h1>
          <p className="mt-1 text-muted-foreground">Manage team members and permissions.</p>
        </div>

        {/* Invite */}
        <div className="glass-card rounded-xl p-6 mb-6">
          <h3 className="font-display font-semibold mb-4">Invite Team Member</h3>
          <div className="flex gap-3">
            <div className="relative flex-1">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input value={inviteEmail} onChange={(e) => setInviteEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-border bg-secondary text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                placeholder="colleague@company.com" />
            </div>
            <select value={inviteRole} onChange={(e) => setInviteRole(e.target.value)}
              className="rounded-lg border border-border bg-secondary px-4 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50">
              <option value="viewer">Viewer</option>
              <option value="editor">Editor</option>
              <option value="admin">Admin</option>
            </select>
            <button className="px-4 py-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 flex items-center gap-2">
              <Plus className="h-4 w-4" /> Invite
            </button>
          </div>
        </div>

        {/* Roles */}
        <div className="glass-card rounded-xl p-6 mb-6">
          <h3 className="font-display font-semibold mb-4">Role Permissions</h3>
          <div className="space-y-3">
            {[
              { role: "Owner", perms: "Full access, billing, delete org" },
              { role: "Admin", perms: "Manage team, settings, all content" },
              { role: "Editor", perms: "Create & edit content, campaigns" },
              { role: "Viewer", perms: "View-only access to all content" },
            ].map((r) => (
              <div key={r.role} className="flex items-center gap-3 p-3 rounded-lg bg-secondary/50">
                <Shield className="h-4 w-4 text-primary" />
                <div>
                  <div className="text-sm font-medium">{r.role}</div>
                  <div className="text-xs text-muted-foreground">{r.perms}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Empty state */}
        <div className="glass-card rounded-xl p-8 text-center">
          <Users className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
          <h3 className="font-display font-semibold mb-1">You're the only team member</h3>
          <p className="text-sm text-muted-foreground">Invite colleagues to collaborate on campaigns and content.</p>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default TeamPage;
