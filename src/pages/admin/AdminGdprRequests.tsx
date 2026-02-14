import { useState } from "react";
import { AdminLayout } from "@/pages/Admin";
import { Search, FileText, Download, Trash2, CheckCircle, Clock, AlertTriangle, Loader2, User, Play } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useGdprRequests } from "@/hooks/useData";
import { gdprProcess } from "@/lib/edge-functions";
import { toast } from "sonner";

const statusColors: Record<string, string> = {
  pending: "bg-yellow-500/20 text-yellow-400",
  processing: "bg-blue-500/20 text-blue-400",
  completed: "bg-primary/20 text-primary",
  failed: "bg-destructive/20 text-destructive",
};

const statusIcons: Record<string, any> = {
  pending: Clock,
  processing: Loader2,
  completed: CheckCircle,
  failed: AlertTriangle,
};

export default function AdminGdprRequests() {
  const { data: requests, isLoading, refetch } = useGdprRequests();
  const [searchQuery, setSearchQuery] = useState("");
  const [processingId, setProcessingId] = useState<string | null>(null);

  const filtered = requests?.filter(r =>
    !searchQuery || r.request_type.includes(searchQuery.toLowerCase()) || r.status.includes(searchQuery.toLowerCase())
  ) || [];

  const stats = {
    pending: filtered.filter(r => r.status === "pending").length,
    processing: filtered.filter(r => r.status === "processing").length,
    completed: filtered.filter(r => r.status === "completed").length,
    failed: filtered.filter(r => r.status === "failed").length,
  };

  const handleProcessDeletion = async (requestId: string) => {
    if (!confirm("This will permanently delete all user data. Are you sure?")) return;
    setProcessingId(requestId);
    try {
      await gdprProcess("process_deletion", requestId);
      toast.success("Deletion request processed successfully.");
      refetch();
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setProcessingId(null);
    }
  };

  const handleExport = async (requestId: string) => {
    setProcessingId(requestId);
    try {
      const result = await gdprProcess("export_data", requestId);
      // Download as JSON
      const blob = new Blob([JSON.stringify(result.export, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `gdpr-export-${requestId}.json`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success("Data exported successfully.");
      refetch();
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <AdminLayout title="GDPR Requests" description="Process data access and deletion requests.">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Card><CardContent className="p-5"><p className="text-sm text-muted-foreground">Pending</p><p className="text-2xl font-bold font-display text-yellow-500">{stats.pending}</p></CardContent></Card>
        <Card><CardContent className="p-5"><p className="text-sm text-muted-foreground">Processing</p><p className="text-2xl font-bold font-display text-blue-500">{stats.processing}</p></CardContent></Card>
        <Card><CardContent className="p-5"><p className="text-sm text-muted-foreground">Completed</p><p className="text-2xl font-bold font-display text-primary">{stats.completed}</p></CardContent></Card>
        <Card><CardContent className="p-5"><p className="text-sm text-muted-foreground">Failed</p><p className="text-2xl font-bold font-display text-destructive">{stats.failed}</p></CardContent></Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-display">Data Requests</CardTitle>
            <Button variant="outline" size="sm"><Download className="h-3 w-3 mr-1" /> Export All</Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search requests..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-9" />
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-8"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-8">
              <FileText className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
              <p className="text-muted-foreground">No GDPR requests.</p>
              <p className="text-xs text-muted-foreground mt-1">Requests will appear here when users submit data access or deletion requests.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filtered.map((req) => {
                const StatusIcon = statusIcons[req.status] || Clock;
                return (
                  <div key={req.id} className="flex items-center justify-between p-4 rounded-lg border border-border">
                    <div className="flex items-center gap-3">
                      <StatusIcon className={`h-4 w-4 ${req.status === "processing" ? "animate-spin" : ""}`} />
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium capitalize">{req.request_type} Request</span>
                          <Badge className={statusColors[req.status]}>{req.status}</Badge>
                        </div>
                        <span className="text-xs text-muted-foreground">
                          {new Date(req.created_at).toLocaleDateString()} · User: {req.user_id.slice(0, 8)}...
                        </span>
                      </div>
                    </div>
                    {req.status === "pending" && (
                      <div className="flex gap-2">
                        {req.request_type === "export" && (
                          <Button size="sm" variant="outline" onClick={() => handleExport(req.id)} disabled={processingId === req.id}>
                            {processingId === req.id ? <Loader2 className="h-3 w-3 animate-spin" /> : <Download className="h-3 w-3 mr-1" />}
                            Export
                          </Button>
                        )}
                        {req.request_type === "deletion" && (
                          <Button size="sm" variant="destructive" onClick={() => handleProcessDeletion(req.id)} disabled={processingId === req.id}>
                            {processingId === req.id ? <Loader2 className="h-3 w-3 animate-spin" /> : <Trash2 className="h-3 w-3 mr-1" />}
                            Process
                          </Button>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </AdminLayout>
  );
}
