import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardDescription, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { accountLifecycle } from "@/lib/edge-functions";
import {
  PauseCircle, Play, CreditCard, ArrowDownCircle, Trash2,
  RotateCcw, AlertTriangle, Loader2, Clock, ShieldAlert, Calendar,
} from "lucide-react";

interface LifecycleStatus {
  account_status: string;
  billing_status: string;
  paused_at: string | null;
  paused_reason: string | null;
  soft_deleted_at: string | null;
  hard_delete_at: string | null;
  restored_at: string | null;
  plan: string;
  recent_events: Array<{ action: string; created_at: string; metadata: unknown }>;
}

interface ConfirmModalState {
  open: boolean;
  action: string;
  title: string;
  description: string;
  confirmWord: string;
  destructive: boolean;
}

export default function DangerZonePanel({ orgName }: { orgName?: string }) {
  const [status, setStatus] = useState<LifecycleStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [modal, setModal] = useState<ConfirmModalState>({
    open: false, action: "", title: "", description: "", confirmWord: "", destructive: false,
  });
  const [confirmInput, setConfirmInput] = useState("");
  const [ack, setAck] = useState(false);
  const [reason, setReason] = useState("");

  const fetchStatus = async () => {
    try {
      const data = await accountLifecycle("get_status");
      setStatus(data as LifecycleStatus);
    } catch {
      // org may not exist yet
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchStatus(); }, []);

  const openConfirm = (action: string, title: string, description: string, destructive = true) => {
    setModal({ open: true, action, title, description, confirmWord: orgName || "CONFIRM", destructive });
    setConfirmInput("");
    setAck(false);
    setReason("");
  };

  const executeAction = async () => {
    setActionLoading(modal.action);
    try {
      const result = await accountLifecycle(modal.action, { reason: reason || undefined });
      toast.success((result as { message?: string }).message || "Action completed");
      setModal((m) => ({ ...m, open: false }));
      await fetchStatus();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Action failed");
    } finally {
      setActionLoading(null);
    }
  };

  const isConfirmValid = confirmInput === (orgName || "CONFIRM") && ack;

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const isPaused = status?.account_status === "paused";
  const isSoftDeleted = status?.account_status === "soft_deleted";
  const isBillingStopped = status?.billing_status === "billing_stopped";
  const isActive = status?.account_status === "active";
  const isPremium = status?.plan && status.plan !== "free";

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 mb-2">
        <ShieldAlert className="h-5 w-5 text-destructive" />
        <h3 className="font-display font-semibold text-destructive">Danger Zone</h3>
      </div>

      {/* Status Banners */}
      {isPaused && (
        <Alert className="border-yellow-500/50 bg-yellow-500/10">
          <PauseCircle className="h-4 w-4 text-yellow-600" />
          <AlertDescription className="text-yellow-700 dark:text-yellow-400">
            <strong>Account Paused</strong> since {status?.paused_at ? new Date(status.paused_at).toLocaleDateString() : "recently"}.
            {status?.paused_reason && <span className="block text-xs mt-1">Reason: {status.paused_reason}</span>}
            <Button size="sm" variant="outline" className="mt-2 border-yellow-500 text-yellow-700" onClick={() => openConfirm("unpause", "Reactivate Account", "This will restore full access to your account.", false)}>
              <Play className="h-3 w-3 mr-1" /> Reactivate
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {isSoftDeleted && (
        <Alert className="border-destructive/50 bg-destructive/10">
          <Trash2 className="h-4 w-4 text-destructive" />
          <AlertDescription className="text-destructive">
            <strong>Account Soft-Deleted</strong> since {status?.soft_deleted_at ? new Date(status.soft_deleted_at).toLocaleDateString() : "recently"}.
            <span className="block text-xs mt-1">
              <Calendar className="h-3 w-3 inline mr-1" />
              Permanent deletion scheduled for {status?.hard_delete_at ? new Date(status.hard_delete_at).toLocaleDateString() : "1 year from deletion"}.
              Restore within 6 months.
            </span>
            <Button size="sm" variant="outline" className="mt-2 border-destructive text-destructive" onClick={() => openConfirm("restore", "Restore Account", "This will reactivate your account and cancel the scheduled permanent deletion.", false)}>
              <RotateCcw className="h-3 w-3 mr-1" /> Restore Account
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {isBillingStopped && !isSoftDeleted && (
        <Alert className="border-orange-500/50 bg-orange-500/10">
          <CreditCard className="h-4 w-4 text-orange-600" />
          <AlertDescription className="text-orange-700 dark:text-orange-400">
            <strong>Billing Stopped.</strong> Subscription renewal has been cancelled. Access continues until the end of your billing period.
          </AlertDescription>
        </Alert>
      )}

      {/* Actions */}
      {isActive && (
        <div className="space-y-3">
          {/* Pause */}
          <Card className="border-border hover:border-yellow-500/30 transition-colors">
            <CardContent className="flex items-center justify-between p-4">
              <div className="flex items-center gap-3">
                <PauseCircle className="h-5 w-5 text-yellow-600 shrink-0" />
                <div>
                  <CardTitle className="text-sm">Pause Account</CardTitle>
                  <CardDescription className="text-xs">Temporarily disable access and publishing. Reactivate anytime.</CardDescription>
                </div>
              </div>
              <Button variant="outline" size="sm" onClick={() => openConfirm("pause", "Pause Account", "Publishing, jobs, and content generation will be blocked. Your data is retained.")}>
                Pause
              </Button>
            </CardContent>
          </Card>

          {/* Stop Billing */}
          {isPremium && !isBillingStopped && (
            <Card className="border-border hover:border-orange-500/30 transition-colors">
              <CardContent className="flex items-center justify-between p-4">
                <div className="flex items-center gap-3">
                  <CreditCard className="h-5 w-5 text-orange-600 shrink-0" />
                  <div>
                    <CardTitle className="text-sm">Stop Billing</CardTitle>
                    <CardDescription className="text-xs">Cancel renewal and stop future charges. Access continues until end of billing period.</CardDescription>
                  </div>
                </div>
                <Button variant="outline" size="sm" onClick={() => openConfirm("stop_billing", "Stop Billing", "Your subscription renewal will be cancelled. Access continues until the end of your current billing period.")}>
                  Stop
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Downgrade */}
          {isPremium && (
            <Card className="border-border hover:border-blue-500/30 transition-colors">
              <CardContent className="flex items-center justify-between p-4">
                <div className="flex items-center gap-3">
                  <ArrowDownCircle className="h-5 w-5 text-blue-600 shrink-0" />
                  <div>
                    <CardTitle className="text-sm">Downgrade to Free</CardTitle>
                    <CardDescription className="text-xs">Move to Free plan now. Premium features disabled immediately.</CardDescription>
                  </div>
                </div>
                <Button variant="outline" size="sm" onClick={() => openConfirm("downgrade", "Downgrade to Free", "Premium features will be disabled immediately. You'll receive 50 free credits/month.")}>
                  Downgrade
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Soft Delete */}
          <Card className="border-destructive/30 hover:border-destructive/50 transition-colors">
            <CardContent className="flex items-center justify-between p-4">
              <div className="flex items-center gap-3">
                <Trash2 className="h-5 w-5 text-destructive shrink-0" />
                <div>
                  <CardTitle className="text-sm text-destructive">Soft Delete Account</CardTitle>
                  <CardDescription className="text-xs">Disable and hide account. Restore anytime within 6 months.</CardDescription>
                </div>
              </div>
              <Button variant="destructive" size="sm" onClick={() => openConfirm("soft_delete", "Soft Delete Account", "Access will be disabled. Social connections revoked. Scheduled posts cancelled. Subscription cancelled. Restore within 6 months. Permanent deletion after 1 year.")}>
                Delete
              </Button>
            </CardContent>
          </Card>

          {/* Hard Delete Info */}
          <div className="rounded-lg bg-muted/50 p-4 text-xs text-muted-foreground flex items-start gap-2">
            <Clock className="h-4 w-4 shrink-0 mt-0.5" />
            <div>
              <strong>Permanent Deletion Policy:</strong> If a soft-deleted account is not restored within 6 months, it becomes permanently deleted after 1 year. This process is automated and irreversible.
            </div>
          </div>
        </div>
      )}

      {/* Recent Events */}
      {status?.recent_events && status.recent_events.length > 0 && (
        <div className="mt-6">
          <h4 className="text-sm font-medium mb-2 text-muted-foreground">Recent Lifecycle Events</h4>
          <div className="space-y-1">
            {status.recent_events.map((event, i) => (
              <div key={i} className="flex items-center gap-2 text-xs text-muted-foreground py-1 border-b border-border last:border-0">
                <Badge variant="outline" className="text-[10px] capitalize">{event.action}</Badge>
                <span>{new Date(event.created_at).toLocaleString()}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Confirmation Modal */}
      <Dialog open={modal.open} onOpenChange={(v) => !v && setModal((m) => ({ ...m, open: false }))}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className={`h-5 w-5 ${modal.destructive ? "text-destructive" : "text-yellow-600"}`} />
              {modal.title}
            </DialogTitle>
            <DialogDescription>{modal.description}</DialogDescription>
          </DialogHeader>

          <div className="space-y-4 mt-2">
            {modal.destructive && (
              <div>
                <Label className="text-sm">Reason (optional)</Label>
                <Input
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="Why are you taking this action?"
                  className="mt-1"
                />
              </div>
            )}

            <div>
              <Label className="text-sm">
                Type <strong>{orgName || "CONFIRM"}</strong> to confirm:
              </Label>
              <Input
                value={confirmInput}
                onChange={(e) => setConfirmInput(e.target.value)}
                placeholder={orgName || "CONFIRM"}
                className="mt-1"
              />
            </div>

            <div className="flex items-center gap-2">
              <Checkbox id="danger-ack" checked={ack} onCheckedChange={(v) => setAck(!!v)} />
              <Label htmlFor="danger-ack" className="text-sm">
                I understand the consequences of this action.
              </Label>
            </div>

            <div className="flex gap-2">
              <Button variant="outline" className="flex-1" onClick={() => setModal((m) => ({ ...m, open: false }))}>
                Cancel
              </Button>
              <Button
                variant={modal.destructive ? "destructive" : "default"}
                className="flex-1"
                disabled={!isConfirmValid || !!actionLoading}
                onClick={executeAction}
              >
                {actionLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Confirm"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
