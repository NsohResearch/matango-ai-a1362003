import { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Loader2, TrendingUp, DollarSign, Zap, Image, Video, BarChart3, RefreshCw } from "lucide-react";
import { useUsageEvents, useProfile } from "@/hooks/useData";

type TimeRange = "7d" | "30d" | "90d";

const PLAN_LIMITS: Record<string, number> = {
  free: 50,
  basic: 500,
  agency: 999999,
  enterprise: 999999,
};

export default function UsageAnalyticsPage() {
  const [timeRange, setTimeRange] = useState<TimeRange>("30d");
  const { data: events, isLoading } = useUsageEvents(timeRange);
  const { data: profile } = useProfile();

  const totalCredits = events?.reduce((s, e) => s + (e.credits_used || 0), 0) || 0;
  const aiGenerations = events?.filter(e => e.event_type === "ai_generation").length || 0;
  const imageCreations = events?.filter(e => e.event_type === "image_generation").length || 0;
  const videoCreations = events?.filter(e => e.event_type === "video_job").length || 0;
  const aaoExecutions = events?.filter(e => e.event_type === "aao_execution").length || 0;

  const planLimit = PLAN_LIMITS[profile?.plan || "free"] || 50;
  const creditsRemaining = Math.max(0, (profile?.credits || 0));
  const usagePercent = planLimit > 0 ? Math.min(100, (totalCredits / planLimit) * 100) : 0;

  const stats = [
    { label: "AI Generations", value: aiGenerations.toString(), icon: Zap, change: 0 },
    { label: "Images Created", value: imageCreations.toString(), icon: Image, change: 0 },
    { label: "Videos Created", value: videoCreations.toString(), icon: Video, change: 0 },
    { label: "Credits Used", value: totalCredits.toString(), icon: DollarSign, change: 0 },
  ];

  const providers = [
    { name: "Built-in AI", usage: totalCredits, limit: planLimit === 999999 ? null : planLimit, unit: "credits" },
    { name: "AAO Executions", usage: aaoExecutions, limit: null, unit: "runs" },
  ];

  return (
    <DashboardLayout>
      <div className="p-8 max-w-5xl">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="font-display text-3xl font-bold">Usage Analytics</h1>
            <p className="text-muted-foreground">Track your platform usage and AI credit consumption.</p>
          </div>
          <Select value={timeRange} onValueChange={(v) => setTimeRange(v as TimeRange)}>
            <SelectTrigger className="w-32"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 90 days</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Credit bar */}
        <Card className="mb-6">
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-2">
              <div>
                <span className="text-sm font-medium">Plan: </span>
                <Badge variant="secondary" className="capitalize">{profile?.plan || "free"}</Badge>
              </div>
              <span className="text-sm text-muted-foreground">{creditsRemaining} credits remaining</span>
            </div>
            <Progress value={usagePercent} className="h-2" />
            <p className="text-xs text-muted-foreground mt-1">{totalCredits} of {planLimit === 999999 ? "∞" : planLimit} credits used this period</p>
          </CardContent>
        </Card>

        {isLoading ? (
          <div className="flex items-center justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
        ) : (
          <>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              {stats.map((s) => (
                <Card key={s.label}>
                  <CardContent className="p-5">
                    <div className="flex items-center justify-between mb-1">
                      <s.icon className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <p className="text-2xl font-bold font-display">{s.value}</p>
                    <p className="text-xs text-muted-foreground">{s.label}</p>
                  </CardContent>
                </Card>
              ))}
            </div>

            <Card>
              <CardHeader><CardTitle className="text-sm font-display">Provider Usage</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                {providers.map((p) => (
                  <div key={p.name}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm">{p.name}</span>
                      <span className="text-xs text-muted-foreground">
                        {p.usage} {p.unit}{p.limit ? ` / ${p.limit}` : ""}
                      </span>
                    </div>
                    {p.limit && <Progress value={(p.usage / p.limit) * 100} className="h-1.5" />}
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Recent events */}
            {events && events.length > 0 && (
              <Card className="mt-6">
                <CardHeader><CardTitle className="text-sm font-display">Recent Activity</CardTitle></CardHeader>
                <CardContent>
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {events.slice(0, 20).map((event) => (
                      <div key={event.id} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="text-[10px] capitalize">{event.event_type.replace("_", " ")}</Badge>
                          <span className="text-xs text-muted-foreground">{new Date(event.created_at).toLocaleString()}</span>
                        </div>
                        <span className="text-xs font-medium">-{event.credits_used} credits</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </>
        )}
      </div>
    </DashboardLayout>
  );
}
