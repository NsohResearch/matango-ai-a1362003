import DashboardLayout from "@/components/DashboardLayout";
import { BarChart3, Brain, Users, Video, Megaphone, Calendar } from "lucide-react";
import { Link } from "react-router-dom";

const quickLinks = [
  { to: "/brand-brain", icon: Brain, label: "Brand Brain", desc: "Define your brand memory" },
  { to: "/influencer-studio", icon: Users, label: "Influencer Studio", desc: "Create AI influencers" },
  { to: "/video-studio", icon: Video, label: "Video Studio", desc: "Generate videos" },
  { to: "/campaign-factory", icon: Megaphone, label: "Campaign Factory", desc: "Launch campaigns" },
  { to: "/schedule", icon: Calendar, label: "Scheduler", desc: "Schedule & publish" },
  { to: "/analytics", icon: BarChart3, label: "Analytics", desc: "Track performance" },
];

const Dashboard = () => {
  return (
    <DashboardLayout>
      <div className="p-8">
        <h1 className="font-display text-3xl font-bold">Dashboard</h1>
        <p className="mt-2 text-muted-foreground">Your AI marketing command center.</p>

        <div className="mt-8 grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {quickLinks.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className="glass-card rounded-xl p-6 hover:bg-secondary/50 transition-colors group"
            >
              <link.icon className="h-8 w-8 text-primary mb-3 group-hover:scale-110 transition-transform" />
              <h3 className="font-display font-semibold">{link.label}</h3>
              <p className="text-sm text-muted-foreground mt-1">{link.desc}</p>
            </Link>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;
