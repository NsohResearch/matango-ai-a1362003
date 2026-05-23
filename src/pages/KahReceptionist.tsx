import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import DashboardLayout from "@/components/DashboardLayout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { INDUSTRIES, OPERATORS } from "@/lib/operators";
import { useOperatorDeployment } from "@/hooks/useOperatorDeployment";
import KnowledgeManager from "@/components/operator/KnowledgeManager";
import ToolRegistry from "@/components/operator/ToolRegistry";
import VoiceConfig from "@/components/operator/VoiceConfig";
import OnboardingWizard from "@/components/operator/OnboardingWizard";
import KPIDashboard from "@/components/operator/KPIDashboard";
import GuidedOnboarding from "@/components/operator/GuidedOnboarding";
import TestScenarios from "@/components/operator/TestScenarios";
import ServiceAreaEditor from "@/components/operator/ServiceAreaEditor";
import HandoffCompliance from "@/components/operator/HandoffCompliance";
import KPITargets from "@/components/operator/KPITargets";
import { Loader2 } from "lucide-react";

export default function KahReceptionist() {
  const { industry = "roofers" } = useParams();
  const ind = INDUSTRIES.find(i => i.slug === industry) ?? INDUSTRIES[0];
  const op = OPERATORS.find(o => o.slug === "kah")!;
  const { deployment, loading, ensure, update } = useOperatorDeployment("kah", ind.slug);
  const [tab, setTab] = useState("guided");

  useEffect(() => {
    if (!loading && !deployment) ensure(`${op.name} — ${ind.name} Receptionist`);
  }, [loading, deployment, ensure, op.name, ind.name]);

  if (loading || !deployment) return (
    <DashboardLayout><div className="flex items-center justify-center h-64"><Loader2 className="h-6 w-6 animate-spin" /></div></DashboardLayout>
  );

  return (
    <DashboardLayout>
      <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div className="flex items-center gap-3">
          <img src={op.image} alt={op.name} className="h-12 w-12 rounded-full object-cover" />
          <div>
            <h1 className="text-2xl font-semibold">{op.name} — {ind.name} Receptionist</h1>
            <p className="text-sm text-muted-foreground">{op.role} · operating in {ind.name.toLowerCase()}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant={deployment.status === "live" ? "default" : "outline"}>{deployment.status}</Badge>
          <Link to="/personas/kah"><Button variant="outline" size="sm">About Ka'h</Button></Link>
        </div>
      </div>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList className="flex-wrap">
          <TabsTrigger value="guided">Guided setup</TabsTrigger>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="knowledge">Knowledge</TabsTrigger>
          <TabsTrigger value="area">Service area</TabsTrigger>
          <TabsTrigger value="tools">Tools</TabsTrigger>
          <TabsTrigger value="voice">Voice & guardrails</TabsTrigger>
          <TabsTrigger value="handoff">Handoff & compliance</TabsTrigger>
          <TabsTrigger value="tests">Test calls</TabsTrigger>
          <TabsTrigger value="onboarding">Checklist</TabsTrigger>
          <TabsTrigger value="kpis">KPIs</TabsTrigger>
        </TabsList>

        <TabsContent value="guided" className="mt-4">
          <GuidedOnboarding deployment={deployment} onUpdate={update} onJumpToVoice={() => setTab("voice")} />
        </TabsContent>

        <TabsContent value="overview" className="space-y-4 mt-4">
          <Card>
            <CardHeader><CardTitle>Scope of responsibilities</CardTitle><CardDescription>What Ka'h handles for a {ind.name.toLowerCase()} business.</CardDescription></CardHeader>
            <CardContent>
              <ul className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                <li>• Answer every inbound call within 2 rings</li>
                <li>• Missed-call text-back within 60 seconds</li>
                <li>• BANT-roofing lead qualification + scoring</li>
                <li>• Book inspections directly on the company calendar</li>
                <li>• Emergency triage: active leaks, storm, collapse</li>
                <li>• After-hours coverage + warm transfer to on-call</li>
                <li>• Warranty &amp; service intake</li>
                <li>• Post-job review requests</li>
              </ul>
            </CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle>BANT scoring</CardTitle></CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-sm">
                <div className="rounded border p-3">Trigger type — 20%</div>
                <div className="rounded border p-3">Insurance vs cash — 20%</div>
                <div className="rounded border p-3">Urgency / active leak — 20%</div>
                <div className="rounded border p-3">Service area — 15%</div>
                <div className="rounded border p-3">Decision maker — 15%</div>
                <div className="rounded border p-3">Roof data — 10%</div>
              </div>
              <p className="text-xs text-muted-foreground mt-3">≥75 → hot lead · 50–74 → warm · &lt;50 → nurture · active leak → emergency override.</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="knowledge" className="mt-4"><KnowledgeManager deploymentId={deployment.id} /></TabsContent>
        <TabsContent value="area" className="mt-4"><ServiceAreaEditor deployment={deployment} onUpdate={update} /></TabsContent>
        <TabsContent value="tools" className="mt-4"><ToolRegistry deploymentId={deployment.id} /></TabsContent>
        <TabsContent value="voice" className="mt-4"><VoiceConfig deployment={deployment} onUpdate={update} /></TabsContent>
        <TabsContent value="tests" className="mt-4"><TestScenarios deploymentId={deployment.id} /></TabsContent>
        <TabsContent value="onboarding" className="mt-4"><OnboardingWizard deploymentId={deployment.id} progress={deployment.onboarding_progress} /></TabsContent>
        <TabsContent value="kpis" className="mt-4"><KPIDashboard deploymentId={deployment.id} /></TabsContent>
      </Tabs>
    </DashboardLayout>
  );
}

