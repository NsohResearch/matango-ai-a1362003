import { Link, useLocation } from "react-router-dom";
import {
  Brain, Users, Video, Megaphone, Calendar, BarChart3,
  LayoutDashboard, Palette, Settings, Zap, Globe, FlaskConical,
  FileText, Library, BookOpen, UserCircle, Layers, Upload
} from "lucide-react";
import matangoIcon from "@/assets/matango-icon.png";

const navGroups = [
  {
    label: "Core",
    items: [
      { to: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
      { to: "/brand-brain", icon: Brain, label: "Brand Brain" },
      { to: "/campaign-factory", icon: Megaphone, label: "Campaign Factory" },
    ],
  },
  {
    label: "Create",
    items: [
      { to: "/influencer-studio", icon: Users, label: "Influencer Studio" },
      { to: "/video-studio", icon: Video, label: "Video Studio" },
      { to: "/video-scripts", icon: FileText, label: "Video Scripts" },
      { to: "/story-studio", icon: BookOpen, label: "Story Studio" },
      { to: "/asset-library", icon: Library, label: "Asset Library" },
      { to: "/templates", icon: Layers, label: "Templates" },
      { to: "/bulk-create", icon: Upload, label: "Bulk Create" },
    ],
  },
  {
    label: "Distribute",
    items: [
      { to: "/campaigns", icon: Megaphone, label: "Campaigns" },
      { to: "/schedule", icon: Calendar, label: "Scheduler" },
      { to: "/social-connections", icon: Globe, label: "Social Connections" },
    ],
  },
  {
    label: "Analyze",
    items: [
      { to: "/analytics", icon: BarChart3, label: "Analytics" },
      { to: "/analytics-hub", icon: BarChart3, label: "Analytics Hub" },
      { to: "/ab-testing", icon: FlaskConical, label: "A/B Testing" },
      { to: "/leads", icon: Zap, label: "Leads" },
    ],
  },
  {
    label: "Manage",
    items: [
      { to: "/brands", icon: Palette, label: "Brands" },
      { to: "/team", icon: Users, label: "Team" },
      { to: "/white-label", icon: Palette, label: "White Label" },
      { to: "/account-settings", icon: Settings, label: "Settings" },
    ],
  },
];

const DashboardLayout = ({ children }: { children: React.ReactNode }) => {
  const location = useLocation();

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <aside className="hidden lg:flex w-64 flex-col border-r border-border bg-sidebar overflow-y-auto">
        <div className="p-4 border-b border-border">
          <Link to="/" className="flex items-center gap-2">
            <img src={matangoIcon} alt="matango.ai" className="h-7 w-7 rounded-lg" />
            <span className="font-display text-sm font-semibold">
              matango<span className="text-primary">.ai</span>
            </span>
          </Link>
        </div>

        <nav className="flex-1 p-3 space-y-5">
          {navGroups.map((group) => (
            <div key={group.label}>
              <span className="px-3 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                {group.label}
              </span>
              <ul className="mt-1.5 space-y-0.5">
                {group.items.map((item) => {
                  const isActive = location.pathname === item.to;
                  return (
                    <li key={item.to}>
                      <Link
                        to={item.to}
                        className={`flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition-colors ${
                          isActive
                            ? "bg-primary/10 text-primary font-medium"
                            : "text-muted-foreground hover:text-foreground hover:bg-secondary"
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
          ))}
        </nav>

        <div className="p-3 border-t border-border">
          <Link
            to="/account-settings"
            className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
          >
            <UserCircle className="h-4 w-4" />
            Account
          </Link>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-y-auto">
        {children}
      </main>
    </div>
  );
};

export default DashboardLayout;
