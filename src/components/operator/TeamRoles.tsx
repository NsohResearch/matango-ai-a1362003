import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Trash2, Mail } from "lucide-react";
import { toast } from "sonner";

const ROLES = [
  { value: "owner", label: "Owner" },
  { value: "gm", label: "General Manager" },
  { value: "estimator", label: "Estimator" },
  { value: "service_manager", label: "Service Manager" },
  { value: "viewer", label: "Viewer" },
];

interface Member {
  id: string;
  invited_email: string;
  invited_phone: string | null;
  role: string;
  status: string;
  created_at: string;
}

export default function TeamRoles({ deploymentId }: { deploymentId: string }) {
  const { user } = useAuth();
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("estimator");
  const [adding, setAdding] = useState(false);

  const load = async () => {
    const { data } = await supabase
      .from("operator_team_members")
      .select("*")
      .eq("deployment_id", deploymentId)
      .order("created_at", { ascending: false });
    setMembers((data as Member[]) ?? []);
    setLoading(false);
  };

  useEffect(() => { load(); /* eslint-disable-next-line */ }, [deploymentId]);

  const invite = async () => {
    if (!email || !user) return;
    setAdding(true);
    const { error } = await supabase.from("operator_team_members").insert({
      deployment_id: deploymentId, owner_id: user.id, invited_email: email, role,
    });
    setAdding(false);
    if (error) return toast.error(error.message);
    setEmail("");
    toast.success(`Invite sent to ${email}`);
    load();
  };

  const remove = async (id: string) => {
    await supabase.from("operator_team_members").delete().eq("id", id);
    load();
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Invite team member</CardTitle>
          <CardDescription>GMs, estimators, and service managers can view leads, calls, and run handoffs.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col sm:flex-row gap-2">
          <Input type="email" placeholder="teammate@company.com" value={email} onChange={e => setEmail(e.target.value)} />
          <Select value={role} onValueChange={setRole}>
            <SelectTrigger className="w-full sm:w-48"><SelectValue /></SelectTrigger>
            <SelectContent>{ROLES.map(r => <SelectItem key={r.value} value={r.value}>{r.label}</SelectItem>)}</SelectContent>
          </Select>
          <Button disabled={adding || !email} onClick={invite}>
            {adding ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : <Mail className="h-4 w-4 mr-1" />}
            Send invite
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Members</CardTitle></CardHeader>
        <CardContent>
          {loading ? <Loader2 className="h-5 w-5 animate-spin mx-auto" /> :
            members.length === 0 ? <p className="text-sm text-muted-foreground">No teammates yet. Invite your GM to get hot-lead routing.</p> :
            <div className="space-y-2">
              {members.map(m => (
                <div key={m.id} className="flex items-center justify-between p-2 rounded border">
                  <div>
                    <p className="text-sm font-medium">{m.invited_email}</p>
                    <p className="text-xs text-muted-foreground">{ROLES.find(r => r.value === m.role)?.label ?? m.role}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={m.status === "active" ? "default" : "outline"}>{m.status}</Badge>
                    <Button variant="ghost" size="icon" onClick={() => remove(m.id)}><Trash2 className="h-3.5 w-3.5" /></Button>
                  </div>
                </div>
              ))}
            </div>
          }
        </CardContent>
      </Card>
    </div>
  );
}
