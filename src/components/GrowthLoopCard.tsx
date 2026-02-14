/**
 * GrowthLoopCard — 5-step growth loop visualization for Dashboard.
 * Adapted from original trpc version to Supabase.
 */
import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useProfile, useBrandBrains, useSocialConnections, useAbTests } from "@/hooks/useData";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import {
  RefreshCw, CreditCard, Brain, Layers, Target, TrendingUp,
  CheckCircle2, Zap, Lock, ArrowRight, Crown,
} from "lucide-react";

const steps = [
  { key: "plan", label: "Plan", icon: CreditCard, desc: "Choose your growth plan", path: "/pricing", verb: "Upgrade" },
  { key: "brand", label: "Brand", icon: Brain, desc: "Set up Brand Brain", path: "/brand-brain", verb: "Configure" },
  { key: "campaign", label: "Campaign", icon: Layers, desc: "Create content & campaigns", path: "/campaign-factory", verb: "Create" },
  { key: "publish", label: "Publish", icon: Target, desc: "Schedule & publish", path: "/schedule", verb: "Publish" },
  { key: "optimize", label: "Optimize", icon: TrendingUp, desc: "Analyze & test", path: "/analytics-hub", verb: "Optimize" },
];

export default function GrowthLoopCard() {
  const { user } = useAuth();
  const { data: profile } = useProfile();
  const { data: brands } = useBrandBrains();
  const { data: connections } = useSocialConnections();
  const { data: tests } = useAbTests();

  const hasPlan = profile?.plan && profile.plan !== "free";
  const hasBrand = (brands?.length || 0) > 0;
  const hasConnections = (connections?.length || 0) > 0;
  const hasTests = (tests?.length || 0) > 0;

  const getStepStatus = (key: string) => {
    switch (key) {
      case "plan": return hasPlan ? "complete" : "ready";
      case "brand": return hasBrand ? "complete" : hasPlan ? "ready" : "ready";
      case "campaign": return hasBrand ? "ready" : "locked";
      case "publish": return hasConnections ? "complete" : hasBrand ? "ready" : "locked";
      case "optimize": return hasTests ? "complete" : hasConnections ? "ready" : "locked";
      default: return "locked";
    }
  };

  return (
    <Card className="border-border">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg font-display">
          <RefreshCw className="h-5 w-5 text-primary" />
          Your Growth Loop
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col gap-2">
          {steps.map((step, i) => {
            const status = getStepStatus(step.key);
            const Icon = step.icon;
            return (
              <motion.div key={step.key} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}>
                <Link
                  to={status === "locked" ? "#" : step.path}
                  className={`flex items-center gap-3 rounded-lg px-3 py-2.5 transition-all ${
                    status === "complete" ? "bg-primary/5 hover:bg-primary/10" :
                    status === "ready" ? "bg-muted/50 hover:bg-muted" :
                    "bg-muted/20 opacity-50 cursor-not-allowed"
                  }`}
                  onClick={(e) => status === "locked" && e.preventDefault()}
                >
                  <div className={`p-1.5 rounded-md ${status === "complete" ? "bg-primary/10" : "bg-muted"}`}>
                    {status === "complete" ? (
                      <CheckCircle2 className="h-4 w-4 text-primary" />
                    ) : status === "locked" ? (
                      <Lock className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <Icon className="h-4 w-4 text-foreground" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium">{step.label}</div>
                    <div className="text-[11px] text-muted-foreground">{step.desc}</div>
                  </div>
                  {status === "complete" ? (
                    <Badge variant="secondary" className="text-[10px] bg-primary/10 text-primary">Done</Badge>
                  ) : status === "ready" ? (
                    <span className="flex items-center gap-1 text-[11px] text-primary font-medium">
                      {step.verb} <ArrowRight className="h-3 w-3" />
                    </span>
                  ) : null}
                </Link>
              </motion.div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
