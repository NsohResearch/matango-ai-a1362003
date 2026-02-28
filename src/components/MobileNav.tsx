import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X, Sparkles, UserCircle, LogOut } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useAuth } from "@/hooks/useAuth";
import { useUserRoles } from "@/hooks/useData";
import { SYSTEM_STEPS } from "@/lib/system-steps";
import { canAccess, SYSTEM_STEP_VISIBILITY, MANAGE_VISIBILITY, ADMIN_VISIBILITY } from "@/lib/rbac";
import { Button } from "@/components/ui/button";
import matangoIcon from "@/assets/matango-icon.png";
import {
  LayoutDashboard, Bell, Settings, ShieldCheck,
} from "lucide-react";

const utilItems = [
  { to: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { to: "/notifications", icon: Bell, label: "Notifications" },
  { to: "/account-settings", icon: Settings, label: "Settings" },
];

const MobileNav = () => {
  const [open, setOpen] = useState(false);
  const location = useLocation();
  const { user, signOut } = useAuth();
  const { data: roles } = useUserRoles();

  if (!user) return null;

  const isActive = (path: string) => location.pathname.startsWith(path);

  return (
    <div className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-sidebar border-b border-sidebar-border">
      <div className="flex items-center justify-between px-4 py-3">
        <Link to="/" className="flex items-center gap-2">
          <img src={matangoIcon} alt="matango.ai" className="h-7 w-7 rounded-lg" />
          <span className="font-display text-sm font-semibold text-sidebar-foreground">
            matango<span className="text-accent">.ai</span>
          </span>
        </Link>

        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="text-sidebar-foreground">
              {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-72 bg-sidebar border-sidebar-border p-0">
            <div className="p-4 border-b border-sidebar-border">
              <Link to="/" className="flex items-center gap-2" onClick={() => setOpen(false)}>
                <img src={matangoIcon} alt="matango.ai" className="h-7 w-7 rounded-lg" />
                <span className="font-display text-sm font-semibold text-sidebar-foreground">
                  matango<span className="text-accent">.ai</span>
                </span>
              </Link>
            </div>

            <nav className="flex-1 p-3 space-y-5 overflow-y-auto max-h-[calc(100vh-140px)]">
              {/* The System */}
              <div>
                <span className="px-3 text-[10px] font-semibold uppercase tracking-widest text-sidebar-foreground/40">
                  The System
                </span>
                <ul className="mt-1.5 space-y-0.5">
                  {SYSTEM_STEPS.filter((step) =>
                    canAccess(roles, SYSTEM_STEP_VISIBILITY[step.id] || { minRole: "user" })
                  ).map((step) => {
                    const active = isActive(step.route);
                    return (
                      <li key={step.id}>
                        <Link
                          to={step.route}
                          onClick={() => setOpen(false)}
                          className={`flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition-colors ${
                            active
                              ? "bg-sidebar-accent text-sidebar-primary font-medium"
                              : "text-sidebar-foreground/60 hover:text-sidebar-foreground hover:bg-sidebar-accent/50"
                          }`}
                        >
                          <span className={`w-5 h-5 flex items-center justify-center rounded-full text-[10px] font-bold shrink-0 ${
                            active ? "bg-sidebar-primary text-sidebar-primary-foreground" : "bg-sidebar-accent text-sidebar-foreground/70"
                          }`}>
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

              {/* Manage */}
              <div>
                <span className="px-3 text-[10px] font-semibold uppercase tracking-widest text-sidebar-foreground/40">
                  Manage
                </span>
                <ul className="mt-1.5 space-y-0.5">
                  {utilItems.filter((item) =>
                    canAccess(roles, MANAGE_VISIBILITY[item.to] || { minRole: "user" })
                  ).map((item) => {
                    const active = location.pathname === item.to;
                    return (
                      <li key={item.to}>
                        <Link
                          to={item.to}
                          onClick={() => setOpen(false)}
                          className={`flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition-colors ${
                            active
                              ? "bg-sidebar-accent text-sidebar-primary font-medium"
                              : "text-sidebar-foreground/60 hover:text-sidebar-foreground hover:bg-sidebar-accent/50"
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

              {/* Admin Console — RBAC gated */}
              {canAccess(roles, ADMIN_VISIBILITY) && (
                <div>
                  <span className="px-3 text-[10px] font-semibold uppercase tracking-widest text-sidebar-foreground/40">
                    Platform
                  </span>
                  <ul className="mt-1.5 space-y-0.5">
                    <li>
                      <Link
                        to="/admin"
                        onClick={() => setOpen(false)}
                        className={`flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition-colors ${
                          isActive("/admin")
                            ? "bg-sidebar-accent text-sidebar-primary font-medium"
                            : "text-sidebar-foreground/60 hover:text-sidebar-foreground hover:bg-sidebar-accent/50"
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
                onClick={() => setOpen(false)}
                className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-sidebar-foreground/60 hover:text-sidebar-foreground hover:bg-sidebar-accent/50 transition-colors"
              >
                <Sparkles className="h-4 w-4" />
                Meet Ka'h
              </Link>
              <Link
                to="/account-settings"
                onClick={() => setOpen(false)}
                className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-sidebar-foreground/60 hover:text-sidebar-foreground hover:bg-sidebar-accent/50 transition-colors"
              >
                <UserCircle className="h-4 w-4" />
                Account
              </Link>
              <button
                onClick={() => { signOut(); setOpen(false); }}
                className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-destructive hover:bg-destructive/10 transition-colors w-full"
              >
                <LogOut className="h-4 w-4" />
                Logout
              </button>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </div>
  );
};

export default MobileNav;
