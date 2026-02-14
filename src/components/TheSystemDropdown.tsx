import { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import { ChevronDown, Brain, Users, FileText, Video, Rocket, Library, BookOpen, Layers, Megaphone, Sparkles, Calendar, Target, BarChart3, FlaskConical, Share2, Palette, Plug, TrendingUp, Settings } from "lucide-react";

interface SystemItem {
  to: string;
  icon: React.ElementType;
  label: string;
  desc: string;
  tag: string;
}

interface SystemGroup {
  label: string;
  items: SystemItem[];
}

const systemGroups: SystemGroup[] = [
  {
    label: "Build & Create",
    items: [
      { to: "/brand-brain", icon: Brain, label: "Brand Brain", desc: "Your brand memory", tag: "Build" },
      { to: "/influencer-studio", icon: Users, label: "Influencer Studio", desc: "Upload, train & create", tag: "Create" },
      { to: "/video-scripts", icon: FileText, label: "Video Scripts", desc: "AI script generator", tag: "Script" },
      { to: "/video-studio", icon: Video, label: "Video Studio", desc: "Generate & edit videos", tag: "Produce" },
      { to: "/aao-studio", icon: Rocket, label: "AAO Studio", desc: "Deploy AI operators", tag: "Deploy" },
      { to: "/asset-library", icon: Library, label: "Asset Library", desc: "Create & manage images", tag: "Create" },
      { to: "/story-studio", icon: BookOpen, label: "Story Studio", desc: "Multi-scene stories", tag: "Story" },
      { to: "/bulk-create", icon: Layers, label: "Bulk Create", desc: "Mass image generation", tag: "Batch" },
      { to: "/campaign-factory", icon: Megaphone, label: "Campaign Factory", desc: "Multi-channel assets", tag: "Generate" },
      { to: "/meet-kah", icon: Sparkles, label: "Meet K'ah", desc: "Our lead AAO", tag: "Meet" },
    ],
  },
  {
    label: "Publish & Learn",
    items: [
      { to: "/schedule", icon: Calendar, label: "Publish & Track", desc: "Schedule everywhere", tag: "Publish" },
      { to: "/leads", icon: Target, label: "Leads & CRM", desc: "Capture & nurture", tag: "Capture" },
      { to: "/analytics-hub", icon: BarChart3, label: "Analytics Hub", desc: "Unified insights", tag: "Learn" },
      { to: "/ab-testing", icon: FlaskConical, label: "A/B Testing", desc: "Optimize campaigns", tag: "Test" },
    ],
  },
  {
    label: "Scale & Customize",
    items: [
      { to: "/team", icon: Share2, label: "Team & Sharing", desc: "Collaborate", tag: "Share" },
      { to: "/white-label", icon: Palette, label: "White Label", desc: "Custom branding", tag: "Brand" },
      { to: "/ai-providers", icon: Plug, label: "AI Providers", desc: "BYOK API keys", tag: "Connect" },
      { to: "/usage-analytics", icon: TrendingUp, label: "Usage Analytics", desc: "Cost & usage tracking", tag: "Track" },
      { to: "/account-settings", icon: Settings, label: "Account Settings", desc: "Manage your account", tag: "Settings" },
    ],
  },
];

const TheSystemDropdown = () => {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1 text-sm text-cream-100/70 hover:text-gold-400 transition-colors"
      >
        The System <ChevronDown className={`h-3 w-3 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <div className="absolute top-full left-0 mt-2 w-[360px] bg-emerald-900 border border-emerald-800/50 rounded-xl shadow-luxury overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="max-h-[70vh] overflow-y-auto py-2">
            {systemGroups.map((group) => (
              <div key={group.label}>
                <div className="px-4 pt-3 pb-1">
                  <span className="text-[10px] font-semibold uppercase tracking-widest text-cream-100/30">
                    {group.label}
                  </span>
                </div>
                {group.items.map((item) => (
                  <Link
                    key={item.to}
                    to={item.to}
                    onClick={() => setOpen(false)}
                    className="flex items-center gap-3 px-4 py-2.5 hover:bg-emerald-800/50 transition-colors group"
                  >
                    <item.icon className="h-4 w-4 text-primary shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-cream-50 group-hover:text-gold-400 transition-colors">
                        {item.label}
                      </div>
                      <div className="text-[11px] text-cream-100/40">{item.desc}</div>
                    </div>
                    <span className="text-[10px] font-medium text-primary/70 shrink-0">{item.tag}</span>
                  </Link>
                ))}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default TheSystemDropdown;
