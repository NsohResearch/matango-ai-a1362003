import { useState } from "react";
import { AdminLayout } from "@/pages/Admin";
import { DollarSign, TrendingUp, CreditCard, Users, Search, Download, ChevronLeft, ChevronRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const statusColors: Record<string, string> = {
  active: "bg-primary/20 text-primary",
  trialing: "bg-blue-500/20 text-blue-400",
  past_due: "bg-destructive/20 text-destructive",
  canceled: "bg-muted text-muted-foreground",
  paused: "bg-yellow-500/20 text-yellow-400",
};

const mockStats = { mrr: 0, arr: 0, mrrGrowth: 0, churnRate: 0, activeSubscriptions: 0, trialConversions: 0 };

export default function AdminBilling() {
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <AdminLayout title="Billing" description="Manage subscriptions and revenue.">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Card><CardContent className="p-5"><p className="text-sm text-muted-foreground">MRR</p><p className="text-2xl font-bold font-display">${mockStats.mrr.toLocaleString()}</p><div className="flex items-center gap-1 mt-1"><TrendingUp className="w-3 h-3 text-primary" /><span className="text-xs text-primary">+{mockStats.mrrGrowth}%</span></div></CardContent></Card>
        <Card><CardContent className="p-5"><p className="text-sm text-muted-foreground">ARR</p><p className="text-2xl font-bold font-display">${mockStats.arr.toLocaleString()}</p></CardContent></Card>
        <Card><CardContent className="p-5"><p className="text-sm text-muted-foreground">Active Subs</p><p className="text-2xl font-bold font-display">{mockStats.activeSubscriptions}</p></CardContent></Card>
        <Card><CardContent className="p-5"><p className="text-sm text-muted-foreground">Churn Rate</p><p className="text-2xl font-bold font-display">{mockStats.churnRate}%</p></CardContent></Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-display">Subscriptions</CardTitle>
            <Button variant="outline" size="sm"><Download className="h-3 w-3 mr-1" /> Export</Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search subscriptions..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-9" />
          </div>
          <div className="text-center py-8 text-muted-foreground">
            <CreditCard className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
            <p>Billing data will appear after Stripe integration is connected.</p>
          </div>
        </CardContent>
      </Card>
    </AdminLayout>
  );
}
