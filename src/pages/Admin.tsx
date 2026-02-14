import DashboardLayout from "@/components/DashboardLayout";
import { ShieldCheck, Users, BarChart3, Flag, ScrollText, Cpu, AlertTriangle, Globe, FileText, Zap, Loader2, Plug, ArrowLeft, Lock } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { useUserRoles } from "@/hooks/useData";
import { Badge } from "@/components/ui/badge";

// Define which roles can access which admin sub-pages
// super_admin: full access to everything
// admin: org-level management (tenants, moderation, leads, audit log, compliance, gdpr)
// No access for team_member, read_only, user
const SUPER_ADMIN_ONLY_ROUTES = ["/admin/feature-flags", "/admin/billing", "/admin/system-health", "/admin/integrations"];

const adminNav = [
  { to: "/admin", icon: BarChart3, label: "Overview", superOnly: false },
  { to: "/admin/tenants", icon: Users, label: "Tenants", superOnly: false },
  { to: "/admin/billing", icon: Zap, label: "Billing", superOnly: true },
  { to: "/admin/feature-flags", icon: Flag, label: "Feature Flags", superOnly: true },
  { to: "/admin/audit-log", icon: ScrollText, label: "Audit Log", superOnly: false },
  { to: "/admin/integrations", icon: Plug, label: "Integrations", superOnly: true },
  { to: "/admin/system-health", icon: Cpu, label: "System Health", superOnly: true },
  { to: "/admin/moderation", icon: AlertTriangle, label: "Moderation", superOnly: false },
  { to: "/admin/compliance", icon: ShieldCheck, label: "Compliance", superOnly: false },
  { to: "/admin/gdpr", icon: FileText, label: "GDPR", superOnly: false },
  { to: "/admin/leads", icon: Globe, label: "Leads", superOnly: false },
];

export { SUPER_ADMIN_ONLY_ROUTES };

