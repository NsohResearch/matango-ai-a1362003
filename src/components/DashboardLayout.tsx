import { Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard, UserCircle, Sparkles, Bell, Settings, ShieldCheck
} from "lucide-react";
import matangoIcon from "@/assets/matango-icon.png";
import SystemProgress from "@/components/system/SystemProgress";
import { SYSTEM_STEPS } from "@/lib/system-steps";
import { useUserRoles } from "@/hooks/useData";

const utilItems = [
  { to: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { to: "/notifications", icon: Bell, label: "Notifications" },
  { to: "/account-settings", icon: Settings, label: "Settings" },
];

const DashboardLayout = ({ children }: { children: React.ReactNode }) => {
  const location = useLocation();
  const { data: roles } = useUserRoles();
  const isSystemPage = SYSTEM_STEPS.some((s) => location.pathname.startsWith(s.route));
  const isAdminOrAbove = roles?.includes("admin") || roles?.includes("super_admin");

  return (
    <div className="flex h-screen" data-theme="dark">
      {/* Sidebar */}
      <aside className="hidden lg:flex w-64 flex-col border-r border-sidebar-border bg-sidebar overflow-y-auto">
        <div className="p-4 border-b border-sidebar-border">
          <Link to="/" className="flex items-center gap-2">
            <img src={matangoIcon} alt="matango.ai" className="h-7 w-7 rounded-lg" />
            <span className="font-display text-sm font-semibold text-sidebar-foreground">
              matango<span className="text-gold-400">.ai</span>
            </span>
          </Link>
        </div>

        <nav className="flex-1 p-3 space-y-5">
          {/* The System — sequential steps */}
          <div>
            <span className="px-3 text-[10px] font-semibold uppercase tracking-widest text-cream-100/30">
              The System
            </span>
            <ul className="mt-1.5 space-y-0.5">
              {SYSTEM_STEPS.map((step) => {
                const isActive = location.pathname.startsWith(step.route);
                return (
                  <li key={step.id}>
                    <Link
                      to={step.route}
                      className={`flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition-colors ${
                        isActive
                          ? "bg-sidebar-accent text-gold-400 font-medium"
                          : "text-cream-100/50 hover:text-cream-50 hover:bg-sidebar-accent"
                      }`}
                    >
                      <span className="w-5 h-5 flex items-center justify-center rounded-full bg-sidebar-accent text-[10px] font-bold text-sidebar-foreground shrink-0">
                        {step.id}
                      </span>
                      <step.icon className="h-4 w-4 shrink-0" />
                      {step.title}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>

          {/* Utility */}
          <div>
            <span className="px-3 text-[10px] font-semibold uppercase tracking-widest text-cream-100/30">
              Manage
            </span>
            <ul className="mt-1.5 space-y-0.5">
              {utilItems.map((item) => {
                const isActive = location.pathname === item.to;
                return (
                  <li key={item.to}>
                    <Link
                      to={item.to}
                      className={`flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition-colors ${
                        isActive
                          ? "bg-sidebar-accent text-gold-400 font-medium"
                          : "text-cream-100/50 hover:text-cream-50 hover:bg-sidebar-accent"
                      }`}
                    >
                      <item.icon className="h-4 w-4 shrink-0" />
                      {item.label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>

          {/* Admin Console — admin only */}
          {isAdminOrAbove && (
            <div>
              <span className="px-3 text-[10px] font-semibold uppercase tracking-widest text-cream-100/30">
                Platform
              </span>
              <ul className="mt-1.5 space-y-0.5">
                <li>
                  <Link
                    to="/admin"
                    className={`flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition-colors ${
                      location.pathname.startsWith("/admin")
                        ? "bg-sidebar-accent text-gold-400 font-medium"
                        : "text-cream-100/50 hover:text-cream-50 hover:bg-sidebar-accent"
                    }`}
                  >
                    <ShieldCheck className="h-4 w-4 shrink-0" />
                    Admin Console
                  </Link>
                </li>
              </ul>
            </div>
          )}
        </nav>

        <div className="p-3 border-t border-sidebar-border space-y-0.5">
          <Link
            to="/meet-kah"
            className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-cream-100/50 hover:text-cream-50 hover:bg-sidebar-accent transition-colors"
          >
            <Sparkles className="h-4 w-4" />
            Meet K'ah
          </Link>
          <Link
            to="/account-settings"
            className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-cream-100/50 hover:text-cream-50 hover:bg-sidebar-accent transition-colors"
          >
            <UserCircle className="h-4 w-4" />
            Account
          </Link>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-y-auto bg-background">
        {isSystemPage && <SystemProgress />}
        {children}
      </main>
    </div>
  );
};

export default DashboardLayout;
