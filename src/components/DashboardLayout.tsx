import { Link, useLocation } from "react-router-dom";
import {
  Brain, Users, Video, Megaphone, Calendar, BarChart3,
  LayoutDashboard, Palette, Settings, Zap, Globe, FlaskConical,
  FileText, Library, BookOpen, UserCircle, Layers, Upload,
  Rocket, Sparkles, Plug, TrendingUp, Target, Share2
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
      { to: "/video-scripts", icon: FileText, label: "Video Scripts" },
      { to: "/video-studio", icon: Video, label: "Video Studio" },
      { to: "/aao-studio", icon: Rocket, label: "AAO Studio" },
      { to: "/asset-library", icon: Library, label: "Asset Library" },
      { to: "/story-studio", icon: BookOpen, label: "Story Studio" },
      { to: "/bulk-create", icon: Upload, label: "Bulk Create" },
    ],
  },
  {
    label: "Distribute",
    items: [
      { to: "/schedule", icon: Calendar, label: "Publish & Track" },
      { to: "/social-connections", icon: Globe, label: "Social Connections" },
      { to: "/leads", icon: Target, label: "Leads & CRM" },
    ],
  },
  {
    label: "Analyze",
    items: [
      { to: "/analytics-hub", icon: BarChart3, label: "Analytics Hub" },
      { to: "/ab-testing", icon: FlaskConical, label: "A/B Testing" },
    ],
  },
  {
    label: "Scale",
    items: [
      { to: "/team", icon: Share2, label: "Team & Sharing" },
      { to: "/brands", icon: Palette, label: "Brands" },
      { to: "/white-label", icon: Palette, label: "White Label" },
      { to: "/ai-providers", icon: Plug, label: "AI Providers" },
      { to: "/usage-analytics", icon: TrendingUp, label: "Usage Analytics" },
    ],
  },
];

const DashboardLayout = ({ children }: { children: React.ReactNode }) => {
  const location = useLocation();

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
          {navGroups.map((group) => (
            <div key={group.label}>
              <span className="px-3 text-[10px] font-semibold uppercase tracking-widest text-cream-100/30">
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
          ))}
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
        {children}
      </main>
    </div>
  );
};

export default DashboardLayout;
