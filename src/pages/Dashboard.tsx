import DashboardLayout from "@/components/DashboardLayout";
import GrowthLoopCard from "@/components/GrowthLoopCard";
import AAOActivityWidget from "@/components/AAOActivityWidget";
import { BarChart3, Brain, Users, Video, Megaphone, Calendar } from "lucide-react";
import { Link } from "react-router-dom";

const quickLinks = [
  { to: "/brand-brain", icon: Brain, label: "Brand Brain", desc: "Define your brand memory" },
  { to: "/influencer-studio", icon: Users, label: "Influencer Studio", desc: "Create AI influencers" },
  { to: "/video-studio", icon: Video, label: "Video Studio", desc: "Generate videos" },
  { to: "/campaign-factory", icon: Megaphone, label: "Campaign Factory", desc: "Launch campaigns" },
  { to: "/schedule", icon: Calendar, label: "Scheduler", desc: "Schedule & publish" },
  { to: "/analytics-hub", icon: BarChart3, label: "Analytics", desc: "Track performance" },
];

const Dashboard = () => {
  return (
    <DashboardLayout>
      <div className="p-8">
        <h1 className="font-display text-3xl font-semibold text-foreground">Dashboard</h1>
        <p className="mt-2 text-muted-foreground">Your AI marketing command center.</p>

        <div className="mt-8 grid lg:grid-cols-3 gap-6">
          {/* Growth Loop + Activity */}
          <div className="lg:col-span-1 space-y-6">
            <GrowthLoopCard />
            <AAOActivityWidget compact />
          </div>

          {/* Quick Links */}
          <div className="lg:col-span-2">
            <h2 className="font-display text-lg font-semibold mb-4">Quick Access</h2>
            <div className="grid sm:grid-cols-2 gap-4">
              {quickLinks.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  className="bg-card border border-border rounded-xl p-6 hover:border-accent/30 hover:shadow-luxury-sm transition-all group"
                >
                  <link.icon className="h-8 w-8 text-accent mb-3 group-hover:scale-105 transition-transform" strokeWidth={1.5} />
                  <h3 className="font-display font-semibold text-card-foreground">{link.label}</h3>
                  <p className="text-sm text-muted-foreground mt-1">{link.desc}</p>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;