export const AdminLayout = ({ children, title, description }: { children: React.ReactNode; title: string; description: string }) => {
  const location = useLocation();
  const { data: roles } = useUserRoles();
  const isSuperAdmin = roles?.includes("super_admin");

  return (
    <DashboardLayout>
      <div className="flex h-full">
        <div className="w-52 border-r border-border p-3 space-y-1 shrink-0 flex flex-col">
          {/* Back to Dashboard */}
          <Link
            to="/dashboard"
            className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs text-muted-foreground hover:text-foreground hover:bg-muted transition-colors mb-2"
          >
            <ArrowLeft className="h-3.5 w-3.5" /> Back to Dashboard
          </Link>
          <div className="px-2 py-1 text-[10px] uppercase tracking-widest text-muted-foreground font-semibold">Admin Console</div>
          {adminNav.map((item) => {
            const locked = item.superOnly && !isSuperAdmin;
            return (
              <Link
                key={item.to}
                to={locked ? "#" : item.to}
                onClick={locked ? (e) => e.preventDefault() : undefined}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs transition-colors ${
                  locked
                    ? "text-muted-foreground/40 cursor-not-allowed"
                    : location.pathname === item.to
                    ? "bg-primary/10 text-primary font-medium"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <item.icon className="h-3.5 w-3.5" />
                {item.label}
                {locked && <Lock className="h-3 w-3 ml-auto" />}
              </Link>
            );
          })}
          {isSuperAdmin && (
            <div className="mt-auto pt-3 border-t border-border">
              <Badge variant="outline" className="text-[10px] text-gold-400 border-gold-400/30">Super Admin</Badge>
            </div>
          )}
        </div>
        <div className="flex-1 p-6 lg:p-8 overflow-y-auto">
          <h1 className="font-display text-3xl font-bold mb-1">{title}</h1>
          <p className="text-muted-foreground mb-6">{description}</p>
          {children}
        </div>
      </div>
    </DashboardLayout>
  );
};

// Admin Overview
export const AdminOverviewPage = () => (
  <AdminLayout title="Admin Overview" description="Platform health and metrics at a glance.">
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {[
        { label: "Total Users", value: "—", change: "+0%" },
        { label: "Active Today", value: "—", change: "+0%" },
        { label: "Total Revenue", value: "$0", change: "+0%" },
        { label: "AI Credits Used", value: "0", change: "+0%" },
      ].map((s) => (
        <div key={s.label} className="glass-card rounded-xl p-5">
          <div className="text-2xl font-bold font-display">{s.value}</div>
          <div className="text-xs text-muted-foreground mt-1">{s.label}</div>
          <div className="text-[10px] text-primary mt-2">{s.change}</div>
        </div>
      ))}
    </div>
    <div className="glass-card rounded-xl p-8 text-center">
      <p className="text-muted-foreground">Admin dashboard data will populate as users join the platform.</p>
    </div>
  </AdminLayout>
);

export const AdminTenantsPage = () => (
  <AdminLayout title="Tenants" description="Manage platform organizations and users.">
    <div className="glass-card rounded-xl p-8 text-center">
      <Users className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
      <p className="text-muted-foreground">No tenants to display yet.</p>
    </div>
  </AdminLayout>
);

export const AdminBillingPage = () => (
  <AdminLayout title="Billing" description="Manage subscriptions and revenue.">
    <div className="glass-card rounded-xl p-8 text-center">
      <Zap className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
      <p className="text-muted-foreground">Billing data will appear after Stripe integration.</p>
    </div>
  </AdminLayout>
);

export const AdminFeatureFlagsPage = () => (
  <AdminLayout title="Feature Flags" description="Control feature availability across the platform.">
    <div className="glass-card rounded-xl p-8 text-center">
      <Flag className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
      <p className="text-muted-foreground">Feature flags will be configurable here.</p>
    </div>
  </AdminLayout>
);

export const AdminAuditLogPage = () => (
  <AdminLayout title="Audit Log" description="View system audit trail.">
    <div className="glass-card rounded-xl p-8 text-center">
      <ScrollText className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
      <p className="text-muted-foreground">Audit events will appear here as admin actions are performed.</p>
    </div>
  </AdminLayout>
);

export const AdminSystemHealthPage = () => (
  <AdminLayout title="System Health" description="Monitor platform status and performance.">
    <div className="grid grid-cols-3 gap-4">
      {["API", "Database", "AI Gateway"].map((service) => (
        <div key={service} className="glass-card rounded-xl p-5">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-2 h-2 rounded-full bg-primary" />
            <span className="text-sm font-medium">{service}</span>
          </div>
          <p className="text-xs text-muted-foreground">Operational</p>
        </div>
      ))}
    </div>
  </AdminLayout>
);

export const AdminModerationPage = () => (
  <AdminLayout title="Moderation" description="Review flagged content.">
    <div className="glass-card rounded-xl p-8 text-center">
      <AlertTriangle className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
      <p className="text-muted-foreground">No content flagged for moderation.</p>
    </div>
  </AdminLayout>
);

export const AdminCompliancePage = () => (
  <AdminLayout title="Compliance" description="Platform compliance management.">
    <div className="glass-card rounded-xl p-8 text-center">
      <ShieldCheck className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
      <p className="text-muted-foreground">Compliance tools and reports.</p>
    </div>
  </AdminLayout>
);

export const AdminGdprPage = () => (
  <AdminLayout title="GDPR Requests" description="Process data access and deletion requests.">
    <div className="glass-card rounded-xl p-8 text-center">
      <FileText className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
      <p className="text-muted-foreground">No pending GDPR requests.</p>
    </div>
  </AdminLayout>
);

export const AdminLeadsPage = () => (
  <AdminLayout title="Platform Leads" description="Global lead management.">
    <div className="glass-card rounded-xl p-8 text-center">
      <Globe className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
      <p className="text-muted-foreground">Platform-wide lead data.</p>
    </div>
  </AdminLayout>
);
