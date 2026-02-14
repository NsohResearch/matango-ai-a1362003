import { useState } from "react";
import { AdminLayout } from "@/pages/Admin";
import { Shield, AlertTriangle, CheckCircle, Eye, Image, Video, MessageSquare, User, Search, ThumbsUp, ThumbsDown } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const stats = { pending: 0, approvedToday: 0, rejectedToday: 0, escalatedToday: 0 };

export default function AdminModeration() {
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <AdminLayout title="Moderation" description="Review flagged content.">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Card><CardContent className="p-5"><p className="text-sm text-muted-foreground">Pending Review</p><p className="text-2xl font-bold font-display text-yellow-500">{stats.pending}</p></CardContent></Card>
        <Card><CardContent className="p-5"><p className="text-sm text-muted-foreground">Approved Today</p><p className="text-2xl font-bold font-display text-primary">{stats.approvedToday}</p></CardContent></Card>
        <Card><CardContent className="p-5"><p className="text-sm text-muted-foreground">Rejected Today</p><p className="text-2xl font-bold font-display text-destructive">{stats.rejectedToday}</p></CardContent></Card>
        <Card><CardContent className="p-5"><p className="text-sm text-muted-foreground">Escalated</p><p className="text-2xl font-bold font-display text-purple-500">{stats.escalatedToday}</p></CardContent></Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-display">Flagged Content</CardTitle>
            <div className="relative w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-9" />
            </div>
          </div>
        </CardHeader>
        <CardContent className="py-12 text-center">
          <Shield className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
          <p className="text-muted-foreground">No content flagged for moderation.</p>
          <p className="text-xs text-muted-foreground mt-1">Content will appear here when users or AI systems flag items for review.</p>
        </CardContent>
      </Card>
    </AdminLayout>
  );
}
