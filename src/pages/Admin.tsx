import DashboardLayout from "@/components/DashboardLayout";
import { ShieldCheck, Users, BarChart3, Flag, ScrollText, Cpu, AlertTriangle, Globe, FileText, Zap, Loader2 } from "lucide-react";
import { Link, useLocation } from "react-router-dom";

const adminNav = [
  { to: "/admin", icon: BarChart3, label: "Overview" },
  { to: "/admin/tenants", icon: Users, label: "Tenants" },
  { to: "/admin/billing", icon: Zap, label: "Billing" },
  { to: "/admin/feature-flags", icon: Flag, label: "Feature Flags" },
  { to: "/admin/audit-log", icon: ScrollText, label: "Audit Log" },
  { to: "/admin/system-health", icon: Cpu, label: "System Health" },
  { to: "/admin/moderation", icon: AlertTriangle, label: "Moderation" },
  { to: "/admin/compliance", icon: ShieldCheck, label: "Compliance" },
  { to: "/admin/gdpr", icon: FileText, label: "GDPR" },
  { to: "/admin/leads", icon: Globe, label: "Leads" },
];

export const AdminLayout = ({ children, title, description }: { children: React.ReactNode; title: string; description: string }) => {
  const location = useLocation();
  return (
    <DashboardLayout>
      <div className="flex h-full">
        <div className="w-48 border-r border-border p-3 space-y-1 shrink-0">
          <div className="px-2 py-1 text-[10px] uppercase tracking-widest text-muted-foreground font-semibold">Admin</div>
          {adminNav.map((item) => (
            <Link key={item.to} to={item.to}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs transition-colors ${location.pathname === item.to ? "bg-primary/10 text-primary font-medium" : "text-muted-foreground hover:text-foreground"}`}>
              <item.icon className="h-3.5 w-3.5" /> {item.label}
            </Link>
          ))}
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
