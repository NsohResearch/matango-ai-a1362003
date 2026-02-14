import { useState } from "react";
import { AdminLayout } from "@/pages/Admin";
import { Search, FileText, Download, Trash2, CheckCircle, Clock, AlertTriangle, Loader2, User } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const statusColors: Record<string, string> = {
  pending: "bg-yellow-500/20 text-yellow-400",
  processing: "bg-blue-500/20 text-blue-400",
  completed: "bg-primary/20 text-primary",
  failed: "bg-destructive/20 text-destructive",
};

export default function AdminGdprRequests() {
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <AdminLayout title="GDPR Requests" description="Process data access and deletion requests.">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Card><CardContent className="p-5"><p className="text-sm text-muted-foreground">Pending</p><p className="text-2xl font-bold font-display text-yellow-500">0</p></CardContent></Card>
        <Card><CardContent className="p-5"><p className="text-sm text-muted-foreground">Processing</p><p className="text-2xl font-bold font-display text-blue-500">0</p></CardContent></Card>
        <Card><CardContent className="p-5"><p className="text-sm text-muted-foreground">Completed</p><p className="text-2xl font-bold font-display text-primary">0</p></CardContent></Card>
        <Card><CardContent className="p-5"><p className="text-sm text-muted-foreground">Deadline Breaches</p><p className="text-2xl font-bold font-display text-destructive">0</p></CardContent></Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-display">Data Requests</CardTitle>
            <Button variant="outline" size="sm"><Download className="h-3 w-3 mr-1" /> Export</Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search requests..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-9" />
          </div>
          <div className="text-center py-8">
            <FileText className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
            <p className="text-muted-foreground">No pending GDPR requests.</p>
            <p className="text-xs text-muted-foreground mt-1">Requests will appear here when users submit data access or deletion requests.</p>
          </div>
        </CardContent>
      </Card>
    </AdminLayout>
  );
}
