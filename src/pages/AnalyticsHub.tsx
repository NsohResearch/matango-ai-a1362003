import { useState, useMemo } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import WorkflowNav from "@/components/WorkflowNav";
import { BarChart3, TrendingUp, Users, Eye, Heart, Share2, Loader2, Sparkles, RefreshCw } from "lucide-react";
import { useAnalyticsData, useAutoInsights, useAnalyticsByPlatform } from "@/hooks/useData";
import { analyticsSeed } from "@/lib/edge-functions";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from "recharts";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";

type TimeRange = "7d" | "30d" | "90d";

const AnalyticsHubPage = () => {
  const { data: analytics, isLoading, refetch } = useAnalyticsData();
  const { data: insights } = useAutoInsights();
  const { data: platformData } = useAnalyticsByPlatform();
  const [seeding, setSeeding] = useState(false);
  const [computingInsights, setComputingInsights] = useState(false);
  const [timeRange, setTimeRange] = useState<TimeRange>("30d");

  // Filter analytics by time range
  const filteredAnalytics = useMemo(() => {
    if (!analytics) return [];
    const days = timeRange === "7d" ? 7 : timeRange === "90d" ? 90 : 30;
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - days);
    return analytics.filter((d) => new Date(d.date) >= cutoff);
  }, [analytics, timeRange]);

  const totals = filteredAnalytics.reduce(
    (acc, d) => ({
      views: acc.views + (d.views || 0),
      likes: acc.likes + (d.likes || 0),
      shares: acc.shares + (d.shares || 0),
      comments: acc.comments + (d.comments || 0),
      followers: Math.max(acc.followers, d.followers || 0),
    }),
    { views: 0, likes: 0, shares: 0, comments: 0, followers: 0 }
  ) || { views: 0, likes: 0, shares: 0, comments: 0, followers: 0 };

  const chartData = filteredAnalytics.slice(0, 14).reverse().map((d) => ({
    date: new Date(d.date).toLocaleDateString("en", { month: "short", day: "numeric" }),
    views: d.views || 0,
    likes: d.likes || 0,
    engagement: d.engagement_rate || 0,
  })) || [];

  // Calculate real change percentages from data
  const calculateChange = (current: number, dataPoints: typeof filteredAnalytics) => {
    if (!dataPoints || dataPoints.length < 2) return null;
    const mid = Math.floor(dataPoints.length / 2);
    const recentHalf = dataPoints.slice(0, mid);
    const olderHalf = dataPoints.slice(mid);
    const recentSum = recentHalf.reduce((s, d) => s + (current === totals.views ? (d.views || 0) : current === totals.likes ? (d.likes || 0) : current === totals.shares ? (d.shares || 0) : 0), 0);
    const olderSum = olderHalf.reduce((s, d) => s + (current === totals.views ? (d.views || 0) : current === totals.likes ? (d.likes || 0) : current === totals.shares ? (d.shares || 0) : 0), 0);
    if (olderSum === 0) return null;
    return ((recentSum - olderSum) / olderSum * 100).toFixed(1);
  };

  const statCards = [
    { label: "Total Views", value: totals.views.toLocaleString(), icon: Eye, change: calculateChange(totals.views, filteredAnalytics) },
    { label: "Total Likes", value: totals.likes.toLocaleString(), icon: Heart, change: calculateChange(totals.likes, filteredAnalytics) },
    { label: "Total Shares", value: totals.shares.toLocaleString(), icon: Share2, change: calculateChange(totals.shares, filteredAnalytics) },
    { label: "Followers", value: totals.followers.toLocaleString(), icon: Users, change: null },
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
          <div className="flex gap-2 items-center">
            <Select value={timeRange} onValueChange={(v) => setTimeRange(v as TimeRange)}>
              <SelectTrigger className="w-32 h-9"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="7d">Last 7 days</SelectItem>
                <SelectItem value="30d">Last 30 days</SelectItem>
                <SelectItem value="90d">Last 90 days</SelectItem>
              </SelectContent>
            </Select>
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
                    {stat.change !== null && totals.views > 0 && (
                      <span className={`text-xs font-medium flex items-center gap-1 ${parseFloat(stat.change) >= 0 ? "text-primary" : "text-destructive"}`}>
                        <TrendingUp className="h-3 w-3" /> {parseFloat(stat.change) >= 0 ? "+" : ""}{stat.change}%
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

            {/* Platform Breakdown */}
            {platformData && platformData.length > 0 && (
              <div className="mb-8">
                <h3 className="font-display font-semibold text-sm mb-3">Platform Breakdown</h3>
                <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
                  {platformData.map((p: any) => {
                    const maxViews = Math.max(...platformData.map((x: any) => x.views || 1));
                    return (
                      <div key={p.platform} className="glass-card rounded-xl p-4">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium capitalize">{p.platform}</span>
                          <Badge variant="secondary" className="text-[10px]">{p.engagement_rate?.toFixed(1)}% eng.</Badge>
                        </div>
                        <Progress value={((p.views || 0) / maxViews) * 100} className="h-1.5 mb-2" />
                        <div className="flex gap-3 text-[10px] text-muted-foreground">
                          <span>{p.views} views</span>
                          <span>{p.likes} likes</span>
                          <span>{p.shares} shares</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
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
