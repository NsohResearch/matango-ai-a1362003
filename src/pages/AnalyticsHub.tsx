import { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import WorkflowNav from "@/components/WorkflowNav";
import { BarChart3, TrendingUp, Users, Eye, Heart, Share2, Loader2, Sparkles, RefreshCw } from "lucide-react";
import { useAnalyticsData, useAutoInsights } from "@/hooks/useData";
import { analyticsSeed } from "@/lib/edge-functions";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from "recharts";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

const AnalyticsHubPage = () => {
  const { data: analytics, isLoading, refetch } = useAnalyticsData();
  const { data: insights } = useAutoInsights();
  const [seeding, setSeeding] = useState(false);
  const [computingInsights, setComputingInsights] = useState(false);

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

  const handleSeedData = async () => {
    setSeeding(true);
    try {
      await analyticsSeed("seed_demo");
      toast.success("Demo analytics data generated!");
      refetch();
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setSeeding(false);
    }
  };

  const handleComputeInsights = async () => {
    setComputingInsights(true);
    try {
      await analyticsSeed("compute_insights");
      toast.success("AI insights computed!");
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setComputingInsights(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="p-6 lg:p-8 max-w-6xl">
        <WorkflowNav />
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="font-display text-3xl font-bold flex items-center gap-2">
              <BarChart3 className="h-8 w-8 text-primary" /> Analytics Hub
            </h1>
            <p className="mt-1 text-muted-foreground">Unified performance dashboard with AI-powered insights.</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={handleComputeInsights} disabled={computingInsights || !analytics?.length}>
              {computingInsights ? <Loader2 className="h-3 w-3 animate-spin mr-1" /> : <Sparkles className="h-3 w-3 mr-1" />}
              AI Insights
            </Button>
          </div>
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
                    {totals.views > 0 && (
                      <span className="text-xs text-primary font-medium flex items-center gap-1">
                        <TrendingUp className="h-3 w-3" /> {stat.change}
                      </span>
                    )}
                  </div>
                  <div className="text-2xl font-bold font-display">{stat.value}</div>
                  <div className="text-xs text-muted-foreground mt-1">{stat.label}</div>
                </div>
              ))}
            </div>

            {/* AI Insights */}
            {insights && insights.length > 0 && (
              <div className="mb-8 space-y-3">
                <h3 className="font-display font-semibold text-sm flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-primary" /> AI Insights
                </h3>
                {insights.map((insight) => (
                  <div key={insight.id} className="glass-card rounded-xl p-4 flex items-start gap-3">
                    <Badge variant="secondary" className="text-[10px] capitalize shrink-0">{insight.insight_type}</Badge>
                    <div>
                      <p className="text-sm font-medium">{insight.title}</p>
                      <p className="text-xs text-muted-foreground">{insight.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Charts */}
            {chartData.length > 0 ? (
              <div className="grid lg:grid-cols-2 gap-6">
                <div className="glass-card rounded-xl p-5">
                  <h3 className="font-display font-semibold mb-4">Views Over Time</h3>
                  <ResponsiveContainer width="100%" height={250}>
                    <AreaChart data={chartData}>
                      <defs>
                        <linearGradient id="viewsGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                      <XAxis dataKey="date" tick={{ fontSize: 11 }} className="fill-muted-foreground" />
                      <YAxis tick={{ fontSize: 11 }} className="fill-muted-foreground" />
                      <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "8px", color: "hsl(var(--foreground))" }} />
                      <Area type="monotone" dataKey="views" stroke="hsl(var(--primary))" fill="url(#viewsGradient)" strokeWidth={2} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>

                <div className="glass-card rounded-xl p-5">
                  <h3 className="font-display font-semibold mb-4">Engagement</h3>
                  <ResponsiveContainer width="100%" height={250}>
                    <BarChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                      <XAxis dataKey="date" tick={{ fontSize: 11 }} className="fill-muted-foreground" />
                      <YAxis tick={{ fontSize: 11 }} className="fill-muted-foreground" />
                      <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "8px", color: "hsl(var(--foreground))" }} />
                      <Bar dataKey="likes" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            ) : (
              <div className="glass-card rounded-xl p-12 text-center">
                <BarChart3 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="font-display text-lg font-semibold mb-2">No analytics data yet</h3>
                <p className="text-sm text-muted-foreground mb-4">Generate demo data to see your dashboard in action, or start publishing content.</p>
                <Button onClick={handleSeedData} disabled={seeding}>
                  {seeding ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : <RefreshCw className="h-4 w-4 mr-1" />}
                  Generate Demo Data
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </DashboardLayout>
  );
};

export default AnalyticsHubPage;
