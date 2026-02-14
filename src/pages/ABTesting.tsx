import DashboardLayout from "@/components/DashboardLayout";
import { FlaskConical, Plus, Loader2, Trophy, BarChart3 } from "lucide-react";
import { useAbTests } from "@/hooks/useData";

const ABTestingPage = () => {
  const { data: tests, isLoading } = useAbTests();

  return (
    <DashboardLayout>
      <div className="p-6 lg:p-8 max-w-6xl">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="font-display text-3xl font-bold flex items-center gap-2">
              <FlaskConical className="h-8 w-8 text-primary" /> A/B Testing
            </h1>
            <p className="mt-1 text-muted-foreground">Run experiments and compare campaign variations.</p>
          </div>
          <button className="px-4 py-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 flex items-center gap-2">
            <Plus className="h-4 w-4" /> New Test
          </button>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
        ) : tests && tests.length > 0 ? (
          <div className="space-y-4">
            {tests.map((test) => (
              <div key={test.id} className="glass-card rounded-xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="font-display font-semibold capitalize">{test.test_type} Test</h3>
                    <p className="text-xs text-muted-foreground mt-0.5">Target: {test.target_metric} • Confidence: {test.confidence_level}%</p>
                  </div>
                  <span className={`text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full ${
                    test.status === "running" ? "bg-primary/20 text-primary" :
                    test.status === "completed" ? "bg-accent/20 text-accent" :
                    "bg-muted text-muted-foreground"
                  }`}>{test.status}</span>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  {(test.ab_test_variants as any[])?.map((v: any) => (
                    <div key={v.id} className={`rounded-lg border p-4 ${v.is_winner ? "border-primary bg-primary/5" : "border-border"}`}>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium">{v.name}</span>
                        {v.is_winner && <Trophy className="h-4 w-4 text-accent" />}
                      </div>
                      <div className="grid grid-cols-3 gap-2 text-center">
                        <div>
                          <div className="text-lg font-bold">{v.impressions || 0}</div>
                          <div className="text-[10px] text-muted-foreground">Impressions</div>
                        </div>
                        <div>
                          <div className="text-lg font-bold">{v.clicks || 0}</div>
                          <div className="text-[10px] text-muted-foreground">Clicks</div>
                        </div>
                        <div>
                          <div className="text-lg font-bold text-primary">{v.conversion_rate || 0}%</div>
                          <div className="text-[10px] text-muted-foreground">Conv Rate</div>
                        </div>
                      </div>
                      <div className="mt-3 h-2 bg-muted rounded-full overflow-hidden">
                        <div className="h-full bg-primary rounded-full" style={{ width: `${v.traffic_split || 50}%` }} />
                      </div>
                      <div className="text-[10px] text-muted-foreground mt-1">{v.traffic_split || 50}% traffic</div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="glass-card rounded-xl p-12 text-center">
            <FlaskConical className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="font-display text-lg font-semibold mb-2">No A/B tests yet</h3>
            <p className="text-sm text-muted-foreground mb-4">Create your first test to optimize your campaigns.</p>
            <button className="px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium">Create First Test</button>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default ABTestingPage;
