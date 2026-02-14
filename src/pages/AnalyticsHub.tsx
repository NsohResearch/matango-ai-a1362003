import DashboardLayout from "@/components/DashboardLayout";
import WorkflowNav from "@/components/WorkflowNav";
import { BarChart3, TrendingUp, Users, Eye, Heart, Share2, Loader2 } from "lucide-react";
import { useAnalyticsData } from "@/hooks/useData";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from "recharts";

const AnalyticsHubPage = () => {
  const { data: analytics, isLoading } = useAnalyticsData();

  const totals = analytics?.reduce(
    (acc, d) => ({
      views: acc.views + (d.views || 0),
      likes: acc.likes + (d.likes || 0),
      shares: acc.shares + (d.shares || 0),
      comments: acc.comments + (d.comments || 0),
      followers: Math.max(acc.followers, d.followers || 0),
    }),
    { views: 0, likes: 0, shares: 0, comments: 0, followers: 0 }
  ) || { views: 0, likes: 0, shares: 0, comments: 0, followers: 0 };

  const chartData = analytics?.slice(0, 14).reverse().map((d) => ({
    date: new Date(d.date).toLocaleDateString("en", { month: "short", day: "numeric" }),
    views: d.views || 0,
    likes: d.likes || 0,
    engagement: d.engagement_rate || 0,
  })) || [];

  const statCards = [
    { label: "Total Views", value: totals.views.toLocaleString(), icon: Eye, change: "+12.5%" },
    { label: "Total Likes", value: totals.likes.toLocaleString(), icon: Heart, change: "+8.3%" },
    { label: "Total Shares", value: totals.shares.toLocaleString(), icon: Share2, change: "+15.2%" },
    { label: "Followers", value: totals.followers.toLocaleString(), icon: Users, change: "+3.1%" },
  ];

  return (
    <DashboardLayout>
      <div className="p-6 lg:p-8 max-w-6xl">
        <WorkflowNav />
        <div className="mb-6">
          <h1 className="font-display text-3xl font-bold flex items-center gap-2">
            <BarChart3 className="h-8 w-8 text-primary" /> Analytics Hub
          </h1>
          <p className="mt-1 text-muted-foreground">Unified performance dashboard with AI-powered insights.</p>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
        ) : (
          <>
            {/* Stats grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              {statCards.map((stat) => (
                <div key={stat.label} className="glass-card rounded-xl p-5">
                  <div className="flex items-center justify-between mb-3">
                    <stat.icon className="h-5 w-5 text-muted-foreground" />
                    <span className="text-xs text-primary font-medium flex items-center gap-1">
                      <TrendingUp className="h-3 w-3" /> {stat.change}
                    </span>
                  </div>
                  <div className="text-2xl font-bold font-display">{stat.value}</div>
                  <div className="text-xs text-muted-foreground mt-1">{stat.label}</div>
                </div>
              ))}
            </div>

            {/* Charts */}
            <div className="grid lg:grid-cols-2 gap-6">
              <div className="glass-card rounded-xl p-5">
                <h3 className="font-display font-semibold mb-4">Views Over Time</h3>
                <ResponsiveContainer width="100%" height={250}>
                  <AreaChart data={chartData}>
                    <defs>
                      <linearGradient id="viewsGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(162, 72%, 45%)" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="hsl(162, 72%, 45%)" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsla(174, 20%, 14%, 0.5)" />
                    <XAxis dataKey="date" tick={{ fontSize: 11, fill: "hsl(160, 8%, 50%)" }} />
                    <YAxis tick={{ fontSize: 11, fill: "hsl(160, 8%, 50%)" }} />
                    <Tooltip contentStyle={{ background: "hsl(174, 25%, 8%)", border: "1px solid hsl(174, 20%, 14%)", borderRadius: "8px", color: "hsl(160, 15%, 90%)" }} />
                    <Area type="monotone" dataKey="views" stroke="hsl(162, 72%, 45%)" fill="url(#viewsGradient)" strokeWidth={2} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              <div className="glass-card rounded-xl p-5">
                <h3 className="font-display font-semibold mb-4">Engagement</h3>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsla(174, 20%, 14%, 0.5)" />
                    <XAxis dataKey="date" tick={{ fontSize: 11, fill: "hsl(160, 8%, 50%)" }} />
                    <YAxis tick={{ fontSize: 11, fill: "hsl(160, 8%, 50%)" }} />
                    <Tooltip contentStyle={{ background: "hsl(174, 25%, 8%)", border: "1px solid hsl(174, 20%, 14%)", borderRadius: "8px", color: "hsl(160, 15%, 90%)" }} />
                    <Bar dataKey="likes" fill="hsl(162, 72%, 45%)" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Empty state for insights */}
            {analytics && analytics.length === 0 && (
              <div className="glass-card rounded-xl p-12 text-center mt-6">
                <BarChart3 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="font-display text-lg font-semibold mb-2">No analytics data yet</h3>
                <p className="text-sm text-muted-foreground">Start publishing content to see your performance metrics.</p>
              </div>
            )}
          </>
        )}
      </div>
    </DashboardLayout>
  );
};

export default AnalyticsHubPage;
