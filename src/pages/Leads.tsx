import { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Zap, Plus, Loader2, Mail, Building, User, ChevronRight } from "lucide-react";
import { useLeads } from "@/hooks/useData";

const STAGES = ["new", "contacted", "qualified", "proposal", "won", "lost"];
const STAGE_COLORS: Record<string, string> = {
  new: "bg-blue-500/20 text-blue-400",
  contacted: "bg-accent/20 text-accent",
  qualified: "bg-purple-500/20 text-purple-400",
  proposal: "bg-cyan-500/20 text-cyan-400",
  won: "bg-primary/20 text-primary",
  lost: "bg-destructive/20 text-destructive",
};

const LeadsPage = () => {
  const { data: leads, isLoading } = useLeads();
  const [viewMode, setViewMode] = useState<"pipeline" | "list">("pipeline");

  const getLeadsByStage = (stage: string) => leads?.filter((l) => l.stage === stage) || [];

  return (
    <DashboardLayout>
      <div className="p-6 lg:p-8 max-w-7xl">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="font-display text-3xl font-bold flex items-center gap-2">
              <Zap className="h-8 w-8 text-primary" /> Leads
            </h1>
            <p className="mt-1 text-muted-foreground">Track and manage your captured leads pipeline.</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex rounded-lg border border-border overflow-hidden">
              <button onClick={() => setViewMode("pipeline")} className={`px-3 py-1.5 text-xs font-medium ${viewMode === "pipeline" ? "bg-primary text-primary-foreground" : "text-muted-foreground"}`}>Pipeline</button>
              <button onClick={() => setViewMode("list")} className={`px-3 py-1.5 text-xs font-medium ${viewMode === "list" ? "bg-primary text-primary-foreground" : "text-muted-foreground"}`}>List</button>
            </div>
            <button className="px-4 py-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 flex items-center gap-2">
              <Plus className="h-4 w-4" /> Add Lead
            </button>
          </div>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
        ) : viewMode === "pipeline" ? (
          <div className="flex gap-4 overflow-x-auto pb-4">
            {STAGES.map((stage) => {
              const stageLeads = getLeadsByStage(stage);
              return (
                <div key={stage} className="flex-shrink-0 w-64">
                  <div className="flex items-center justify-between mb-3 px-1">
                    <span className={`text-xs font-medium uppercase tracking-wider px-2 py-0.5 rounded-full ${STAGE_COLORS[stage]}`}>{stage}</span>
                    <span className="text-xs text-muted-foreground">{stageLeads.length}</span>
                  </div>
                  <div className="space-y-2 min-h-[200px]">
                    {stageLeads.map((lead) => (
                      <div key={lead.id} className="glass-card rounded-lg p-3 hover:border-primary/20 transition-colors cursor-pointer">
                        <h4 className="text-sm font-medium flex items-center gap-1.5">
                          <User className="h-3 w-3 text-muted-foreground" /> {lead.name || "Unknown"}
                        </h4>
                        {lead.company && <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1"><Building className="h-3 w-3" /> {lead.company}</p>}
                        {lead.email && <p className="text-xs text-muted-foreground mt-0.5 flex items-center gap-1"><Mail className="h-3 w-3" /> {lead.email}</p>}
                        {lead.source && <span className="inline-block mt-2 text-[10px] bg-secondary px-1.5 py-0.5 rounded">{lead.source}</span>}
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="space-y-2">
            {leads && leads.length > 0 ? leads.map((lead) => (
              <div key={lead.id} className="glass-card rounded-xl p-4 flex items-center gap-4">
                <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary text-sm font-bold">
                  {(lead.name || "?").charAt(0)}
                </div>
                <div className="flex-1">
                  <h4 className="text-sm font-medium">{lead.name || "Unknown"}</h4>
                  <p className="text-xs text-muted-foreground">{lead.email} {lead.company ? `• ${lead.company}` : ""}</p>
                </div>
                <span className={`text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full ${STAGE_COLORS[lead.stage]}`}>{lead.stage}</span>
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              </div>
            )) : (
              <div className="glass-card rounded-xl p-12 text-center">
                <Zap className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="font-display text-lg font-semibold mb-2">No leads yet</h3>
                <p className="text-sm text-muted-foreground">Leads captured from your campaigns will appear here.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default LeadsPage;
