import { useState } from "react";
import { AdminLayout } from "@/pages/Admin";
import { Shield, FileText, Download, Clock, Search, CheckCircle, AlertTriangle, Globe, Lock } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const complianceItems = [
  { framework: "GDPR", status: "compliant" as const, lastAudit: "2026-01-15", articles: ["Art. 15 - Access", "Art. 17 - Erasure", "Art. 20 - Portability"] },
  { framework: "SOC 2 Type II", status: "in_progress" as const, lastAudit: "—", articles: ["Trust Services Criteria"] },
  { framework: "CCPA", status: "compliant" as const, lastAudit: "2026-01-10", articles: ["Right to Know", "Right to Delete", "Right to Opt-Out"] },
];

const statusColors = { compliant: "bg-primary/20 text-primary", in_progress: "bg-yellow-500/20 text-yellow-400", non_compliant: "bg-destructive/20 text-destructive" };

export default function AdminCompliance() {
  return (
    <AdminLayout title="Compliance" description="Platform compliance management.">
      <div className="grid grid-cols-3 gap-4 mb-8">
        <Card><CardContent className="p-5"><p className="text-sm text-muted-foreground">Pending Requests</p><p className="text-2xl font-bold font-display">0</p></CardContent></Card>
        <Card><CardContent className="p-5"><p className="text-sm text-muted-foreground">Completed This Month</p><p className="text-2xl font-bold font-display text-primary">0</p></CardContent></Card>
        <Card><CardContent className="p-5"><p className="text-sm text-muted-foreground">Avg Processing Time</p><p className="text-2xl font-bold font-display">—</p></CardContent></Card>
      </div>

      <div className="space-y-4">
        {complianceItems.map((item) => (
          <Card key={item.framework}>
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <Shield className="h-5 w-5 text-primary" />
                  <div>
                    <h3 className="font-medium">{item.framework}</h3>
                    <p className="text-xs text-muted-foreground">Last audit: {item.lastAudit}</p>
                  </div>
                </div>
                <Badge className={statusColors[item.status]}>{item.status.replace("_", " ")}</Badge>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {item.articles.map((a) => <Badge key={a} variant="secondary" className="text-[10px]">{a}</Badge>)}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </AdminLayout>
  );
}
