import { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Loader2, TrendingUp, DollarSign, Zap, Image, Video, BarChart3 } from "lucide-react";

type TimeRange = "7d" | "30d" | "90d";

export default function UsageAnalyticsPage() {
  const [timeRange, setTimeRange] = useState<TimeRange>("30d");

  const stats = [
    { label: "Total Generations", value: "0", icon: Zap, change: 0 },
    { label: "Images Created", value: "0", icon: Image, change: 0 },
    { label: "Videos Created", value: "0", icon: Video, change: 0 },
    { label: "Estimated Cost", value: "$0.00", icon: DollarSign, change: 0 },
  ];

  const providers = [
    { name: "Built-in AI", usage: 0, limit: 100, unit: "credits" },
    { name: "OpenAI (BYOK)", usage: 0, limit: null, unit: "requests" },
    { name: "Replicate (BYOK)", usage: 0, limit: null, unit: "requests" },
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

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {stats.map((s) => (
            <Card key={s.label}>
              <CardContent className="p-5">
                <div className="flex items-center justify-between mb-1">
                  <s.icon className="h-4 w-4 text-muted-foreground" />
                  {s.change !== 0 && <div className="flex items-center gap-1"><TrendingUp className="h-3 w-3 text-primary" /><span className="text-xs text-primary">+{s.change}%</span></div>}
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
      </div>
    </DashboardLayout>
  );
}
