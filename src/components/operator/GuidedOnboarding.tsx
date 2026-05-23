import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { CheckCircle2, Circle, ChevronRight, BookOpen, MapPin, PhoneCall, Wrench, Rocket } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { KNOWLEDGE_CATEGORIES, KAH_TEST_SCENARIOS, KAH_TOOLS } from "@/lib/operatorToolRegistry";
import KnowledgeManager from "./KnowledgeManager";
import ServiceAreaEditor from "./ServiceAreaEditor";
import TestScenarios from "./TestScenarios";
import ToolRegistry from "./ToolRegistry";

interface Props {
  deployment: any;
  onUpdate: (patch: any) => Promise<void> | void;
  onJumpToVoice: () => void;
}

export default function GuidedOnboarding({ deployment, onUpdate, onJumpToVoice }: Props) {
  const [docs, setDocs] = useState<{ category: string }[]>([]);
  const [tools, setTools] = useState<{ tool_name: string; is_enabled: boolean }[]>([]);
  const [runs, setRuns] = useState<{ scenario_id: string; status: string }[]>([]);
  const [step, setStep] = useState(0);

  const load = async () => {
    const [d, t, r] = await Promise.all([
      (supabase as any).from("operator_knowledge_docs").select("category").eq("deployment_id", deployment.id),
      (supabase as any).from("operator_tools").select("tool_name,is_enabled").eq("deployment_id", deployment.id),
      (supabase as any).from("operator_test_runs").select("scenario_id,status").eq("deployment_id", deployment.id),
    ]);
    setDocs(d.data ?? []); setTools(t.data ?? []); setRuns(r.data ?? []);
  };
  useEffect(() => { if (deployment?.id) load(); /* eslint-disable-next-line */ }, [deployment?.id]);

  const knowledgeCovered = useMemo(() => {
    const present = new Set(docs.map(d => d.category));
    return KNOWLEDGE_CATEGORIES.filter(c => present.has(c.id)).length;
  }, [docs]);
  const serviceAreaSet = (deployment.service_area_zips?.length ?? 0) > 0 ||
    (!!deployment.service_area_center && !!deployment.service_area_radius_miles);
  const schedulingReady = tools.some(t => t.tool_name === "book_inspection" && t.is_enabled) &&
    tools.some(t => t.tool_name === "check_availability" && t.is_enabled);
  const voiceReady = !!deployment.config?.retell_agent_id;
  const passes = runs.filter(r => r.status === "pass").length;
  const testsReady = passes === KAH_TEST_SCENARIOS.length;

  const steps = [
    { id: 0, title: "Load Ka'h knowledge", icon: BookOpen,
      done: knowledgeCovered >= KNOWLEDGE_CATEGORIES.length,
      detail: `${knowledgeCovered}/${KNOWLEDGE_CATEGORIES.length} categories filled`,
      content: <KnowledgeManager deploymentId={deployment.id} /> },
    { id: 1, title: "Set service area", icon: MapPin,
      done: serviceAreaSet,
      detail: serviceAreaSet ? "Configured" : "ZIP list or radius required",
      content: <ServiceAreaEditor deployment={deployment} onUpdate={onUpdate} /> },
    { id: 2, title: "Connect scheduling + tools", icon: Wrench,
      done: schedulingReady,
      detail: schedulingReady ? "book_inspection + check_availability enabled" : "Enable Google Calendar or Acuity",
      content: <ToolRegistry deploymentId={deployment.id} /> },
    { id: 3, title: "Provision voice agent", icon: PhoneCall,
      done: voiceReady,
      detail: voiceReady ? `Retell agent ${String(deployment.config?.retell_agent_id).slice(0, 16)}…` : "Sync Ka'h to Retell",
      content: (
        <Card><CardHeader><CardTitle>Voice agent</CardTitle><CardDescription>Open the Voice tab to configure Retell, voice ID, bilingual mode, and start a web test call.</CardDescription></CardHeader>
          <CardContent><Button onClick={onJumpToVoice}>Open Voice & guardrails<ChevronRight className="h-4 w-4 ml-1" /></Button></CardContent></Card>
      ) },
    { id: 4, title: "Run 10 test-call scenarios", icon: Rocket,
      done: testsReady,
      detail: `${passes}/${KAH_TEST_SCENARIOS.length} passed`,
      content: <TestScenarios deploymentId={deployment.id} /> },
  ];

  const completedCount = steps.filter(s => s.done).length;
  const pct = Math.round((completedCount / steps.length) * 100);

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Guided onboarding</CardTitle>
              <CardDescription>Follow the five steps in order — each one unlocks the next.</CardDescription>
            </div>
            <Badge variant={pct === 100 ? "default" : "outline"}>{completedCount}/{steps.length}</Badge>
          </div>
        </CardHeader>
        <CardContent><Progress value={pct} /></CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-4">
        <div className="space-y-2">
          {steps.map(s => {
            const Icon = s.icon;
            const isActive = step === s.id;
            return (
              <button key={s.id} onClick={() => setStep(s.id)}
                className={`w-full text-left rounded-lg border p-3 transition ${isActive ? "border-primary bg-primary/5" : "hover:bg-muted/50"}`}>
                <div className="flex items-start gap-2">
                  {s.done ? <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5 shrink-0" /> : <Circle className="h-5 w-5 text-muted-foreground mt-0.5 shrink-0" />}
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5"><Icon className="h-3.5 w-3.5 text-muted-foreground" /><span className="text-sm font-medium">{s.title}</span></div>
                    <p className="text-xs text-muted-foreground mt-0.5">{s.detail}</p>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
        <div>{steps[step].content}</div>
      </div>
    </div>
  );
}
