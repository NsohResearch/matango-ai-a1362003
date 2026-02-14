import { useState } from "react";
import { AdminLayout } from "@/pages/Admin";
import { Activity, Server, Database, Cpu, Clock, CheckCircle, RefreshCw, BarChart3 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

const metrics = [
  { name: "CPU Usage", value: 45, max: 100, unit: "%", status: "healthy" as const },
  { name: "Memory Usage", value: 68, max: 100, unit: "%", status: "healthy" as const },
  { name: "Disk Usage", value: 72, max: 100, unit: "%", status: "warning" as const },
  { name: "Network I/O", value: 125, max: 1000, unit: "MB/s", status: "healthy" as const },
];

const queues = [
  { name: "image-generation", pending: 0, processing: 0, completed: 0, failed: 0, status: "running" as const },
  { name: "video-generation", pending: 0, processing: 0, completed: 0, failed: 0, status: "running" as const },
  { name: "email-delivery", pending: 0, processing: 0, completed: 0, failed: 0, status: "running" as const },
];

const services = [
  { name: "API Gateway", status: "operational" as const, uptime: 99.98, responseTime: 45 },
  { name: "Database", status: "operational" as const, uptime: 99.99, responseTime: 12 },
  { name: "AI Gateway", status: "operational" as const, uptime: 99.95, responseTime: 230 },
  { name: "Storage", status: "operational" as const, uptime: 99.99, responseTime: 8 },
  { name: "Auth Service", status: "operational" as const, uptime: 100, responseTime: 15 },
];

const statusColor = { healthy: "text-primary", warning: "text-yellow-500", critical: "text-destructive" };
const serviceColor = { operational: "bg-primary", degraded: "bg-yellow-500", outage: "bg-destructive" };

export default function AdminSystemHealth() {
  return (
    <AdminLayout title="System Health" description="Monitor platform status and performance.">
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {metrics.map((m) => (
          <Card key={m.name}>
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-muted-foreground">{m.name}</span>
                <span className={`text-sm font-bold ${statusColor[m.status]}`}>{m.value}{m.unit}</span>
              </div>
              <Progress value={(m.value / m.max) * 100} className="h-1.5" />
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader><CardTitle className="text-sm font-display">Services</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {services.map((s) => (
              <div key={s.name} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${serviceColor[s.status]}`} />
                  <span className="text-sm">{s.name}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs text-muted-foreground">{s.responseTime}ms</span>
                  <Badge variant="secondary" className="text-[10px]">{s.uptime}%</Badge>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-sm font-display">Job Queues</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {queues.map((q) => (
              <div key={q.name} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${q.status === "running" ? "bg-primary" : "bg-yellow-500"}`} />
                  <span className="text-sm font-mono">{q.name}</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <span>P:{q.pending}</span>
                  <span>C:{q.completed}</span>
                  <span>F:{q.failed}</span>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
