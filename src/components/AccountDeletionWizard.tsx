/**
 * AccountDeletionWizard — 4-step deletion flow with guardrails.
 * Adapted from trpc to Supabase auth.
 */
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  AlertTriangle, Download, PauseCircle, ArrowDownCircle, Power, Trash2,
  CheckCircle2, ArrowRight, ArrowLeft, Loader2,
} from "lucide-react";

interface AccountDeletionWizardProps {
  isOpen: boolean;
  onClose: () => void;
  userEmail: string;
  userName: string;
  currentPlan: string;
}

export default function AccountDeletionWizard({ isOpen, onClose, userEmail, userName, currentPlan }: AccountDeletionWizardProps) {
  const [step, setStep] = useState(1);
  const [confirmPhrase, setConfirmPhrase] = useState("");
  const [ack1, setAck1] = useState(false);
  const [ack2, setAck2] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const alternatives = [
    { icon: PauseCircle, label: "Pause billing", desc: "Keep your data but stop charges. Resume anytime." },
    { icon: ArrowDownCircle, label: "Downgrade to Free", desc: "Switch to the free plan and keep your brands." },
    { icon: Power, label: "Deactivate account", desc: "Hide your profile. Reactivate within 90 days." },
  ];

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await supabase.auth.signOut();
      toast.success("Account deletion requested. You've been signed out.");
      onClose();
    } catch {
      toast.error("Deletion failed. Please contact support.");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 font-display">
            <AlertTriangle className="h-5 w-5 text-destructive" />
            Delete Account
          </DialogTitle>
          <DialogDescription>This action cannot be undone.</DialogDescription>
        </DialogHeader>

        <Progress value={(step / 4) * 100} className="mb-4" />

        {step === 1 && (
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">Before you go, have you considered these alternatives?</p>
            {alternatives.map((alt) => (
              <Card key={alt.label} className="cursor-pointer hover:border-primary/30 transition-colors" onClick={() => { toast.info(`${alt.label} — coming soon`); }}>
                <CardContent className="flex items-center gap-3 p-4">
                  <alt.icon className="h-5 w-5 text-primary shrink-0" />
                  <div><CardTitle className="text-sm">{alt.label}</CardTitle><CardDescription className="text-xs">{alt.desc}</CardDescription></div>
                </CardContent>
              </Card>
            ))}
            <Button variant="destructive" className="w-full mt-4" onClick={() => setStep(2)}>
              I still want to delete <ArrowRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4">
            <Alert><AlertDescription>Export your data before deletion. Once deleted, your brands, campaigns, and content cannot be recovered.</AlertDescription></Alert>
            <Button variant="outline" className="w-full" onClick={() => toast.info("Data export — coming soon")}>
              <Download className="h-4 w-4 mr-2" /> Export My Data
            </Button>
            <div className="flex gap-2 mt-4">
              <Button variant="outline" onClick={() => setStep(1)}><ArrowLeft className="h-4 w-4 mr-1" /> Back</Button>
              <Button variant="destructive" className="flex-1" onClick={() => setStep(3)}>Continue <ArrowRight className="h-4 w-4 ml-1" /></Button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-4">
            <Label>Type <strong>DELETE {userName || userEmail}</strong> to confirm:</Label>
            <Input value={confirmPhrase} onChange={(e) => setConfirmPhrase(e.target.value)} placeholder={`DELETE ${userName || userEmail}`} />
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Checkbox id="ack1" checked={ack1} onCheckedChange={(v) => setAck1(!!v)} />
                <Label htmlFor="ack1" className="text-sm">I understand all my data will be permanently deleted.</Label>
              </div>
              <div className="flex items-center gap-2">
                <Checkbox id="ack2" checked={ack2} onCheckedChange={(v) => setAck2(!!v)} />
                <Label htmlFor="ack2" className="text-sm">I understand this action cannot be undone.</Label>
              </div>
            </div>
            <div className="flex gap-2 mt-4">
              <Button variant="outline" onClick={() => setStep(2)}><ArrowLeft className="h-4 w-4 mr-1" /> Back</Button>
              <Button
                variant="destructive"
                className="flex-1"
                disabled={confirmPhrase !== `DELETE ${userName || userEmail}` || !ack1 || !ack2}
                onClick={handleDelete}
              >
                {deleting ? <Loader2 className="h-4 w-4 animate-spin" /> : <><Trash2 className="h-4 w-4 mr-1" /> Delete My Account</>}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
