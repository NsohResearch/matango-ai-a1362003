import { useState } from "react";
import { AdminLayout } from "@/pages/Admin";
import { Plug, CheckCircle, AlertTriangle, RefreshCw, ExternalLink, Activity, Key, Settings } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const integrations = [
  { id: "stripe", name: "Stripe", type: "api", status: "healthy" as const, uptime: 99.99, latency: 45, desc: "Payment processing" },
  { id: "openai", name: "OpenAI", type: "api", status: "healthy" as const, uptime: 99.95, latency: 230, desc: "AI text generation" },
  { id: "replicate", name: "Replicate", type: "api", status: "healthy" as const, uptime: 99.90, latency: 1200, desc: "AI image/video generation" },
  { id: "resend", name: "Resend", type: "api", status: "healthy" as const, uptime: 99.98, latency: 35, desc: "Transactional email" },
];

const statusColors = { healthy: "bg-primary", degraded: "bg-yellow-500", down: "bg-destructive" };

export default function AdminIntegrations() {
  return (
    <AdminLayout title="Integrations" description="Manage platform-wide integrations, webhooks, and third-party connections.">
      <Tabs defaultValue="integrations">
        <TabsList className="mb-6">
          <TabsTrigger value="integrations"><Plug className="h-3.5 w-3.5 mr-1" /> Integrations</TabsTrigger>
          <TabsTrigger value="webhooks"><Activity className="h-3.5 w-3.5 mr-1" /> Webhooks</TabsTrigger>
          <TabsTrigger value="api-keys"><Key className="h-3.5 w-3.5 mr-1" /> API Keys</TabsTrigger>
        </TabsList>

        <TabsContent value="integrations">
          <div className="grid md:grid-cols-2 gap-4">
            {integrations.map((int) => (
              <Card key={int.id} className="hover:border-primary/30 transition-colors">
                <CardContent className="p-5">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="font-medium">{int.name}</h3>
                      <p className="text-xs text-muted-foreground">{int.desc}</p>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <div className={`w-2 h-2 rounded-full ${statusColors[int.status]}`} />
                      <span className="text-xs capitalize">{int.status}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <span>Uptime: {int.uptime}%</span>
                    <span>Latency: {int.latency}ms</span>
                    <Badge variant="secondary" className="text-[10px]">{int.type}</Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="webhooks">
          <Card><CardContent className="py-12 text-center"><Activity className="h-8 w-8 text-muted-foreground mx-auto mb-2" /><p className="text-muted-foreground">No webhook events recorded.</p></CardContent></Card>
        </TabsContent>

        <TabsContent value="api-keys">
          <Card><CardContent className="py-12 text-center"><Key className="h-8 w-8 text-muted-foreground mx-auto mb-2" /><p className="text-muted-foreground">API key management coming soon.</p></CardContent></Card>
        </TabsContent>
      </Tabs>
    </AdminLayout>
  );
}
